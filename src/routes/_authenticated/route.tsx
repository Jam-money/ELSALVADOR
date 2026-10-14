import { createFileRoute, redirect, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Baby, Heart, HeartPulse, FileSearch, FolderOpen, LogOut, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: prof } = await supabase.from("profiles").select("is_active,last_active_at").eq("id", data.user.id).maybeSingle();
    if (prof && !prof.is_active) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }
    if (!prof?.last_active_at || Date.now() - new Date(prof.last_active_at).getTime() > 10 * 60 * 1000) {
      void supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", data.user.id);
    }
    return { user: data.user };
  },
  component: Shell,
});

const soon: { label: string; icon: LucideIcon }[] = [{ label: "CENODEATH", icon: HeartPulse }, { label: "CENOMAR", icon: FileSearch }, { label: "MARRIAGE", icon: Heart }];

function Shell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: me } = useQuery({
    queryKey: ["me", user.id],
    queryFn: async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      return { name: p?.full_name ?? user.email, roles: (r ?? []).map((x) => x.role) };
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (path.startsWith("/admin")) return <Outlet />;

  const role = me?.roles[0];
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Staff";
  const item = (active: boolean) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? "border-l-2 border-gold bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"}`;
  const ico = (Icon: LucideIcon, active: boolean) => <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-sidebar-foreground/70"}`} />;
  const birthActive = path.startsWith("/births");
  const encActive = path.startsWith("/encodings");

  return (
    <div className="flex min-h-screen flex-col bg-seal text-sidebar-foreground">
      <header className="flex items-center gap-4 border-t-[3px] border-gold px-6 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-white">
          <img src="/psa-logo.png" alt="Philippine Statistics Authority" className="h-full w-full object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div>
          <p className="font-display text-sm text-sidebar-accent-foreground">eCRIS</p>
          <p className="text-[10px] uppercase tracking-widest opacity-60">El Salvador City Civil Registrar</p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col px-4 pb-6 pt-4 md:flex">
          <p className="font-display text-lg text-sidebar-accent-foreground">{roleLabel} Staff View</p>
          <p className="truncate text-sm text-gold">{me?.name}</p>
          <nav className="mt-8 flex-1 space-y-1">
            <Link to="/births/new" className={item(birthActive)}>{ico(Baby, birthActive)}BIRTH</Link>
            {soon.map((s) => (
              <span key={s.label} title="Coming soon" className={`${item(false)} cursor-not-allowed opacity-50`}>{ico(s.icon, false)}{s.label}</span>
            ))}
            <div className="my-4 border-t border-sidebar-border" />
            <Link to="/encodings" className={item(encActive)}>{ico(FolderOpen, encActive)}All My Encodings</Link>
          </nav>
          <button onClick={signOut} className="flex items-center gap-3 border-t border-sidebar-border px-3 pt-4 text-left text-sm hover:text-sidebar-accent-foreground"><LogOut className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />LOG OUT</button>
        </aside>
        <main className="min-w-0 flex-1 bg-background p-6 text-foreground md:p-8">
          <div className="mb-4 flex justify-between gap-3 text-sm md:hidden">
            <Link to="/births/new">BIRTH</Link>
            <Link to="/encodings">All My Encodings</Link>
            <button onClick={signOut} className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />LOG OUT</button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}