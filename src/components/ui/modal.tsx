"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#110B3B] shadow-2xl",
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#110B3B]/95 px-6 py-5 backdrop-blur-xl">
          <h2 className="text-lg font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-purple-200/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
