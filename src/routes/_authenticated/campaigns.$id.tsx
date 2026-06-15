import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db, type Campaign, type CampaignSupplier, type Message } from "@/lib/db";
import {
  scoreCampaign, upgradeCampaign, launchOutreach, recordReply, setCommissionResponse,
} from "@/lib/agent.functions";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Loader2, Sparkles, Zap, Send, Crown, MessageSquare, Building2, Trophy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  component: CampaignPage,
});

function err(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("RATE_LIMIT")) return "AI is rate-limited. Try again in a moment.";
  if (m.includes("CREDITS")) return "AI credits exhausted. Add credits in workspace settings.";
  return m;
}

function CampaignPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const campaign = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await db.from("campaigns").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Campaign;
    },
  });

  const suppliers = useQuery({
    queryKey: ["campaign-suppliers", id],
    queryFn: async () => {
      const { data, error } = await db.from("campaign_suppliers").select("*").eq("campaign_id", id).order("match_score", { ascending: false });
      if (error) throw error;
      return data as CampaignSupplier[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["campaign", id] });
    qc.invalidateQueries({ queryKey: ["campaign-suppliers", id] });
    qc.invalidateQueries({ queryKey: ["campaigns"] });
  };

  const scoreFn = useServerFn(scoreCampaign);
  const upgradeFn = useServerFn(upgradeCampaign);
  const launchFn = useServerFn(launchOutreach);

  const score = useMutation({
    mutationFn: () => scoreFn({ data: { campaignId: id } }),
    onSuccess: (r) => { toast.success(`Scored — ${r.count} matches found`); invalidate(); },
    onError: (e) => toast.error(err(e)),
  });
  const upgrade = useMutation({
    mutationFn: () => upgradeFn({ data: { campaignId: id } }),
    onSuccess: () => { toast.success("Upgraded — agent activated"); invalidate(); },
    onError: (e) => toast.error(err(e)),
  });
  const launch = useMutation({
    mutationFn: () => launchFn({ data: { campaignId: id } }),
    onSuccess: (r) => { toast.success(`Outreach sent to ${r.sent} suppliers`); invalidate(); },
    onError: (e) => toast.error(err(e)),
  });

  if (campaign.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!campaign.data) return <p>Campaign not found.</p>;
  const c = campaign.data;
  const list = suppliers.data ?? [];

  return (
    <div>
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <PageHeader
        title={c.brand}
        description={c.product ?? undefined}
        actions={<StatusBadge value={c.status} />}
      />

      {/* Brief summary */}
      <Card className="mb-6 grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Category" value={c.category} />
        <Detail label="Volume" value={c.volume} />
        <Detail label="Packaging" value={c.packaging} />
        <Detail label="Technical requirements" value={c.technical_requirements} />
        <Detail label="Certifications" value={c.certifications_needed} />
        <Detail label="Target launch" value={c.target_launch} />
      </Card>

      {/* Action bar */}
      <Card className="mb-8 flex flex-wrap items-center gap-3 p-5">
        <Button onClick={() => score.mutate()} disabled={score.isPending} variant={list.length ? "outline" : "default"}>
          {score.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {list.length ? "Re-score matches" : "Score against database"}
        </Button>

        {list.length > 0 && !c.upgraded && (
          <UpgradeDialog onConfirm={() => upgrade.mutate()} pending={upgrade.isPending} count={list.length} />
        )}

        {c.upgraded && (
          <Button onClick={() => launch.mutate()} disabled={launch.isPending}>
            {launch.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Launch / continue outreach
          </Button>
        )}
        {!c.upgraded && list.length === 0 && (
          <p className="text-sm text-muted-foreground">Score the brief first to see the highest matches.</p>
        )}
      </Card>

      {list.length > 0 && (
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="matches" className="mt-6 grid gap-4">
            {list.map((s) => <SupplierCard key={s.id} s={s} onChange={invalidate} upgraded={c.upgraded} />)}
          </TabsContent>
          <TabsContent value="pipeline" className="mt-6">
            <Pipeline list={list} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "—"}</p>
    </div>
  );
}

function UpgradeDialog({ onConfirm, pending, count }: { onConfirm: () => void; pending: boolean; count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Crown className="mr-2 h-4 w-4" /> Upgrade to activate ($20)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Activate the sourcing agent</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          We found <strong>{count}</strong> high-scoring matches — plus a few more on the side. Would you like the
          agent to go forward and talk to them so you don't have to? Upgrade to Pro (~$20) to start outreach.
        </p>
        <Button onClick={() => { onConfirm(); setOpen(false); }} disabled={pending} className="mt-2">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Yes, activate the agent
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function SupplierCard({ s, onChange, upgraded }: { s: CampaignSupplier; onChange: () => void; upgraded: boolean }) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const replyFn = useServerFn(recordReply);
  const commissionFn = useServerFn(setCommissionResponse);

  const messages = useQuery({
    queryKey: ["messages", s.id],
    queryFn: async () => {
      const { data, error } = await db.from("messages").select("*").eq("campaign_supplier_id", s.id).order("created_at");
      if (error) throw error;
      return data as Message[];
    },
  });

  const record = useMutation({
    mutationFn: () => replyFn({ data: { campaignSupplierId: s.id, replyText: reply } }),
    onSuccess: (r) => {
      toast.success(`Reply classified: ${r.classification}`);
      setReply("");
      qc.invalidateQueries({ queryKey: ["messages", s.id] });
      onChange();
    },
    onError: (e) => toast.error(err(e)),
  });
  const commission = useMutation({
    mutationFn: (agreed: boolean) => commissionFn({ data: { campaignSupplierId: s.id, agreed } }),
    onSuccess: () => { toast.success("Recorded"); qc.invalidateQueries({ queryKey: ["messages", s.id] }); onChange(); },
    onError: (e) => toast.error(err(e)),
  });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="font-display text-lg">{s.company_name}</p>
            <StatusBadge value={s.stage} />
            {s.response && <StatusBadge value={s.response} />}
            {s.is_partner && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"><Trophy className="h-3 w-3" /> Partner</span>}
            {s.source === "competitor" && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-foreground">Competitor co-man</span>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{s.match_reasons}</p>
          {s.contact_name && <p className="mt-0.5 text-xs text-muted-foreground">{s.contact_name} · {s.email}</p>}
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-primary">{s.match_score}</p>
          <p className="text-xs text-muted-foreground">match</p>
        </div>
      </div>

      {/* Threads */}
      {(messages.data?.length ?? 0) > 0 && (
        <div className="mt-4 space-y-2 rounded-lg border bg-muted/30 p-3">
          {messages.data!.map((m) => (
            <div key={m.id} className={`text-sm ${m.direction === "inbound" ? "pl-6" : ""}`}>
              <p className="text-xs font-semibold text-muted-foreground">
                {m.direction === "inbound" ? "↩ Supplier" : "→ Agent"}{m.classification ? ` · ${m.classification}` : ""}
              </p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Commission step for QUALIFIED */}
      {s.stage === "QUALIFIED" && s.commission_status === "asked" && (
        <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3">
          <p className="text-sm font-medium">Agent asked about referral commission. How did they respond?</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => commission.mutate(true)} disabled={commission.isPending}>Agreed to commission</Button>
            <Button size="sm" variant="outline" onClick={() => commission.mutate(false)} disabled={commission.isPending}>Declined commission</Button>
          </div>
        </div>
      )}

      {/* Simulate reply */}
      {upgraded && s.stage !== "IDENTIFIED" && (
        <div className="mt-4">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Paste the supplier's reply to classify (Yes / No / Maybe)…"
          />
          <Button size="sm" className="mt-2" onClick={() => record.mutate()} disabled={record.isPending || !reply.trim()}>
            {record.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
            Classify & run branch
          </Button>
        </div>
      )}
    </Card>
  );
}

const STAGES = ["IDENTIFIED", "CONTACTED", "RESPONDED", "QUALIFIED", "NEGOTIATING", "FINALIZED", "REJECTED"];
function Pipeline({ list }: { list: CampaignSupplier[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage) => {
        const items = list.filter((s) => s.stage === stage);
        if (items.length === 0) return null;
        return (
          <div key={stage} className="rounded-lg border bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge value={stage} />
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="rounded-md border bg-background p-2.5 text-sm">
                  <p className="font-medium">{s.company_name}</p>
                  <p className="text-xs text-muted-foreground">Score {s.match_score}{s.response ? ` · ${s.response}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
