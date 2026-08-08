"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Receipt as ReceiptIcon, CheckCircle2, Clock, LoaderCircle, AlertCircle, RefreshCw } from "lucide-react"

const PIE_COLORS = ["#6366F1", "#0EA5E9", "#F59E0B", "#10B981"]

interface DashboardStats {
  totalBalance: number
  youOwe: number
  owedToYou: number
  pendingSettls: number
}

interface DashboardData {
  stats: DashboardStats
  weeklySpending: { name: string; amount: number }[]
  categorySpending: { name: string; value: number }[]
  monthlyOverview: { name: string; total: number; settled: number }[]
  recentActivity: { name: string; description: string; time: string; kind: string }[]
}

function fmt(amount: number) {
  return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function timeAgo(iso: string) {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return iso
  const seconds = Math.round((Date.now() - then.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return then.toLocaleDateString()
}

function activityIcon(kind: string) {
  if (kind === "paid" || kind === "settled") return <CheckCircle2 className="size-4 text-emerald-400" />
  return <Clock className="size-4 text-amber-400" />
}

export function Dashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Failed to load dashboard data")
      const json = (await res.json()) as DashboardData
      setData(json)
    } catch {
      setError("Couldn't load your dashboard. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader title="Welcome back" subtitle="Here&apos;s what&apos;s happening with your shared expenses." />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-7">
            <LoadingCard className="md:col-span-4" />
            <LoadingCard className="md:col-span-3" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard title="Total Balance" value={fmt(data.stats.totalBalance)} description="Across all groups" icon={<ReceiptIcon className="size-4 text-muted-foreground" />} trend={{ value: "Today", up: true }} />
            <InfoCard title="You Owe" value={fmt(data.stats.youOwe)} description="To friends" icon={<ArrowDownRight className="size-4 text-red-400" />} trend={{ value: "Today", up: false }} />
            <InfoCard title="Owed to You" value={fmt(data.stats.owedToYou)} description="From friends" icon={<ArrowUpRight className="size-4 text-emerald-400" />} trend={{ value: "Today", up: true }} />
            <InfoCard title="Pending Settls" value={String(data.stats.pendingSettls)} description="Awaiting response" icon={<Clock className="size-4 text-amber-400" />} trend={{ value: "Today", up: true }} />
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm font-medium">Weekly Spending</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Your share this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.weeklySpending}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--popover-foreground)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm font-medium">Spending by Category</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">This month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.categorySpending} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {data.categorySpending.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--popover-foreground)", fontSize: 12 }} formatter={(value: number) => fmt(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {data.categorySpending.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm font-medium">Monthly Overview</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Total vs settled expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.monthlyOverview} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--popover-foreground)", fontSize: 12 }} />
                    <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="settled" fill="#818CF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm font-medium">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Latest settlements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentActivity.map((item, i) => (
                  <ActivityItem key={i} name={item.name} description={item.description} time={timeAgo(item.time)} icon={activityIcon(item.kind)} />
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </>
  )
}

function InfoCard({ title, value, description, icon, trend }: { title: string; value: string; description: string; icon: React.ReactNode; trend: { value: string; up: boolean } }) {
  return (
    <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-muted-foreground text-xs font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium ${trend.up ? "text-emerald-400" : "text-red-400"}`}>{trend.value}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ name, description, time, icon }: { name: string; description: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary border-border hover:bg-accent/50 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  )
}

function LoadingCard({ className }: { className?: string }) {
  return (
    <Card className={`bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl flex items-center justify-center gap-2 py-12 ${className ?? ""}`}>
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </Card>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl flex flex-col items-center justify-center gap-3 py-12">
      <AlertCircle className="size-6 text-red-400" />
      <p className="text-sm text-muted-foreground max-w-sm text-center">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Retry
      </Button>
    </Card>
  )
}
