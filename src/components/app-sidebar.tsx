"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  PlusCircle,
  Receipt
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ 
  userName, 
  userEmail, 
  userInitials, 
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  userName?: string; 
  userEmail?: string; 
  userInitials?: string 
}) {
  
  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/auth/signin";
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#0a071e] text-white" {...props}>
      
      <SidebarHeader className="border-b border-white/10 px-4 py-4">
        <a href="/dashboard" className="flex items-center gap-2 font-black text-lg text-white tracking-wider">
          <div className="size-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-600/30">
            S
          </div>
          <span className="group-data-[collapsible=icon]:hidden">SETTLR</span>
        </a>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-200/50 text-[10px] uppercase tracking-wider group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-white/10 hover:text-white text-purple-200 h-10">
                  <a href="/dashboard">
                    <LayoutDashboard className="size-4 text-purple-400" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-purple-200/50 text-[10px] uppercase tracking-wider">I miei Gruppi</SidebarGroupLabel>
            <button className="text-purple-300 hover:text-white transition">
              <PlusCircle className="size-4" />
            </button>
          </div>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-white/10 hover:text-white text-purple-200 h-10">
                  <a href="/dashboard?group=viaggio">
                    <Users className="size-4 text-indigo-400" />
                    <span>Viaggio Estate ✈️</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-white/10 data-[state=open]:text-white hover:bg-white/10 hover:text-white text-white"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-purple-600 to-indigo-600 text-xs font-bold text-white shadow">
                    {userInitials || "U"}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{userName || "Utente"}</span>
                    <span className="truncate text-xs text-purple-200/60">{userEmail || ""}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-purple-200/60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-[#110B3B] border-white/10 text-white shadow-2xl rounded-2xl p-1"
              >
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer">
                  <a href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-xs font-medium">
                    <Settings className="size-4 text-purple-300" />
                    <span>Profile settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="focus:bg-red-500/20 focus:text-red-300 text-red-400 rounded-xl cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium"
                >
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}