import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, startOfDay } from "date-fns";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Baby, Heart, Cross, Archive, PenLine, Receipt, Clock, AlertCircle, FileEdit, FileCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CRIS" },
      { name: "description", content: "Civil registry office overview and analytics." },
      { property: "og:title", content: "Dashboard — CRIS" },
      { property: "og:description", content: "Civil registry office overview and analytics." },
    ],
  }),
  component: Dashboard,
});

type Row = { created_at: string; status: string };

async function load() {
  const since = startOfMonth(subMonths(new Date(), 11)).toISOString();
  const [b, m, d, t, u] = await Promise.all([
    supabase.from("birth_records").select("created_at,status"),
    supabase.from("marriage_records").select("created_at,status"),
    supabase.from("death_records").select("created_at,status"),
    supabase.from("transactions").select("created_at,status,transaction_type").gte("created_at", since),
    supabase.from("user_roles").select("user_id"),
  ]);
  return { births: (b.data ?? []) as Row[], marriages: (m.data ?? []) as Row[], deaths: (d.data ?? []) as Row[], tx: t.data ?? [], users: new Set((u.data ?? []).map((x) => x.user_id)).size };
}

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: load });
  if (!data) return <p className="text-muted-foreground">Loading office data…</p>;

  const today = startOfDay(new Date()).getTime();
  const all = [...data.births, ...data.marriages, ...data.deaths];
  const isToday = (r: { created_at: string }) => new Date(r.created_at).getTime() >= today;

  const months = Array.from({ length: 12 }, (_, i) => startOfMonth(subMonths(new Date(), 11 - i)));
  const key = (s: string) => format(new Date(s), "yyyy-MM");
  const countBy = (rows: { created_at: string }[]) => rows.reduce<Record<string, number>>((a, r) => ((a[key(r.created_at)] = (a[key(r.created_at)] ?? 0) + 1), a), {});
  const [bm, mm, dm] = [countBy(data.births), countBy(data.marriages), countBy(data.deaths)];
  const monthly = months.map((m) => { const k = format(m, "yyyy-MM"); return { month: format(m, "MMM"), Birth: bm[k] ?? 0, Marriage: mm[k] ?? 0, Death: dm[k] ?? 0 }; });

  const byType = Object.entries(data.tx.reduce<Record<string, number>>((a, t) => ((a[t.transaction_type] = (a[t.transaction_type] ?? 0) + 1), a), {})).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Birth Records", value: data.births.length, icon: Baby },
    { label: "Marriage Records", value: data.marriages.length, icon: Heart },
    { label: "Death Records", value: data.deaths.length, icon: Cross },
    { label: "Total Registered", value: all.filter((r) => r.status === "registered").length, icon: Archive },
    { label: "Encoded Today", value: all.filter(isToday).length, icon: PenLine },
    { label: "Transactions Today", value: data.tx.filter(isToday).length, icon: Receipt },
    { label: "Pending Transactions", value: data.tx.filter((t) => t.status === "pending").length, icon: Clock, warn: true },
    { label: "Requiring Validation", value: all.filter((r) => r.status === "for_validation").length, icon: AlertCircle, warn: true },
    { label: "Amendments", value: all.filter((r) => r.status === "amended").length, icon: FileEdit },
    { label: "Certificates Issued", value: data.tx.filter((t) => t.transaction_type === "Certified Copy" && t.status === "completed").length, icon: FileCheck },
    { label: "Active Users", value: data.users, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Office overview</p>
          <h1 className="text-3xl">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, warn }) => (
          <Card key={label} className="border-t-2 border-t-gold">
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={`mt-2 font-display text-3xl ${warn && value > 0 ? "text-warning" : "text-primary"}`}>{value.toLocaleString()}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-lg">Registrations by month</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
                <Tooltip /><Legend />
                <Bar dataKey="Birth" fill={C[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Marriage" fill={C[1]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Death" fill={C[3]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Transactions by type</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {byType.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="font-display text-lg">Registration trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly.map((m) => ({ ...m, Total: m.Birth + m.Marriage + m.Death }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Total" stroke={C[0]} strokeWidth={2.5} dot={{ fill: C[1] }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
