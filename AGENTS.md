# AGENTS.md

# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions 
- Never assume design, tech stack or features 
- Use deep-dive sub-agents to assist with research 
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / BUILD MODE

- Never implement features yourself when possible - use sub-agents! 
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently 
- When using sub-agents to implement features, act as a coordinator only 
- Use the best model for the task — premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation 
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## TESTING

- Use any testing tools, libraries available to the project for testing your changes 
- Never assume your changes simply work, always test! 
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.

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
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (not PostCSS); gradients use v4 syntax `bg-linear-to-*` (NOT v3's `bg-gradient-to-*`)
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

Copy `.env.example` → `.env`. All env vars are Astro `PUBLIC_`-prefixed.
NOTE: `.env` is **git-tracked** (it was committed before `.gitignore`'s `.env*` rule). Do not add secrets to it / don't assume it's ignored. `.env.local` does not exist.

## Routing & pages

- `src/pages/` — Astro file-based routing
- `src/pages/api/` — API endpoints (`APIRoute` handlers), return JSON
- `src/layouts/Layout.astro` — shared shell (`<html>`, head, body, `<slot />`); used by **all** pages
- `src/components/FallingReceipts.astro` — reusable lavalamp background with falling receipt animations; wraps content via `<slot />` and emits global CSS + keyframes via `<style is:global>`

Pages: `index.astro`, `auth/{signin,signup,forgot-password,update-password,callback}.astro`, and under `dashboard/`: `index`, `activity`, `friends`, `friends/[id]`, `groups`, `groups/[id]`, `settls`.

### Dashboard page pattern

Every `src/pages/dashboard/*.astro` follows the same shape (frontmatter → islands):

```astro
const userData = await getServerUser({ request: Astro.request, cookies: Astro.cookies });
if (!userData) return Astro.redirect('/auth/signin');
<Layout>
  <DashboardLayout client:load user={userData}>
    <SomePage client:load />
  </DashboardLayout>
</Layout>
```

The actual UI lives in React page components under `src/components/pages/` (`groups.tsx`, `friends.tsx`, `settls.tsx`, `activity.tsx`, `dashboard.tsx`, `group-page.tsx`, `friend-page.tsx`). `DashboardLayout` also exports a `PageHeader` helper used by these pages. CAUTION: these page components currently render **hardcoded mock data**; only `nav-user.tsx` talks to Supabase so far.

## Auth

Centralized in `src/middleware.js`:

1. Public routes bypass check: `/`, `/about`, `/auth/*`, `/api/auth/*`, static assets (note: `/about` is in the public list but no such page exists yet)
2. All other routes require a valid Supabase session via `supabase.auth.getUser()`
3. Unauthenticated → redirect to `/auth/signin?redirect=<path>`
4. Authenticated `user` attached to `context.locals.user`; responses get `Cache-Control: no-store`

Two auth paths coexist (redundant):
- **Astro Actions** (`src/actions/index.ts`) — `signUp`, `signIn`, `signOut`
- **API Routes** (`src/pages/api/auth/*.ts`) — form-based signin, register, signout, forgot-password, update-password

Email confirmation: `/auth/callback?token_hash=...&type=email` → verify OTP → redirect.
Password reset flow: `forgot-password` (enter email) → API sends link → `update-password` (set new password with recovery token).

## Supabase clients & data layer

`src/lib/supabase.ts` exports two clients:
- `createClient({ request, cookies })` — server-side `@supabase/ssr` client for middleware, page frontmatter, API routes. `cookies` = `context.cookies` in middleware, `Astro.cookies` in pages/API routes.
- `createBrowserSupabaseClient()` — client-side for React islands (used by `nav-user.tsx`).

`src/lib/user.ts` — `getServerUser({ request, cookies })` resolves the session user to `{ name, email, avatar }` (or `null`); `formatServerUser(raw)` for already-fetched users.

`src/lib/database.ts` — DB helpers (`createExpenseTransaction`, `getRecentActivities`, `getUserGroups`). These reveal the actual table schema: `expenses` (note the column is `value_amout`, misspelled in the DB), `paid_by`, `expense_split`, `group_members`, `groups`.

## Dark mode

- **Init**: `DarkModeInit.astro` (inline `<script>` in `<head>`) reads `localStorage` / `prefers-color-scheme`, sets `.dark` class on `<html>`, persists changes back to localStorage via `MutationObserver`.
- **Toggle**: `ModeToggle` React component (`src/components/darkmode-toggle.tsx`) — dropdown with Light/Dark/System. Rendered in `Layout.astro` body, fixed bottom-right (`z-50`). Hydrated with `client:load`.
- All dark-mode CSS is driven by the `.dark` class on `<html>` with Tailwind v4's `@custom-variant dark (&:is(.dark *))`.

## Components

- **App components** — `src/components/*.tsx` (signin-form, signup-form, dashboard-layout, app-sidebar, nav-main, nav-projects, nav-user, team-switcher, darkmode-toggle)
- **Page components** — `src/components/pages/*.tsx` (see Dashboard page pattern above)
- **shadcn/ui primitives** — `src/components/ui/*.tsx` (button, card, sheet, sidebar, dropdown-menu, etc.)
- **Custom hooks** — `src/hooks/use-mobile.ts` (responsive sidebar)
- Use `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`) to merge Tailwind classes

## Supabase local dev

`supabase/config.toml` — ports 54321–54324. Run `supabase start`. Auth email confirmations disabled locally; emails go to Inbucket at `http://127.0.0.1:54324`. Config references `./seed.sql` but that file doesn't exist yet.

## Known quirks

- `.env` is git-tracked despite `.gitignore` having `.env*`; don't assume it's safe from commits
- `pnpm astro` is how you run the Astro CLI directly (e.g., `pnpm astro add`)
- shadcn CLI (`npx shadcn add`) is configured via `components.json`; custom components live in the same `@/components/ui` directory
- `FallingReceipts.astro` emits global CSS via `<style is:global>` — the lavalamp/bg classes are available everywhere without per-page `<style>` blocks
- Use Tailwind v4 `bg-linear-to-*` for gradients — `bg-gradient-to-*` (v3) silently does nothing
