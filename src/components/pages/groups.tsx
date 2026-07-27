"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { GroupsPage as GroupsContent } from "@/components/pages/groups-page"

export function Groups() {
  return (
    <DashboardLayout>
      <GroupsContent />
    </DashboardLayout>
  )
}
