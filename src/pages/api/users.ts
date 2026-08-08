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

  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id_1, user_id_2")
    .or(`user_id_1.eq.${me},user_id_2.eq.${me}`);

  const excluded = new Set<number>();
  for (const f of friendships ?? []) {
    if (f.user_id_1 === me) excluded.add(f.user_id_2);
    if (f.user_id_2 === me) excluded.add(f.user_id_1);
  }

  const users = (data ?? [])
    .filter((u) => !excluded.has(u.id))
    .map((u) => ({
      id: u.id,
      name: u.full_name || u.username || (u.email ? u.email.split("@")[0] : "User"),
      avatar: u.avatar_url,
      email: u.email,
    }));

  return new Response(JSON.stringify({ users }));
};
