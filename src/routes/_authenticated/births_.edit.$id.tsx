import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EncodeForm } from "@/components/encode-form";
import { Form102 } from "@/components/form102";
import { birthRow, birthSchema, toValues } from "@/lib/birth-form";

export const Route = createFileRoute("/_authenticated/births_/edit/$id")({
  head: () => ({ meta: [{ title: "Edit Returned Record — eCRIS" }] }),
  component: EditBirth,
});

function EditBirth() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: rec, isLoading } = useQuery({
    queryKey: ["birth", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("birth_records").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading record…</p>;
  if (!rec || rec.status !== "returned") {
    return (
      <div className="space-y-3">
        <p>This record can only be edited while it is returned for correction.</p>
        <Link to="/encodings" className="text-primary underline">Back to All My Encodings</Link>
      </div>
    );
  }

  return (
    <EncodeForm key={rec.id} tab="birth" eyebrow="Returned for Correction" title="Edit Certificate of Live Birth" schema={birthSchema}
      defaults={toValues(rec)} fixedRefNo={rec.registry_number ?? ""}
      layout={(api) => (
        <div className="space-y-3">
          {rec.return_reason && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <b>Returned by the registrar:</b> {rec.return_reason}
            </p>
          )}
          <Form102 api={api} />
        </div>
      )}
      submitLabel="Save & Continue to Page 2"
      onSubmit={async (v) => {
        const { error } = await supabase.from("birth_records")
          .update({ ...birthRow(v), status: "for_validation", return_reason: null } as unknown as Database["public"]["Tables"]["birth_records"]["Update"])
          .eq("id", rec.id);
        if (error) { toast.error(error.message); return; }
        toast.success("Corrections saved - resubmitted for approval");
        qc.invalidateQueries({ queryKey: ["births"] });
        qc.invalidateQueries({ queryKey: ["birth", id] });
        qc.invalidateQueries({ queryKey: ["admin"] });
        navigate({ to: "/births/page-2", search: { reg: rec.registry_number ?? undefined } });
      }}
    />
  );
}
