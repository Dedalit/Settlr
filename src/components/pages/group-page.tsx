"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { GroupDetailPage as GroupDetailContent } from "@/components/pages/group-detail"

export function GroupDetail({ id }: { id: string }) {
  return (
    <DashboardLayout>
      <GroupDetailContent id={id} />
    </DashboardLayout>
  )
}
