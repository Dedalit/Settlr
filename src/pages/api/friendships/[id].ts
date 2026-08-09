export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/database";

async function resolveFriendship(supabase: any, me: number, rawId: string) {
  const numeric = Number(rawId);
  if (Number.isFinite(numeric)) {
    const { data: byId } = await supabase
      .from("friendships")
      .select("id, user_id_1, user_id_2, status")
      .eq("id", numeric)
      .maybeSingle();
    if (byId) return byId;
    // The id may be the OTHER user's id (friend delete flow)
    const { data: byUser } = await supabase
      .from("friendships")
      .select("id, user_id_1, user_id_2, status")
      .or(`and(user_id_1.eq.${me},user_id_2.eq.${numeric}),and(user_id_1.eq.${numeric},user_id_2.eq.${me})`)
      .maybeSingle();
    if (byUser) return byUser;
  }
  return null;
}

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const friendship = await resolveFriendship(supabase, me, params.id ?? "");
  if (!friendship || friendship.user_id_2 !== me || friendship.status !== "pending") {
    return new Response(JSON.stringify({ success: false, message: "Request not found" }), { status: 404 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  if (body?.action === "accept") {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendship.id);
    if (error) return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    await supabase.rpc("create_notification", {
      recipient_id: friendship.user_id_1,
      actor_id: me,
      notif_type: "friend_request_accepted",
      notif_payload: {},
    });
    return new Response(JSON.stringify({ success: true }));
  }

  if (body?.action === "reject") {
    const { error } = await supabase.from("friendships").delete().eq("id", friendship.id);
    if (error) return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(JSON.stringify({ success: false, message: "Invalid action" }), { status: 400 });
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const friendship = await resolveFriendship(supabase, me, params.id ?? "");
  if (!friendship || (friendship.user_id_1 !== me && friendship.user_id_2 !== me)) {
    return new Response(JSON.stringify({ success: false, message: "Friendship not found" }), { status: 404 });
  }

  const { error } = await supabase.from("friendships").delete().eq("id", friendship.id);
  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
};
