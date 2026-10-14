import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Search, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusBadge } from "@/lib/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function BirthList({ title, eyebrow, mineOnly = false }: { title: string; eyebrow: string; mineOnly?: boolean }) {
  const [q, setQ] = useState("");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["births", mineOnly ? "mine" : "all"],
    queryFn: async () => {
      let query = supabase.from("birth_records").select("*").order("created_at", { ascending: false }).limit(500);
      if (mineOnly) {
        const { data: u } = await supabase.auth.getUser();
        query = query.eq("encoded_by", u.user?.id ?? "");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => rows.filter((r) => {
    const s = `${r.registry_number} ${r.child_first_name} ${r.child_middle_name ?? ""} ${r.child_last_name} ${r.mother_name}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [rows, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
          <h1 className="text-3xl">{title}</h1>
        </div>
        <Button asChild><Link to="/births/new"><Plus className="mr-2 h-4 w-4" />New birth record</Link></Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by registry no., child or mother's name" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="overflow-hidden rounded-lg border border-t-2 border-t-gold bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registry No.</TableHead><TableHead>Child</TableHead><TableHead>Sex</TableHead>
              <TableHead>Date of birth</TableHead><TableHead>Mother</TableHead><TableHead>Registered</TableHead>
              <TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={8} className="text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No matching records.</TableCell></TableRow>}
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.registry_number ?? "—"}</TableCell>
                <TableCell className="font-medium">{r.child_last_name}, {r.child_first_name} {r.child_middle_name ?? ""}</TableCell>
                <TableCell>{r.sex}</TableCell>
                <TableCell>{format(new Date(r.date_of_birth), "MMM d, yyyy")}</TableCell>
                <TableCell>{r.mother_name}</TableCell>
                <TableCell>{format(new Date(r.date_registered), "MMM d, yyyy")}</TableCell>
                <TableCell>{statusBadge(r.status)}{r.status === "returned" && r.return_reason && <p className="mt-1 max-w-48 text-xs text-destructive">{r.return_reason}</p>}</TableCell>
                <TableCell>
                  {r.status === "returned" && (
                    <Button asChild size="sm" variant="ghost"><Link to="/births/edit/$id" params={{ id: r.id }}><Pencil className="mr-1 h-4 w-4" />Edit &amp; Resubmit</Link></Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
