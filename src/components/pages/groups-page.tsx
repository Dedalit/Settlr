"use client"

import { PageHeader } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react"

const groups = [
  {
    id: "cecina",
    name: "Vacanza a Cecina",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    members: 4,
    balance: 47.50,
    totalSettls: 23,
    totalSpent: 1240.00,
    lastActive: "2h ago",
  },
  {
    id: "topolini",
    name: "I Tre Topolini",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    members: 4,
    balance: -15.00,
    totalSettls: 18,
    totalSpent: 890.50,
    lastActive: "5h ago",
  },
  {
    id: "weeknd",
    name: "The Weeknd 27/7",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
    members: 3,
    balance: 0,
    totalSettls: 8,
    totalSpent: 540.00,
    lastActive: "1d ago",
  },
  {
    id: "universita",
    name: "Università '25",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop",
    members: 6,
    balance: 120.00,
    totalSettls: 42,
    totalSpent: 2100.00,
    lastActive: "3d ago",
  },
]

export function GroupsPage() {
  return (
    <>
      <PageHeader title="Groups" subtitle="Shared expense groups you're part of" />

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <a key={group.id} href={`/dashboard/groups/${group.id}`} className="block group">
            <Card className="bg-[#110B3B]/60 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/[0.07] hover:border-purple-400/30 transition-all overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">{group.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-purple-200/50">
                        <Users className="size-3.5" />
                        {group.members} members
                      </span>
                      <span className="flex items-center gap-1 text-xs text-purple-200/50">
                        <Receipt className="size-3.5" />
                        {group.totalSettls} settls
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {group.balance !== 0 ? (
                      <div className="flex items-center gap-1">
                        {group.balance > 0 ? (
                          <ArrowUpRight className="size-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="size-4 text-red-400" />
                        )}
                        <span className={`text-sm font-bold ${group.balance > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          €{Math.abs(group.balance).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-purple-200/40">Settled</span>
                    )}
                    <p className="text-xs text-purple-200/30 mt-0.5">Total €{group.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  )
}
