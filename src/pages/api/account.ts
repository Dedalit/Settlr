export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, username, email, phone, avatar_url")
    .eq("id", me)
    .single();

  if (!user) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), { status: 404 });
  }

  const { data: { user: authUser } } = await supabase.auth.getUser();

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email || authUser?.email || "",
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
    })
  );
};

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
      full_name: name,
    },
  });

  if (metaError) {
    return new Response(JSON.stringify({ success: false, message: metaError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
};
