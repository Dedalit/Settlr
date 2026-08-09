export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies, url }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return new Response(JSON.stringify({ users: [] }));

  const like = `%${q}%`;
  const { data } = await supabase
    .from("users")
    .select("id, full_name, username, email, avatar_url")
    .neq("id", me)
    .or(`full_name.ilike.${like},username.ilike.${like},email.ilike.${like}`)
    .limit(10);

  let excluded = new Set<number>();
  let requestSent = new Set<number>();
  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id_1, user_id_2, status")
    .or(`user_id_1.eq.${me},user_id_2.eq.${me}`);

  for (const f of friendships ?? []) {
    const other = f.user_id_1 === me ? f.user_id_2 : f.user_id_1;
    if (f.status === "accepted") {
      excluded.add(other);
    } else if (f.status === "pending") {
      if (f.user_id_1 === me) requestSent.add(other);
      else excluded.add(other);
    }
  }

  const users = (data ?? [])
    .filter((u) => !excluded.has(u.id))
    .map((u) => ({
      id: u.id,
      name: u.full_name || u.username || (u.email ? u.email.split("@")[0] : "User"),
      username: u.username,
      avatar: u.avatar_url,
      email: u.email,
      requestSent: requestSent.has(u.id),
    }));

  return new Response(JSON.stringify({ users }));
};
