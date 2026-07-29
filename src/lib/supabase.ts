import { createServerClient } from "@supabase/ssr";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 1. Client per le pagine Astro (Server-side)
export function createClient({
    request,
    cookies,
}: {
    request: Request;
    cookies: AstroCookies;
}) {
    return createServerClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            cookies: {
                getAll() {
                    const cookieHeader = request.headers.get("Cookie") ?? "";
                    return cookieHeader.split(";").map(cookie => {
                        const [name, ...rest] = cookie.trim().split("=");
                        return { name, value: rest.join("=") };
                    }).filter(c => c.name);
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookies.set(name, value, options);
                    });
                },
            },
        }
    );
}

// 2. Client per i componenti React (Browser-side) con persistenza attiva
export function createBrowserSupabaseClient() {
    return createBrowserClient(supabaseUrl, supabasePublishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}