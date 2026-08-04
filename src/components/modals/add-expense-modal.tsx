"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Segmented } from "@/components/modals/segmented"
import { CheckCircle2, Circle, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MemberOption {
  name: string
  avatar?: string
}

type SplitType = "equal" | "custom" | "percentage"

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  members: MemberOption[]
}

export function AddExpenseModal({ open, onClose, members }: AddExpenseModalProps) {
  const [title, setTitle] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [split, setSplit] = React.useState<SplitType>("equal")
  const [share, setShare] = React.useState("")
  const [payer, setPayer] = React.useState(members[0]?.name ?? "You")
  const [splitMembers, setSplitMembers] = React.useState<Set<string>>(new Set(members.map((m) => m.name)))

  React.useEffect(() => {
    setPayer(members[0]?.name ?? "You")
    setSplitMembers(new Set(members.map((m) => m.name)))
  }, [members, open])

  const toggleMember = (name: string) => {
    setSplitMembers((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const perPerson =
    split === "equal" && splitMembers.size > 0 && amount
      ? `Each pays €${(parseFloat(amount) / splitMembers.size).toFixed(2)}`
      : null

  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <div className="space-y-5">
        <Field>
          <FieldLabel className="text-foreground">Title</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dinner, Uber, Tickets"
            className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
          />
        </Field>

        <Field>
          <FieldLabel className="text-foreground">Amount (€)</FieldLabel>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
          />
        </Field>

        {members.length > 1 && (
          <Field>
            <FieldLabel className="text-foreground">Split between</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => toggleMember(m.name)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    splitMembers.has(m.name)
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {splitMembers.has(m.name) ? (
                    <CheckCircle2 className="size-3.5 text-primary" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                  {m.name}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel className="text-foreground">Split type</FieldLabel>
          <Segmented<SplitType>
            options={[
              { label: "Equal", value: "equal" },
              { label: "Custom", value: "custom" },
              { label: "Percentage", value: "percentage" },
            ]}
            value={split}
            onChange={setSplit}
          />
        </Field>

        {split !== "equal" && (
          <Field>
            <FieldLabel className="text-foreground">
              {split === "custom" ? "Your share (€)" : "Your share (%)"}
            </FieldLabel>
            <Input
              type="number"
              min="0"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              placeholder="0"
              className="h-11 rounded-3xl border-border bg-input text-foreground placeholder:text-muted-foreground"
            />
          </Field>
        )}

        {split === "equal" && perPerson && (
          <p className="rounded-xl border-border bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
            {perPerson}
          </p>
        )}

        <Field>
          <FieldLabel className="text-foreground">Paid by</FieldLabel>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="h-11 w-full rounded-3xl border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            {members.map((m) => (
              <option key={m.name} value={m.name} className="bg-popover text-popover-foreground">
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Button className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
          <Receipt className="size-4" /> Add expense
        </Button>
      </div>
    </Modal>
  )
}
