"use client"

import { GroupDetailPage as GroupDetailContent } from "@/components/pages/group-detail"

export function GroupDetail({ id }: { id: string }) {
  return <GroupDetailContent id={id} />
}
