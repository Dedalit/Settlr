"use client"

import { cn } from "@/lib/utils"

interface SegmentedOption<T extends string> {
  label: string
  value: T
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
            value === opt.value ? "bg-purple-500/80 text-white" : "text-purple-200/60 hover:text-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
