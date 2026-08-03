"use client"

import { cn } from "@/lib/utils"

export interface FloatingAction {
  label: string
  icon?: React.ReactNode
  variant?: "default" | "primary"
  onClick?: () => void
}

export function FloatingActions({ actions }: { actions: FloatingAction[] }) {
  return (
    <div className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-[#110B3B]/80 p-3 shadow-2xl backdrop-blur-xl">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            "flex items-center gap-2.5 rounded-full border px-7 py-3.5 text-base font-semibold transition-all active:scale-95",
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
