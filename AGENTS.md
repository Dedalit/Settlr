# AGENTS.md

## Commands

```bash
pnpm dev      # astro dev (defaults to localhost:4321)
pnpm build    # astro build (SSR standalone output)
pnpm preview  # astro preview (run production build locally)
```

There is no lint, typecheck, or test command configured.

## Stack

- **Astro 7** — SSR mode (`output: "server"`) with Node adapter in standalone mode
- **React 19** — islands hydrated with `client:load`; `.astro` files server-render, `.tsx` files are interactive islands
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, not PostCSS
- **shadcn/ui** — built on **Base UI** primitives (not Radix); components in `src/components/ui/`
- **Supabase SSR** — auth handled via `@supabase/ssr` with cookie-based sessions (HttpOnly, SameSite=Lax)
- **pnpm** — package manager (pnpm-workspace.yaml present); a stale `package-lock.json` also exists
- **Node >= 22.12.0** required

## Path aliases

`@/` maps to `src/` (defined in tsconfig.json `paths`).

## Environment variables

| Variable | Purpose |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

All env vars are `PUBLIC_` prefixed (Astro convention for client-accessible vars). Copy `.env.example` to `.env` and fill values. Do NOT commit `.env` or `.env.local` (both are gitignored).

## Architecture

### Routing (Astro file-based)

- `src/pages/` — routes mapped by filename
- `src/pages/api/` — API endpoints (`APIRoute` handlers)
- `src/layouts/Layout.astro` — shared base layout (not used by `index.astro` or `about.astro`)

### Auth flow

Auth is centralized in `src/middleware.js`:

1. Public routes (`/`, `/about`, `/auth/*`, `/api/auth/*`) bypass auth checks
2. All other routes check for a valid Supabase session via `supabase.auth.getUser()`
3. Unauthenticated users redirect to `/auth/signin?redirect=<path>`
4. Authenticated `user` object attached to `context.locals.user`

Two auth paths coexist (some redundancy):

- **Astro Actions** (`src/actions/index.ts`) — `signUp`, `signIn`, `signOut` via `astro:actions`
- **API Routes** (`src/pages/api/auth/*.ts`) — form-based signin/register/signout endpoints

Email confirmation flow: `/auth/callback?token_hash=...&type=email` → server-side OTP verification → redirect.

### Server-side Supabase client (`src/lib/supabase.ts`)

Uses `@supabase/ssr`'s `createServerClient`. Import this in any server-side context (middleware, page frontmatter, API routes). The `cookies` parameter varies by context — in middleware it's `context.cookies`, in API routes it's `Astro.cookies`.

## Components

- **Application components** — `src/components/*.tsx` (app-sidebar, login-form, dashboard-shell, nav-*, team-switcher, ModeToggle)
- **shadcn UI primitives** — `src/components/ui/*.tsx` (button, card, sheet, sidebar, dropdown-menu, etc.)
- **Custom hook** — `src/hooks/use-mobile.ts` for responsive sidebar behavior

Use `cn()` from `@/lib/utils` (re-exported `clsx` + `tailwind-merge`) to merge Tailwind classes.

## Dark mode

Managed via `.dark` class on `<html>`. Inline script in `index.astro` and `dashboard.astro` reads from `localStorage.getItem('theme')` or `matchMedia('(prefers-color-scheme: dark)')`. The `ModeToggle.tsx` React component provides light/dark/system switching.

## Supabase local development

`supabase/config.toml` is configured for local dev (ports 54321–54324). Run `supabase start` for local Supabase services. Auth email confirmations are disabled locally (`enable_confirmations = false`) but emails go to Inbucket at `http://127.0.0.1:54324`.

## Known quirks

- `src/pages/dashboard.astro` and `src/pages/dashboard/index.astro` are functionally identical — only one is needed
- Both `.env` and `.env.local` exist and are redundant (`.env` takes precedence in dev)
- shadcn CLI (`npx shadcn add`) is configured via `components.json`; use it to add more UI components — custom components live in the same `@/components/ui` directory
