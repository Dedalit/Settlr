// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { createClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response(JSON.stringify({ success: false, message: "Email and password are required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient({ request, cookies });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });

  return new Response(JSON.stringify({ success: true, message: "Signed in successfully" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};