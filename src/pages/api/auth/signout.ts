export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "../../../lib/supabase";

async function handleSignOut({ request, cookies, redirect }: Parameters<APIRoute>[0]) {
  const supabase = createClient({ request, cookies });

  await supabase.auth.signOut();

  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  return redirect("/auth/signin");
}

export const GET: APIRoute = handleSignOut;
export const POST: APIRoute = handleSignOut;