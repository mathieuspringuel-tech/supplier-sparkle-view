import { useMemo } from "react";
import type { Supplier } from "@/data/suppliers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, Leaf, Target } from "lucide-react";

interface InsightDashboardProps {
  suppliers: Supplier[];
  year: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(210 80% 45%)",
  "hsl(150 60% 40%)",
  "hsl(30 80% 55%)",
  "hsl(280 60% 55%)",
  "hsl(0 70% 55%)",
  "hsl(190 70% 45%)",
];

const CustomAngleTick = ({ x, y, payload }: any) => (
  <text x={x} y={y} dy={10} textAnchor="end" fontSize={9} fill="hsl(var(--muted-foreground))" transform={`rotate(-35, ${x}, ${y})`}>
    {payload.value}
  </text>
);

export function InsightDashboard({ suppliers, year }: InsightDashboardProps) {
  const stats = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const totalTco2e = suppliers.reduce((sum, s) => sum + s.tco2e, 0);
    const withTargets = suppliers.filter(s => s.targetStatus !== "no-targets").length;
    const targetPct = totalSuppliers > 0 ? Math.round((withTargets / totalSuppliers) * 100) : 0;

    // tCO2e by Category
    const categoryMap: Record<string, number> = {};
    suppliers.forEach(s => {
      categoryMap[s.category] = (categoryMap[s.category] || 0) + s.tco2e;
    });
    const byCategory = Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, value: +value.toFixed(2) }))
      .sort((a, b) => b.value - a.value);

    // Top 10 spend
    const topSpend = [...suppliers]
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
      .map(s => ({ name: s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name, value: s.spend }));

    // Target breakdown
    const targetMap: Record<string, number> = {};
    suppliers.forEach(s => {
      const label = s.targetStatus.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Sbti", "SBTi").replace("No Targets", "No Targets");
      targetMap[label] = (targetMap[label] || 0) + 1;
    });
    const targetBreakdown = Object.entries(targetMap).map(([name, value]) => ({ name, value }));

    // Calc methodology split
    const calcMap: Record<string, number> = {};
    suppliers.forEach(s => {
      const label = s.calculationMethodology === "spend" ? "Spend-based" : s.calculationMethodology === "tco2e" ? "tCO2e-based" : "Activity-based";
      calcMap[label] = (calcMap[label] || 0) + 1;
    });
    const calcSplit = Object.entries(calcMap).map(([name, value]) => ({ name, value }));

    return { totalSuppliers, totalTco2e, targetPct, withTargets, byCategory, topSpend, targetBreakdown, calcSplit };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Users size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">No. of Suppliers</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,30%,15%)] border-0 text-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Leaf size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Total tCO2e</p>
                <p className="text-2xl font-bold">{stats.totalTco2e.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(170,50%,35%)] border-0 text-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Suppliers w/ Targets</p>
                <p className="text-2xl font-bold">{stats.targetPct}% <span className="text-sm font-normal text-white/60">({stats.withTargets}/{stats.totalSuppliers})</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* tCO2e by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">tCO2e by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCategory} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [`${v} tCO2e`, "Emissions"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Spend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 10 Spend by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topSpend} margin={{ left: 10, right: 20, top: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={<CustomAngleTick />} stroke="hsl(var(--muted-foreground))" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Spend"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(210 80% 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Target Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Target Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.targetBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={{ stroke: "hsl(var(--muted-foreground))" }} style={{ fontSize: 10 }}>
                    {stats.targetBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calc Methodology Split */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Calculation Methodology Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.calcSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={{ stroke: "hsl(var(--muted-foreground))" }} style={{ fontSize: 11 }}>
                    {stats.calcSplit.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
