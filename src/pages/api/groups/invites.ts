export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUsersByIds } from "@/lib/database";

// Pending group invites for the current user
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { data, error } = await supabase
    .from("group_invites")
    .select("*")
    .eq("invitee_id", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  const groupIds = [...new Set((data ?? []).map((i) => i.group_id))];
  const inviterIds = [...new Set((data ?? []).map((i) => i.inviter_id))];

  let groupNames = new Map<number, string>();
  if (groupIds.length > 0) {
    const { data: g } = await supabase.from("groups").select("id, group_name").in("id", groupIds);
    for (const row of g ?? []) groupNames.set(row.id, row.group_name);
  }

  const users = await getUsersByIds(supabase, inviterIds);

  const invites = (data ?? []).map((i) => ({
    id: i.id,
    group_id: i.group_id,
    group_name: groupNames.get(i.group_id) ?? "",
    inviter_id: i.inviter_id,
    inviter_name: users.get(i.inviter_id)?.name ?? "User",
    created_at: i.created_at,
  }));

  return new Response(JSON.stringify({ invites }));
};
