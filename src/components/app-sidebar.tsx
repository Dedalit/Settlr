"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, LayoutDashboardIcon, ActivityIcon, ReceiptIcon, UsersIcon, FolderOpenIcon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navLinks: [
    {
      title: "Dashboard",
      url: "#",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Recent Activity",
      url: "#",
      icon: <ActivityIcon />,
    },
    {
      title: "Settls",
      url: "#",
      icon: <ReceiptIcon />,
    },
  ],
  navGroups: [
    {
      title: "Friends",
      url: "#",
      icon: <UsersIcon />,
      isActive: true,
      items: [
        {
          title: "Nasty",
          url: "#",
        },
        {
          title: "Pippo",
          url: "#",
        },
        {
          title: "GiovAnge",
          url: "#",
        },
        {
          title: "Grecia <3",
          url: "#",
        },
        {
          title: "All friends...",
          url: "#",
          isDisabled: true,
        },
      ],
    },
    {
      title: "Groups",
      url: "#",
      icon: <FolderOpenIcon />,
      items: [
        {
          title: "Vacanza a Cecina",
          url: "#",
        },
        {
          title: "I Tre Topolini",
          url: "#",
        },
        {
          title: "The Weeknd 27/7",
          url: "#",
        },
        {
          title: "All groups...",
          url: "#",
          isDisabled: true,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={data.navLinks} groups={data.navGroups} />
        {/*--<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
