"use client"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PinMoreItem {
  id: string
  name: string
  image?: string
}

interface PinMoreModalProps {
  open: boolean
  kind: "friends" | "groups"
  items: PinMoreItem[]
  pinnedIds: string[]
  onTogglePin: (id: string) => void
  onClose: () => void
}

export function PinMoreModal({ open, kind, items, pinnedIds, onTogglePin, onClose }: PinMoreModalProps) {
  const atMax = pinnedIds.length >= 5

  return (
    <Modal open={open} onClose={onClose} title={kind === "friends" ? "Pin friends" : "Pin groups"}>
      <p className="mb-4 text-sm text-muted-foreground">
        Choose which {kind} stay pinned in the sidebar.
      </p>
      {atMax && (
        <p className="mb-4 rounded-xl border-border bg-secondary px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          5 pins max
        </p>
      )}
      <div className="space-y-2">
        {items.map((item) => {
          const pinned = pinnedIds.includes(item.id)
          const disabled = !pinned && atMax
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border-border bg-secondary p-3"
            >
              {item.image && (
                <img src={item.image} alt={item.name} className="size-11 shrink-0 rounded-full bg-white/10 object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{item.name}</span>
              <Button
                onClick={() => onTogglePin(item.id)}
                disabled={disabled}
                className={cn(
                  "h-auto shrink-0 rounded-full px-4 py-2 text-xs font-semibold",
                  pinned
                    ? "border border-accent bg-accent/15 text-foreground hover:bg-accent/25"
                    : "border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
                  disabled && "pointer-events-none opacity-40"
                )}
              >
                {pinned ? <Pin className="size-3.5" /> : <PinOff className="size-3.5" />}
                {pinned ? "Pinned" : "Pin"}
              </Button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
