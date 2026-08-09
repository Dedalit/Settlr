"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Save, LoaderCircle, AlertCircle, Eye, EyeOff, KeyRound } from "lucide-react"

interface AccountModalProps {
  open: boolean
  onClose: () => void
  user: { name: string; email: string; avatar: string }
  onSave: (user: { name: string; email: string }) => void
}

export function AccountModal({ open, onClose, user, onSave }: AccountModalProps) {
  const [name, setName] = React.useState(user.name)
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState(user.email)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    let mounted = true
    setName(user.name)
    setEmail(user.email)
    setUsername("")
    setShowPassword(false)
    setSaving(false)
    setSaved(false)
    setError(null)
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        const u = data?.user
        if (!u) return
        setName(u.full_name || user.name)
        setUsername(u.username || "")
        setEmail(u.email || user.email)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [open, user])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || user.name }),
      })
      if (!res.ok) throw new Error("Failed to save changes")
      onSave({ name: name.trim() || user.name, email })
      setSaved(true)
      window.setTimeout(onClose, 900)
    } catch {
      setError("Couldn't save your changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const readonlyInput = "h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground opacity-70 cursor-not-allowed"

  return (
    <Modal open={open} onClose={onClose} title="Account">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar size="lg" className="size-20">
            <AvatarImage src={user.avatar} alt={name} />
            <AvatarFallback className="text-lg">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Username</label>
            <Input
              value={username}
              readOnly
              placeholder="—"
              className={readonlyInput}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              readOnly
              placeholder="you@example.com"
              className={readonlyInput}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value="••••••••••"
                readOnly
                className={`${readonlyInput} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <a
              href="/auth/update-password"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline"
            >
              <KeyRound className="size-3.5" /> Change password
            </a>
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
