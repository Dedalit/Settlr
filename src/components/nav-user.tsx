"use client"

import React, { useEffect, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, Settings, BadgeCheckIcon, BellIcon, LogOutIcon } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"

export function NavUser({ user: initialUser }: { user?: { name: string; email: string; avatar: string } } = {}) {
  const { isMobile } = useSidebar()
  const [userData, setUserData] = useState<{ name: string; email: string; avatar: string } | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    if (initialUser) return // already have server user
    let mounted = true
    const supabase = createBrowserSupabaseClient()

    async function loadUser() {
      // Prefer session-based retrieval if available
      const sessionResp = await supabase.auth.getSession()
      const clientUser = sessionResp.data?.session?.user ?? (await supabase.auth.getUser()).data?.user
      if (!mounted) return
      if (!clientUser) {
        setUserData({ name: 'User', email: '', avatar: '/avatars/shadcn.jpg' })
        setLoading(false)
        return
      }

      const username = clientUser.user_metadata?.username
      const firstName = clientUser.user_metadata?.first_name || ''
      const lastName = clientUser.user_metadata?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim()
      const email = clientUser.email || ''
      const usernameFromEmail = email.split('@')[0]

      const displayName =
        username ||
        (fullName ? fullName : null) ||
        clientUser.user_metadata?.full_name ||
        clientUser.user_metadata?.name ||
        (usernameFromEmail ? usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1) : 'User')

      const data = {
        name: displayName,
        email,
        avatar: clientUser.user_metadata?.avatar_url || '/avatars/shadcn.jpg',
      }

      setUserData(data)
      setLoading(false)
    }

    loadUser()
    return () => { mounted = false }
  }, [initialUser])

  const user = userData ?? { name: 'User', email: '', avatar: '/avatars/shadcn.jpg' }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = "/api/auth/signout"}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
