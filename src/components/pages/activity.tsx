"use client"

import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Pencil, DollarSign, ArrowRightLeft, UserPlus, UserMinus, Tag, RefreshCw } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "settlement",
    group: "Vacanza a Cecina",
    actor: "Nasty",
    action: "settled up with Pippo",
    amount: "€24.50",
    time: "2 hours ago",
    icon: <DollarSign className="size-4 text-emerald-400" />,
  },
  {
    id: 2,
    type: "expense",
    group: "I Tre Topolini",
    actor: "Grecia <3",
    action: "added expense: Drinks at Bar — €32.00 (split 4 ways)",
    amount: "€8.00 your share",
    time: "5 hours ago",
    icon: <Tag className="size-4 text-muted-foreground" />,
  },
  {
    id: 3,
    type: "rename",
    group: "The Weeknd 27/7",
    actor: "Pippo",
    action: "renamed group from \"Concert Tickets\" to \"The Weeknd 27/7\"",
    amount: "",
    time: "1 day ago",
    icon: <Pencil className="size-4 text-blue-400" />,
  },
  {
    id: 4,
    type: "member",
    group: "Vacanza a Cecina",
    actor: "GiovAnge",
    action: "joined the group",
    amount: "",
    time: "2 days ago",
    icon: <UserPlus className="size-4 text-emerald-400" />,
  },
  {
    id: 5,
    type: "settlement",
    group: "I Tre Topolini",
    actor: "You",
    action: "paid Nasty",
    amount: "€15.00",
    time: "2 days ago",
    icon: <ArrowRightLeft className="size-4 text-amber-400" />,
  },
  {
    id: 6,
    type: "expense",
    group: "The Weeknd 27/7",
    actor: "Nasty",
    action: "added expense: Tickets — €180.00 (split 3 ways)",
    amount: "€60.00 your share",
    time: "3 days ago",
    icon: <Tag className="size-4 text-muted-foreground" />,
  },
  {
    id: 7,
    type: "member",
    group: "I Tre Topolini",
    actor: "Pippo",
    action: "removed Marco from the group",
    amount: "",
    time: "4 days ago",
    icon: <UserMinus className="size-4 text-red-400" />,
  },
  {
    id: 8,
    type: "settlement",
    group: "Vacanza a Cecina",
    actor: "Grecia <3",
    action: "settled up with You",
    amount: "€42.00",
    time: "5 days ago",
    icon: <RefreshCw className="size-4 text-emerald-400" />,
  },
  {
    id: 9,
    type: "expense",
    group: "I Tre Topolini",
    actor: "GiovAnge",
    action: "added expense: Grocery run — €45.80 (split 4 ways)",
    amount: "€11.45 your share",
    time: "1 week ago",
    icon: <Tag className="size-4 text-muted-foreground" />,
  },
  {
    id: 10,
    type: "settlement",
    group: "The Weeknd 27/7",
    actor: "Pippo",
    action: "settled up with Grecia <3",
    amount: "€30.00",
    time: "1 week ago",
    icon: <DollarSign className="size-4 text-emerald-400" />,
  },
]

function ActivityIcon({ type }: { type: string }) {
  const bgMap: Record<string, string> = {
    settlement: "bg-emerald-500/20 border-emerald-500/30",
    expense: "bg-secondary border-border",
    rename: "bg-blue-500/20 border-blue-500/30",
    member: "bg-amber-500/20 border-amber-500/30",
  }
  return bgMap[type] || "bg-secondary border-border"
}

export function Activity() {
  return (
    <>
      <PageHeader title="Recent Activity" subtitle="Everything happening in your groups" />

      <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-4">
        <FilterChip label="All" active />
        <FilterChip label="Settlements" />
        <FilterChip label="Expenses" />
        <FilterChip label="Group Changes" />
        <FilterChip label="Members" />
      </div>

      <div className="space-y-3">
        {activities.map((item) => (
          <Card key={item.id} className="bg-card/70 text-card-foreground border-border shadow-sm backdrop-blur-xl hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center border ${ActivityIcon({ type: item.type })}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{item.actor}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.group}</p>
                    </div>
                    {item.amount && (
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">{item.amount}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-secondary text-muted-foreground border-border hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
