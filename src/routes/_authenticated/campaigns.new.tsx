import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/campaigns/new")({
  component: NewBrief,
});

const DUMMY = {
  brand: "Northbarn Snacks",
  contact: "Marcus Reed — marcus@northbarnsnacks.example.com",
  product: "3-SKU fermented sourdough cracker line",
  category: "Crackers / Baked snacks",
  volume: "Pilot 8,000 units; scaling to ~120,000 units/month",
  packaging: "Nitrogen-flushed stand-up pouches (soft-touch matte)",
  technical_requirements: "Fermented dough handling; 2mm sheeting; post-bake seasoning tumbler",
  certifications_needed: "SQF; Organic preferred; Kosher a plus",
  target_launch: "Q4 2026",
  budget_notes: "Open on price for the right facility; wants a true co-man partner, not a one-off run.",
  competitor_reference: "Brand names 2 competitors whose crackers they admire — find who co-manufactures for them and email them too.",
};

const empty = { ...DUMMY, brand: "", contact: "", product: "", category: "", volume: "", packaging: "", technical_requirements: "", certifications_needed: "", target_launch: "", budget_notes: "", competitor_reference: "" };

function NewBrief() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  function set(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await db.from("campaigns").insert({
        user_id: uid,
        order_id: `ORD-${Date.now().toString().slice(-6)}`,
        ...form,
        plan: "Free", upgraded: false, status: "DRAFT",
      }).select("id").single();
      if (error) throw error;
      toast.success("Brief uploaded");
      navigate({ to: "/campaigns/$id", params: { id: (data as { id: string }).id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save brief");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Upload a brief"
        description="The agent scores your supplier database against this brief."
        actions={<Button variant="outline" type="button" onClick={() => setForm(DUMMY)}><Sparkles className="mr-1 h-4 w-4" /> Load sample order</Button>}
      />
      <Card className="max-w-3xl p-6">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand (client)" required value={form.brand} onChange={(v) => set("brand", v)} />
            <Field label="Contact" value={form.contact} onChange={(v) => set("contact", v)} />
          </div>
          <Field label="Product" value={form.product} onChange={(v) => set("product", v)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" value={form.category} onChange={(v) => set("category", v)} />
            <Field label="Volume" value={form.volume} onChange={(v) => set("volume", v)} />
          </div>
          <Field label="Packaging" value={form.packaging} onChange={(v) => set("packaging", v)} />
          <Area label="Key technical requirements" value={form.technical_requirements} onChange={(v) => set("technical_requirements", v)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Certifications needed" value={form.certifications_needed} onChange={(v) => set("certifications_needed", v)} />
            <Field label="Target launch" value={form.target_launch} onChange={(v) => set("target_launch", v)} />
          </div>
          <Area label="Budget / notes" value={form.budget_notes} onChange={(v) => set("budget_notes", v)} />
          <Area label="Competitor reference" value={form.competitor_reference} onChange={(v) => set("competitor_reference", v)} />
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload brief
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && " *"}</Label>
      <Input value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} />
    </div>
  );
}
