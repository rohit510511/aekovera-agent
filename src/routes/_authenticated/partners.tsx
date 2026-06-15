import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, type Partner } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/partners")({
  component: Partners,
});

function Partners() {
  const partners = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await db.from("partners").select("*").order("ref_id");
      if (error) throw error;
      return data as Partner[];
    },
  });
  const list = partners.data ?? [];

  return (
    <div>
      <PageHeader
        title="Partner database"
        description="Suppliers who signed the referral agreement + NDA. The agent never re-asks these about commission."
      />
      <div className="grid gap-3">
        {list.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <p className="font-display text-lg">{p.company_name}</p>
                <span className="text-xs text-muted-foreground">{p.ref_id}</span>
                {p.referral_commission && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{p.referral_commission} commission</span>}
              </div>
              <span className="text-xs text-muted-foreground">{p.supplier_type} · {p.region}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{p.product_categories} — {p.capabilities}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {p.certifications} · MOQ {p.moq} · Capacity {p.monthly_capacity} · NDA {p.nda_signed} ({p.agreement_date})
            </p>
            {p.relationship_notes && <p className="mt-2 rounded-md bg-muted/40 p-2.5 text-sm italic">{p.relationship_notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
