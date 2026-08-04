"use client"

import * as React from "react"

import { NavMain, type NavLink } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { PinMoreModal, type PinMoreItem } from "@/components/modals/pin-more-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ActivityIcon, ReceiptIcon, UsersIcon, FolderOpenIcon } from "lucide-react"

const allFriends: PinMoreItem[] = [
  { id: "nasty", name: "Nasty", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nasty&backgroundColor=b6e3f4" },
  { id: "pippo", name: "Pippo", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pippo&backgroundColor=c0aede" },
  { id: "giovanage", name: "GiovAnge", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=GiovAnge&backgroundColor=d1d4f9" },
  { id: "grecia", name: "Grecia <3", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Grecia&backgroundColor=ffd5dc" },
  { id: "marco", name: "Marco", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marco&backgroundColor=b6e3f4" },
  { id: "sofia", name: "Sofia", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia&backgroundColor=c0aede" },
]

const allGroups: PinMoreItem[] = [
  { id: "cecina", name: "Vacanza a Cecina", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop" },
  { id: "topolini", name: "I Tre Topolini", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop" },
  { id: "weeknd", name: "The Weeknd 27/7", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop" },
  { id: "universita", name: "Università '25", image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop" },
]

const staticLinks: NavLink[] = [
  { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Recent Activity", url: "/dashboard/activity", icon: <ActivityIcon /> },
  { title: "Settls", url: "/dashboard/settls", icon: <ReceiptIcon /> },
]

function getActiveState(pathname: string, navLinks: NavLink[]) {
  return navLinks.map((link) => {
    const itemsWithActive = link.items?.map((item) => ({
      ...item,
      isActive: item.url ? pathname === item.url : false,
    }))
    return {
      ...link,
      isActive: pathname === link.url || (link.items ? pathname.startsWith(link.url + "/") : false),
      items: itemsWithActive,
    }
  })
}

export function AppSidebar({ pathname, user, ...props }: React.ComponentProps<typeof Sidebar> & { pathname: string; user?: { name: string; email: string; avatar: string } }) {
  const [pinnedFriends, setPinnedFriends] = React.useState<string[]>(allFriends.slice(0, 4).map((f) => f.id))
  const [pinnedGroups, setPinnedGroups] = React.useState<string[]>(allGroups.slice(0, 3).map((g) => g.id))
  const [pinModal, setPinModal] = React.useState<null | "friends" | "groups">(null)

  const navLinks: NavLink[] = [
    ...staticLinks,
    {
      title: "Friends",
      url: "/dashboard/friends",
      icon: <UsersIcon />,
      items: [
        ...pinnedFriends
          .map((id) => allFriends.find((f) => f.id === id))
          .filter((f): f is PinMoreItem => Boolean(f))
          .map((f) => ({ title: f.name, url: `/dashboard/friends/${f.id}` })),
        { title: "Edit pins", onClick: () => setPinModal("friends"), className: "text-sidebar-foreground/50" },
      ],
    },
    {
      title: "Groups",
      url: "/dashboard/groups",
      icon: <FolderOpenIcon />,
      items: [
        ...pinnedGroups
          .map((id) => allGroups.find((g) => g.id === id))
          .filter((g): g is PinMoreItem => Boolean(g))
          .map((g) => ({ title: g.name, url: `/dashboard/groups/${g.id}` })),
        { title: "Edit pins", onClick: () => setPinModal("groups"), className: "text-sidebar-foreground/50" },
      ],
    },
  ]

  const links = getActiveState(pathname, navLinks)

  const MAX_PINS = 5

  const togglePin = (id: string) => {
    if (pinModal === "friends") {
      setPinnedFriends((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        if (prev.length >= MAX_PINS) return prev
        return [...prev, id]
      })
    } else if (pinModal === "groups") {
      setPinnedGroups((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        if (prev.length >= MAX_PINS) return prev
        return [...prev, id]
      })
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 px-3">
              <h2 className="text-base font-black tracking-widest text-sidebar-foreground uppercase whitespace-nowrap group-data-[collapsible=icon]:hidden">
                SETTLR
              </h2>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={links} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />

      <PinMoreModal
        open={pinModal !== null}
        kind={pinModal === "groups" ? "groups" : "friends"}
        items={pinModal === "groups" ? allGroups : allFriends}
        pinnedIds={pinModal === "groups" ? pinnedGroups : pinnedFriends}
        onTogglePin={togglePin}
        onClose={() => setPinModal(null)}
      />
    </Sidebar>
  )
}
