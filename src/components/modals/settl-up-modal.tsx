"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SettlTarget {
  name: string
  avatar?: string
  amount: number
}

interface SettlUpModalProps {
  open: boolean
  onClose: () => void
  targets: SettlTarget[]
}

export function SettlUpModal({ open, onClose, targets }: SettlUpModalProps) {
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (open) setSelected(0)
  }, [open])

  const showPicker = targets.length > 1
  const active = targets[selected]
  const empty = targets.length === 0

  return (
    <Modal open={open} onClose={onClose} title="Settl Up">
      {empty ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">You're all settled up.</p>
          <Button
            onClick={onClose}
            className="mt-6 h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {showPicker && (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Who are you settling up with?
              </p>
              <div className="space-y-2">
                {targets.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 transition-colors",
                      selected === i
                        ? "border-accent bg-accent/15"
                        : "border-border bg-secondary hover:bg-accent"
                    )}
                  >
                    {t.avatar && (
                      <img src={t.avatar} alt={t.name} className="size-9 rounded-full bg-white/10" />
                    )}
                    <span className="flex-1 text-left text-sm font-semibold text-foreground">{t.name}</span>
                    {selected === i ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border-border bg-secondary p-5 text-center">
            {!showPicker && active?.avatar && (
              <img src={active.avatar} alt={active.name} className="mx-auto size-12 rounded-full bg-white/10" />
            )}
            {!showPicker && <p className="mt-2 text-sm font-semibold text-foreground">{active?.name}</p>}
            <p className="mt-1 text-xs text-muted-foreground">You'll settle</p>
            <p className="mt-1 text-3xl font-black text-foreground">€{active?.amount.toFixed(2)}</p>
          </div>

          <Button className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
            <HandCoins className="size-4" /> Settl Up
          </Button>
        </div>
      )}
    </Modal>
  )
}
