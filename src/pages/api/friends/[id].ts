export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUserGroupIds } from "@/lib/database";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const friendId = Number(params.id);
  if (!Number.isFinite(friendId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid friend" }), { status: 400 });
  }

  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id_1.eq.${me},user_id_2.eq.${friendId}),and(user_id_1.eq.${friendId},user_id_2.eq.${me})`)
    .eq("status", "accepted")
    .maybeSingle();

  if (!friendship) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const { data: friendRow } = await supabase
    .from("users")
    .select("id, full_name, username, email, avatar_url")
    .eq("id", friendId)
    .single();
  if (!friendRow) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const friend = {
    id: friendRow.id,
    name: friendRow.full_name || friendRow.username || (friendRow.email ? friendRow.email.split("@")[0] : "User"),
    avatar: friendRow.avatar_url,
    email: friendRow.email,
    balance: 0,
  };

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
    .select("id, created_at, group_id, payer_id, payee_id, amount, note")
    .or(`payer_id.eq.${me},payee_id.eq.${me}`);

  const between = (allSettlements ?? []).filter(
    (s) => (s.payer_id === me && s.payee_id === friendId) || (s.payer_id === friendId && s.payee_id === me)
  );

  const involvedExpenses = expenses.filter((e) => {
    const paid = (e.paid_by ?? []).map((p: any) => p.user_id);
    const split = (e.expense_split ?? []).map((s: any) => s.user_id);
    return paid.includes(friendId) || split.includes(friendId);
  });

  let friendOwesMe = 0;
  let iOweFriend = 0;
  const transactions: any[] = [];

  for (const e of involvedExpenses) {
    const paidBy = (e.paid_by ?? [])[0];
    const splits = e.expense_split ?? [];
    const amount = Number(e.value_amout) || 0;
    const group = groupNames.get(e.group_id) ?? "";

    if (paidBy?.user_id === me) {
      const theirShare = splits.find((s: any) => s.user_id === friendId);
      const share = theirShare ? Number(theirShare.amount_owed) || 0 : 0;
      friendOwesMe += share;
      transactions.push({
        id: `e-${e.id}`,
        kind: "expense",
        group,
        description: `${e.description} — split with ${friend.name}`,
        amount: share,
        date: e.created_at,
        direction: "you-paid",
      });
    } else if (paidBy?.user_id === friendId) {
      const myShare = splits.find((s: any) => s.user_id === me);
      const share = myShare ? Number(myShare.amount_owed) || 0 : 0;
      iOweFriend += share;
      transactions.push({
        id: `e-${e.id}`,
        kind: "expense",
        group,
        description: `${e.description} — your share`,
        amount: share,
        date: e.created_at,
        direction: "you-owe",
      });
    }
  }

  let received = 0;
  let sent = 0;
  for (const s of between) {
    const amt = Number(s.amount) || 0;
    if (s.payee_id === me) received += amt;
    if (s.payer_id === me) sent += amt;
    transactions.push({
      id: `s-${s.id}`,
      kind: "settlement",
      group: s.group_id ? groupNames.get(s.group_id) ?? "" : "",
      description: s.payee_id === me ? `${friend.name} settled up with you` : `You settled up with ${friend.name}`,
      amount: amt,
      date: s.created_at,
      direction: "settled",
    });
  }

  friend.balance = Math.round((friendOwesMe - iOweFriend - received + sent) * 100) / 100;

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return new Response(JSON.stringify({ friend, transactions }));
};
