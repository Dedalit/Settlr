"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardActionsMenuProps {
  label: string
  icon: React.ReactNode
  onAction: () => void
  buttonClassName?: string
}

export function CardActionsMenu({ label, icon, onAction, buttonClassName }: CardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`${label} options`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className={cn(
              "rounded-full border border-border bg-card/80 p-2 text-muted-foreground backdrop-blur-xl transition-colors hover:bg-accent hover:text-accent-foreground",
              buttonClassName
            )}
          />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem variant="destructive" onClick={onAction}>
          {icon}
          {label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
