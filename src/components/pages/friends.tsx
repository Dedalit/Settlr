"use client"

import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

const friends = [
  {
    id: "nasty",
    name: "Nasty",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nasty&backgroundColor=b6e3f4",
    balance: -24.5,
    settls: 8,
    lastActive: "2h ago",
  },
  {
    id: "pippo",
    name: "Pippo",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pippo&backgroundColor=c0aede",
    balance: 27.3,
    settls: 12,
    lastActive: "5h ago",
  },
  {
    id: "giovanage",
    name: "GiovAnge",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=GiovAnge&backgroundColor=d1d4f9",
    balance: 37.0,
    settls: 5,
    lastActive: "2d ago",
  },
  {
    id: "grecia",
    name: "Grecia <3",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Grecia&backgroundColor=ffd5dc",
    balance: -42.0,
    settls: 15,
    lastActive: "1d ago",
  },
  {
    id: "marco",
    name: "Marco",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marco&backgroundColor=b6e3f4",
    balance: 5.5,
    settls: 3,
    lastActive: "1w ago",
  },
  {
    id: "sofia",
    name: "Sofia",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia&backgroundColor=c0aede",
    balance: 0,
    settls: 6,
    lastActive: "3d ago",
  },
]

export function Friends() {
  return (
    <>
      <PageHeader title="Friends" subtitle="People you share expenses with" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <a key={friend.id} href={`/dashboard/friends/${friend.id}`} className="block group">
            <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/[0.07] hover:border-purple-400/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <img src={friend.avatar} alt={friend.name} className="size-14 rounded-full bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{friend.name}</p>
                    <p className="text-xs text-purple-200/40">Active {friend.lastActive}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-purple-300/50" />
                    <span className="text-xs text-purple-200/50">{friend.settls} settls</span>
                  </div>
                  {friend.balance !== 0 ? (
                    <div className="flex items-center gap-1">
                      {friend.balance > 0 ? (
                        <>
                          <ArrowUpRight className="size-3.5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-400">+€{friend.balance.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="size-3.5 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">-€{Math.abs(friend.balance).toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-purple-200/40">Settled up</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  )
}
