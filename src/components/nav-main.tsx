"use client"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export interface NavSubItem {
  title: string
  url?: string
  onClick?: () => void
  isActive?: boolean
  className?: string
}

export interface NavLink {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  badge?: number
  items?: NavSubItem[]
}

export function NavMain({ links }: { links: NavLink[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.title}>
            <SidebarMenuButton
              render={<a href={link.url} />}
              tooltip={link.title}
              isActive={link.isActive}
            >
              {link.icon}
              <span>{link.title}</span>
            </SidebarMenuButton>
            {link.badge != null && link.badge > 0 && (
              <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-sidebar">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            )}
            {link.items && (
              <SidebarMenuSub>
                {link.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      render={
                        subItem.onClick ? (
                          <button type="button" onClick={subItem.onClick} />
                        ) : subItem.url ? (
                          <a href={subItem.url} />
                        ) : undefined
                      }
                      isActive={subItem.isActive}
                      className={subItem.className}
                    >
                      <span>{subItem.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
