import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday, startOfMonth, subMonths, isSameMonth } from "date-fns";
import { CheckCircle2, FilePlus2, Undo2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles, shortName, childName } from "@/lib/admin-data";
import { statusBadge } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — eCRIS" }] }),
  component: AdminDashboard,
});

const when = (iso: string) => {
  const d = new Date(iso);
  return `${isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMM d")}, ${format(d, "h:mm a")}`;
};

async function load() {
  const [b, enc, logs] = await Promise.all([
    supabase.from("birth_records").select("id,registry_number,child_first_name,child_middle_name,child_last_name,status,created_at,date_registered,encoded_by").order("created_at", { ascending: true }),
    supabase.from("user_roles").select("user_id").eq("role", "encoder"),
    supabase.from("audit_logs").select("id,user_id,action,entity_id,details,created_at").eq("entity", "birth_record").order("created_at", { ascending: false }).limit(5),
  ]);
  return { births: b.data ?? [], encoders: (enc.data ?? []).map((e) => e.user_id), logs: logs.data ?? [] };
}

function AdminDashboard() {
  const { data } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: load });
  const { data: profiles = [] } = useProfiles();
  if (!data) return <p className="text-muted-foreground">Loading overview…</p>;

  const name = (id: string | null) => shortName(profiles.find((p) => p.id === id)?.full_name);
  const now = new Date();
  const approved = data.births.filter((r) => r.status === "registered" || r.status === "amended");
  const thisMonth = approved.filter((r) => isSameMonth(new Date(r.date_registered), now)).length;
  const lastMonth = approved.filter((r) => isSameMonth(new Date(r.date_registered), startOfMonth(subMonths(now, 1)))).length;
  const pendingRows = data.births.filter((r) => r.status === "for_validation" || r.status === "returned");
  const pendingToday = pendingRows.filter((r) => isToday(new Date(r.created_at))).length;
  const returned = data.births.filter((r) => r.status === "returned").length;
  const activeEncoders = profiles.filter((p) => data.encoders.includes(p.id) && p.is_active).length;
  const pct = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const cards = [
    { label: "Pending Approval", value: pendingRows.length, note: `▲ ${pendingToday} new today`, edge: "border-l-gold", noteCls: "text-warning" },
    { label: "Approved This Month", value: thisMonth, note: pct === null ? "No data last month" : `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs last month`, edge: "border-l-success", noteCls: "text-success" },
    { label: "Returned for Correction", value: returned, note: "Awaiting re-submission", edge: "border-l-destructive", noteCls: "text-warning" },
    { label: "Active Encoders", value: activeEncoders, note: "El Salvador LCRO Staff", edge: "border-l-gold", noteCls: "text-success" },
  ];

  const recordOf = (id: string | null) => data.births.find((r) => r.id === id);
  const activity = data.logs.map((l) => {
    const rec = recordOf(l.entity_id);
    const st = (l.details as { status?: string } | null)?.status;
    const who = name(l.user_id);
    const child = rec ? childName(rec) : "record";
    if (l.action === "insert") return { icon: FilePlus2, title: "Encoded", text: `${child} submitted for review`, who, at: l.created_at };
    if (st === "registered") return { icon: CheckCircle2, title: "Approved", text: child, who, at: l.created_at };
    if (st === "returned") return { icon: Undo2, title: "Returned", text: child, who, at: l.created_at };
    return { icon: RefreshCw, title: "Updated", text: child, who, at: l.created_at };
  });

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">El Salvador City LCRO — Civil Registration Overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg border border-l-4 bg-card p-5 ${c.edge}`}>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-primary">{c.value.toLocaleString()}</p>
            <p className={`mt-1 text-xs ${c.noteCls}`}>{c.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg">Pending Approval Queue</h2>
            <Link to="/admin/review" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2">Reg. No.</th><th>Child Name</th><th>Encoder</th><th>Status</th></tr></thead>
            <tbody>
              {pendingRows.slice(0, 5).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2.5 font-mono text-xs">{r.registry_number}</td><td>{childName(r)}</td><td>{name(r.encoded_by)}</td><td>{statusBadge(r.status)}</td>
                </tr>
              ))}
              {pendingRows.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Nothing waiting for approval.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
          <h2 className="border-b pb-2 text-lg">Recent Activity</h2>
          <ul className="mt-2">
            {activity.map((a, i) => (
              <li key={i} className="flex items-center gap-3 border-b py-3 last:border-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent"><a.icon className="h-4 w-4 text-primary" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm"><span className="font-semibold">{a.title}</span> — {a.text}</p>
                  <p className="text-xs text-muted-foreground">{when(a.at)} · {a.who}</p>
                </div>
              </li>
            ))}
            {activity.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
