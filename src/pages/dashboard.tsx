import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Truck, CheckCircle2,
  Clock, XCircle, Users, Package, RefreshCw,
} from "lucide-react";

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (n: number) => `KES ${n.toLocaleString()}`;

/* ── stat card ────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
}

function StatCard({ label, value, icon, iconBg, sub }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: "hsl(237,28%,12%)", border: "1px solid hsl(237,22%,18%)" }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium" style={{ color: "hsl(220,15%,52%)" }}>{label}</span>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-xs mt-1.5" style={{ color: "hsl(220,15%,48%)" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── custom tooltip ───────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-xl"
      style={{ background: "hsl(237,28%,18%)", border: "1px solid hsl(237,22%,25%)", color: "#fff" }}
    >
      <p style={{ color: "hsl(220,15%,60%)" }} className="text-xs mb-1">{label}</p>
      <p className="font-bold" style={{ color: "hsl(152,80%,50%)" }}>{fmt(payload[0].value)}</p>
    </div>
  );
}

/* ── main ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const qc = useQueryClient();
  const key = getGetAdminStatsQueryKey();

  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: key },
  });

  const handleRefresh = () => qc.invalidateQueries({ queryKey: key });

  const topMax = stats?.topPlans?.[0]?.revenue ?? 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "hsl(237,28%,16%)", color: "hsl(220,15%,55%)", border: "1px solid hsl(237,22%,20%)" }}
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Stat cards — 2 column grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 h-24 animate-pulse"
              style={{ background: "hsl(237,28%,12%)", border: "1px solid hsl(237,22%,18%)" }} />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Revenue"
            value={fmt(stats.totalRevenue)}
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            iconBg="hsl(152,70%,32%)"
            sub={`Today: ${fmt(stats.revenueToday)}`}
          />
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-4 w-4 text-white" />}
            iconBg="hsl(217,91%,40%)"
            sub={`Today: ${stats.ordersToday} orders`}
          />
          <StatCard
            label="Delivered"
            value={stats.deliveredOrders}
            icon={<Truck className="h-4 w-4 text-white" />}
            iconBg="hsl(142,70%,32%)"
            sub="Data sent successfully"
          />
          <StatCard
            label="Paid (Awaiting)"
            value={stats.paidOrders}
            icon={<CheckCircle2 className="h-4 w-4 text-white" />}
            iconBg="hsl(271,80%,42%)"
            sub="Payment confirmed"
          />
          <StatCard
            label="Pending"
            value={stats.pendingOrders}
            icon={<Clock className="h-4 w-4 text-white" />}
            iconBg="hsl(32,95%,40%)"
            sub="Awaiting M-Pesa"
          />
          <StatCard
            label="Failed / Cancelled"
            value={stats.failedOrders + stats.cancelledOrders}
            icon={<XCircle className="h-4 w-4 text-white" />}
            iconBg="hsl(0,70%,42%)"
            sub={`${stats.failedOrders} failed · ${stats.cancelledOrders} cancelled`}
          />
          <StatCard
            label="Customers"
            value={stats.totalCustomers}
            icon={<Users className="h-4 w-4 text-white" />}
            iconBg="hsl(199,80%,36%)"
            sub="Unique active users"
          />
          <StatCard
            label="Active Plans"
            value={stats.totalPlans}
            icon={<Package className="h-4 w-4 text-white" />}
            iconBg="hsl(237,40%,36%)"
            sub="Data bundles listed"
          />
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-xl p-5"
        style={{ background: "hsl(237,28%,12%)", border: "1px solid hsl(237,22%,18%)" }}>
        <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: "hsl(152,80%,45%)" }} />
          Revenue — Last 14 Days
        </p>

        {!stats?.dailyRevenue?.length ? (
          <div className="h-36 flex items-center justify-center text-sm"
            style={{ color: "hsl(220,15%,40%)" }}>
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={stats.dailyRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(152,80%,45%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(152,80%,45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(237,22%,18%)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(220,15%,45%)", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(220,15%,45%)", fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(237,22%,25%)" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(152,80%,45%)"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(152,80%,45%)", stroke: "hsl(237,28%,12%)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top plans */}
      <div className="rounded-xl p-5"
        style={{ background: "hsl(237,28%,12%)", border: "1px solid hsl(237,22%,18%)" }}>
        <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: "hsl(152,80%,45%)" }} />
          Top Plans by Revenue
        </p>

        {!stats?.topPlans?.length ? (
          <p className="text-sm py-4 text-center" style={{ color: "hsl(220,15%,40%)" }}>
            No completed orders yet
          </p>
        ) : (
          <div className="space-y-4">
            {(stats.topPlans as any[]).map((plan: any, i: number) => {
              const pct = Math.round((plan.revenue / topMax) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-medium text-white">{plan.name}</p>
                      <p className="text-[11px]" style={{ color: "hsl(220,15%,45%)" }}>
                        {plan.orders} {plan.orders === 1 ? "order" : "orders"}
                      </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "hsl(152,80%,50%)" }}>
                      {fmt(plan.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(237,22%,20%)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "hsl(152,80%,40%)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
