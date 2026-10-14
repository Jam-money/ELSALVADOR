import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; full_name: string; position: string | null; username: string | null; is_active: boolean; last_active_at: string | null };

export function useProfiles() {
  return useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,full_name,position,username,is_active,last_active_at");
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function usePendingCount() {
  return useQuery({
    queryKey: ["admin", "pendingCount"],
    queryFn: async () => {
      const { count, error } = await supabase.from("birth_records").select("id", { count: "exact", head: true }).in("status", ["for_validation", "returned"]);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30000,
  });
}

export const shortName = (full?: string | null) => {
  if (!full) return "—";
  const p = full.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]![0]}. ${p[p.length - 1]}` : full;
};

export const childName = (r: { child_last_name: string; child_first_name: string; child_middle_name: string | null }) =>
  `${r.child_last_name}, ${r.child_first_name}${r.child_middle_name ? ` ${r.child_middle_name[0]}.` : ""}`;
