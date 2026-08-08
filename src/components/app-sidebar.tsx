"use client"

import * as React from "react"

import { NavMain, type NavLink, type NavSubItem } from "@/components/nav-main"
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
  const [friends, setFriends] = React.useState<PinMoreItem[]>([])
  const [groups, setGroups] = React.useState<PinMoreItem[]>([])
  const [pinnedFriendIds, setPinnedFriendIds] = React.useState<string[]>([])
  const [pinnedGroupIds, setPinnedGroupIds] = React.useState<string[]>([])
  const [pinModal, setPinModal] = React.useState<null | "friends" | "groups">(null)

  React.useEffect(() => {
    let mounted = true
    Promise.all([
      fetch("/api/friends").then((r) => r.json()),
      fetch("/api/groups").then((r) => r.json()),
    ])
      .then(([friendsData, groupsData]) => {
        if (!mounted) return
        const loadedFriends: PinMoreItem[] = (friendsData.friends ?? []).map((f: any) => ({
          id: String(f.id),
          name: f.name,
          image: f.avatar ?? undefined,
        }))
        const loadedGroups: PinMoreItem[] = (groupsData.groups ?? []).map((g: any) => ({
          id: String(g.id),
          name: g.name,
          image: g.image_url ?? undefined,
        }))
        setFriends(loadedFriends)
        setGroups(loadedGroups)
        setPinnedFriendIds(loadedFriends.slice(0, 4).map((f) => f.id))
        setPinnedGroupIds(loadedGroups.slice(0, 3).map((g) => g.id))
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const friendSubItems: NavSubItem[] = [
    ...pinnedFriendIds
      .map((id) => friends.find((f) => f.id === id))
      .filter((f): f is PinMoreItem => Boolean(f))
      .map((f) => ({ title: f.name, url: `/dashboard/friends/${f.id}` })),
    {
      title: pinnedFriendIds.length === 0 ? "Pin friends" : "Edit pins",
      onClick: () => setPinModal("friends"),
      className: "text-sidebar-foreground/50",
    },
  ]

  const groupSubItems: NavSubItem[] = [
    ...pinnedGroupIds
      .map((id) => groups.find((g) => g.id === id))
      .filter((g): g is PinMoreItem => Boolean(g))
      .map((g) => ({ title: g.name, url: `/dashboard/groups/${g.id}` })),
    {
      title: pinnedGroupIds.length === 0 ? "Pin groups" : "Edit pins",
      onClick: () => setPinModal("groups"),
      className: "text-sidebar-foreground/50",
    },
  ]

  const navLinks: NavLink[] = [
    ...staticLinks,
    {
      title: "Friends",
      url: "/dashboard/friends",
      icon: <UsersIcon />,
      items: friendSubItems,
    },
    {
      title: "Groups",
      url: "/dashboard/groups",
      icon: <FolderOpenIcon />,
      items: groupSubItems,
    },
  ]

  const links = getActiveState(pathname, navLinks)

  const MAX_PINS = 5

  const togglePin = (id: string) => {
    if (pinModal === "friends") {
      setPinnedFriendIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        if (prev.length >= MAX_PINS) return prev
        return [...prev, id]
      })
    } else if (pinModal === "groups") {
      setPinnedGroupIds((prev) => {
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
            <div className="flex h-14 items-center gap-2 px-3">
              <h2 className="text-2xl font-black tracking-widest text-sidebar-foreground uppercase whitespace-nowrap group-data-[collapsible=icon]:hidden">
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
        items={pinModal === "groups" ? groups : friends}
        pinnedIds={pinModal === "groups" ? pinnedGroupIds : pinnedFriendIds}
        onTogglePin={togglePin}
        onClose={() => setPinModal(null)}
      />
    </Sidebar>
  )
}
