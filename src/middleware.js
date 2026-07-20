// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createClient } from "./lib/supabase";

// 1. Define public routes that do NOT require auth
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
];

// 1b. Define public prefixes (API endpoints, assets, etc.)
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_astro",
  "/favicon.ico",
  "/robots.txt",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // 2. Skip check for public routes and known prefixes (assets, api)
  const isExactPublic = PUBLIC_ROUTES.includes(pathname) ||
    (pathname !== "/" && PUBLIC_ROUTES.includes(pathname.replace(/\/$/, "")));

  const isPrefixPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isExactPublic || isPrefixPublic) {
    return next();
  }

  // 3. Initialize Supabase client for the request
  const supabase = createClient({
    request: context.request,
    cookies: context.cookies,
  });

  // 4. Check for valid user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // 5. Redirect unauthenticated users to signin
    // Optionally pass the intended destination: /auth/signin?redirect=/dashboard
    return redirect(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
  }

  // 6. Attach user to locals so pages can access it without re-fetching
  context.locals.user = user;

  // Continue to the page
  return next();
});   