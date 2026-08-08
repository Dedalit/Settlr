"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, LoaderCircle, AlertCircle, RefreshCw } from "lucide-react"

interface Transaction {
  id: string
  type: "you-paid" | "owed-to-you" | "you-owe" | "settled"
  friend: string
  group: string
  description: string
  amount: number
  status: "settled" | "pending"
  date: string
}

interface SettlsData {
  owedToYou: number
  youOwe: number
  netBalance: number
  transactions: Transaction[]
}

function fmt(amount: number) {
  return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function timeAgo(date: string) {
  const then = new Date(date)
  if (Number.isNaN(then.getTime())) return date
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

const statusIcon: Record<Transaction["status"], React.ReactNode> = {
  settled: <CheckCircle2 className="size-4 text-emerald-400" />,
  pending: <Clock className="size-4 text-amber-400" />,
}

export function Settls() {
  const [data, setData] = React.useState<SettlsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settls")
      if (!res.ok) throw new Error("Failed to load settlements")
      const json = (await res.json()) as SettlsData
      setData(json)
    } catch {
      setError("Couldn't load your settlements. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader title="Settls" subtitle="All your transactions and settlements" />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
          <LoadingCard />
        </div>
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <ArrowUpRight className="size-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Owed to You</p>
                    <p className="text-xl font-bold text-emerald-400">{fmt(data.owedToYou)}</p>
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
                    <p className="text-xl font-bold text-red-400">{fmt(data.youOwe)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${data.netBalance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {data.netBalance >= 0 ? <ArrowUpRight className="size-5 text-emerald-400" /> : <ArrowDownRight className="size-5 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Balance</p>
                    <p className={`text-xl font-bold ${data.netBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {data.netBalance >= 0 ? "+" : ""}{fmt(Math.abs(data.netBalance))}
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
              {data.transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.transactions.map((t) => (
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
                          {t.type === "owed-to-you" ? "+" : t.type === "you-owe" ? "-" : ""}{fmt(t.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo(t.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
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
