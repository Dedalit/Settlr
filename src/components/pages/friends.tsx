"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { InlineActions } from "@/components/inline-actions"
import { CardActionsMenu } from "@/components/card-actions-menu"
import { AddFriendModal } from "@/components/modals/add-friend-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ArrowUpRight, ArrowDownRight, UserPlus, Trash2, Check, Loader2 } from "lucide-react"

interface Friend {
  id: string
  name: string
  avatar: string
  email?: string
  balance: number
  settls: number
  lastActive: string
}

interface FriendRequest {
  friendship_id: string
  id: string
  name: string
  avatar: string
  email?: string
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

export function Friends() {
  const [addFriendOpen, setAddFriendOpen] = React.useState(false)
  const [friends, setFriends] = React.useState<Friend[]>([])
  const [requests, setRequests] = React.useState<FriendRequest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/friends")
      if (!res.ok) throw new Error("Failed to load friends")
      const data = await res.json()
      setFriends(data.friends ?? [])
      setRequests(data.requests ?? [])
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (friend: Friend) => {
    try {
      const res = await fetch(`/api/friendships/${friend.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setFriends((prev) => prev.filter((f) => f.id !== friend.id))
      } else {
        window.alert(data.message ?? "Couldn't remove this friend. Please try again.")
      }
    } catch {
      window.alert("Couldn't remove this friend. Please try again.")
    }
  }

  const handleAccept = async (req: FriendRequest) => {
    setBusyId(req.friendship_id)
    try {
      const res = await fetch(`/api/friendships/${req.friendship_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        await load()
      } else {
        window.alert(data.message ?? "Couldn't accept the request. Please try again.")
      }
    } catch {
      window.alert("Couldn't accept the request. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const handleDecline = async (req: FriendRequest) => {
    setBusyId(req.friendship_id)
    try {
      const res = await fetch(`/api/friendships/${req.friendship_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setRequests((prev) => prev.filter((r) => r.friendship_id !== req.friendship_id))
      } else {
        window.alert(data.message ?? "Couldn't decline the request. Please try again.")
      }
    } catch {
      window.alert("Couldn't decline the request. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Friends"
        subtitle="People you share expenses with"
        actions={
          friends.length > 0 ? (
            <InlineActions
              actions={[
                {
                  label: "Add friend",
                  icon: <UserPlus className="size-4" />,
                  onClick: () => setAddFriendOpen(true),
                },
              ]}
            />
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Couldn't load your friends.</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {requests.length > 0 && (
            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-medium">Friend requests</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">People who want to add you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.friendship_id} className="flex items-center gap-3 rounded-2xl border-border bg-secondary p-3">
                      <Avatar className="size-11">
                        <AvatarImage src={req.avatar} alt={req.name} />
                        <AvatarFallback>{initials(req.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{req.name}</p>
                        {req.email && <p className="truncate text-xs text-muted-foreground">{req.email}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccept(req)}
                          disabled={busyId === req.friendship_id}
                          className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {busyId === req.friendship_id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecline(req)}
                          disabled={busyId === req.friendship_id}
                          className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {friends.length === 0 ? (
            <Card className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No friends yet — use Add friend to send a request.</p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAddFriendOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <UserPlus className="size-4" />
                    Add friend
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <a key={friend.id} href={`/dashboard/friends/${friend.id}`} className="block group">
                  <Card className="relative bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl hover:bg-accent/50 hover:border-accent transition-all">
                    <CardContent className="p-5">
                      <CardActionsMenu
                        buttonClassName="absolute right-3 top-3"
                        label="Delete friend"
                        icon={<Trash2 className="size-4" />}
                        onAction={() => handleDelete(friend)}
                      />
                      <div className="flex items-center gap-4">
                        <Avatar className="size-14">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>{initials(friend.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
                          <p className="text-xs text-muted-foreground">Active {timeAgo(friend.lastActive)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{friend.settls} settls</span>
                        </div>
                        {friend.balance !== 0 ? (
                          <div className="flex items-center gap-1">
                            {friend.balance > 0 ? (
                              <>
                                <ArrowUpRight className="size-3.5 text-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-400">+€{friend.balance.toFixed(2)}</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="size-3.5 text-red-400" />
                                <span className="text-sm font-semibold text-red-400">-€{Math.abs(friend.balance).toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Settled up</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      <AddFriendModal open={addFriendOpen} onClose={() => setAddFriendOpen(false)} />
    </>
  )
}
