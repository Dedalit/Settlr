"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { FriendsPage as FriendsContent } from "@/components/pages/friends-page"

export function Friends() {
  return (
    <DashboardLayout>
      <FriendsContent />
    </DashboardLayout>
  )
}
