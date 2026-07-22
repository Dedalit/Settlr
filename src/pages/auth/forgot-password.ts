export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, url }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    return new Response(JSON.stringify({ success: false, message: "Inserisci un indirizzo email valido." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient({ request, cookies });
  
  // Genera l'URL di rimando dopo il click sull'email (puoi creare una pagina /auth/update-password se vuoi)
  const redirectTo = `${url.origin}/auth/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, message: "Controlla la tua casella email per il link di recupero." }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};