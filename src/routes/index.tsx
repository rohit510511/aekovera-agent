import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sprout, Search, Mail, GitBranch, Users, AlertTriangle, BarChart3, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aekovera — AI Supplier Sourcing Agent for CPG Brands" },
      { name: "description", content: "From product brief to qualified supplier in days. AI scores your supplier database, runs personalized outreach, classifies every reply, and escalates the deals that matter." },
      { property: "og:title", content: "Aekovera — AI Supplier Sourcing Agent" },
      { property: "og:description", content: "AI-powered supplier discovery, outreach, and negotiation for CPG brands." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: Search, title: "Score the brief", desc: "AI ranks every supplier in your database against the client brief and flags the highest matches." },
  { icon: Mail, title: "Personalized outreach", desc: "Generates and sends tailored emails to top suppliers and competitors' co-manufacturers." },
  { icon: GitBranch, title: "Classify replies", desc: "Every response is sorted YES / NO / MAYBE and routed down the right branch automatically." },
  { icon: Users, title: "Human handoff", desc: "When a supplier says yes and agrees to commission, a human is pulled in to close." },
  { icon: AlertTriangle, title: "Train the database", desc: "After each reply the supplier's can-do / cannot-do is updated so no one is re-emailed wrongly." },
  { icon: BarChart3, title: "Full analytics", desc: "Response rates, conversion, and pipeline visibility across every campaign." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-display text-xl">Aekovera</span>
        </div>
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
            AI Sourcing Agent for CPG brands
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">
            From product brief to qualified supplier in <span className="text-accent">days, not months.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload a brief. The agent scores your supplier database, runs personalized outreach to the best
            matches and competitors' co-manufacturers, classifies every reply, and escalates the deals worth
            a human's time — logging everything as it goes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start sourcing <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">See the dashboard</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-8 text-sm">
            <div><p className="font-display text-2xl text-primary">3×</p><p className="text-muted-foreground">faster campaigns</p></div>
            <div><p className="font-display text-2xl text-primary">2×</p><p className="text-muted-foreground">better response rates</p></div>
            <div><p className="font-display text-2xl text-primary">10×</p><p className="text-muted-foreground">cost reduction</p></div>
          </div>
        </div>
      </section>

      <section className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl">How the agent works</h2>
          <p className="mt-2 text-muted-foreground">The founder's exact sourcing playbook, automated end to end.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-xl border bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl">Ready to let the agent do the hustle?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Set up a workspace, upload your first brief, and watch the pipeline build itself.
        </p>
        <Button asChild size="lg" className="mt-6"><Link to="/auth">Get started free</Link></Button>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Aekovera Sourcing Agent · AI-powered supplier sourcing automation</p>
      </footer>
    </div>
  );
}
