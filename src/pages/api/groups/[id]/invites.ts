export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, isGroupMember, getUsersByIds } from "@/lib/database";

// Pending invites for a specific group (used by the invite modal to exclude already-invited users)
export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupId = Number(params.id);
  if (!Number.isFinite(groupId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid group" }), { status: 400 });
  }
  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "You are not a member of this group" }), { status: 403 });
  }

  const { data, error } = await supabase
    .from("group_invites")
    .select("id, invitee_id, created_at")
    .eq("group_id", groupId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  const users = await getUsersByIds(supabase, (data ?? []).map((i) => i.invitee_id));

  const invites = (data ?? []).map((i) => ({
    id: i.id,
    invitee_id: i.invitee_id,
    invitee_name: users.get(i.invitee_id)?.name ?? "User",
    created_at: i.created_at,
  }));

  return new Response(JSON.stringify({ invites }));
};

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupId = Number(params.id);
  if (!Number.isFinite(groupId)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid group" }), { status: 400 });
  }
  if (!(await isGroupMember(supabase, groupId, me))) {
    return new Response(JSON.stringify({ success: false, message: "You are not a member of this group" }), { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const inviteeId = Number(body?.userId);
  if (!Number.isFinite(inviteeId) || inviteeId === me) {
    return new Response(JSON.stringify({ success: false, message: "Invalid user" }), { status: 400 });
  }

  const { data: target } = await supabase.from("users").select("id").eq("id", inviteeId).single();
  if (!target) {
    return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
  }

  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id_1.eq.${me},user_id_2.eq.${inviteeId}),and(user_id_1.eq.${inviteeId},user_id_2.eq.${me})`)
    .eq("status", "accepted")
    .maybeSingle();
  if (!friendship) {
    return new Response(JSON.stringify({ success: false, message: "You can only invite your friends" }), { status: 400 });
  }

  const { data: existingMember } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", inviteeId)
    .maybeSingle();
  if (existingMember) {
    return new Response(JSON.stringify({ success: false, message: "This user is already in the group" }), { status: 400 });
  }

  const { data: existingInvite } = await supabase
    .from("group_invites")
    .select("id")
    .eq("group_id", groupId)
    .eq("invitee_id", inviteeId)
    .eq("status", "pending")
    .maybeSingle();
  if (existingInvite) {
    return new Response(JSON.stringify({ success: false, message: "An invite is already pending for this user" }), { status: 400 });
  }

  const { data: groupRow } = await supabase.from("groups").select("group_name").eq("id", groupId).single();

  const { data: invite, error } = await supabase
    .from("group_invites")
    .insert({ group_id: groupId, inviter_id: me, invitee_id: inviteeId, status: "pending" })
    .select("id")
    .single();

  if (error || !invite) {
    return new Response(JSON.stringify({ success: false, message: error?.message || "Could not send the invite" }), { status: 500 });
  }

  await supabase.rpc("create_notification", {
    recipient_id: inviteeId,
    actor_id: me,
    notif_type: "group_invite",
    notif_payload: { group_id: groupId, group_name: groupRow?.group_name ?? "" },
  });

  return new Response(JSON.stringify({ success: true, inviteId: invite.id }));
};
