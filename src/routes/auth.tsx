import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — CRIS" },
      { name: "description", content: "Sign in to the Civil Registration Information System." },
      { property: "og:title", content: "Staff Sign In — CRIS" },
      { property: "og:description", content: "Sign in to the Civil Registration Information System." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function home() {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id ?? "";
    const [{ data }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("is_active").eq("id", uid).maybeSingle(),
    ]);
    if (prof && !prof.is_active) {
      await supabase.auth.signOut();
      throw new Error("This account is deactivated. Contact the administrator.");
    }
    const staff = (data ?? []).some((r) => r.role === "admin" || r.role === "registrar");
    await navigate({ to: staff ? "/admin" : "/births/new" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await home();
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-seal p-12 text-primary-foreground md:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold font-display font-bold text-gold">LCR</div>
        <div>
          <h1 className="text-4xl leading-tight">Civil Registration Information System</h1>
          <p className="mt-4 opacity-75">Authorized personnel only. All actions are logged.</p>
        </div>
        <div className="gold-rule pt-4 text-xs uppercase tracking-widest opacity-60">El Salvador City — Local Civil Registry Office</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl">Staff sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your office credentials.</p>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
        </form>
      </div>
    </div>
  );
}
