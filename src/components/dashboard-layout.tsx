"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [pathname, setPathname] = React.useState("")

  React.useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} user={user} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-linear-to-br from-[#110B3B] via-[#1A1250] to-[#0F0A2E] min-h-svh">
          {children}
        </div>
      </SidebarInset>
      <div className="fixed bottom-5 right-5 z-[55]">
        <SidebarTrigger className="size-9 rounded-full bg-[#110B3B]/80 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/10 transition-colors" />
      </div>
    </SidebarProvider>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="relative mt-8">
      <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-400 via-indigo-300 to-pink-400 opacity-30 blur-2xl"></div>
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-purple-200/70 text-sm">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  )
}