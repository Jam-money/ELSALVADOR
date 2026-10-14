import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useProfiles, shortName, childName } from "@/lib/admin-data";
import { statusBadge } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { RecordSheet } from "@/components/record-sheet";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/review")({
  head: () => ({ meta: [{ title: "Review & Approve — eCRIS" }] }),
  component: Review,
});

type Rec = Database["public"]["Tables"]["birth_records"]["Row"];

function Review() {
  const qc = useQueryClient();
  const { data: profiles = [] } = useProfiles();
  const [encoder, setEncoder] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<Rec | null>(null);
  const [reason, setReason] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "review"],
    queryFn: async () => {
      const { data, error } = await supabase.from("birth_records").select("*").in("status", ["for_validation", "returned"]).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: aff } = useQuery({
    queryKey: ["admin", "affidavits", open?.id],
    enabled: !!open,
    queryFn: async () => {
      const id = open!.id;
      const [p, d] = await Promise.all([
        supabase.from("paternity_affidavits").select("*").eq("birth_record_id", id).order("created_at", { ascending: false }).limit(1),
        supabase.from("delayed_registration_affidavits").select("*").eq("birth_record_id", id).order("created_at", { ascending: false }).limit(1),
      ]);
      return { pa: p.data?.[0] ?? null, dr: d.data?.[0] ?? null };
    },
  });

  const name = (id: string | null) => shortName(profiles.find((p) => p.id === id)?.full_name);
  const encoders = [...new Set(rows.map((r) => r.encoded_by).filter(Boolean))] as string[];
  const shown = rows.filter((r) => (encoder === "all" || r.encoded_by === encoder) && (status === "all" || r.status === status));

  const decide = useMutation({
    mutationFn: async ({ rec, approve }: { rec: Rec; approve: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      const patch = approve
        ? { status: "registered" as const, return_reason: null }
        : { status: "returned" as const, return_reason: reason.trim() };
      const { error } = await supabase.from("birth_records").update({ ...patch, reviewed_by: u.user?.id ?? null, reviewed_at: new Date().toISOString() }).eq("id", rec.id);
      if (error) throw error;
      return approve;
    },
    onSuccess: (approve) => {
      toast.success(approve ? "Record approved" : "Record returned to encoder");
      setOpen(null); setReason("");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["births"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const sel = "h-9 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl">Review & Approve</h1>
        <p className="text-sm text-muted-foreground">Encoded birth records awaiting your approval before PSA sync</p>
      </div>

      <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <h2 className="text-lg">Pending Queue — {shown.length} record{shown.length === 1 ? "" : "s"}</h2>
          <div className="flex gap-2">
            <select className={sel} value={encoder} onChange={(e) => setEncoder(e.target.value)}>
              <option value="all">All Encoders</option>
              {encoders.map((id) => <option key={id} value={id}>{shortName(profiles.find((p) => p.id === id)?.full_name)}</option>)}
            </select>
            <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Status</option><option value="for_validation">Pending</option><option value="returned">Returned</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Reg. No.</th><th>Child Name</th><th>Date of Birth</th><th>Encoder</th><th>Submitted</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-6 text-muted-foreground">Loading…</td></tr>}
              {!isLoading && shown.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No records to review.</td></tr>}
              {shown.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 font-mono text-xs">{r.registry_number}</td>
                  <td>{childName(r)}</td>
                  <td>{format(new Date(r.date_of_birth), "MMMM d, yyyy")}</td>
                  <td>{name(r.encoded_by)}</td>
                  <td>{format(new Date(r.created_at), "MMM d")}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td><Button size="sm" variant={r.status === "returned" ? "outline" : "default"} onClick={() => { setOpen(r); setReason(""); }}>Review</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>Review {open.registry_number} — {childName(open)}</DialogTitle>
              </DialogHeader>
              {open.return_reason && open.status === "returned" && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Returned: {open.return_reason}</p>}
              {aff ? <RecordSheet key={open.id} rec={open} pa={aff.pa} dr={aff.dr} /> : <p className="text-sm text-muted-foreground">Loading record...</p>}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="reason">Reason for returning (required to return)</Label>
                <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" disabled={!reason.trim() || decide.isPending} onClick={() => decide.mutate({ rec: open, approve: false })}>Return for correction</Button>
                  <Button disabled={decide.isPending} onClick={() => decide.mutate({ rec: open, approve: true })}>Approve</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
