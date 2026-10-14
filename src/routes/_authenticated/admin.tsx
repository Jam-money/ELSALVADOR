import { createFileRoute, redirect, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Menu, LayoutDashboard, ClipboardCheck, BookOpen, BarChart3, Users, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePendingCount } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    const roles = (data ?? []).map((r) => r.role);
    if (!roles.some((r) => r === "admin" || r === "registrar")) throw redirect({ to: "/births/new" });
    return { roles };
  },
  component: AdminShell,
});

function AdminShell() {
  const { user, roles } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: pending = 0 } = usePendingCount();
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && localStorage.getItem("admin-sidebar") === "closed");
  const toggleSidebar = () => setCollapsed((c) => { localStorage.setItem("admin-sidebar", c ? "open" : "closed"); return !c; });
  const { data: me } = useQuery({
    queryKey: ["adminme", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name,position").eq("id", user.id).maybeSingle();
      return { name: data?.full_name || user.email || "", position: data?.position ?? "" };
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const isAdmin = roles.includes("admin");
  type NavItem = { to: "/admin" | "/admin/review" | "/admin/registry" | "/admin/reports" | "/admin/staff"; label: string; icon: typeof Users; exact?: boolean; badge?: number };
  const groups: { label: string; items: NavItem[] }[] = [
    { label: "Overview", items: [{ to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true }] },
    { label: "Records", items: [
      { to: "/admin/review" as const, label: "Review & Approve", icon: ClipboardCheck, badge: pending },
      { to: "/admin/registry" as const, label: "Registry Book", icon: BookOpen },
      { to: "/admin/reports" as const, label: "Reports", icon: BarChart3 },
    ] },
    ...(isAdmin ? [{ label: "Management", items: [{ to: "/admin/staff" as const, label: "Staff Accounts", icon: Users }] }] : []),
  ];
  const active = (to: string, exact?: boolean) => (exact ? path === to : path.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col bg-seal text-sidebar-foreground">
      <header className="flex items-center justify-between border-t-[3px] border-gold px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} aria-label="Toggle sidebar" className="hidden rounded-md bg-sidebar-accent p-2 transition-all duration-200 hover:bg-sidebar-accent/70 active:scale-90 md:block">
            <Menu className={`h-5 w-5 text-gold transition-transform duration-300 ${collapsed ? "rotate-90" : "rotate-0"}`} />
          </button>
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-white font-display text-sm font-bold text-primary">
            PSA
            <img src="/psa-logo.png" alt="" className="absolute inset-0 h-full w-full bg-white object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div>
            <p className="font-display text-sm text-sidebar-accent-foreground">eCRIS Admin</p>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Civil Registry • PSA Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:inline">El Salvador City LCRO</span>
          <Link to="/admin/review" aria-label="Pending approvals" className="relative rounded-md bg-sidebar-accent p-2 hover:bg-sidebar-accent/70">
            <Bell className="h-4 w-4 text-gold" />
            {pending > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />}
          </Link>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className={`hidden shrink-0 overflow-hidden border-dashed border-gold transition-all duration-300 ease-in-out md:flex ${collapsed ? "w-0 border-l-0 opacity-0" : "w-64 border-l-2 opacity-100"}`}>
          <div className="flex w-64 shrink-0 flex-col px-4 pb-6 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Admin View</p>
          <p className="font-display text-lg text-sidebar-accent-foreground">{me?.name}</p>
          <p className="text-xs opacity-70">{me?.position || (isAdmin ? "City Civil Registrar" : "Registrar")}</p>
          <button onClick={() => setEditing(true)} className="mt-1 text-left text-[10px] opacity-50 hover:opacity-90">✎ Click to edit account</button>
          <nav className="mt-6 flex-1 space-y-5 border-t border-sidebar-border pt-5">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="px-3 pb-1 text-[10px] uppercase tracking-widest opacity-50">{g.label}</p>
                {g.items.map(({ to, label, icon: Icon, exact, badge }) => {
                  const on = active(to, exact);
                  return (
                    <Link key={to} to={to} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${on ? "border-l-2 border-gold bg-sidebar-accent text-gold" : "hover:bg-sidebar-accent/60"}`}>
                      <Icon className="h-4 w-4" />{label}
                      {badge ? <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">{badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <button onClick={signOut} className="flex items-center gap-3 border-t border-sidebar-border px-3 pt-4 text-left text-sm hover:text-sidebar-accent-foreground"><LogOut className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />LOG OUT</button>
          </div>
        </aside>
        <main className={`min-w-0 flex-1 bg-background p-6 text-foreground transition-[padding] duration-300 ${collapsed ? "md:p-5" : "md:p-8"}`}>
          <div className="mb-4 flex flex-wrap gap-4 text-sm md:hidden">
            {groups.flatMap((g) => g.items).map((i) => <Link key={i.to} to={i.to}>{i.label}</Link>)}
            <button onClick={signOut} className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />LOG OUT</button>
          </div>
          <Outlet />
        </main>
      </div>
      <EditAccount open={editing} onClose={() => setEditing(false)} userId={user.id} name={me?.name ?? ""} position={me?.position ?? ""} />
    </div>
  );
}

function EditAccount({ open, onClose, userId, name, position }: { open: boolean; onClose: () => void; userId: string; name: string; position: string }) {
  const qc = useQueryClient();
  const [n, setN] = useState(name);
  const [p, setP] = useState(position);
  useEffect(() => { if (open) { setN(name); setP(position); } }, [open, name, position]);
  async function save() {
    const { error } = await supabase.from("profiles").update({ full_name: n.trim(), position: p.trim() || null }).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Account updated");
    qc.invalidateQueries({ queryKey: ["adminme"] });
    qc.invalidateQueries({ queryKey: ["admin", "profiles"] });
    onClose();
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit account</DialogTitle></DialogHeader>
        <div className="space-y-2"><Label>Full name</Label><Input value={n} onChange={(e) => setN(e.target.value)} /></div>
        <div className="space-y-2"><Label>Position</Label><Input value={p} onChange={(e) => setP(e.target.value)} /></div>
        <Button onClick={save} disabled={!n.trim()}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}
