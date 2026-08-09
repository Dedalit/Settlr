export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUserGroupIds } from "@/lib/database";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

const round2 = (n: number) => Math.round(n * 100) / 100;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupIds = await getUserGroupIds(supabase, me);
  let expenses: any[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("expenses")
      .select("id, group_id, category, value_amout, created_at, created_by, paid_by ( user_id, tot_paid ), expense_split ( user_id, amount_owed )")
      .in("group_id", groupIds);
    expenses = data ?? [];
  }

  const { data: allSettlements } = await supabase
    .from("settlements")
    .select("id, created_at, payer_id, payee_id, amount")
    .or(`payer_id.eq.${me},payee_id.eq.${me}`);
  const settlements = allSettlements ?? [];

  const { data: logRows } = await supabase
    .from("activity_log")
    .select(`id, created_at, actor_id, event_type, payload, actor:users ( full_name, username, email )`)
    .order("created_at", { ascending: false })
    .limit(5);
  const log = logRows ?? [];

  // ---- stats ----
  let claims = 0;
  let debts = 0;
  let received = 0;
  let sent = 0;
  let pendingSettls = 0;

  for (const e of expenses) {
    const paidBy = (e.paid_by ?? [])[0];
    const splits = e.expense_split ?? [];
    if (paidBy?.user_id === me) {
      for (const s of splits) {
        if (s.user_id === me) continue;
        claims = round2(claims + (Number(s.amount_owed) || 0));
        pendingSettls += 1;
      }
    } else {
      const mySplit = splits.find((s: any) => s.user_id === me);
      if (mySplit) debts = round2(debts + (Number(mySplit.amount_owed) || 0));
    }
  }
  for (const s of settlements) {
    const amt = Number(s.amount) || 0;
    if (s.payee_id === me) received = round2(received + amt);
    else sent = round2(sent + amt);
  }

  const stats = {
    totalBalance: round2((claims - received) - (debts - sent)),
    youOwe: Math.max(0, round2(debts - sent)),
    owedToYou: Math.max(0, round2(claims - received)),
    pendingSettls,
  };

  // ---- weekly spending ----
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  const dayTotals = new Array(7).fill(0);
  for (const e of expenses) {
    const d = new Date(e.created_at);
    const dayDiff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (dayDiff < 0 || dayDiff > 6) continue;
    const paidBy = (e.paid_by ?? [])[0];
    const splits = e.expense_split ?? [];
    const mySplit = splits.find((s: any) => s.user_id === me);
    let myAmount = 0;
    if (mySplit) myAmount = Number(mySplit.amount_owed) || 0;
    else if (paidBy?.user_id === me) myAmount = Number(e.value_amout) || 0;
    dayTotals[dayDiff] = round2(dayTotals[dayDiff] + myAmount);
  }
  const weeklySpending = WEEKDAYS.map((name, i) => ({ name, amount: dayTotals[i] }));

  // ---- category spending (this month) ----
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const catTotals = new Map<string, number>();
  for (const e of expenses) {
    if (new Date(e.created_at) < monthStart) continue;
    const cat = e.category || "Other";
    catTotals.set(cat, round2((catTotals.get(cat) ?? 0) + (Number(e.value_amout) || 0)));
  }
  const categorySpending = [...catTotals.entries()].map(([name, value]) => ({ name, value }));

  // ---- monthly overview (last 6 months) ----
  const months: { name: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    months.push({ name: MONTHS[start.getMonth()], start, end });
  }
  const monthlyOverview = months.map((m) => {
    let total = 0;
    let settled = 0;
    for (const e of expenses) {
      const d = new Date(e.created_at);
      if (d >= m.start && d < m.end) total = round2(total + (Number(e.value_amout) || 0));
    }
    for (const s of settlements) {
      const d = new Date(s.created_at);
      if (s.payee_id === me && d >= m.start && d < m.end) settled = round2(settled + (Number(s.amount) || 0));
    }
    return { name: m.name, total, settled };
  });

  // ---- recent activity ----
  const recentActivity = log.map((a: any) => {
    const actor = a.actor
      ? a.actor.full_name || a.actor.username || (a.actor.email ? a.actor.email.split("@")[0] : "User")
      : "User";
    const p = a.payload ?? {};
    let description = "";
    let kind = "owed";
    switch (a.event_type) {
      case "expense_added":
        description = `added expense: ${p.description ?? "Expense"} — €${Number(p.amount ?? 0).toFixed(2)}`;
        kind = a.actor_id === me ? "paid" : "owed";
        break;
      case "settlement":
        description = p.payee_id === me
          ? `settled up with ${p.payer_name ?? "someone"}`
          : `settled up with ${p.payee_name ?? "someone"}`;
        kind = p.payee_id === me ? "paid" : "settled";
        break;
      case "group_created":
        description = "created a group";
        break;
      case "group_renamed":
        description = `renamed a group to "${p.new ?? ""}"`;
        break;
      case "member_joined":
        description = "joined a group";
        break;
      case "member_removed":
        description = "left a group";
        break;
      default:
        description = a.event_type;
    }
    return { name: actor, description, time: a.created_at, kind };
  });

  return new Response(
    JSON.stringify({ stats, weeklySpending, categorySpending, monthlyOverview, recentActivity })
  );
};
