import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db, type Escalation } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/escalations")({
  component: Escalations,
});

type EscRow = Escalation & { campaigns?: { brand: string; id: string } | null };

function Escalations() {
  const qc = useQueryClient();
  const escalations = useQuery({
    queryKey: ["escalations"],
    queryFn: async () => {
      const { data, error } = await db
        .from("escalations")
        .select("*, campaigns(id,brand)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EscRow[];
    },
  });
  const list = escalations.data ?? [];
  const open = list.filter((e) => e.status === "OPEN");
  const resolved = list.filter((e) => e.status !== "OPEN");

  return (
    <div>
      <PageHeader
        title="Escalation center"
        description="Where the agent pulls a human in — YES + commission handoffs, and batched MAYBE questions to send the client (anonymized)."
      />
      {list.length === 0 && (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No escalations yet. They appear as suppliers respond to outreach.</p>
        </Card>
      )}
      {open.length > 0 && (
        <>
          <h2 className="mb-3 font-display text-xl">Open</h2>
          <div className="grid gap-3">{open.map((e) => <EscCard key={e.id} e={e} onDone={() => qc.invalidateQueries({ queryKey: ["escalations"] })} />)}</div>
        </>
      )}
      {resolved.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-xl">Resolved</h2>
          <div className="grid gap-3">{resolved.map((e) => <EscCard key={e.id} e={e} onDone={() => qc.invalidateQueries({ queryKey: ["escalations"] })} />)}</div>
        </>
      )}
    </div>
  );
}

function EscCard({ e, onDone }: { e: EscRow; onDone: () => void }) {
  const [resolution, setResolution] = useState(e.resolution ?? "");
  const resolve = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("escalations").update({ status: "RESOLVED", resolution }).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Escalation resolved"); onDone(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
          <p className="font-display text-lg">{e.reason}</p>
          <StatusBadge value={e.status} />
        </div>
        {e.campaigns && (
          <Link to="/campaigns/$id" params={{ id: e.campaigns.id }} className="text-sm text-primary hover:underline">
            {e.campaigns.brand} →
          </Link>
        )}
      </div>
      {e.context && <p className="mt-2 rounded-md bg-muted/40 p-3 text-sm">{e.context}</p>}
      {e.status === "OPEN" ? (
        <div className="mt-3">
          <Textarea rows={2} placeholder="Add resolution notes (call summary, decision, contract status)…" value={resolution} onChange={(ev) => setResolution(ev.target.value)} />
          <Button size="sm" className="mt-2" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
            {resolve.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Mark resolved
          </Button>
        </div>
      ) : (
        e.resolution && <p className="mt-2 text-sm italic text-muted-foreground">Resolution: {e.resolution}</p>
      )}
    </Card>
  );
}
