"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ArrowUpRight, ArrowDownRight, Receipt, Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const statusIcon = {
  settled: <CheckCircle2 className="size-4 text-emerald-400" />,
  pending: <Clock className="size-4 text-amber-400" />,
  overdue: <AlertCircle className="size-4 text-red-400" />,
}

const groupProfiles: Record<string, { name: string; image: string; members: number; balance: number; totalSpent: number; created: string; location: string }> = {
  cecina: { name: "Vacanza a Cecina", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", members: 4, balance: 47.5, totalSpent: 1240.0, created: "Jun 2026", location: "Cecina, Italy" },
  topolini: { name: "I Tre Topolini", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", members: 4, balance: -15.0, totalSpent: 890.5, created: "May 2026", location: "Milan, Italy" },
  weeknd: { name: "The Weeknd 27/7", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop", members: 3, balance: 0, totalSpent: 540.0, created: "Jul 2026", location: "Rome, Italy" },
  universita: { name: "Università '25", image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop", members: 6, balance: 120.0, totalSpent: 2100.0, created: "Sep 2025", location: "Bologna, Italy" },
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
  const group = groupProfiles[id] || { name: "Unknown", image: "", members: 0, balance: 0, totalSpent: 0, created: "", location: "" }
  const members = memberList[id] || []

  return (
    <>
      {/* About Section */}
      <div className="relative mt-8">
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-400 via-indigo-300 to-pink-400 opacity-20 blur-2xl"></div>
        <Card className="relative bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
          <div className="h-40 overflow-hidden">
            <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          </div>
          <CardContent className="p-6">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase">{group.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                <Users className="size-3.5" />
                {group.members} members
              </span>
              <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                <MapPin className="size-3.5" />
                {group.location}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                <Calendar className="size-3.5" />
                Created {group.created}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                <Receipt className="size-3.5" />
                Total €{group.totalSpent.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${group.balance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {group.balance >= 0 ? <ArrowUpRight className="size-5 text-emerald-400" /> : <ArrowDownRight className="size-5 text-red-400" />}
              </div>
              <div>
                <p className="text-xs text-purple-200/50">Group Balance</p>
                <p className={`text-xl font-bold ${group.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {group.balance >= 0 ? "+" : ""}€{Math.abs(group.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Receipt className="size-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-purple-200/50">Total Spent</p>
                <p className="text-xl font-bold text-white">€{group.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-purple-200/50">Members</p>
                <p className="text-xl font-bold text-white">{group.members}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members & Settls */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Members */}
        {members.length > 0 && (
          <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-purple-100 text-sm font-medium">Members</CardTitle>
              <CardDescription className="text-purple-200/60 text-xs">Balances within the group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sm text-purple-100 font-medium">{m.name}</span>
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
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-purple-100 text-sm font-medium">Settl History</CardTitle>
            <CardDescription className="text-purple-200/60 text-xs">All group expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {settlHistory.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="shrink-0">{statusIcon[t.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-purple-100 font-medium truncate">{t.description}</p>
                    <p className="text-xs text-purple-200/40">{t.actor} · {t.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-purple-200/30">€{t.amount.toFixed(2)}</p>
                    <p className="text-xs text-purple-200/50">Your share: €{t.yourShare.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
