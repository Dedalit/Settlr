"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ActivityPage as ActivityContent } from "@/components/pages/activity-page"

export function Activity() {
  return (
    <DashboardLayout>
      <ActivityContent />
    </DashboardLayout>
  )
}
