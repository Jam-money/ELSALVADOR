import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EncodeForm, opt, nul } from "@/components/encode-form";
import { affidavitValues } from "@/lib/birth-form";
import { Form102Page2 } from "@/components/form102-page2";

export const Route = createFileRoute("/_authenticated/births_/page-2")({
  validateSearch: (s: Record<string, unknown>): { reg?: string | undefined } => ({ reg: typeof s["reg"] === "string" ? s["reg"] : undefined }),
  head: () => ({ meta: [{ title: "Page 2 - Affidavits - eCRIS" }] }),
  component: Page2,
});

const PA = ["father_name", "mother_name", "child_name", "child_birth_date", "child_birth_place", "sworn_date", "id_number", "id_issued_on", "id_issued_at", "officer_name", "officer_position", "officer_address"];
const DR = ["affiant_name", "civil_status", "residence_address", "applicant_for", "birth_place", "birth_date", "attendant_name", "attendant_address", "citizenship", "parents_status", "delay_reason", "execution_date", "execution_place", "sworn_date", "sworn_place", "id_number", "id_issued_on", "id_issued_at", "officer_name", "officer_position", "officer_address"];
const DR_OPTIONAL = ["subject_name", "parents_marriage_date", "parents_marriage_place", "father_acknowledgment", "father_name", "married_to", "relationship_to_owner"];

const shape = Object.fromEntries([...PA.map((k) => `pa_${k}`), ...DR.map((k) => `dr_${k}`), ...DR_OPTIONAL.map((k) => `dr_${k}`)].map((k) => [k, opt]));
const schema = z.object(shape).superRefine((v: Record<string, string | undefined>, ctx) => {
  const filled = (p: string) => Object.entries(v).some(([k, x]) => k.startsWith(p) && x && x.trim());
  const need = (k: string, cond = true) => { if (cond && !(v[k] && v[k]!.trim())) ctx.addIssue({ code: "custom", path: [k], message: "Required" }); };
  if (filled("pa_")) PA.forEach((k) => need(`pa_${k}`));
  if (filled("dr_")) {
    DR.forEach((k) => need(`dr_${k}`));
    need("dr_subject_name", v["dr_applicant_for"] === "The birth of another person");
    need("dr_relationship_to_owner", v["dr_applicant_for"] === "The birth of another person");
    need("dr_parents_marriage_date", v["dr_parents_status"] === "Married");
    need("dr_parents_marriage_place", v["dr_parents_status"] === "Married");
    need("dr_father_acknowledgment", v["dr_parents_status"] === "Not married");
    need("dr_father_name", v["dr_parents_status"] === "Not married");
  }
});

type Existing = { pa: Database["public"]["Tables"]["paternity_affidavits"]["Row"] | null; dr: Database["public"]["Tables"]["delayed_registration_affidavits"]["Row"] | null };

function Page2() {
  const { reg } = Route.useSearch();
  const { data: existing, isLoading } = useQuery({
    queryKey: ["page2", reg],
    queryFn: async (): Promise<Existing> => {
      if (!reg) return { pa: null, dr: null };
      const { data: rec } = await supabase.from("birth_records").select("id").eq("registry_number", reg).maybeSingle();
      if (!rec) return { pa: null, dr: null };
      const [p, d] = await Promise.all([
        supabase.from("paternity_affidavits").select("*").eq("birth_record_id", rec.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("delayed_registration_affidavits").select("*").eq("birth_record_id", rec.id).order("created_at", { ascending: false }).limit(1),
      ]);
      return { pa: p.data?.[0] ?? null, dr: d.data?.[0] ?? null };
    },
  });
  if (isLoading || !existing) return <p className="text-muted-foreground">Loading…</p>;
  return <Page2Form reg={reg} existing={existing} />;
}

function Page2Form({ reg, existing }: { reg: string | undefined; existing: Existing }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const has = !!(existing.pa || existing.dr);

  return (
    <EncodeForm tab="page2" defaults={has ? affidavitValues(existing.pa, existing.dr) : undefined} eyebrow="Birth Registration - Page 2" title="Affidavits (Back of Certificate of Live Birth)" schema={schema}
      layout={(api) => <Form102Page2 api={api} />}
      submitLabel="Save & Finish" onSkip={() => navigate({ to: "/births" })} skipLabel={has ? "Skip (no changes)" : "Skip (no affidavits)"}
      onSubmit={async (v) => {
        const val = v as Record<string, string | undefined>;
        const { data: u } = await supabase.auth.getUser();
        let birth_record_id: string | null = null;
        const registry_number = reg ?? null;
        if (registry_number) {
          const { data } = await supabase.from("birth_records").select("id").eq("registry_number", registry_number).maybeSingle();
          if (!data) { toast.error("No birth record found with that registry number"); return; }
          birth_record_id = data.id;
        }
        const pick = (p: string) => Object.fromEntries(Object.entries(val).filter(([k]) => k.startsWith(p)).map(([k, x]) => [k.slice(p.length), nul(x)]));
        const base = { registry_number, birth_record_id, encoded_by: u.user?.id ?? null };
        const pa = pick("pa_");
        const dr = pick("dr_");
        let saved = 0;

        if (Object.values(pa).some(Boolean)) {
          const body = { ...pa, registry_number, birth_record_id };
          const { error } = existing.pa
            ? await supabase.from("paternity_affidavits").update(body as unknown as Database["public"]["Tables"]["paternity_affidavits"]["Update"]).eq("id", existing.pa.id)
            : await supabase.from("paternity_affidavits").insert({ ...body, encoded_by: base.encoded_by } as unknown as Database["public"]["Tables"]["paternity_affidavits"]["Insert"]);
          if (error) { toast.error(error.message); return; }
          saved++;
        }
        if (Object.values(dr).some(Boolean)) {
          const { parents_status, father_acknowledgment, applicant_for, ...rest } = dr;
          const body = {
            ...rest, registry_number, birth_record_id,
            applicant_for: applicant_for === "My own birth" ? "self" : "other",
            parents_married: parents_status ? parents_status === "Married" : null,
            father_acknowledged: parents_status === "Not married" ? father_acknowledgment === "Acknowledged" : null,
          };
          const { error } = existing.dr
            ? await supabase.from("delayed_registration_affidavits").update(body as unknown as Database["public"]["Tables"]["delayed_registration_affidavits"]["Update"]).eq("id", existing.dr.id)
            : await supabase.from("delayed_registration_affidavits").insert({ ...body, encoded_by: base.encoded_by } as unknown as Database["public"]["Tables"]["delayed_registration_affidavits"]["Insert"]);
          if (error) { toast.error(error.message); return; }
          saved++;
        }
        toast.success(saved ? `Saved ${saved} affidavit${saved > 1 ? "s" : ""}` : "No affidavit entered");
        qc.invalidateQueries({ queryKey: ["births"] });
        qc.invalidateQueries({ queryKey: ["page2"] });
        qc.invalidateQueries({ queryKey: ["admin", "affidavits"] });
        navigate({ to: "/births" });
      }}
    />
  );
}
