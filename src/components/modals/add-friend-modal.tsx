"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Search, UserPlus } from "lucide-react"

interface SearchUser {
  id: string
  name: string
  avatar: string
  email?: string
}

const allUsers: SearchUser[] = [
  { id: "nasty", name: "Nasty", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nasty&backgroundColor=b6e3f4", email: "nasty@example.com" },
  { id: "pippo", name: "Pippo", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pippo&backgroundColor=c0aede", email: "pippo@example.com" },
  { id: "giovanage", name: "GiovAnge", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=GiovAnge&backgroundColor=d1d4f9", email: "giovanage@example.com" },
  { id: "grecia", name: "Grecia <3", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Grecia&backgroundColor=ffd5dc", email: "grecia@example.com" },
  { id: "marco", name: "Marco", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marco&backgroundColor=b6e3f4", email: "marco@example.com" },
  { id: "sofia", name: "Sofia", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia&backgroundColor=c0aede", email: "sofia@example.com" },
  { id: "luca", name: "Luca", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luca&backgroundColor=d1d4f9", email: "luca@example.com" },
  { id: "elena", name: "Elena", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Elena&backgroundColor=ffd5dc", email: "elena@example.com" },
]

export function AddFriendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("")
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set())

  const results = query.trim()
    ? allUsers.filter((u) => u.name.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  const sendRequest = (id: string) => {
    setSentIds((prev) => new Set(prev).add(id))
  }

  return (
    <Modal open={open} onClose={onClose} title="Add friend">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-purple-200/50" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="h-11 rounded-3xl border border-white/10 bg-white/5 pl-10 text-purple-100 placeholder:text-purple-200/40"
        />
      </div>

      <div className="mt-4 space-y-2">
        {!query.trim() && (
          <p className="py-6 text-center text-sm text-purple-200/40">Search for people to add</p>
        )}
        {query.trim() && results.length === 0 && (
          <p className="py-6 text-center text-sm text-purple-200/40">No users found</p>
        )}
        {results.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <img src={user.avatar} alt={user.name} className="size-11 rounded-full bg-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              {user.email && <p className="truncate text-xs text-purple-200/40">{user.email}</p>}
            </div>
            {sentIds.has(user.id) ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                <Check className="size-3.5" /> Sent
              </span>
            ) : (
              <Button
                onClick={() => sendRequest(user.id)}
                className="h-auto rounded-full bg-purple-500/80 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-400"
              >
                <UserPlus className="size-3.5" />
                Send request
              </Button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
