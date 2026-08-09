"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Segmented } from "@/components/modals/segmented"
import { ImageIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type GroupType = "trip" | "roommates" | "event" | "other"

const groupTypeOptions: { label: string; value: GroupType }[] = [
  { label: "Trip", value: "trip" },
  { label: "Roommates", value: "roommates" },
  { label: "Event", value: "event" },
  { label: "Other", value: "other" },
]

export function CreateGroupModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const [title, setTitle] = React.useState("")
  const [picture, setPicture] = React.useState("")
  const [type, setType] = React.useState<GroupType>("trip")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setTitle("")
    setPicture("")
    setType("trip")
    setSubmitting(false)
    setError(null)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title.trim(), imageUrl: picture.trim() || null, type }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create the group.")
      }
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the group.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create group">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field>
          <FieldLabel className="text-foreground">Group title</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Vacanza a Cecina"
            className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
          />
        </Field>

        <Field>
          <FieldLabel className="text-foreground">Group picture</FieldLabel>
          <div className="flex items-center gap-3">
            {picture ? (
              <img
                src={picture}
                alt="Group preview"
                className="size-14 shrink-0 rounded-2xl border-border object-cover"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-border bg-secondary text-muted-foreground">
                <ImageIcon className="size-5" />
              </div>
            )}
            <Input
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
              placeholder="Paste an image URL..."
              className="h-11 flex-1 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel className="text-foreground">Type</FieldLabel>
          <Segmented<GroupType> options={groupTypeOptions} value={type} onChange={setType} />
        </Field>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={!title.trim() || submitting}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className={cn("size-4", submitting && "animate-spin")} /> {submitting ? "Creating..." : "Create group"}
        </Button>
      </form>
    </Modal>
  )
}
