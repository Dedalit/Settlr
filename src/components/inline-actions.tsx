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
      <Card className="w-full border-border bg-card/70 shadow-sm backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-stretch gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-4 text-sm font-semibold transition-all active:scale-[0.98]",
                  action.variant === "primary"
                    ? "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
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
              ? "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  )
}
