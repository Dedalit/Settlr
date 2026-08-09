export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, logActivity } from "@/lib/database";

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const inviteId = Number(params.id);
  if (!Number.isFinite(inviteId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid invite" }), { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const { data: invite } = await supabase
    .from("group_invites")
    .select("id, group_id, inviter_id, invitee_id, status")
    .eq("id", inviteId)
    .single();

  if (!invite || invite.status !== "pending" || invite.invitee_id !== me) {
    return new Response(JSON.stringify({ success: false, message: "Invite not found" }), { status: 404 });
  }

  if (body?.action === "accept") {
    const { data: groupRow } = await supabase.from("groups").select("group_name").eq("id", invite.group_id).single();

    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ user_id: me, group_id: invite.group_id });
    if (memberError) {
      return new Response(JSON.stringify({ success: false, message: memberError.message }), { status: 500 });
    }

    await supabase.from("group_invites").update({ status: "accepted" }).eq("id", inviteId);
    await logActivity(supabase, me, "member_joined", invite.group_id, {});
    await supabase.rpc("create_notification", {
      recipient_id: invite.inviter_id,
      actor_id: me,
      notif_type: "group_invite_accepted",
      notif_payload: { group_id: invite.group_id, group_name: groupRow?.group_name ?? "" },
    });

    return new Response(JSON.stringify({ success: true }));
  }

  if (body?.action === "decline") {
    const { error } = await supabase.from("group_invites").update({ status: "declined" }).eq("id", inviteId);
    if (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(JSON.stringify({ success: false, message: "Invalid action" }), { status: 400 });
};
