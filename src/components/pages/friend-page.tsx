"use client"

import { FriendDetailPage as FriendDetailContent } from "@/components/pages/friend-detail"

export function FriendDetail({ id }: { id: string }) {
  return <FriendDetailContent id={id} />
}
