# AGENTS.md

## Commands

```bash
pnpm dev       # astro dev (localhost:4321)
pnpm build     # astro build (SSR standalone → dist/)
pnpm preview   # astro preview (run production build)
pnpm astro     # raw astro CLI passthrough
```

No lint, typecheck, or test commands exist.

## Stack

- **Astro 7** — `output: "server"`, Node adapter in `standalone` mode
- **React 19** — `.tsx` islands hydrated with `client:load`; `.astro` files are server-only
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (not PostCSS)
- **shadcn/ui** — built on **Base UI** (not Radix); components in `src/components/ui/`
- **Supabase SSR** — `@supabase/ssr` with cookie-based sessions (HttpOnly, SameSite=Lax)
- **pnpm** — package manager; a stale `package-lock.json` exists, ignore it
- **Node >= 22.12.0** required

## Path alias

`@/` → `src/` (tsconfig.json `paths`).

## Environment

| Variable | Purpose |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

Copy `.env.example` → `.env`. Both `.env` and `.env.local` exist and are redundant (`.env` wins).
All env vars are Astro `PUBLIC_`-prefixed. Do NOT commit `.env` or `.env.local`.

## Routing & pages

- `src/pages/` — Astro file-based routing
- `src/pages/api/` — API endpoints (`APIRoute` handlers), return JSON
- `src/layouts/Layout.astro` — shared shell (`<html>`, head, body, `<slot />`); used by **all** pages
- `src/components/FallingReceipts.astro` — reusable lavalamp background with falling receipt animations; wraps content via `<slot />` and emits global CSS + keyframes via `<style is:global>`

Page inventory: `index.astro`, `auth/signin.astro`, `auth/signup.astro`, `auth/forgot-password.astro`, `auth/update-password.astro`, `auth/callback.astro`, `dashboard/index.astro`.

## Auth

Centralized in `src/middleware.js`:

1. Public routes bypass check: `/`, `/about`, `/auth/*`, `/api/auth/*`, static assets
2. All other routes require a valid Supabase session via `supabase.auth.getUser()`
3. Unauthenticated → redirect to `/auth/signin?redirect=<path>`
4. Authenticated `user` attached to `context.locals.user`

Two auth paths coexist (redundant):
- **Astro Actions** (`src/actions/index.ts`) — `signUp`, `signIn`, `signOut`
- **API Routes** (`src/pages/api/auth/*.ts`) — form-based signin, register, signout, forgot-password, update-password

Email confirmation: `/auth/callback?token_hash=...&type=email` → verify OTP → redirect.

Password reset flow: `forgot-password` (enter email) → API sends link → `update-password` (set new password with recovery token).

### Server-side Supabase client

`src/lib/supabase.ts` — wraps `@supabase/ssr`'s `createServerClient`. Import in middleware, page frontmatter, or API routes. `cookies` parameter is `context.cookies` in middleware, `Astro.cookies` in pages & API routes.

## Dark mode

- **Init**: `DarkModeInit.astro` (inline `<script>` in `<head>`) reads `localStorage` / `prefers-color-scheme`, sets `.dark` class on `<html>`, persists changes back to localStorage via `MutationObserver`.
- **Toggle**: `ModeToggle` React component (`src/components/darkmode-toggle.tsx`) — dropdown with Light/Dark/System. Rendered in `Layout.astro` body, fixed bottom-right (`z-50`). Hydrated with `client:load`.
- All dark-mode CSS is driven by the `.dark` class on `<html>` with Tailwind v4's `@custom-variant dark (&:is(.dark *))`.

## Components

- **App components** — `src/components/*.tsx` (login-form, signup-form, dashboard-shell, app-sidebar, nav-*, team-switcher, darkmode-toggle)
- **shadcn/ui primitives** — `src/components/ui/*.tsx` (button, card, sheet, sidebar, dropdown-menu, etc.)
- **Custom hooks** — `src/hooks/use-mobile.ts` (responsive sidebar)
- Use `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`) to merge Tailwind classes

## Supabase local dev

`supabase/config.toml` — ports 54321–54324. Run `supabase start`. Auth email confirmations disabled locally; emails go to Inbucket at `http://127.0.0.1:54324`.

## Known quirks

- Both `.env` and `.env.local` exist and are redundant (`.env` takes precedence in dev)
- `pnpm astro` is how you run the Astro CLI directly (e.g., `pnpm astro add`, `pnpm astro check`)
- shadcn CLI (`npx shadcn add`) is configured via `components.json`; custom components live in the same `@/components/ui` directory
- `FallingReceipts.astro` emits global CSS via `<style is:global>` — the lavalamp/bg classes are available everywhere without per-page `<style>` blocks
