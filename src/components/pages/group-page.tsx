"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InlineActions } from "@/components/inline-actions"
import { CardActionsMenu } from "@/components/card-actions-menu"
import { AddExpenseModal } from "@/components/modals/add-expense-modal"
import { SettlUpModal } from "@/components/modals/settl-up-modal"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Users, ArrowUpRight, ArrowDownRight, Receipt, Calendar, CheckCircle2, Clock, HandCoins, Pencil, ImageIcon } from "lucide-react"

interface GroupMember {
  id: number
  name: string
  avatar: string | null
  balance: number
  balanceWithYou?: number
}

interface ExpenseSplit {
  user_id: number
  name: string
  amount_owed: number
}

interface Expense {
  id: number
  description: string
  amount: number
  category: string | null
  img_url: string | null
  created_at: string
  paid_by: { id: number; name: string }
  splits: ExpenseSplit[]
  yourShare: number
  paidByYou: boolean
}

interface Settlement {
  id: number
  created_at: string
  payer: { id: number; name: string }
  payee: { id: number; name: string }
  amount: number
  note: string | null
}

interface GroupDetailData {
  group: {
    id: number
    name: string
    image_url: string | null
    type: string
    created_at: string
    created_by: number
    memberCount: number
    totalSpent: number
    balance: number
  }
  members: GroupMember[]
  expenses: Expense[]
  settlements: Settlement[]
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk}w ago`
  return new Date(iso).toLocaleDateString()
}

function initialOf(name: string) {
  return name.charAt(0).toUpperCase()
}

export function GroupDetail({ id }: { id: string }) {
  const [data, setData] = React.useState<GroupDetailData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [meId, setMeId] = React.useState<number | null>(null)
  const [expenseOpen, setExpenseOpen] = React.useState(false)
  const [settlOpen, setSettlOpen] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/groups/${id}`)
      if (!res.ok) throw new Error("Failed to load group")
      const json = await res.json()
      setData(json)
    } catch {
      setError("Could not load this group.")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    let mounted = true
    const resolve = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return
        const { data: rows } = await supabase.from("users").select("id").eq("auth_id", user.id).single()
        if (rows && mounted) setMeId(rows.id)
      } catch {
        // ignore
      }
    }
    resolve()
    return () => {
      mounted = false
    }
  }, [])

  const handleRename = async () => {
    if (!data) return
    const newName = window.prompt("Rename group", data.group.name)
    if (!newName || newName.trim() === data.group.name) return
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        window.alert(json.message || "Could not rename the group.")
        return
      }
      load()
    } catch {
      window.alert("Could not rename the group.")
    }
  }

  const expenseMembers = data
    ? data.members.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar ?? undefined }))
    : []

  const settlTargets = data
    ? data.members
        .filter((m) => m.id !== meId && (m.balanceWithYou ?? m.balance) !== 0)
        .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar ?? undefined, amount: Math.abs(m.balanceWithYou ?? m.balance) }))
    : []

  const history = React.useMemo(() => {
    if (!data) return []
    const expenseRows = data.expenses.map((e) => ({
      key: `e-${e.id}`,
      createdAt: e.created_at,
      kind: "expense" as const,
      expense: e,
    }))
    const settlementRows = data.settlements.map((s) => ({
      key: `s-${s.id}`,
      createdAt: s.created_at,
      kind: "settlement" as const,
      settlement: s,
    }))
    return [...expenseRows, ...settlementRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [data])

  const group = data?.group
  const members = data?.members ?? []
  const balance = group?.balance ?? 0
  const totalSpent = group?.totalSpent ?? 0
  const memberCount = group?.memberCount ?? 0

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
      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading...</p>}

      {!loading && error && (
        <div className="mt-8 flex flex-col items-start gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && group && (
        <>
          {/* About Section */}
          <Card className="relative mt-8 bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl overflow-hidden">
            <div className="h-40 overflow-hidden">
              {group.image_url ? (
                <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-violet-500/10">
                  <ImageIcon className="size-10 text-primary/60" />
                </div>
              )}
            </div>
            <CardActionsMenu
              buttonClassName="absolute right-3 top-3"
              label="Rename"
              icon={<Pencil className="size-4" />}
              onAction={handleRename}
            />
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
                  {memberCount} members
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Created {timeAgo(group.created_at)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Receipt className="size-3.5" />
                  Total €{totalSpent.toFixed(2)}
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
                  <div className={`size-10 rounded-xl flex items-center justify-center ${balance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {balance >= 0 ? <ArrowUpRight className="size-5 text-emerald-400" /> : <ArrowDownRight className="size-5 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Group Balance</p>
                    <p className={`text-xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {balance >= 0 ? "+" : ""}€{Math.abs(balance).toFixed(2)}
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
                    <p className="text-xl font-bold text-foreground">€{totalSpent.toFixed(2)}</p>
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
                    <p className="text-xl font-bold text-foreground">{memberCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members & History */}
          <div className="grid gap-4 md:grid-cols-2">
            {members.length > 0 && (
              <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-foreground text-sm font-medium">Members</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Balances within the group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex min-w-0 items-center gap-3">
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="size-8 shrink-0 rounded-full bg-white/10" />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {initialOf(m.name)}
                            </div>
                          )}
                          <span className="truncate text-sm text-foreground font-medium">{m.name}</span>
                        </div>
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
                <CardDescription className="text-muted-foreground text-xs">Expenses and settlements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.length === 0 && (
                    <p className="text-xs text-muted-foreground">No activity yet.</p>
                  )}
                  {history.map((row) => {
                    if (row.kind === "expense") {
                      const e = row.expense
                      return (
                        <div key={row.key} className="flex items-center gap-4 p-3 rounded-xl bg-secondary border border-border">
                          <div className="shrink-0">
                            {e.paidByYou ? (
                              <CheckCircle2 className="size-4 text-emerald-400" />
                            ) : (
                              <Clock className="size-4 text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium truncate">{e.description}</p>
                            <p className="text-xs text-muted-foreground">{e.paid_by.name} · {timeAgo(e.created_at)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">€{e.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Your share: €{e.yourShare.toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    }
                    const s = row.settlement
                    return (
                      <div key={row.key} className="flex items-center gap-4 p-3 rounded-xl bg-secondary border border-border">
                        <div className="shrink-0">
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate">
                            {s.payer.name} settled up with {s.payee.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo(s.created_at)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">€{s.amount.toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <AddExpenseModal
            open={expenseOpen}
            onClose={() => setExpenseOpen(false)}
            groupId={group.id}
            members={expenseMembers}
            onCreated={load}
          />
          <SettlUpModal
            open={settlOpen}
            onClose={() => {
              setSettlOpen(false)
              load()
            }}
            groupId={group.id}
            targets={settlTargets}
          />
        </>
      )}
    </>
  )
}
