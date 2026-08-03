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
          <FieldLabel className="text-purple-200/70">Title</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dinner, Uber, Tickets"
            className="h-11 rounded-3xl border border-white/10 bg-white/5 text-purple-100 placeholder:text-purple-200/40"
          />
        </Field>

        <Field>
          <FieldLabel className="text-purple-200/70">Amount (€)</FieldLabel>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-11 rounded-3xl border border-white/10 bg-white/5 text-purple-100 placeholder:text-purple-200/40"
          />
        </Field>

        {members.length > 1 && (
          <Field>
            <FieldLabel className="text-purple-200/70">Split between</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => toggleMember(m.name)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    splitMembers.has(m.name)
                      ? "border-purple-400/40 bg-purple-500/20 text-white"
                      : "border-white/10 bg-white/5 text-purple-200/60 hover:text-white"
                  )}
                >
                  {splitMembers.has(m.name) ? (
                    <CheckCircle2 className="size-3.5 text-purple-400" />
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
          <FieldLabel className="text-purple-200/70">Split type</FieldLabel>
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
            <FieldLabel className="text-purple-200/70">
              {split === "custom" ? "Your share (€)" : "Your share (%)"}
            </FieldLabel>
            <Input
              type="number"
              min="0"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              placeholder="0"
              className="h-11 rounded-3xl border border-white/10 bg-white/5 text-purple-100 placeholder:text-purple-200/40"
            />
          </Field>
        )}

        {split === "equal" && perPerson && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-purple-200/60">
            {perPerson}
          </p>
        )}

        <Field>
          <FieldLabel className="text-purple-200/70">Paid by</FieldLabel>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="h-11 w-full rounded-3xl border border-white/10 bg-white/5 px-4 text-sm text-purple-100 outline-none focus-visible:border-purple-400/50"
          >
            {members.map((m) => (
              <option key={m.name} value={m.name} className="bg-[#110B3B] text-white">
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Button className="h-12 w-full rounded-full bg-purple-500/80 text-base font-semibold text-white hover:bg-purple-400">
          <Receipt className="size-4" /> Add expense
        </Button>
      </div>
    </Modal>
  )
}
