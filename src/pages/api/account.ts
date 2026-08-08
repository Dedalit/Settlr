export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return new Response(JSON.stringify({ success: false, message: "Name is required" }), { status: 400 });
  }

  const { error: userUpdate } = await supabase.from("users").update({ full_name: name }).eq("auth_id", user.id);

  if (userUpdate) {
    return new Response(JSON.stringify({ success: false, message: userUpdate.message }), { status: 500 });
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      first_name: name.split(" ")[0] ?? "",
      last_name: name.split(" ").slice(1).join(" ").trim(),
    },
  });

  if (metaError) {
    return new Response(JSON.stringify({ success: false, message: metaError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
};
