// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createClient } from "./lib/supabase";

const PUBLIC_ROUTES = new Set([
  "/",
  "/about",
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/update-password",
]);

const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_astro",
  "/favicon.ico",
  "/robots.txt",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;
  const pathname = url.pathname;
  const cleanPathname = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;

  if (PUBLIC_ROUTES.has(cleanPathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return next();
  }

  const supabase = createClient({
    request: context.request,
    cookies: context.cookies,
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
  }

  context.locals.user = user;

  return next();
});