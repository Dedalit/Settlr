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
  id: number
  name: string
  avatar?: string
}

type SplitType = "equal" | "custom" | "percentage"

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  groupId?: number
  friendId?: number
  members: MemberOption[]
  onCreated?: () => void
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function AddExpenseModal({ open, onClose, groupId, friendId, members, onCreated }: AddExpenseModalProps) {
  const [title, setTitle] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [split, setSplit] = React.useState<SplitType>("equal")
  const [payerId, setPayerId] = React.useState<number | null>(members[0]?.id ?? null)
  const [splitMemberIds, setSplitMemberIds] = React.useState<Set<number>>(new Set(members.map((m) => m.id)))
  const [customAmounts, setCustomAmounts] = React.useState<Record<number, string>>({})
  const [percentages, setPercentages] = React.useState<Record<number, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setTitle("")
    setAmount("")
    setSplit("equal")
    setPayerId(members[0]?.id ?? null)
    setSplitMemberIds(new Set(members.map((m) => m.id)))
    setCustomAmounts({})
    setPercentages({})
    setSubmitting(false)
    setError(null)
  }, [open, members])

  const toggleMember = (id: number) => {
    setSplitMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedMembers = members.filter((m) => splitMemberIds.has(m.id))
  const total = parseFloat(amount)
  const totalValid = !Number.isNaN(total) && total > 0

  const perPerson = split === "equal" && splitMemberIds.size > 0 && totalValid
    ? `Each pays €${round2(total / splitMemberIds.size).toFixed(2)}`
    : null

  const customValue = (id: number) => {
    if (customAmounts[id] !== undefined) return customAmounts[id]
    return splitMemberIds.size > 0 && totalValid ? round2(total / splitMemberIds.size).toFixed(2) : ""
  }

  const percentageValue = (id: number) => {
    if (percentages[id] !== undefined) return percentages[id]
    return splitMemberIds.size > 0 ? round2(100 / splitMemberIds.size).toString() : ""
  }

  const buildSplits = (): { userId: number; amount: number }[] => {
    if (!totalValid) return []
    if (split === "equal") {
      const per = round2(total / selectedMembers.length)
      return selectedMembers.map((m) => ({ userId: m.id, amount: per }))
    }
    if (split === "percentage") {
      return selectedMembers.map((m) => {
        const pct = parseFloat(percentageValue(m.id)) || 0
        return { userId: m.id, amount: round2((pct / 100) * total) }
      })
    }
    return selectedMembers.map((m) => ({
      userId: m.id,
      amount: round2(parseFloat(customValue(m.id)) || 0),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!title.trim()) {
      setError("Please enter a title.")
      return
    }
    if (!totalValid) {
      setError("Please enter an amount greater than 0.")
      return
    }
    if (selectedMembers.length === 0) {
      setError("Select at least one person to split with.")
      return
    }
    const splits = buildSplits()
    const sum = round2(splits.reduce((acc, s) => acc + s.amount, 0))
    if (Math.abs(sum - total) > 0.01) {
      setError(split === "percentage" ? "Percentages must add up to 100%." : "Split amounts must add up to the total.")
      return
    }
    if (payerId == null) {
      setError("Select who paid.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(groupId != null ? { groupId } : {}),
          ...(friendId != null ? { friendId } : {}),
          description: title.trim(),
          amount: total,
          category: null,
          imgUrl: null,
          paidByUserId: payerId,
          splits,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not add the expense.")
      }
      setTitle("")
      setAmount("")
      setSplit("equal")
      setCustomAmounts({})
      setPercentages({})
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the expense.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <form onSubmit={handleSubmit} className="space-y-5">
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
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    splitMemberIds.has(m.id)
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {splitMemberIds.has(m.id) ? (
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
              {split === "custom" ? "Amount per person (€)" : "Share per person (%)"}
            </FieldLabel>
            <div className="space-y-2">
              {selectedMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{m.name}</span>
                  <Input
                    type="number"
                    min="0"
                    value={split === "custom" ? customValue(m.id) : percentageValue(m.id)}
                    onChange={(e) =>
                      split === "custom"
                        ? setCustomAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))
                        : setPercentages((prev) => ({ ...prev, [m.id]: e.target.value }))
                    }
                    className="h-9 w-28 rounded-2xl border-border bg-input text-sm text-foreground"
                  />
                  {split === "percentage" && <span className="text-sm text-muted-foreground">%</span>}
                </div>
              ))}
            </div>
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
            value={payerId ?? ""}
            onChange={(e) => setPayerId(Number(e.target.value))}
            className="h-11 w-full rounded-3xl border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id} className="bg-popover text-popover-foreground">
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Receipt className={cn("size-4", submitting && "animate-spin")} /> {submitting ? "Adding..." : "Add expense"}
        </Button>
      </form>
    </Modal>
  )
}
