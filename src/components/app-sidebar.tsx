"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ActivityIcon, ReceiptIcon, UsersIcon, FolderOpenIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navLinks: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Recent Activity",
      url: "/dashboard/activity",
      icon: <ActivityIcon />,
    },
    {
      title: "Settls",
      url: "/dashboard/settls",
      icon: <ReceiptIcon />,
    },
  ],
  navGroups: [
    {
      title: "Friends",
      url: "/dashboard/friends",
      icon: <UsersIcon />,
      isActive: true,
      items: [
        {
          title: "Nasty",
          url: "/dashboard/friends/nasty",
        },
        {
          title: "Pippo",
          url: "/dashboard/friends/pippo",
        },
        {
          title: "GiovAnge",
          url: "/dashboard/friends/giovanage",
        },
        {
          title: "Grecia <3",
          url: "/dashboard/friends/grecia",
        },
        {
          title: "All friends...",
          url: "/dashboard/friends",
          isDisabled: true,
        },
      ],
    },
    {
      title: "Groups",
      url: "/dashboard/groups",
      icon: <FolderOpenIcon />,
      items: [
        {
          title: "Vacanza a Cecina",
          url: "/dashboard/groups/cecina",
        },
        {
          title: "I Tre Topolini",
          url: "/dashboard/groups/topolini",
        },
        {
          title: "The Weeknd 27/7",
          url: "/dashboard/groups/weeknd",
        },
        {
          title: "All groups...",
          url: "/dashboard/groups",
          isDisabled: true,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-3">
              <SidebarTrigger className="-ml-1 size-7 shrink-0" />
              <h2 className="text-base font-black tracking-widest text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-purple-200/80 uppercase whitespace-nowrap group-data-[collapsible=icon]:hidden">
                SETTLR
              </h2>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={data.navLinks} groups={data.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
