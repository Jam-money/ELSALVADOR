import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { printHtml } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/registry")({
  head: () => ({ meta: [{ title: "Registry Book — eCRIS" }] }),
  component: Registry,
});

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const up = (v: string | null | undefined) => (v ? v.toUpperCase() : "");
const val = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const clock = (t: string | null) => (t ? format(new Date(`1970-01-01T${t}`), "h:mm a") : "");

const H = "border border-neutral-700 bg-[#f1ead7] px-1.5 py-1 text-center align-middle font-display text-[10px] font-bold uppercase leading-tight text-neutral-900";
const S = "border border-neutral-700 bg-[#f1ead7] px-1 py-0.5 text-center align-middle font-display text-[9px] font-semibold leading-tight text-neutral-900";
const N = "border border-neutral-700 bg-[#f1ead7] px-1 py-0.5 text-center text-[9px] text-neutral-700";
const D = "h-9 break-words border border-neutral-600 px-1 text-center align-middle font-mono text-[10px] text-neutral-900";

function Registry() {
  const thisYear = new Date().getFullYear();
  const [draft, setDraft] = useState({ year: String(thisYear), month: "all", q: "" });
  const [f, setF] = useState(draft);
  const tableRef = useRef<HTMLTableElement>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "registry"],
    queryFn: async () => {
      const { data, error } = await supabase.from("birth_records").select("*").in("status", ["registered", "amended"]).order("registry_number", { ascending: true }).limit(5000);
      if (error) throw error;
      return data;
    },
  });

  const years = useMemo(() => [...new Set([thisYear, ...rows.map((r) => new Date(r.date_registered).getFullYear())])].sort((a, b) => b - a), [rows, thisYear]);

  const shown = rows.filter((r) => {
    const d = new Date(r.date_registered);
    if (String(d.getFullYear()) !== f.year) return false;
    if (f.month !== "all" && String(d.getMonth()) !== f.month) return false;
    const q = f.q.trim().toLowerCase();
    if (!q) return true;
    return `${r.child_last_name}, ${r.child_first_name} ${r.child_middle_name ?? ""} ${r.child_first_name} ${r.child_last_name}`.toLowerCase().includes(q);
  });

  const cells = (r: (typeof rows)[number]) => {
    const dob = new Date(r.date_of_birth);
    const place = [r.hospital, r.birth_city].filter(Boolean).join(", ") || r.place_of_birth;
    const mar = r.parents_marriage_date ? new Date(r.parents_marriage_date) : null;
    return [
      r.registry_number, format(new Date(r.date_registered), "dd/MM/yyyy"),
      up(r.child_first_name), up(r.child_middle_name), up(r.child_last_name), r.sex === "Male" ? "M" : "F",
      format(dob, "dd"), format(dob, "MM"), format(dob, "yyyy"), clock(r.time_of_birth), place,
      val(r.type_of_birth), val(r.birth_order),
      up(r.mother_first_name ?? r.mother_name), up(r.mother_last_name), val(r.mother_age), up(r.mother_citizenship), up(r.mother_religion),
      up(r.father_first_name ?? r.father_name), up(r.father_last_name), val(r.father_age), up(r.father_citizenship), up(r.father_religion),
      mar ? format(mar, "dd") : "", mar ? format(mar, "MM") : "", mar ? format(mar, "yyyy") : "",
      [r.parents_marriage_city, r.parents_marriage_province].filter(Boolean).join(", "), val(r.remarks),
    ];
  };

  const sub = `El Salvador City · ${f.year}${f.month === "all" ? "" : ` · ${months[Number(f.month)]}`}`;
  const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl">Registry Book</h1>
        <p className="text-sm text-muted-foreground">Register of Live Birth — El Salvador City</p>
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-lg border border-t-2 border-t-gold bg-card p-5" onSubmit={(e) => { e.preventDefault(); setF(draft); }}>
        <div className="w-40 space-y-1.5"><Label>Year</Label>
          <select className={sel} value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })}>{years.map((y) => <option key={y}>{y}</option>)}</select></div>
        <div className="w-44 space-y-1.5"><Label>Month</Label>
          <select className={sel} value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })}>
            <option value="all">All Months</option>{months.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
        <div className="min-w-56 flex-1 space-y-1.5"><Label>Search by Name</Label>
          <Input placeholder="Last name, First name…" value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} /></div>
        <Button type="submit">Filter</Button>
        <Button type="button" variant="outline" onClick={() => tableRef.current && printHtml("REGISTER OF LIVE BIRTH", `Municipal Form No. 26-1, Revised 1984 · ${sub}`, tableRef.current.outerHTML, true)}>
          <Download className="mr-2 h-4 w-4" />Export PDF
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-t-2 border-t-gold bg-[#fbf8ee] p-3">
        <div className="flex min-w-[1100px] items-end justify-between px-1 pb-2">
          <span className="font-display text-[10px] italic text-neutral-700">(Municipal Form No. 26-1, Revised 1984)</span>
          <h2 className="font-display text-2xl font-bold tracking-wide text-neutral-900">REGISTER OF LIVE BIRTH</h2>
          <span className="w-40 text-right font-display text-xs text-neutral-700">{sub}</span>
        </div>
        <table ref={tableRef} className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr>
              <th className={H} rowSpan={3}>LCR Number</th>
              <th className={H} rowSpan={3}>Date of Registration<br /><span className="font-normal normal-case">(Day/Mo./Year)</span></th>
              <th className={H} colSpan={3}>Name of Child</th>
              <th className={H} rowSpan={3}>Sex</th>
              <th className={H} colSpan={4}>Date and Time of Birth</th>
              <th className={H} rowSpan={3}>Place of Birth<br /><span className="font-normal normal-case">(Name of hospital/institution; if not in hospital, give street/barangay)</span></th>
              <th className={H} colSpan={2}>Type of Birth</th>
              <th className={`${H} tracking-[0.4em]`} colSpan={5}>M O T H E R</th>
              <th className={`${H} tracking-[0.4em]`} colSpan={5}>F A T H E R</th>
              <th className={H} colSpan={4}>Date and Place of Marriage of Parents</th>
              <th className={H} rowSpan={3}>Remarks<br /><span className="font-normal normal-case">(e.g., Delayed, Supplemental Report of Birth, Legitimated by subsequent marriage, Acknowledged by father, For statistical purposes only, etc.)</span></th>
            </tr>
            <tr>
              <th className={S} rowSpan={2}>First</th><th className={S} rowSpan={2}>Middle</th><th className={S} rowSpan={2}>Last</th>
              <th className={S} rowSpan={2}>Day</th><th className={S} rowSpan={2}>Mo.</th><th className={S} rowSpan={2}>Year</th><th className={S} rowSpan={2}>Time</th>
              <th className={S} rowSpan={2}>Type</th><th className={S} rowSpan={2}>Order</th>
              <th className={S} colSpan={2}>Maiden Name</th><th className={S} rowSpan={2}>Age</th><th className={S} rowSpan={2}>Nationality</th><th className={S} rowSpan={2}>Religion</th>
              <th className={S} colSpan={2}>Name</th><th className={S} rowSpan={2}>Age</th><th className={S} rowSpan={2}>Nationality</th><th className={S} rowSpan={2}>Religion</th>
              <th className={S} colSpan={3}>Date</th><th className={S} rowSpan={2}>Place<br /><span className="font-normal">(Municipality, Province)</span></th>
            </tr>
            <tr>
              <th className={S}>First</th><th className={S}>Last</th>
              <th className={S}>First</th><th className={S}>Last</th>
              <th className={S}>Day</th><th className={S}>Mo.</th><th className={S}>Year</th>
            </tr>
            <tr>
              <th className={N}>(1)</th><th className={N}>(2)</th><th className={N} colSpan={3}>(3)</th><th className={N}>(4)</th>
              <th className={N}>(5)</th><th className={N}>(6)</th><th className={N}>(7)</th><th className={N}>(8)</th><th className={N}>(9)</th>
              <th className={N}>(10)</th><th className={N}>(11)</th>
              <th className={N} colSpan={2}>(12)</th><th className={N}>(13)</th><th className={N}>(14)</th><th className={N}>(15)</th>
              <th className={N} colSpan={2}>(16)</th><th className={N}>(17)</th><th className={N}>(18)</th><th className={N}>(19)</th>
              <th className={N}>(20)</th><th className={N}>(21)</th><th className={N}>(22)</th><th className={N}>(23)</th><th className={N}>(24)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={28} className="p-6 text-center font-sans text-sm text-muted-foreground">Loading…</td></tr>}
            {!isLoading && shown.length === 0 && <tr><td colSpan={28} className="p-8 text-center font-sans text-sm text-muted-foreground">No approved records for this filter.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className="bg-white/60 hover:bg-gold/10">
                {cells(r).map((c, i) => <td key={i} className={D}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
