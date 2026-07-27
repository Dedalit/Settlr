"use client"

import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowUpRight, ArrowDownRight, ReceiptIcon, CheckCircle2, Clock } from "lucide-react"

const spendingData = [
  { name: "Lun", amount: 120 },
  { name: "Mar", amount: 85 },
  { name: "Mer", amount: 200 },
  { name: "Gio", amount: 45 },
  { name: "Ven", amount: 310 },
  { name: "Sab", amount: 175 },
  { name: "Dom", amount: 90 },
]

const monthlyData = [
  { name: "Gen", total: 420, settled: 380 },
  { name: "Feb", total: 350, settled: 310 },
  { name: "Mar", total: 510, settled: 490 },
  { name: "Apr", total: 280, settled: 260 },
  { name: "Mag", total: 630, settled: 580 },
  { name: "Giu", total: 470, settled: 440 },
]

const pieData = [
  { name: "Food", value: 35 },
  { name: "Travel", value: 25 },
  { name: "Entertainment", value: 20 },
  { name: "Bills", value: 20 },
]

const PIE_COLORS = ["#7161EF", "#3B2991", "#C084FC", "#4C32A8"]

export function DashboardOverview() {
  return (
    <>
      <PageHeader title="Welcome back" subtitle="Here&apos;s what&apos;s happening with your shared expenses." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Total Balance" value="€2,478.50" description="Across all groups" icon={<ReceiptIcon className="size-4 text-purple-300" />} trend={{ value: "+12.5%", up: true }} />
        <InfoCard title="You Owe" value="€186.30" description="To 3 friends" icon={<ArrowDownRight className="size-4 text-red-400" />} trend={{ value: "-8.2%", up: false }} />
        <InfoCard title="Owed to You" value="€342.80" description="From 5 friends" icon={<ArrowUpRight className="size-4 text-emerald-400" />} trend={{ value: "+5.1%", up: true }} />
        <InfoCard title="Pending Settls" value="12" description="Awaiting response" icon={<Clock className="size-4 text-amber-400" />} trend={{ value: "3 due today", up: true }} />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-100 text-sm font-medium">Weekly Spending</CardTitle>
            <CardDescription className="text-purple-200/60 text-xs">Your share this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7161EF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7161EF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(17,11,59,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="#7161EF" strokeWidth={2} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-100 text-sm font-medium">Spending by Category</CardTitle>
            <CardDescription className="text-purple-200/60 text-xs">This month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "rgba(17,11,59,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "#fff", fontSize: 12 }} formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-purple-200/60">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-100 text-sm font-medium">Monthly Overview</CardTitle>
            <CardDescription className="text-purple-200/60 text-xs">Total vs settled expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(17,11,59,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                <Bar dataKey="total" fill="#7161EF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="settled" fill="#C084FC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-100 text-sm font-medium">Recent Activity</CardTitle>
            <CardDescription className="text-purple-200/60 text-xs">Latest settlements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActivityItem name="Nasty" description="Paid you €24.50 for Cecina trip" time="2h ago" icon={<CheckCircle2 className="size-4 text-emerald-400" />} />
            <ActivityItem name="Pippo" description="Owes you €15.00 for pizza" time="5h ago" icon={<Clock className="size-4 text-amber-400" />} />
            <ActivityItem name="Grecia <3" description="Settled €42.00 — Concert tickets" time="1d ago" icon={<CheckCircle2 className="size-4 text-emerald-400" />} />
            <ActivityItem name="GiovAnge" description="Owes you €8.50 for coffee" time="2d ago" icon={<Clock className="size-4 text-amber-400" />} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function InfoCard({ title, value, description, icon, trend }: { title: string; value: string; description: string; icon: React.ReactNode; trend: { value: string; up: boolean } }) {
  return (
    <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-purple-200/80 text-xs font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium ${trend.up ? "text-emerald-400" : "text-red-400"}`}>{trend.value}</span>
          <span className="text-xs text-purple-200/50">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ name, description, time, icon }: { name: string; description: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-purple-100 font-medium truncate">{name}</p>
        <p className="text-xs text-purple-200/60 truncate">{description}</p>
      </div>
      <span className="text-xs text-purple-200/40 whitespace-nowrap">{time}</span>
    </div>
  )
}
