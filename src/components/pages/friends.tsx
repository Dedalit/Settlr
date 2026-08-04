"use client"

import * as React from "react"
import { PageHeader } from "@/components/dashboard-layout"
import { InlineActions } from "@/components/inline-actions"
import { CardActionsMenu } from "@/components/card-actions-menu"
import { AddFriendModal } from "@/components/modals/add-friend-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowUpRight, ArrowDownRight, UserPlus, Trash2 } from "lucide-react"

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
  const [addFriendOpen, setAddFriendOpen] = React.useState(false)
  const [friendsList, setFriendsList] = React.useState(friends)

  const handleDelete = (friend: (typeof friends)[number]) => {
    if (friend.balance !== 0) {
      window.alert(
        `You still have an outstanding balance with ${friend.name} (€${Math.abs(friend.balance).toFixed(2)}). Settle up before you can remove them.`
      )
      return
    }
    setFriendsList((prev) => prev.filter((f) => f.id !== friend.id))
  }

  return (
    <>
      <PageHeader
        title="Friends"
        subtitle="People you share expenses with"
        actions={
          <InlineActions
            actions={[
              {
                label: "Add friend",
                icon: <UserPlus className="size-4" />,
                onClick: () => setAddFriendOpen(true),
              },
            ]}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friendsList.map((friend) => (
          <a key={friend.id} href={`/dashboard/friends/${friend.id}`} className="block group">
            <Card className="relative bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl hover:bg-accent/50 hover:border-accent transition-all">
              <CardContent className="p-5">
                <CardActionsMenu
                  buttonClassName="absolute right-3 top-3"
                  label="Delete friend"
                  icon={<Trash2 className="size-4" />}
                  onAction={() => handleDelete(friend)}
                />
                <div className="flex items-center gap-4">
                  <img src={friend.avatar} alt={friend.name} className="size-14 rounded-full bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">Active {friend.lastActive}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{friend.settls} settls</span>
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
                    <span className="text-xs text-muted-foreground">Settled up</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      <AddFriendModal open={addFriendOpen} onClose={() => setAddFriendOpen(false)} />
    </>
  )
}
