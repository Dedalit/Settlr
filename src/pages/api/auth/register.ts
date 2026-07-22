export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const phone = formData.get("phone")?.toString();
  const username = formData.get("username")?.toString();

  if (!email || !password || !firstName || !lastName) {
    return new Response(JSON.stringify({ success: false, message: "Tutti i campi obbligatori devono essere compilati." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient({ request, cookies });
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        username: username || "",
        phone: phone || "",
      },
    },
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, message: "Controlla la tua email per confermare l'account." }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};