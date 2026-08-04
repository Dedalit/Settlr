"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InlineActions } from "@/components/inline-actions"
import { AddExpenseModal } from "@/components/modals/add-expense-modal"
import { SettlUpModal } from "@/components/modals/settl-up-modal"
import { Users, ArrowUpRight, ArrowDownRight, Receipt, Calendar, CheckCircle2, Clock, AlertCircle, HandCoins } from "lucide-react"

const statusIcon = {
  settled: <CheckCircle2 className="size-4 text-emerald-400" />,
  pending: <Clock className="size-4 text-amber-400" />,
  overdue: <AlertCircle className="size-4 text-red-400" />,
}

const groupProfiles: Record<string, { name: string; image: string; members: number; balance: number; totalSpent: number; created: string }> = {
  cecina: { name: "Vacanza a Cecina", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", members: 4, balance: 47.5, totalSpent: 1240.0, created: "Jun 2026" },
  topolini: { name: "I Tre Topolini", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", members: 4, balance: -15.0, totalSpent: 890.5, created: "May 2026" },
  weeknd: { name: "The Weeknd 27/7", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop", members: 3, balance: 0, totalSpent: 540.0, created: "Jul 2026" },
  universita: { name: "Università '25", image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop", members: 6, balance: 120.0, totalSpent: 2100.0, created: "Sep 2025" },
}

const memberList: Record<string, { name: string; avatar: string; balance: number }[]> = {
  cecina: [
    { name: "You", avatar: "", balance: 47.5 },
    { name: "Nasty", avatar: "", balance: -24.5 },
    { name: "Pippo", avatar: "", balance: -15.0 },
    { name: "Grecia <3", avatar: "", balance: -8.0 },
  ],
}

const settlHistory = [
  { id: 1, actor: "Nasty", description: "Paid for Airbnb — split 4 ways", amount: 190.0, yourShare: 47.5, status: "settled" as const, date: "Jul 25, 2026" },
  { id: 2, actor: "Pippo", description: "Grocery run at Coop", amount: 45.8, yourShare: 11.45, status: "pending" as const, date: "Jul 24, 2026" },
  { id: 3, actor: "You", description: "Dinner at Ristorante da Mario", amount: 120.0, yourShare: 30.0, status: "settled" as const, date: "Jul 22, 2026" },
  { id: 4, actor: "Grecia <3", description: "Beach umbrellas & chairs", amount: 60.0, yourShare: 15.0, status: "overdue" as const, date: "Jul 20, 2026" },
  { id: 5, actor: "You", description: "Gas for the road trip", amount: 85.0, yourShare: 21.25, status: "settled" as const, date: "Jul 18, 2026" },
]

export function GroupDetail({ id }: { id: string }) {
  const group = groupProfiles[id] || { name: "Unknown", image: "", members: 0, balance: 0, totalSpent: 0, created: "" }
  const members = memberList[id] || []
  const [expenseOpen, setExpenseOpen] = React.useState(false)
  const [settlOpen, setSettlOpen] = React.useState(false)

  const expenseMembers = [{ name: "You" }, ...members.filter((m) => m.name !== "You").map((m) => ({ name: m.name }))]
  const settlTargets = members
    .filter((m) => m.name !== "You" && m.balance !== 0)
    .map((m) => ({ name: m.name, amount: Math.abs(m.balance) }))

  const actions = [
    {
      label: "Add expense",
      icon: <Receipt className="size-4" />,
      onClick: () => setExpenseOpen(true),
    },
    {
      label: "Settl Up",
      icon: <HandCoins className="size-4" />,
      variant: "primary" as const,
      onClick: () => setSettlOpen(true),
    },
  ]

  return (
    <>
      {/* About Section */}
      <Card className="relative mt-8 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl overflow-hidden">
        <div className="h-40 overflow-hidden">
          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-2xl font-black text-foreground uppercase">{group.name}</h1>
            <div className="hidden lg:block">
              <InlineActions actions={actions} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {group.members} members
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Created {group.created}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Receipt className="size-3.5" />
              Total €{group.totalSpent.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="lg:hidden">
        <InlineActions actions={actions} layout="card" />
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${group.balance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {group.balance >= 0 ? <ArrowUpRight className="size-5 text-emerald-400" /> : <ArrowDownRight className="size-5 text-red-400" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Group Balance</p>
                <p className={`text-xl font-bold ${group.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {group.balance >= 0 ? "+" : ""}€{Math.abs(group.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-secondary flex items-center justify-center">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-foreground">€{group.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-xl font-bold text-foreground">{group.members}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members & Settls */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Members */}
        {members.length > 0 && (
          <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground text-sm font-medium">Members</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Balances within the group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                    <span className="text-sm text-foreground font-medium">{m.name}</span>
                    <span className={`text-sm font-semibold ${m.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {m.balance >= 0 ? "+" : ""}€{Math.abs(m.balance).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settl History */}
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-medium">Settl History</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">All group expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {settlHistory.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary border border-border">
                  <div className="shrink-0">{statusIcon[t.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.actor} · {t.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">€{t.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Your share: €{t.yourShare.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <AddExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} members={expenseMembers} />
      <SettlUpModal open={settlOpen} onClose={() => setSettlOpen(false)} targets={settlTargets} />
    </>
  )
}
