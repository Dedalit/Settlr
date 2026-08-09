export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUserGroupIds } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupIds = await getUserGroupIds(supabase, me);
  let groupNames = new Map<number, string>();
  let expenses: any[] = [];
  if (groupIds.length > 0) {
    const { data: g } = await supabase.from("groups").select("id, group_name").in("id", groupIds);
    for (const row of g ?? []) groupNames.set(row.id, row.group_name);

    const { data: ex } = await supabase
      .from("expenses")
      .select("id, group_id, description, value_amout, created_at, paid_by ( user_id, tot_paid ), expense_split ( user_id, amount_owed )")
      .in("group_id", groupIds);
    expenses = ex ?? [];
  }

  const { data: allSettlements } = await supabase
    .from("settlements")
    .select("id, created_at, group_id, payer_id, payee_id, amount")
    .or(`payer_id.eq.${me},payee_id.eq.${me}`);

  const settlements = allSettlements ?? [];

  // collect names
  const involvedIds = new Set<number>([me]);
  for (const e of expenses) {
    for (const p of e.paid_by ?? []) involvedIds.add(p.user_id);
    for (const s of e.expense_split ?? []) involvedIds.add(s.user_id);
  }
  for (const s of settlements) {
    involvedIds.add(s.payer_id);
    involvedIds.add(s.payee_id);
  }
  const names = new Map<number, string>();
  const { data: userRows } = await supabase
    .from("users")
    .select("id, full_name, username, email")
    .in("id", [...involvedIds]);
  for (const u of userRows ?? []) {
    names.set(u.id, u.full_name || u.username || (u.email ? u.email.split("@")[0] : "User"));
  }

  const transactions: any[] = [];
  let claims = 0;
  let debts = 0;
  let received = 0;
  let sent = 0;

  for (const e of expenses) {
    const paidBy = (e.paid_by ?? [])[0];
    const splits = e.expense_split ?? [];
    const group = groupNames.get(e.group_id) ?? "";
    const amount = Number(e.value_amout) || 0;

    if (paidBy?.user_id === me) {
      for (const s of splits) {
        if (s.user_id === me) continue;
        const share = Number(s.amount_owed) || 0;
        claims = Math.round((claims + share) * 100) / 100;
        transactions.push({
          id: `e-${e.id}-${s.user_id}`,
          type: "owed-to-you",
          friend: names.get(s.user_id) ?? "User",
          group,
          description: `${e.description} — your payment`,
          amount: share,
          status: "pending",
          date: e.created_at,
        });
      }
    } else if (paidBy) {
      const mySplit = splits.find((s: any) => s.user_id === me);
      if (mySplit) {
        const share = Number(mySplit.amount_owed) || 0;
        debts = Math.round((debts + share) * 100) / 100;
        transactions.push({
          id: `e-${e.id}-me`,
          type: "you-owe",
          friend: names.get(paidBy.user_id) ?? "User",
          group,
          description: `${e.description} — your share`,
          amount: share,
          status: "pending",
          date: e.created_at,
        });
      }
    }
    void amount;
  }

  for (const s of settlements) {
    const amt = Number(s.amount) || 0;
    const friend = s.payee_id === me ? names.get(s.payer_id) ?? "User" : names.get(s.payee_id) ?? "User";
    const description =
      s.payee_id === me
        ? `${friend} settled up with you`
        : `You settled up with ${friend}`;
    if (s.payee_id === me) received = Math.round((received + amt) * 100) / 100;
    else sent = Math.round((sent + amt) * 100) / 100;
    transactions.push({
      id: `s-${s.id}`,
      type: "settled",
      friend,
      group: s.group_id ? groupNames.get(s.group_id) ?? "" : "",
      description,
      amount: amt,
      status: "settled",
      date: s.created_at,
    });
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const limited = transactions.slice(0, 50);

  const owedToYou = Math.max(0, Math.round((claims - received) * 100) / 100);
  const youOwe = Math.max(0, Math.round((debts - sent) * 100) / 100);

  return new Response(
    JSON.stringify({
      owedToYou,
      youOwe,
      netBalance: Math.round(((claims - received) - (debts - sent)) * 100) / 100,
      transactions: limited,
    })
  );
};
