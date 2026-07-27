"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Users, Clock, CheckCircle2, AlertCircle, Mail } from "lucide-react"

const statusIcon = {
  settled: <CheckCircle2 className="size-4 text-emerald-400" />,
  pending: <Clock className="size-4 text-amber-400" />,
  overdue: <AlertCircle className="size-4 text-red-400" />,
}

const friendProfiles: Record<string, { name: string; avatar: string; email: string; joined: string; balance: number; settls: number }> = {
  nasty: { name: "Nasty", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nasty&backgroundColor=b6e3f4", email: "nasty@example.com", joined: "Jan 2025", balance: -24.50, settls: 8 },
  pippo: { name: "Pippo", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pippo&backgroundColor=c0aede", email: "pippo@example.com", joined: "Feb 2025", balance: 27.30, settls: 12 },
  giovanage: { name: "GiovAnge", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=GiovAnge&backgroundColor=d1d4f9", email: "giovanage@example.com", joined: "Mar 2025", balance: 37.00, settls: 5 },
  grecia: { name: "Grecia <3", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Grecia&backgroundColor=ffd5dc", email: "grecia@example.com", joined: "Dec 2024", balance: -42.00, settls: 15 },
}

const settlHistory = [
  { id: 1, group: "Vacanza a Cecina", description: "You paid for Airbnb — split 4 ways", amount: 47.50, status: "settled" as const, date: "Jul 25, 2026" },
  { id: 2, group: "I Tre Topolini", description: "Grocery run split", amount: 15.00, status: "pending" as const, date: "Jul 24, 2026" },
  { id: 3, group: "The Weeknd 27/7", description: "Concert tickets", amount: 60.00, status: "settled" as const, date: "Jul 20, 2026" },
  { id: 4, group: "Vacanza a Cecina", description: "Gas money", amount: 12.30, status: "overdue" as const, date: "Jul 18, 2026" },
]

export function FriendDetailPage({ id }: { id: string }) {
  const friend = friendProfiles[id] || { name: "Unknown", avatar: "", email: "", joined: "", balance: 0, settls: 0 }

  return (
    <>
      {/* About Section */}
      <div className="relative mt-8">
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-400 via-indigo-300 to-pink-400 opacity-20 blur-2xl"></div>
        <Card className="relative bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <img src={friend.avatar} alt={friend.name} className="size-20 rounded-full bg-white/10 ring-2 ring-purple-400/30" />
              <div className="flex-1">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase">{friend.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                    <Mail className="size-3.5" />
                    {friend.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-purple-200/50">
                    <Users className="size-3.5" />
                    Joined {friend.joined}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {friend.balance !== 0 && (
                  <div className={`text-2xl font-bold ${friend.balance > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {friend.balance > 0 ? "+" : ""}€{Math.abs(friend.balance).toFixed(2)}
                  </div>
                )}
                <p className="text-xs text-purple-200/40 mt-1">{friend.settls} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-purple-200/50">Owes You</p>
                <p className="text-xl font-bold text-emerald-400">€0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ArrowDownRight className="size-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-purple-200/50">You Owe</p>
                <p className="text-xl font-bold text-red-400">€{Math.abs(friend.balance).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settl History */}
      <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-purple-100 text-sm font-medium">Settl History</CardTitle>
          <CardDescription className="text-purple-200/60 text-xs">All transactions with {friend.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settlHistory.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="shrink-0">{statusIcon[t.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-100 font-medium truncate">{t.description}</p>
                  <p className="text-xs text-purple-200/40">{t.group} · {t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.status === "settled" ? "text-white" : t.status === "pending" ? "text-amber-400" : "text-red-400"}`}>
                  €{t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
