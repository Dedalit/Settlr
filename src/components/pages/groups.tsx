"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { InlineActions } from "@/components/inline-actions"
import { CardActionsMenu } from "@/components/card-actions-menu"
import { CreateGroupModal } from "@/components/modals/create-group-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowUpRight, ArrowDownRight, Receipt, Plus, LogOut } from "lucide-react"

interface GroupSummary {
  id: number
  name: string
  image_url: string | null
  type: string
  members: number
  balance: number
  totalSettls: number
  totalSpent: number
  lastActive: string | null
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "never"
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

export function Groups() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [groupsList, setGroupsList] = React.useState<GroupSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadGroups = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/groups")
      if (!res.ok) throw new Error("Failed to load groups")
      const data = await res.json()
      setGroupsList(data.groups ?? [])
    } catch {
      setError("Could not load your groups.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleLeave = async (group: GroupSummary) => {
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (res.status === 400 && data.message) {
        window.alert(data.message)
        return
      }
      if (!res.ok) {
        window.alert(data.message || "Could not leave the group.")
        return
      }
      setGroupsList((prev) => prev.filter((g) => g.id !== group.id))
    } catch {
      window.alert("Could not leave the group.")
    }
  }

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Shared expense groups you're part of"
        actions={
          groupsList.length > 0 ? (
            <InlineActions
              actions={[
                {
                  label: "Create group",
                  icon: <Plus className="size-4" />,
                  onClick: () => setCreateOpen(true),
                },
              ]}
            />
          ) : undefined
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!loading && error && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={loadGroups}
            className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        groupsList.length === 0 ? (
          <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No groups yet — Ask your friends to invite you or create one.</p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  Create group
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groupsList.map((group) => (
            <a key={group.id} href={`/dashboard/groups/${group.id}`} className="block group">
              <Card className="relative bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl hover:bg-accent/50 hover:border-accent transition-all overflow-hidden">
                <div className="h-32 overflow-hidden">
                  {group.image_url ? (
                    <img src={group.image_url} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-violet-500/10">
                      <Users className="size-9 text-primary/60" />
                    </div>
                  )}
                </div>
                <CardActionsMenu
                  buttonClassName="absolute right-3 top-3"
                  label="Leave group"
                  icon={<LogOut className="size-4" />}
                  onAction={() => handleLeave(group)}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground truncate">{group.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3.5" />
                          {group.members} members
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Receipt className="size-3.5" />
                          {group.totalSettls} settls
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        Active {timeAgo(group.lastActive)}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {group.balance !== 0 ? (
                        <div className="flex items-center gap-1">
                          {group.balance > 0 ? (
                            <ArrowUpRight className="size-4 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="size-4 text-red-400" />
                          )}
                          <span className={`text-sm font-bold ${group.balance > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            €{Math.abs(group.balance).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Settled</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">Total €{group.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        )
      )}

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadGroups} />
    </>
  )
}
