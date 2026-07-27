"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ActivityIcon, ReceiptIcon, UsersIcon, FolderOpenIcon } from "lucide-react"

const navLinks = [
  { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Recent Activity", url: "/dashboard/activity", icon: <ActivityIcon /> },
  { title: "Settls", url: "/dashboard/settls", icon: <ReceiptIcon /> },
]

const navGroups = [
  {
    title: "Friends",
    url: "/dashboard/friends",
    icon: <UsersIcon />,
    items: [
      { title: "Nasty", url: "/dashboard/friends/nasty" },
      { title: "Pippo", url: "/dashboard/friends/pippo" },
      { title: "GiovAnge", url: "/dashboard/friends/giovanage" },
      { title: "Grecia <3", url: "/dashboard/friends/grecia" },
      { title: "All friends...", url: "/dashboard/friends", isDisabled: true },
    ],
  },
  {
    title: "Groups",
    url: "/dashboard/groups",
    icon: <FolderOpenIcon />,
    items: [
      { title: "Vacanza a Cecina", url: "/dashboard/groups/cecina" },
      { title: "I Tre Topolini", url: "/dashboard/groups/topolini" },
      { title: "The Weeknd 27/7", url: "/dashboard/groups/weeknd" },
      { title: "All groups...", url: "/dashboard/groups", isDisabled: true },
    ],
  },
]

function getActiveState(pathname: string) {
  const linksWithActive = navLinks.map((link) => ({
    ...link,
    isActive: pathname === link.url,
  }))

  const groupsWithActive = navGroups.map((group) => {
    const isGroupActive = pathname === group.url || pathname.startsWith(group.url + "/")
    const itemsWithActive = group.items?.map((item) => ({
      ...item,
      isActive: pathname === item.url,
    }))
    return {
      ...group,
      isActive: isGroupActive,
      items: itemsWithActive,
    }
  })

  return { links: linksWithActive, groups: groupsWithActive }
}

export function AppSidebar({ pathname, ...props }: React.ComponentProps<typeof Sidebar> & { pathname: string }) {
  const { links, groups } = getActiveState(pathname)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-3 py-3">
              <h2 className="text-base font-black tracking-widest text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase whitespace-nowrap group-data-[collapsible=icon]:hidden">
                SETTLR
              </h2>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={links} groups={groups} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
