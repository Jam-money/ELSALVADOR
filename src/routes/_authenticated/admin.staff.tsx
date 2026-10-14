import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles, type Profile } from "@/lib/admin-data";
import { createEncoder } from "@/lib/staff.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  beforeLoad: ({ context }) => { if (!context.roles.includes("admin")) throw redirect({ to: "/admin" }); },
  head: () => ({ meta: [{ title: "Staff Accounts — eCRIS" }] }),
  component: Staff,
});

const lastActive = (iso: string | null) => (!iso ? "Never" : isToday(new Date(iso)) ? "Today" : isYesterday(new Date(iso)) ? "Yesterday" : format(new Date(iso), "MMM d"));
const roleLabel = (r?: string) => (r === "registrar" ? "Registrar" : r === "viewer" ? "Viewer" : "LCRO Encoder");

function Staff() {
  const qc = useQueryClient();
  const { data: profiles = [] } = useProfiles();
  const [edit, setEdit] = useState<Profile | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: meta } = useQuery({
    queryKey: ["admin", "staffMeta"],
    queryFn: async () => {
      const [roles, recs] = await Promise.all([
        supabase.from("user_roles").select("user_id,role"),
        supabase.from("birth_records").select("encoded_by").limit(20000),
      ]);
      const counts: Record<string, number> = {};
      (recs.data ?? []).forEach((r) => { if (r.encoded_by) counts[r.encoded_by] = (counts[r.encoded_by] ?? 0) + 1; });
      return { roles: roles.data ?? [], counts };
    },
  });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); };
  const toggle = useMutation({
    mutationFn: async (p: Profile) => {
      const { error } = await supabase.from("profiles").update({ is_active: !p.is_active }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Account updated"); refresh(); },
    onError: (e) => toast.error((e as Error).message),
  });

  const staff = profiles
    .map((p) => ({ p, roles: (meta?.roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role) }))
    .filter((x) => x.roles.length > 0 && !x.roles.includes("admin"))
    .sort((a, b) => a.p.full_name.localeCompare(b.p.full_name));

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl">Staff Accounts</h1>
        <p className="text-sm text-muted-foreground">Manage encoder and staff accounts under El Salvador LCRO</p>
      </div>

      <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg">Staff — {staff.length} account{staff.length === 1 ? "" : "s"}</h2>
          <Button size="sm" onClick={() => setAdding(true)}>+ Add Encoder</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Name</th><th>Position</th><th>Username</th><th>Records Encoded</th><th>Last Active</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {staff.map(({ p, roles }) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3 font-semibold">{p.full_name}</td>
                  <td>{p.position || roleLabel(roles[0])}</td>
                  <td>{p.username ?? "—"}</td>
                  <td>{meta?.counts[p.id] ?? 0}</td>
                  <td>{lastActive(p.last_active_at)}</td>
                  <td><Badge variant="outline" className={p.is_active ? "border-success/30 bg-success/15 text-success" : "bg-muted text-muted-foreground"}>{p.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => setEdit(p)}>Edit</Button>
                    <Button size="sm" variant={p.is_active ? "destructive" : "default"} className={p.is_active ? "" : "bg-success text-white hover:bg-success/90"} disabled={toggle.isPending} onClick={() => toggle.mutate(p)}>
                      {p.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No staff accounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <EditDialog p={edit} onClose={() => setEdit(null)} onSaved={refresh} />
      <AddDialog open={adding} onClose={() => setAdding(false)} onSaved={refresh} />
    </div>
  );
}

function EditDialog({ p, onClose, onSaved }: { p: Profile | null; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState({ full_name: "", position: "", username: "" });
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (p && loadedFor !== p.id) { setLoadedFor(p.id); setV({ full_name: p.full_name, position: p.position ?? "", username: p.username ?? "" }); }
  if (!p && loadedFor) setLoadedFor(null);

  async function save() {
    if (!p) return;
    const { error } = await supabase.from("profiles").update({ full_name: v.full_name.trim(), position: v.position.trim() || null, username: v.username.trim() || null }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Account updated");
    onSaved(); onClose();
  }
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit staff account</DialogTitle></DialogHeader>
        <div className="space-y-2"><Label>Full name</Label><Input value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Position</Label><Input value={v.position} onChange={(e) => setV({ ...v, position: e.target.value })} /></div>
        <div className="space-y-2"><Label>Username</Label><Input value={v.username} onChange={(e) => setV({ ...v, username: e.target.value })} /></div>
        <Button onClick={save} disabled={!v.full_name.trim()}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}

function AddDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const empty = { full_name: "", username: "", position: "LCRO Encoder", email: "", password: "" };
  const [v, setV] = useState(empty);
  const [busy, setBusy] = useState(false);
  const f = (k: keyof typeof empty, label: string, type = "text") => (
    <div className="space-y-2"><Label>{label}</Label><Input type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>
  );
  async function save() {
    setBusy(true);
    try {
      await createEncoder({ data: v });
      toast.success("Encoder account created");
      setV(empty); onSaved(); onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add encoder</DialogTitle></DialogHeader>
        {f("full_name", "Full name")}{f("username", "Username")}{f("position", "Position")}{f("email", "Email", "email")}{f("password", "Temporary password (min. 6 characters)", "password")}
        <Button onClick={save} disabled={busy || !v.full_name.trim() || !v.username.trim() || !v.email.trim() || v.password.length < 6}>Create account</Button>
      </DialogContent>
    </Dialog>
  );
}
