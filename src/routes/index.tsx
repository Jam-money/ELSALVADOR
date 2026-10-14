import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRIS — Civil Registration Information System" },
      { name: "description", content: "Secure records management for birth, marriage, and death registration at the El Salvador City Local Civil Registry Office." },
      { property: "og:title", content: "CRIS — Civil Registration Information System" },
      { property: "og:description", content: "Secure records management for the El Salvador City Local Civil Registry Office." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-seal text-primary-foreground">
      <div className="gold-rule" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold font-display text-sm font-bold text-gold">LCR</div>
          <div>
            <p className="font-display text-lg leading-tight">El Salvador City</p>
            <p className="text-xs uppercase tracking-widest opacity-70">Local Civil Registry Office</p>
          </div>
        </div>
        <Button asChild variant="secondary"><Link to="/auth">Staff sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Civil Registration Information System</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">Every life event, recorded with care and accountability.</h1>
        <p className="mt-6 max-w-xl text-lg opacity-80">Encode, validate, and retrieve birth, marriage, and death records — with a complete audit trail for every change.</p>
        <Button asChild size="lg" className="mt-10 bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/auth">Enter the system</Link></Button>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { icon: FileText, t: "Registry records", d: "Structured encoding with validation and duplicate checks." },
            { icon: BarChart3, t: "Office analytics", d: "Monthly trends, transactions, and workload at a glance." },
            { icon: ShieldCheck, t: "Role-based access", d: "Admin, registrar, encoder, and viewer permissions." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-6">
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-lg">{t}</h3>
              <p className="mt-2 text-sm opacity-75">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
