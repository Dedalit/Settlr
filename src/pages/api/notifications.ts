export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUsersByIds } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { data: rows, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", me)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  const actorIds = [...new Set((rows ?? []).map((n) => n.actor_id))];
  const names = await getUsersByIds(supabase, actorIds);

  const notifications = (rows ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    actor: names.get(n.actor_id)?.name ?? "User",
    actor_id: n.actor_id,
    payload: n.payload ?? {},
    read: n.read,
    created_at: n.created_at,
  }));

  const unread = (rows ?? []).filter((n) => !n.read).length;

  return new Response(JSON.stringify({ unread, notifications }));
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", me)
    .eq("read", false);

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
};
