"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2, Search, UserPlus } from "lucide-react"

interface SearchUser {
  id: string
  name: string
  avatar: string
  email?: string
}

export function AddFriendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [results, setResults] = React.useState<SearchUser[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set())
  const [sendingId, setSendingId] = React.useState<string | null>(null)

  const requestId = React.useRef(0)

  React.useEffect(() => {
    if (open) setQuery("")
  }, [open])

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    const q = debounced.trim()
    const id = ++requestId.current
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/users?q=${encodeURIComponent(q)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search failed")
        return res.json()
      })
      .then((data) => {
        if (requestId.current !== id) return
        setResults(data.users ?? [])
      })
      .catch(() => {
        if (requestId.current === id) setResults([])
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false)
      })
  }, [debounced, open])

  const sendRequest = async (user: SearchUser) => {
    setSendingId(user.id)
    try {
      const res = await fetch("/api/friendships", {
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
        window.alert(data.message ?? "Couldn't send the request. Please try again.")
      }
    } catch {
      window.alert("Couldn't send the request. Please try again.")
    } finally {
      setSendingId(null)
    }
  }

  const hasQuery = Boolean(debounced.trim())

  return (
    <Modal open={open} onClose={onClose} title="Add friend">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="h-11 rounded-3xl border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 space-y-2">
        {!hasQuery && (
          <p className="py-6 text-center text-sm text-muted-foreground">Search for people to add</p>
        )}
        {hasQuery && loading && (
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </p>
        )}
        {hasQuery && !loading && results.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No users found</p>
        )}
        {results.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl border-border bg-secondary p-3">
            <Avatar className="size-11">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
            {sentIds.has(user.id) ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                <Check className="size-3.5" /> Sent
              </span>
            ) : (
              <Button
                onClick={() => sendRequest(user)}
                disabled={sendingId === user.id}
                className="h-auto rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {sendingId === user.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <UserPlus className="size-3.5" />
                )}
                Send request
              </Button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
