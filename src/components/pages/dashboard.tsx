"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview as OverviewContent } from "@/components/pages/dashboard-overview"

export function Dashboard() {
  return (
    <DashboardLayout>
      <OverviewContent />
    </DashboardLayout>
  )
}
