import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv, printTable } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — eCRIS" }] }),
  component: Reports,
});

const parse = (ym: string) => { const [y, m] = ym.split("-").map(Number); return new Date(y!, m! - 1, 1); };

function Reports() {
  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-01`);
  const [to, setTo] = useState(format(now, "yyyy-MM"));
  const [type, setType] = useState("Monthly Birth Summary");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("birth_records").select("registry_number,child_first_name,child_middle_name,child_last_name,sex,date_of_birth,mother_name,father_name,status,date_registered").limit(10000);
      if (error) throw error;
      return data;
    },
  });

  const start = parse(from);
  const end = parse(to);
  const valid = from && to && start <= end;
  const monthsList: Date[] = [];
  if (valid) for (let d = start; d <= end && monthsList.length < 60; d = addMonths(d, 1)) monthsList.push(d);

  const summary = monthsList.map((m) => {
    const inMonth = rows.filter((r) => startOfMonth(new Date(r.date_registered)).getTime() === m.getTime());
    const approved = inMonth.filter((r) => r.status === "registered" || r.status === "amended").length;
    const pending = inMonth.filter((r) => r.status === "for_validation" || r.status === "returned").length;
    return [format(m, "MMMM"), inMonth.length, approved, pending] as (string | number)[];
  });

  const inRange = rows.filter((r) => { const d = new Date(r.date_registered); return valid && d >= start && d < addMonths(end, 1) && (r.status === "registered" || r.status === "amended"); });
  const listing = inRange.map((r) => [r.registry_number, `${r.child_last_name}, ${r.child_first_name} ${r.child_middle_name ?? ""}`.trim(), r.sex, format(new Date(r.date_of_birth), "MMM d, yyyy"), r.mother_name, r.father_name ?? "—", format(new Date(r.date_registered), "MMM d, yyyy")]);

  const isSummary = type === "Monthly Birth Summary";
  const head = isSummary ? ["Month", "Registered", "Approved", "Pending"] : ["LCR No.", "Child", "Sex", "Date of Birth", "Mother", "Father", "Date Registered"];
  const body = isSummary ? summary : listing;
  const subtitle = `${format(start, "MMMM yyyy")} – ${format(end, "MMMM yyyy")} · El Salvador City LCRO`;
  const fileBase = `${type.toLowerCase().replace(/\s+/g, "-")}-${from}-to-${to}`;
  const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl">Reports</h1>
        <p className="text-sm text-muted-foreground">Statistical summaries and generated documents for El Salvador LCRO</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
          <h2 className="border-b pb-2 text-lg">Births by Month{valid ? ` — ${format(start, "MMM yyyy")} to ${format(end, "MMM yyyy")}` : ""}</h2>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2">Month</th><th>Registered</th><th>Approved</th><th>Pending</th></tr></thead>
            <tbody>
              {summary.map((r) => <tr key={String(r[0]) + r[1]} className="border-t">{r.map((c, i) => <td key={i} className="py-2.5">{c}</td>)}</tr>)}
              {!valid && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Choose a valid date range.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-t-2 border-t-gold bg-card p-5">
          <h2 className="border-b pb-2 text-lg">Generate Reports</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5"><Label>Report Type</Label>
              <select className={sel} value={type} onChange={(e) => setType(e.target.value)}><option>Monthly Birth Summary</option><option>Registry Listing</option></select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>From</Label><Input type="month" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>To</Label><Input type="month" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </div>
            <div className="flex gap-2">
              <Button disabled={!valid} onClick={() => printTable(type, subtitle, head, body)}>⬇ Export PDF</Button>
              <Button variant="outline" disabled={!valid} onClick={() => downloadCsv(`${fileBase}.csv`, [head, ...body])}>⬇ Export Excel</Button>
            </div>
            <p className="text-xs text-muted-foreground">Excel export downloads a CSV file that opens in Excel. PDF opens the print dialog — choose "Save as PDF".</p>
          </div>
        </section>
      </div>
    </div>
  );
}
