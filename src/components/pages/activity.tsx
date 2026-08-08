"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Pencil, DollarSign, UserPlus, UserMinus, Tag, LoaderCircle, AlertCircle, RefreshCw } from "lucide-react"

type ActivityType = "expense_added" | "settlement" | "member_joined" | "member_removed" | "group_created" | "group_renamed"

interface ActivityItemData {
  id: string
  type: ActivityType
  group: string
  actor: string
  action: string
  amount?: number | string
  time: string
}

interface ActivityData {
  activities: ActivityItemData[]
}

const typeConfig: Record<ActivityType, { icon: React.ReactNode; badge: string }> = {
  expense_added: { icon: <Tag className="size-4 text-muted-foreground" />, badge: "bg-secondary border-border" },
  settlement: { icon: <DollarSign className="size-4 text-emerald-400" />, badge: "bg-emerald-500/20 border-emerald-500/30" },
  member_joined: { icon: <UserPlus className="size-4 text-emerald-400" />, badge: "bg-emerald-500/20 border-emerald-500/30" },
  member_removed: { icon: <UserMinus className="size-4 text-red-400" />, badge: "bg-red-500/20 border-red-500/30" },
  group_created: { icon: <Users className="size-4 text-emerald-400" />, badge: "bg-emerald-500/20 border-emerald-500/30" },
  group_renamed: { icon: <Pencil className="size-4 text-blue-400" />, badge: "bg-blue-500/20 border-blue-500/30" },
}

const filters = [
  { key: "all", label: "All", types: null as ActivityType[] | null },
  { key: "settlements", label: "Settlements", types: ["settlement"] as ActivityType[] },
  { key: "expenses", label: "Expenses", types: ["expense_added"] as ActivityType[] },
  { key: "groups", label: "Group Changes", types: ["group_created", "group_renamed"] as ActivityType[] },
  { key: "members", label: "Members", types: ["member_joined", "member_removed"] as ActivityType[] },
]

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
  return then.toLocaleDateString()
}

function amountText(amount: number | string | undefined) {
  if (amount === undefined || amount === null) return ""
  return typeof amount === "number" ? fmt(amount) : amount
}

export function Activity() {
  const [data, setData] = React.useState<ActivityData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState("all")

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/activity")
      if (!res.ok) throw new Error("Failed to load activity")
      const json = (await res.json()) as ActivityData
      setData(json)
    } catch {
      setError("Couldn't load your activity. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filter = filters.find((f) => f.key === activeFilter)
  const filtered = data?.activities.filter((a) => !filter?.types || filter.types.includes(a.type)) ?? []

  return (
    <>
      <PageHeader title="Recent Activity" subtitle="Everything happening in your groups" />

      <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-4">
        {filters.map((f) => (
          <FilterChip key={f.key} label={f.label} active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)} />
        ))}
      </div>

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">No activity here yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const config = typeConfig[item.type] || typeConfig.expense_added
            const amount = amountText(item.amount)
            return (
              <Card key={item.id} className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center border ${config.badge}`}>{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{item.actor}</span>{" "}
                            <span className="text-muted-foreground">{item.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.group}</p>
                        </div>
                        {amount && (
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{amount}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(item.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-secondary text-muted-foreground border-border hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function LoadingCard() {
  return (
    <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl flex items-center justify-center gap-2 py-12">
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
