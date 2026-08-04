"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Segmented } from "@/components/modals/segmented"
import { ImageIcon, Plus } from "lucide-react"

type GroupType = "trip" | "roommates" | "event" | "other"

const groupTypeOptions: { label: string; value: GroupType }[] = [
  { label: "Trip", value: "trip" },
  { label: "Roommates", value: "roommates" },
  { label: "Event", value: "event" },
  { label: "Other", value: "other" },
]

export function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = React.useState("")
  const [picture, setPicture] = React.useState("")
  const [type, setType] = React.useState<GroupType>("trip")

  return (
    <Modal open={open} onClose={onClose} title="Create group">
      <div className="space-y-5">
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

        <Button className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" /> Create group
        </Button>
      </div>
    </Modal>
  )
}
