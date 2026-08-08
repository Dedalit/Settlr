export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/database";

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

  const target = Number(body?.userId);
  if (!Number.isFinite(target) || target === me) {
    return new Response(JSON.stringify({ success: false, message: "Invalid user" }), { status: 400 });
  }

  const { data: targetUser } = await supabase.from("users").select("id").eq("id", target).single();
  if (!targetUser) {
    return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
  }

  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id_1.eq.${me},user_id_2.eq.${target}),and(user_id_1.eq.${target},user_id_2.eq.${me})`)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ success: false, message: "A request already exists with this user" }), { status: 400 });
  }

  const { data: friendship, error } = await supabase
    .from("friendships")
    .insert({ user_id_1: me, user_id_2: target, status: "pending" })
    .select("id")
    .single();

  if (error || !friendship) {
    return new Response(JSON.stringify({ success: false, message: error?.message || "Could not send the request" }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, friendshipId: friendship.id }));
};
