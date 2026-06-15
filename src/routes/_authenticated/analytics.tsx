import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, type CampaignSupplier } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
});

function Analytics() {
  const cs = useQuery({
    queryKey: ["all-campaign-suppliers"],
    queryFn: async () => {
      const { data, error } = await db.from("campaign_suppliers").select("*");
      if (error) throw error;
      return data as CampaignSupplier[];
    },
  });
  const list = cs.data ?? [];

  const contacted = list.filter((s) => s.stage !== "IDENTIFIED").length;
  const responded = list.filter((s) => s.response).length;
  const yes = list.filter((s) => s.response === "Yes").length;
  const no = list.filter((s) => s.response === "No").length;
  const maybe = list.filter((s) => s.response === "Maybe").length;
  const qualified = list.filter((s) => ["QUALIFIED", "NEGOTIATING", "FINALIZED"].includes(s.stage)).length;
  const responseRate = contacted ? Math.round((responded / contacted) * 100) : 0;
  const conversion = contacted ? Math.round((qualified / contacted) * 100) : 0;

  const pie = [
    { name: "Yes", value: yes, color: "var(--color-success)" },
    { name: "Maybe", value: maybe, color: "var(--color-warning)" },
    { name: "No", value: no, color: "var(--color-destructive)" },
  ].filter((d) => d.value > 0);

  const stages = ["IDENTIFIED", "CONTACTED", "RESPONDED", "QUALIFIED", "NEGOTIATING", "FINALIZED", "REJECTED"];
  const bar = stages.map((s) => ({ stage: s.slice(0, 4), count: list.filter((x) => x.stage === s).length }));

  return (
    <div>
      <PageHeader title="Analytics" description="Performance across all your sourcing campaigns." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Suppliers engaged" value={contacted} />
        <Metric label="Response rate" value={`${responseRate}%`} />
        <Metric label="Conversion" value={`${conversion}%`} />
        <Metric label="Qualified" value={qualified} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg">Response breakdown</h2>
          {pie.length === 0 ? (
            <p className="text-sm text-muted-foreground">No responses recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {pie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg">Pipeline by stage</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bar}>
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
