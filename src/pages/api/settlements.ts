export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, isGroupMember, computePairwiseBalance, getUserName, logActivity } from "@/lib/database";

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

  const otherId = Number(body?.payeeId);
  const amount = Number(body?.amount);
  const groupId = body?.groupId ? Number(body.groupId) : null;

  if (!Number.isFinite(otherId) || otherId === me) {
    return new Response(JSON.stringify({ success: false, message: "Invalid recipient" }), { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return new Response(JSON.stringify({ success: false, message: "A positive amount is required" }), { status: 400 });
  }
  if (groupId !== null && (!Number.isFinite(groupId) || !(await isGroupMember(supabase, groupId, me)))) {
    return new Response(JSON.stringify({ success: false, message: "You are not a member of this group" }), { status: 403 });
  }

  const pairwise = await computePairwiseBalance(supabase, me, otherId, groupId);
  if (Math.abs(pairwise) < 0.01) {
    return new Response(JSON.stringify({ success: false, message: "You're already settled up with this person." }), { status: 400 });
  }

  const amountToSettle = Math.min(amount, Math.abs(pairwise));
  // positive pairwise => the other person owes me, so they pay me
  const payerId = pairwise > 0 ? otherId : me;
  const payeeId = pairwise > 0 ? me : otherId;

  const { data: settlement, error } = await supabase
    .from("settlements")
    .insert({
      group_id: groupId,
      payer_id: payerId,
      payee_id: payeeId,
      amount: amountToSettle,
      note: typeof body?.note === "string" && body.note ? body.note : null,
    })
    .select("id")
    .single();

  if (error || !settlement) {
    return new Response(JSON.stringify({ success: false, message: error?.message || "Could not create settlement" }), { status: 500 });
  }

  const myName = await getUserName(supabase, me);
  const otherName = await getUserName(supabase, otherId);
  await logActivity(supabase, me, "settlement", groupId, {
    amount: amountToSettle,
    payer_id: payerId,
    payee_id: payeeId,
    payer_name: payerId === me ? myName : otherName,
    payee_name: payeeId === me ? myName : otherName,
  });

  return new Response(JSON.stringify({ success: true, settlementId: settlement.id }));
};
