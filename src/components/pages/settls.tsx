"use client"

import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "you-paid",
    friend: "Nasty",
    group: "Vacanza a Cecina",
    description: "You paid for Airbnb — split 4 ways",
    amount: 47.5,
    status: "settled",
    date: "Jul 25, 2026",
  },
  {
    id: 2,
    type: "owed-to-you",
    friend: "Pippo",
    group: "I Tre Topolini",
    description: "Pippo owes you for grocery run",
    amount: 15.0,
    status: "pending",
    date: "Jul 24, 2026",
  },
  {
    id: 3,
    type: "you-owe",
    friend: "Grecia <3",
    group: "The Weeknd 27/7",
    description: "You owe Grecia for concert tickets",
    amount: 60.0,
    status: "pending",
    date: "Jul 23, 2026",
  },
  {
    id: 4,
    type: "settled",
    friend: "Grecia <3",
    group: "Vacanza a Cecina",
    description: "Grecia settled up with you",
    amount: 42.0,
    status: "settled",
    date: "Jul 22, 2026",
  },
  {
    id: 5,
    type: "you-paid",
    friend: "GiovAnge",
    group: "I Tre Topolini",
    description: "You paid for dinner at Trattoria",
    amount: 28.5,
    status: "pending",
    date: "Jul 21, 2026",
  },
  {
    id: 6,
    type: "settled",
    friend: "Nasty",
    group: "The Weeknd 27/7",
    description: "You paid Nasty for tickets",
    amount: 30.0,
    status: "settled",
    date: "Jul 20, 2026",
  },
  {
    id: 7,
    type: "owed-to-you",
    friend: "Pippo",
    group: "Vacanza a Cecina",
    description: "Pippo owes you for gas",
    amount: 12.3,
    status: "overdue",
    date: "Jul 18, 2026",
  },
  {
    id: 8,
    type: "you-owe",
    friend: "Nasty",
    group: "I Tre Topolini",
    description: "You owe Nasty for cleaning supplies",
    amount: 8.5,
    status: "pending",
    date: "Jul 17, 2026",
  },
]

const statusIcon = {
  settled: <CheckCircle2 className="size-4 text-emerald-400" />,
  pending: <Clock className="size-4 text-amber-400" />,
  overdue: <AlertCircle className="size-4 text-red-400" />,
}

export function Settls() {
  const totalOwedToYou = transactions.filter((t) => t.type === "owed-to-you").reduce((s, t) => s + t.amount, 0)
  const totalYouOwe = transactions.filter((t) => t.type === "you-owe").reduce((s, t) => s + t.amount, 0)
  const netBalance = totalOwedToYou - totalYouOwe

  return (
    <>
      <PageHeader title="Settls" subtitle="All your transactions and settlements" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Owed to You</p>
                <p className="text-xl font-bold text-emerald-400">€{totalOwedToYou.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ArrowDownRight className="size-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">You Owe</p>
                <p className="text-xl font-bold text-red-400">€{totalYouOwe.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {netBalance >= 0 ? <ArrowUpRight className="size-5 text-emerald-400" /> : <ArrowDownRight className="size-5 text-red-400" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Balance</p>
                <p className={`text-xl font-bold ${netBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {netBalance >= 0 ? "+" : ""}€{netBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-medium">All Transactions</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">Recent activity with friends and groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary border-border hover:bg-accent/50 transition-colors">
                <div className="shrink-0">{statusIcon[t.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {t.friend}
                    <span className="text-muted-foreground font-normal"> — {t.group}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${t.type === "owed-to-you" ? "text-emerald-400" : t.type === "you-owe" ? "text-red-400" : "text-foreground"}`}>
                    {t.type === "owed-to-you" ? "+" : t.type === "you-owe" ? "-" : ""}€{t.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
