import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { db, type Supplier } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/suppliers")({
  component: Suppliers,
});

function Suppliers() {
  const [q, setQ] = useState("");
  const suppliers = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await db.from("suppliers").select("*").order("ref_id");
      if (error) throw error;
      return data as Supplier[];
    },
  });
  const list = (suppliers.data ?? []).filter((s) =>
    !q || `${s.company_name} ${s.product_categories} ${s.region}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Supplier database"
        description="The trained outreach pool. Can-do / cannot-do updates after every reply so no one is re-emailed wrongly."
        actions={<Input placeholder="Search suppliers…" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />}
      />
      <div className="grid gap-3">
        {list.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-lg">{s.company_name}</p>
                <span className="text-xs text-muted-foreground">{s.ref_id}</span>
                <StatusBadge value={s.last_response} />
                {s.form_filled && <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">Form on file</span>}
              </div>
              <span className="text-xs text-muted-foreground">{s.supplier_type} · {s.region}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{s.product_categories} — {s.capabilities_claimed}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-success/10 p-2.5">
                <p className="text-xs font-semibold uppercase text-success">Can do</p>
                <p className="text-sm">{s.can_do || "—"}</p>
              </div>
              <div className="rounded-md bg-destructive/5 p-2.5">
                <p className="text-xs font-semibold uppercase text-destructive">Cannot do</p>
                <p className="text-sm">{s.cannot_do || "—"}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {s.certifications} · MOQ {s.moq}{s.last_contacted ? ` · last contacted ${s.last_contacted}` : ""}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
