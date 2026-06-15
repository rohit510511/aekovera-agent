import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, type FormSubmission } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/forms")({
  component: Forms,
});

function Forms() {
  const forms = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await db.from("form_submissions").select("*").order("submission_date", { ascending: false });
      if (error) throw error;
      return data as FormSubmission[];
    },
  });
  const list = forms.data ?? [];

  return (
    <div>
      <PageHeader
        title="Capability form inbox"
        description="When a supplier says no, the agent asks them to fill this. Check here before following up — if they're already on file, say 'no worries, we have you on file.'"
      />
      <div className="grid gap-3">
        {list.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="font-display text-lg">{f.company_name}</p>
                <StatusBadge value={f.open_to_commission} />
              </div>
              <span className="text-xs text-muted-foreground">{f.submission_date} · {f.region}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{f.products_made} — {f.equipment}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {f.contact_name} · {f.email} · {f.certifications} · MOQ {f.moq} · Capacity {f.monthly_capacity}
            </p>
            {f.notes && <p className="mt-2 rounded-md bg-muted/40 p-2.5 text-sm italic">{f.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
