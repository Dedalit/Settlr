"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-gradient-to-br from-[#110B3B] via-[#1A1250] to-[#0F0A2E] min-h-svh">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative mt-8">
      <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-400 via-indigo-300 to-pink-400 opacity-30 blur-2xl"></div>
      <div className="relative">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-purple-200/70 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
