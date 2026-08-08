"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InlineActions } from "@/components/inline-actions"
import { AddExpenseModal } from "@/components/modals/add-expense-modal"
import { SettlUpModal } from "@/components/modals/settl-up-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownRight, Mail, Receipt, HandCoins, Hand, CheckCircle2, Loader2 } from "lucide-react"

interface FriendData {
  id: number
  name: string
  avatar: string
  email: string
  balance: number
}

interface Transaction {
  id: string
  kind: "expense" | "settlement"
  group: string
  description: string
  amount: number
  date: string
  direction: "owed-to-you" | "you-owe" | "you-paid" | "settled"
}

interface FriendResponse {
  friend: FriendData
  transactions: Transaction[]
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "recently"
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000))
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const initials = (name: string) => name.trim().slice(0, 2).toUpperCase()

export function FriendDetail({ id }: { id: string }) {
  const [data, setData] = React.useState<FriendResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [expenseOpen, setExpenseOpen] = React.useState(false)
  const [settlOpen, setSettlOpen] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/friends/${id}`)
      if (!res.ok) throw new Error("Failed to load friend")
      const json = await res.json()
      setData(json)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="mt-8 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Couldn't load this friend.</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  const friend = data.friend
  const transactions = data.transactions
  const owesYou = friend.balance > 0 ? friend.balance : 0
  const youOwe = friend.balance < 0 ? Math.abs(friend.balance) : 0

  const expenseMembers = [{ id: friend.id, name: friend.name, avatar: friend.avatar }]
  const settlTargets =
    friend.balance !== 0
      ? [{ id: Number(friend.id), name: friend.name, avatar: friend.avatar, amount: Math.abs(friend.balance) }]
      : []

  const actions = [
    {
      label: "Add Expense",
      icon: <Receipt className="size-4" />,
      onClick: () => setExpenseOpen(true),
    },
    ...(friend.balance !== 0
      ? [
          {
            label: "Settl Up",
            icon: <HandCoins className="size-4" />,
            variant: "primary" as const,
            onClick: () => setSettlOpen(true),
          },
        ]
      : []),
  ]

  const txIcon = (t: Transaction) => {
    if (t.kind === "settlement") return <CheckCircle2 className="size-4 text-emerald-400" />
    switch (t.direction) {
      case "you-owe":
        return <ArrowDownRight className="size-4 text-red-400" />
      case "owed-to-you":
        return <ArrowUpRight className="size-4 text-emerald-400" />
      case "you-paid":
      default:
        return <Hand className="size-4 text-amber-400" />
    }
  }

  const txAmountClass = (t: Transaction) => {
    if (t.kind === "settlement" || t.direction === "owed-to-you") return "text-emerald-400"
    if (t.direction === "you-owe") return "text-red-400"
    return "text-foreground"
  }

  const txDescription = (t: Transaction) => {
    if (t.kind === "settlement" && !t.description) return `You settled up with ${friend.name}`
    return t.description
  }

  return (
    <>
      {/* About Section */}
      <Card className="relative mt-8 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="size-20 ring-2 ring-border">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback className="text-lg">{initials(friend.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-black text-foreground uppercase">{friend.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3.5" />
                  {friend.email}
                </span>
              </div>
            </div>
            <div className="ml-auto hidden sm:ml-0 lg:block">
              <InlineActions actions={actions} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:hidden">
        <InlineActions actions={actions} layout="card" />
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Owes You</p>
                <p className="text-xl font-bold text-emerald-400">€{owesYou.toFixed(2)}</p>
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
                <p className="text-xl font-bold text-red-400">€{youOwe.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settl History */}
      <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-medium">Settl History</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">All transactions with {friend.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary border border-border">
                  <div className="shrink-0">{txIcon(t)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{txDescription(t)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.group ? `${t.group} · ` : ""}
                      {timeAgo(t.date)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${txAmountClass(t)}`}>
                    €{t.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <AddExpenseModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        friendId={friend.id}
        members={expenseMembers}
        onCreated={load}
      />
      <SettlUpModal
        open={settlOpen}
        onClose={() => setSettlOpen(false)}
        targets={settlTargets}
        onCompleted={load}
      />
    </>
  )
}
