export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import {
  getCurrentUserId,
  isGroupMember,
  getGroupMemberIds,
  findDirectGroup,
  getUserName,
  logActivity,
} from "@/lib/database";

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const amount = Number(body?.amount);
  const paidByUserId = Number(body?.paidByUserId);
  const splitsRaw = Array.isArray(body?.splits) ? body.splits : [];

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    return new Response(JSON.stringify({ success: false, message: "A title and a positive amount are required" }), { status: 400 });
  }
  if (!Number.isFinite(paidByUserId)) {
    return new Response(JSON.stringify({ success: false, message: "Missing payer" }), { status: 400 });
  }

  const splits = splitsRaw
    .map((s: any) => ({ userId: Number(s?.userId), amount: Number(s?.amount) }))
    .filter((s: { userId: number; amount: number }) => Number.isFinite(s.userId) && Number.isFinite(s.amount) && s.userId > 0);

  const splitSum = Math.round(splits.reduce((acc: number, s: { amount: number }) => acc + s.amount, 0) * 100) / 100;
  if (splits.length === 0) {
    return new Response(JSON.stringify({ success: false, message: "Select at least one person to split with" }), { status: 400 });
  }
  if (Math.abs(splitSum - Math.round(amount * 100) / 100) > 0.01) {
    return new Response(JSON.stringify({ success: false, message: "Split amounts must add up to the total" }), { status: 400 });
  }

  let groupId = Number(body?.groupId);
  if (body?.friendId) {
    const friendId = Number(body.friendId);
    if (!Number.isFinite(friendId)) {
      return new Response(JSON.stringify({ success: false, message: "Invalid friend" }), { status: 400 });
    }
    if (!Number.isFinite(groupId)) {
      groupId = await findDirectGroup(supabase, me, friendId);
      if (!groupId) {
        const { data: friendRow } = await supabase.from("users").select("full_name, username, email").eq("id", friendId).single();
        const friendName = friendRow
          ? friendRow.full_name || friendRow.username || (friendRow.email ? friendRow.email.split("@")[0] : "Friend")
          : "Friend";
        const myName = await getUserName(supabase, me);
        const { data: newGroup } = await supabase
          .from("groups")
          .insert({ group_name: `${friendName} & ${myName}`, type: "other", created_by: me })
          .select("id")
          .single();
        if (!newGroup) {
          return new Response(JSON.stringify({ success: false, message: "Could not create group" }), { status: 500 });
        }
        groupId = newGroup.id;
        await supabase.from("group_members").insert([{ user_id: me, group_id: groupId }, { user_id: friendId, group_id: groupId }]);
        await logActivity(supabase, me, "group_created", groupId, {});
      }
    }
  }

  if (!Number.isFinite(groupId) || groupId <= 0) {
    return new Response(JSON.stringify({ success: false, message: "Missing group" }), { status: 400 });
  }
  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "You are not a member of this group" }), { status: 403 });
  }

  const memberIds = await getGroupMemberIds(supabase, groupId);
  if (!memberIds.includes(paidByUserId)) {
    return new Response(JSON.stringify({ success: false, message: "The payer must be a group member" }), { status: 400 });
  }
  for (const s of splits) {
    if (!memberIds.includes(s.userId)) {
      return new Response(JSON.stringify({ success: false, message: "Every participant must be a group member" }), { status: 400 });
    }
  }

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      created_by: me,
      description,
      value_amout: amount,
      category: typeof body?.category === "string" && body.category ? body.category : null,
      img_url: typeof body?.imgUrl === "string" && body.imgUrl ? body.imgUrl : null,
    })
    .select("id")
    .single();

  if (expenseError || !expense) {
    return new Response(JSON.stringify({ success: false, message: expenseError?.message || "Could not create expense" }), { status: 500 });
  }

  const expenseId = expense.id;

  const { error: paidError } = await supabase.from("paid_by").insert({
    expense_id: expenseId,
    user_id: paidByUserId,
    group_id: groupId,
    tot_paid: amount,
  });
  if (paidError) {
    return new Response(JSON.stringify({ success: false, message: paidError.message }), { status: 500 });
  }

  const { error: splitError } = await supabase.from("expense_split").insert(
    splits.map((s: { userId: number; amount: number }) => ({
      expense_id: expenseId,
      user_id: s.userId,
      amount_owed: s.amount,
    }))
  );
  if (splitError) {
    return new Response(JSON.stringify({ success: false, message: splitError.message }), { status: 500 });
  }

  await logActivity(supabase, me, "expense_added", groupId, { description, amount });

  return new Response(JSON.stringify({ success: true, expenseId }));
};
