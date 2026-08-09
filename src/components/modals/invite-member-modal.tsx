"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2, Search, UserPlus, Users } from "lucide-react"

interface FriendOption {
  id: number
  name: string
  username?: string
  avatar: string | null
}

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  groupId: number
  members: { id: number; name: string }[]
}

export function InviteMemberModal({ open, onClose, groupId, members }: InviteMemberModalProps) {
  const [friends, setFriends] = React.useState<FriendOption[]>([])
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [sentIds, setSentIds] = React.useState<Set<number>>(new Set())
  const [sendingId, setSendingId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!open) return
    setQuery("")
    setSentIds(new Set())
    setSendingId(null)
    setLoading(true)
    let mounted = true
    const memberIds = new Set(members.map((m) => m.id))
    Promise.all([
      fetch("/api/friends").then((r) => r.json()),
      fetch(`/api/groups/${groupId}/invites`).then((r) => r.json()),
    ])
      .then(([friendsData, invitesData]) => {
        if (!mounted) return
        const invitedIds = new Set((invitesData.invites ?? []).map((i: any) => i.invitee_id))
        const options: FriendOption[] = (friendsData.friends ?? [])
          .filter((f: any) => !memberIds.has(f.id) && !invitedIds.has(f.id))
          .map((f: any) => ({
            id: f.id,
            name: f.name,
            username: f.username ?? undefined,
            avatar: f.avatar ?? null,
          }))
        setFriends(options)
      })
      .catch(() => setFriends([]))
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [open, groupId, members])

  const q = query.trim().toLowerCase()
  const filtered = q ? friends.filter((f) => f.name.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)) : friends

  const sendInvite = async (user: FriendOption) => {
    setSendingId(user.id)
    try {
      const res = await fetch(`/api/groups/${groupId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setSentIds((prev) => new Set(prev).add(user.id))
      } else if (data.message && /already/i.test(data.message)) {
        setSentIds((prev) => new Set(prev).add(user.id))
      } else {
        window.alert(data.message ?? "Couldn't send the invite. Please try again.")
      }
    } catch {
      window.alert("Couldn't send the invite. Please try again.")
    } finally {
      setSendingId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite friends">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter friends..."
          className="h-11 rounded-3xl border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 space-y-2">
        {loading && (
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </p>
        )}
        {!loading && friends.length === 0 && (
          <div className="py-6 text-center">
            <Users className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No friends to invite yet.</p>
          </div>
        )}
        {!loading && friends.length > 0 && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No friends match your filter.</p>
        )}
        {filtered.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl border-border bg-secondary p-3">
            <Avatar className="size-11">
              <AvatarImage src={user.avatar ?? ""} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              {user.username && <p className="truncate text-xs text-muted-foreground">@{user.username}</p>}
            </div>
            {sentIds.has(user.id) ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                <Check className="size-3.5" /> Invited
              </span>
            ) : (
              <Button
                onClick={() => sendInvite(user)}
                disabled={sendingId === user.id}
                className="h-auto rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {sendingId === user.id ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                Invite
              </Button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
