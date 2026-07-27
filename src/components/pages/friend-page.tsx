"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { FriendDetailPage as FriendDetailContent } from "@/components/pages/friend-detail"

export function FriendDetail({ id }: { id: string }) {
  return (
    <DashboardLayout>
      <FriendDetailContent id={id} />
    </DashboardLayout>
  )
}
