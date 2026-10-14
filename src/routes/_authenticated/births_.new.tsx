import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EncodeForm } from "@/components/encode-form";
import { Form102 } from "@/components/form102";
import { birthRow, birthSchema } from "@/lib/birth-form";

export const Route = createFileRoute("/_authenticated/births_/new")({
  head: () => ({ meta: [{ title: "Certificate of Live Birth - Encoding — eCRIS" }] }),
  component: NewBirth,
});

function NewBirth() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <EncodeForm tab="birth" eyebrow="Birth Registration - New Entry" title="Certificate of Live Birth - Encoding" schema={birthSchema} layout={(api) => <Form102 api={api} />}
      submitLabel="Save & Continue to Page 2"
      onSubmit={async (v, refNo) => {
        const { data: u } = await supabase.auth.getUser();
        const { data: dup } = await supabase.from("birth_records").select("id")
          .ilike("child_first_name", v.child_first_name).ilike("child_last_name", v.child_last_name).eq("date_of_birth", v.date_of_birth).limit(1);
        if (dup?.length && !confirm("A record with the same child name and birth date already exists. Save anyway?")) return;

        const { error } = await supabase.from("birth_records").insert({
          ...birthRow(v),
          registry_number: refNo,
          encoded_by: u.user?.id ?? null,
        } as unknown as Database["public"]["Tables"]["birth_records"]["Insert"]);
        if (error) { toast.error(error.message); return; }
        toast.success(`Saved as ${refNo} — awaiting validation`);
        qc.invalidateQueries({ queryKey: ["births"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        navigate({ to: "/births/page-2", search: { reg: refNo } });
      }}
    />
  );
}
