"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface InlineAction {
  label: string
  icon?: React.ReactNode
  variant?: "default" | "primary"
  onClick?: () => void
}

export function InlineActions({ actions, layout = "inline" }: { actions: InlineAction[]; layout?: "inline" | "card" }) {
  if (layout === "card") {
    return (
      <Card className="w-full bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-stretch gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-4 text-sm font-semibold transition-all active:scale-[0.98]",
                  action.variant === "primary"
                    ? "border-orange-400/50 bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400 hover:shadow-orange-400/40"
                    : "border-white/10 bg-white/5 text-purple-100 hover:bg-white/10 hover:text-white"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            "flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
            action.variant === "primary"
              ? "border-orange-400/50 bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400 hover:shadow-orange-400/40"
              : "border-white/10 bg-white/5 text-purple-100 hover:bg-white/10 hover:text-white"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  )
}
