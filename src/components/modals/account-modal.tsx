"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Save, LoaderCircle, AlertCircle } from "lucide-react"

interface AccountModalProps {
  open: boolean
  onClose: () => void
  user: { name: string; email: string; avatar: string }
  onSave: (user: { name: string; email: string }) => void
}

export function AccountModal({ open, onClose, user, onSave }: AccountModalProps) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(user.name)
      setEmail(user.email)
      setSaving(false)
      setSaved(false)
      setError(null)
    }
  }, [open, user])

  const handleSave = async () => {
    if (saving) return
    const payload = { name: name.trim() || user.name, email: email.trim() }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save changes")
      onSave(payload)
      setSaved(true)
      window.setTimeout(onClose, 900)
    } catch {
      setError("Couldn't save your changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Account">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar size="lg" className="size-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {error && (
          <p className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </Modal>
  )
}
