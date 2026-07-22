export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  const password = body.password;

  if (!password) {
    return new Response(JSON.stringify({ success: false, message: "La password è obbligatoria." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient({ request, cookies });
  
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, message: "Password aggiornata con successo." }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};