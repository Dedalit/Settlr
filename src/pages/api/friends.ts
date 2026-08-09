export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUserGroupIds } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, user_id_1, user_id_2, status")
    .or(`user_id_1.eq.${me},user_id_2.eq.${me}`);

  const accepted = (friendships ?? []).filter((f) => f.status === "accepted");
  const pendingIncoming = (friendships ?? []).filter((f) => f.status === "pending" && f.user_id_2 === me);

  const friendIds = accepted.map((f) => (f.user_id_1 === me ? f.user_id_2 : f.user_id_1));
  const requestorIds = pendingIncoming.map((f) => f.user_id_1);

  const allIds = [...new Set([...friendIds, ...requestorIds])];
  const users: Record<number, any> = {};
  if (allIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, username, email, avatar_url")
      .in("id", allIds);
    for (const u of data ?? []) {
      users[u.id] = {
        id: u.id,
        name: u.full_name || u.username || (u.email ? u.email.split("@")[0] : "User"),
        username: u.username,
        avatar: u.avatar_url,
        email: u.email,
      };
    }
  }

  // Load my groups + expenses + settlements for balance math
  const groupIds = await getUserGroupIds(supabase, me);
  let expenses: any[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("expenses")
      .select("group_id, created_at, paid_by ( user_id, tot_paid ), expense_split ( user_id, amount_owed )")
      .in("group_id", groupIds);
    expenses = data ?? [];
  }

  const { data: allSettlements } = await supabase
    .from("settlements")
    .select("id, created_at, payer_id, payee_id, amount")
    .or(`payer_id.eq.${me},payee_id.eq.${me}`);

  const settlements = allSettlements ?? [];

  const friends = friendIds.map((fid) => {
    const involvedExpenses = expenses.filter((e) => {
      const paid = (e.paid_by ?? []).map((p: any) => p.user_id);
      const split = (e.expense_split ?? []).map((s: any) => s.user_id);
      return paid.includes(fid) || split.includes(fid);
    });

    let friendOwesMe = 0;
    let iOweFriend = 0;
    let lastActive: string | null = null;
    for (const e of involvedExpenses) {
      const paidBy = (e.paid_by ?? [])[0];
      const splits = e.expense_split ?? [];
      if (paidBy?.user_id === me) {
        const theirShare = splits.find((s: any) => s.user_id === fid);
        if (theirShare) friendOwesMe += Number(theirShare.amount_owed) || 0;
      } else if (paidBy?.user_id === fid) {
        const myShare = splits.find((s: any) => s.user_id === me);
        if (myShare) iOweFriend += Number(myShare.amount_owed) || 0;
      }
      if (!lastActive || new Date(e.created_at) > new Date(lastActive)) lastActive = e.created_at;
    }

    const between = settlements.filter((s) => (s.payer_id === me && s.payee_id === fid) || (s.payer_id === fid && s.payee_id === me));
    let received = 0;
    let sent = 0;
    for (const s of between) {
      if (s.payee_id === me) received += Number(s.amount) || 0;
      if (s.payer_id === me) sent += Number(s.amount) || 0;
      if (!lastActive || new Date(s.created_at) > new Date(lastActive)) lastActive = s.created_at;
    }

    const balance = Math.round((friendOwesMe - iOweFriend - received + sent) * 100) / 100;

    return {
      id: fid,
      ...users[fid],
      balance,
      settls: between.length,
      lastActive,
    };
  });

  const requests = pendingIncoming.map((f) => {
    const u = users[f.user_id_1];
    return {
      friendship_id: f.id,
      id: f.user_id_1,
      name: u?.name ?? "User",
      username: u?.username ?? null,
      avatar: u?.avatar ?? null,
      email: u?.email ?? null,
    };
  });

  return new Response(JSON.stringify({ friends, requests }));
};
