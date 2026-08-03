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
      <p className="mb-4 text-sm text-purple-200/60">
        Choose which {kind} stay pinned in the sidebar.
      </p>
      {atMax && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-purple-200/60">
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
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              {item.image && (
                <img src={item.image} alt={item.name} className="size-11 shrink-0 rounded-full bg-white/10 object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{item.name}</span>
              <Button
                onClick={() => onTogglePin(item.id)}
                disabled={disabled}
                className={cn(
                  "h-auto shrink-0 rounded-full px-4 py-2 text-xs font-semibold",
                  pinned
                    ? "border border-purple-400/40 bg-purple-500/20 text-white hover:bg-purple-500/30"
                    : "border border-white/10 bg-white/5 text-purple-200/60 hover:bg-white/10 hover:text-white",
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
