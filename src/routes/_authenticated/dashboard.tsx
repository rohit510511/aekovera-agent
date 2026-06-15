import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, type Campaign } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderPlus, Boxes, CheckCircle2, AlertTriangle, ArrowRight, Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await db.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ count: suppliers }, { count: qualified }, { count: escalations }] = await Promise.all([
        db.from("suppliers").select("*", { count: "exact", head: true }),
        db.from("campaign_suppliers").select("*", { count: "exact", head: true }).eq("stage", "QUALIFIED"),
        db.from("escalations").select("*", { count: "exact", head: true }).eq("status", "OPEN"),
      ]);
      return { suppliers: suppliers ?? 0, qualified: qualified ?? 0, escalations: escalations ?? 0 };
    },
  });

  const list = campaigns.data ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your sourcing campaigns at a glance."
        actions={<Button asChild><Link to="/campaigns/new"><FolderPlus className="mr-1 h-4 w-4" /> New brief</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Active campaigns" value={list.filter((c) => c.upgraded).length} />
        <StatCard icon={Boxes} label="Suppliers in pool" value={stats.data?.suppliers ?? 0} />
        <StatCard icon={CheckCircle2} label="Qualified suppliers" value={stats.data?.qualified ?? 0} />
        <StatCard icon={AlertTriangle} label="Open escalations" value={stats.data?.escalations ?? 0} accent />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl">Campaigns</h2>
        {campaigns.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <Card className="mt-4 flex flex-col items-center justify-center gap-3 p-12 text-center">
            <FolderPlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No campaigns yet. Upload your first brief to start sourcing.</p>
            <Button asChild><Link to="/campaigns/new">Create a brief</Link></Button>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4">
            {list.map((c) => (
              <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }}>
                <Card className="flex items-center justify-between p-5 transition-colors hover:border-accent/50">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg">{c.brand}</p>
                      <StatusBadge value={c.status} />
                      {!c.upgraded && <span className="text-xs font-semibold text-accent-foreground">Free · upgrade to activate</span>}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{c.product}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent,
}: { icon: typeof Inbox; label: string; value: number; accent?: boolean }) {
  return (
    <Card className="p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
