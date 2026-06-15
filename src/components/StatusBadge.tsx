import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  // responses
  Yes: "bg-success/15 text-success border-success/30",
  No: "bg-destructive/10 text-destructive border-destructive/30",
  Maybe: "bg-warning/20 text-warning-foreground border-warning/40",
  // stages
  IDENTIFIED: "bg-muted text-muted-foreground border-border",
  CONTACTED: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  RESPONDED: "bg-accent/15 text-accent-foreground border-accent/30",
  QUALIFIED: "bg-success/15 text-success border-success/30",
  NEGOTIATING: "bg-primary/10 text-primary border-primary/30",
  FINALIZED: "bg-success/20 text-success border-success/40",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/30",
  // campaign status
  DRAFT: "bg-muted text-muted-foreground border-border",
  SCORED: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  ACTIVE: "bg-accent/15 text-accent-foreground border-accent/30",
  OUTREACH_SENT: "bg-primary/10 text-primary border-primary/30",
  OPEN: "bg-warning/20 text-warning-foreground border-warning/40",
  RESOLVED: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ value, className }: { value: string | null | undefined; className?: string }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        MAP[value] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
