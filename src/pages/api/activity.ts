export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/database";

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

  return new Response(JSON.stringify({ activities }));
};
