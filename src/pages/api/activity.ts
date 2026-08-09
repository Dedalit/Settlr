export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId, getUsersByIds } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { data } = await supabase
    .from("activity_log")
    .select(`
      id,
      created_at,
      group_id,
      actor_id,
      event_type,
      payload,
      actor:users ( full_name, username, email ),
      groups ( group_name )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const activities = (data ?? []).map((a: any) => {
    const actor = a.actor
      ? a.actor.full_name || a.actor.username || (a.actor.email ? a.actor.email.split("@")[0] : "User")
      : "User";
    const group = a.groups?.group_name ?? null;
    const p = a.payload ?? {};

    let action = "";
    let amount: number | null = null;

    switch (a.event_type) {
      case "expense_added":
        action = `added expense: ${p.description ?? "Expense"} — €${Number(p.amount ?? 0).toFixed(2)}`;
        amount = p.amount != null ? Number(p.amount) : null;
        break;
      case "settlement":
        action = p.payee_id === a.actor_id
          ? `settled up with ${p.payer_name ?? "someone"}`
          : `settled up with ${p.payee_name ?? "someone"}`;
        amount = p.amount != null ? Number(p.amount) : null;
        break;
      case "member_joined":
        action = "joined the group";
        break;
      case "member_removed":
        action = "left the group";
        break;
      case "group_created":
        action = "created the group";
        break;
      case "group_renamed":
        action = `renamed the group from "${p.old ?? ""}" to "${p.new ?? ""}"`;
        break;
      default:
        action = a.event_type;
    }

    return {
      id: String(a.id),
      type: a.event_type,
      group,
      actor,
      action,
      amount,
      time: a.created_at,
    };
  });

  // Merge in the current user's notifications (friend requests, group invites, ...)
  const { data: notifRows } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", me)
    .order("created_at", { ascending: false })
    .limit(50);

  let notificationItems: any[] = [];
  if (notifRows && notifRows.length > 0) {
    const actorIds = [...new Set(notifRows.map((n) => n.actor_id))];
    const users = await getUsersByIds(supabase, actorIds);

    notificationItems = notifRows.map((n) => {
      const actor = users.get(n.actor_id)?.name ?? "User";
      const p = n.payload ?? {};
      let action = "";
      let group: string | null = null;

      switch (n.type) {
        case "friend_request":
          action = "sent you a friend request";
          break;
        case "friend_request_accepted":
          action = "accepted your friend request";
          break;
        case "group_invite":
          action = `invited you to join ${p.group_name ?? "a group"}`;
          group = p.group_name ?? null;
          break;
        case "group_invite_accepted":
          action = `accepted your invite to join ${p.group_name ?? "a group"}`;
          group = p.group_name ?? null;
          break;
        default:
          action = n.type;
      }

      return {
        id: `n-${n.id}`,
        type: n.type,
        group,
        actor,
        action,
        amount: null,
        time: n.created_at,
      };
    });
  }

  const all = [...activities, ...notificationItems].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return new Response(JSON.stringify({ activities: all }));
};
