"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Save } from "lucide-react"

interface AccountModalProps {
  open: boolean
  onClose: () => void
  user: { name: string; email: string; avatar: string }
  onSave: (user: { name: string; email: string }) => void
}

export function AccountModal({ open, onClose, user, onSave }: AccountModalProps) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(user.name)
      setEmail(user.email)
      setSaved(false)
    }
  }, [open, user])

  const handleSave = () => {
    onSave({ name: name.trim() || user.name, email: email.trim() })
    setSaved(true)
    window.setTimeout(onClose, 900)
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
            <label className="mb-1.5 block text-xs font-semibold text-purple-200/60">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-3xl border border-white/10 bg-white/5 text-purple-100 placeholder:text-purple-200/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-purple-200/60">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-3xl border border-white/10 bg-white/5 text-purple-100 placeholder:text-purple-200/40"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-11 rounded-full bg-purple-500/80 text-sm font-semibold text-white hover:bg-purple-400"
        >
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </Modal>
  )
}
