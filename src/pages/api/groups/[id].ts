export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import {
  getCurrentUserId,
  isGroupMember,
  getGroupMemberIds,
  getUsersByIds,
  fetchGroupExpenses,
  fetchGroupSettlements,
  computeUserGroupBalance,
  computeGroupBalances,
  computePairwiseFromData,
  logActivity,
  getUserName,
} from "@/lib/database";

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupId = Number(params.id);
  if (!Number.isFinite(groupId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid group" }), { status: 400 });
  }

  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const { data: groupRow } = await supabase
    .from("groups")
    .select("id, group_name, image_url, type, created_at, created_by")
    .eq("id", groupId)
    .single();
  if (!groupRow) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const memberIds = await getGroupMemberIds(supabase, groupId);
  const users = await getUsersByIds(supabase, memberIds);
  const balances = await computeGroupBalances(supabase, groupId);

  const expenses = await fetchGroupExpenses(supabase, groupId);
  const settlementList = await fetchGroupSettlements(supabase, groupId);

  const members = memberIds.map((id) => {
    const u = users.get(id);
    return {
      id,
      name: u?.name ?? "User",
      avatar: u?.avatar ?? null,
      balance: balances.get(id) ?? 0,
      balanceWithYou: id === me ? 0 : computePairwiseFromData(expenses, settlementList, me, id),
    };
  });

  let totalSpent = 0;
  const expenseList = expenses.map((e) => {    const amount = Number(e.value_amout) || 0;
    totalSpent = Math.round((totalSpent + amount) * 100) / 100;
    const payer = (e.paid_by ?? [])[0];
    const payerUser = payer ? users.get(payer.user_id) : undefined;
    const splits = (e.expense_split ?? []).map((s) => ({
      user_id: s.user_id,
      name: users.get(s.user_id)?.name ?? "User",
      amount_owed: Number(s.amount_owed) || 0,
    }));
    const yourSplit = (e.expense_split ?? []).find((s) => s.user_id === me);
    const paidByYou = payer?.user_id === me;
    return {
      id: e.id,
      description: e.description,
      amount,
      category: e.category,
      img_url: e.img_url,
      created_at: e.created_at,
      paid_by: payer
        ? { id: payer.user_id, name: payerUser?.name ?? "User" }
        : { id: 0, name: "Unknown" },
      splits,
      yourShare: yourSplit ? Number(yourSplit.amount_owed) || 0 : paidByYou ? amount : 0,
      paidByYou,
    };
  });

  const settlements = settlementList.map((s) => ({
    id: s.id,
    created_at: s.created_at,
    payer: { id: s.payer_id, name: users.get(s.payer_id)?.name ?? "User" },
    payee: { id: s.payee_id, name: users.get(s.payee_id)?.name ?? "User" },
    amount: Number(s.amount) || 0,
    note: s.note,
  }));

  return new Response(
    JSON.stringify({
      group: {
        id: groupRow.id,
        name: groupRow.group_name,
        image_url: groupRow.image_url,
        type: groupRow.type,
        created_at: groupRow.created_at,
        created_by: groupRow.created_by,
        memberCount: memberIds.length,
        totalSpent,
        balance: balances.get(me) ?? 0,
      },
      members,
      expenses: expenseList,
      settlements,
    })
  );
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupId = Number(params.id);
  if (!Number.isFinite(groupId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid group" }), { status: 400 });
  }
  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return new Response(JSON.stringify({ success: false, message: "Group name is required" }), { status: 400 });
  }

  const { data: existing } = await supabase.from("groups").select("group_name").eq("id", groupId).single();
  if (!existing) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const { error } = await supabase.from("groups").update({ group_name: name }).eq("id", groupId);
  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  await logActivity(supabase, me, "group_renamed", groupId, { old: existing.group_name, new: name });

  return new Response(JSON.stringify({ success: true }));
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupId = Number(params.id);
  if (!Number.isFinite(groupId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid group" }), { status: 400 });
  }
  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const balance = await computeUserGroupBalance(supabase, me, groupId);
  if (Math.abs(balance) > 0.01) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `You still have an outstanding balance of €${Math.abs(balance).toFixed(2)} in this group. Settle up before you can leave.`,
      }),
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", me);
  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  const myName = await getUserName(supabase, me);
  await logActivity(supabase, me, "member_removed", groupId, { name: myName });

  return new Response(JSON.stringify({ success: true }));
};
