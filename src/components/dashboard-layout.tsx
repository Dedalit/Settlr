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
    <SidebarProvider className="dashboard-shell">
      <AppSidebar pathname={pathname} user={user} />
      <SidebarInset>
        <div className="relative flex min-h-svh flex-1 flex-col gap-6 overflow-hidden bg-linear-to-br from-background via-background to-muted/60 p-6 pt-0">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -top-32 -left-24 size-96 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute top-1/4 right-0 size-80 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 size-96 rounded-full bg-violet-500/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>
      <div className="fixed bottom-5 right-5 z-[55]">
        <SidebarTrigger className="size-9 rounded-full border border-border bg-indigo-500 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-indigo-500" />
      </div>
    </SidebarProvider>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  )
}
