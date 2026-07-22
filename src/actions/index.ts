import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createClient } from "../lib/supabase";

function persistSession(cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void }, session: { access_token: string; refresh_token: string }) {
  const isSecure = import.meta.env.PROD;
  cookies.set("sb-access-token", session.access_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
  });
  cookies.set("sb-refresh-token", session.refresh_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
  });
}

function clearSession(cookies: { delete: (name: string, options?: Record<string, unknown>) => void }) {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
}

export const server = {
  signUp: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    handler: async (input, context) => {
      try {
        const supabase = createClient({
          request: context.request,
          cookies: context.cookies,
        });

        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
        });

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        if (data.session) {
          persistSession(context.cookies, data.session);
        }

        return {
          success: true,
          message: "Check your email to confirm your account",
        };
      } catch (err) {
        return {
          success: false,
          message: "Unexpected error",
        };
      }
    },
  }),
  signIn: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    handler: async (input, context) => {
      try {
        const supabase = createClient({
          request: context.request,
          cookies: context.cookies,
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        if (data.session) {
          persistSession(context.cookies, data.session);
        }

        return {
          success: true,
          message: "Signed in successfully",
        };
      } catch (err) {
        return {
          success: false,
          message: "Unexpected error",
        };
      }
    },
  }),
  signOut: defineAction({
    handler: async (_, context) => {
      try {
        const supabase = createClient({
          request: context.request,
          cookies: context.cookies,
        });

        await supabase.auth.signOut();
        clearSession(context.cookies);

        return {
          success: true,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed to sign out",
        };
      }
    },
  }),
};