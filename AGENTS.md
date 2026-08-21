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

- Always follow the UI design system when creating or reviewing components or pages. The design system is described in the "Appearance & theming" section below.

```bash
pnpm dev       # astro dev (localhost:4321, runs on Cloudflare workerd)
pnpm build     # astro build (Cloudflare Workers output → dist/)
pnpm preview   # astro preview (run production build on workerd)
pnpm deploy    # astro build && wrangler deploy (push to Cloudflare Workers)
pnpm astro     # raw astro CLI passthrough
```

No lint, typecheck, or test commands exist. `pnpm build` is the only verification gate — always run it after changes.

## Stack

- **Astro 7** — `output: "server"`, `@astrojs/cloudflare` adapter (Workers runtime via `workerd`; `astro dev`/`preview` run on the real Workers runtime, not Node)
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

## Cloudflare deployment

- **Target**: Cloudflare Workers (NOT Pages — the adapter dropped Pages support in v13). Worker name: `settlr` → `https://settlr.<account>.workers.dev`.
- **Config**: `wrangler.jsonc` — `main` = `@astrojs/cloudflare/entrypoints/server`, assets served from `dist/` via the `ASSETS` binding with `not_found_handling: "404-page"`, `nodejs_compat` flag.
- **Env vars**: the two `PUBLIC_*` Supabase keys live in `wrangler.jsonc` `vars` (they are public publishable keys) AND are inlined at build time from the git-tracked `.env`. Do NOT add real secrets to `wrangler.jsonc` — use `pnpm dlx wrangler secret put <NAME>` instead.
- **Sessions**: `session: false` is set in `astro.config.ts` (no Astro Sessions usage) so no KV namespace is auto-provisioned.
- **Image service**: `imageService: 'passthrough'` — the app doesn't use Astro's image pipeline, so no Images binding is provisioned.
- **Local preview**: `pnpm build && pnpm preview` runs the production Worker on `workerd`. `pnpm dlx wrangler deploy --dry-run` validates the bundle without uploading.
- **Workers Builds** (Cloudflare dashboard): build command `npx astro build`, deploy command `npx wrangler deploy`. No GitHub Actions needed.
- Do NOT reintroduce `@astrojs/node` — the codebase must stay free of Node-only server APIs (`node:*`, `fs`, `process`, etc.).

## Routing & pages

- `src/pages/` — Astro file-based routing; `404.astro` handles unmatched routes automatically (SSR)
- `src/pages/api/` — API endpoints (`APIRoute` handlers), return JSON
- `src/layouts/Layout.astro` — shared shell (`<html>`, head, body, `<slot />`); used by **all** pages
- `src/components/FallingReceipts.astro` — reusable lavalamp background with falling receipt animations; wraps content via `<slot />` and emits global CSS + keyframes via `<style is:global>`

Pages: `index.astro`, `404.astro`, `auth/{signin,signup,forgot-password,update-password,callback}.astro`, and under `dashboard/`: `index`, `activity`, `friends`, `friends/[id]`, `groups`, `groups/[id]`, `settls`.

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

The actual UI lives in React page components under `src/components/pages/` (`groups.tsx`, `friends.tsx`, `settls.tsx`, `activity.tsx`, `dashboard.tsx`, `group-page.tsx`, `friend-page.tsx`). `DashboardLayout` also exports a `PageHeader` helper that accepts an optional `actions` slot (buttons rendered to the right of the title — prefer this over placing action buttons elsewhere). CAUTION: these page components currently render **hardcoded mock data**; only `nav-user.tsx` talks to Supabase so far.

## Appearance & theming

- All light/dark colors are theme-aware CSS tokens in `src/styles/global.css` (`:root` = light, `.dark` = dark). Dashboard components MUST use the token classes (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`) — do NOT hardcode hex/purple classes.
- **Purple/violet is accent-only**: used for `--primary` (light: indigo `#6366f1`), primary/Settl Up buttons, active/selected states, and filter chips. The old purple-heavy dark theme (`#110B3B` card backgrounds, white→purple gradient headings, blur glow divs) is GONE from the dashboard — do not reintroduce it.
- **Sidebar**: uses a purple gradient via `--sidebar-gradient-from/to` (defined for light and dark in `global.css`), applied through the `[data-sidebar="sidebar"]` rule. The sidebar is collapsible; `SidebarMenuButton` collapsed sizing is `h-9! w-8! p-2!` (in `ui/sidebar.tsx`) — keeps rows aligned with the expanded `h-9` and centers icons. Don't revert to `size-8`.
- **Glass surfaces**: cards use `bg-card/70 backdrop-blur-xl`. The shared `Card` primitive still applies a solid `bg-card`, so `.dashboard-shell [data-slot="card"]` and `.dashboard-glass-modal` utilities in `global.css` enforce the translucent+blur look with `!important`. New modals should use the `dashboard-glass-modal` class on their shell. There are subtle color blobs behind the page content (in `dashboard-layout.tsx`) that the glass blurs.
- **Theme switching**: `DarkModeInit.astro` (inline script in `<head>`) reads `localStorage['theme']` / `prefers-color-scheme`, sets `.dark` on `<html>`, and persists changes via a `MutationObserver`. The Light/Dark/System control lives in the **Settings modal** (`modals/settings-modal.tsx`), which toggles the `.dark` class. There is no floating dark-mode toggle component anymore.
- **Out of scope for the dashboard theme**: the landing (`index.astro`) and `auth/*` pages deliberately keep the purple `FallingReceipts` lavalamp style. Don't restyle them to match the dashboard.

## Auth

Centralized in `src/middleware.ts` (runs in the Cloudflare Workers runtime):

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

## Components

- **App components** — `src/components/*.tsx` (signin-form, signup-form, dashboard-layout, app-sidebar, nav-main, nav-user, inline-actions, card-actions-menu)
- **Page components** — `src/components/pages/*.tsx` (see Dashboard page pattern above)
- **Modals** — `src/components/modals/*.tsx` (account, settings, add-expense, add-friend, create-group, pin-more, settl-up, segmented). Modal shells use `src/components/ui/modal.tsx`.
- **shadcn/ui primitives** — `src/components/ui/*.tsx` (button, card, sheet, sidebar, dropdown-menu, modal, etc.)
- **Custom hooks** — `src/hooks/use-mobile.ts` (responsive sidebar)
- Use `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`) to merge Tailwind classes

Layout notes: `DashboardLayout` renders the collapsible sidebar with `NavUser` in its **footer** (bottom-left) and a **fixed sidebar toggle button at bottom-right of the screen** (not inside the sidebar). Page action buttons should use `InlineActions` (inline buttons/cards near the page header) — the old floating bottom action bar (`floating-actions.tsx`) was removed.

## Supabase local dev

`supabase/config.toml` — ports 54321–54324. Run `supabase start`. Auth email confirmations disabled locally; emails go to Inbucket at `http://127.0.0.1:54324`. Config references `./seed.sql` but that file doesn't exist yet.

## Known quirks

- `.env` is git-tracked despite `.gitignore` having `.env*`; don't assume it's safe from commits
- `pnpm astro` is how you run the Astro CLI directly (e.g., `pnpm astro add`)
- shadcn CLI (`npx shadcn add`) is configured via `components.json`; custom components live in the same `@/components/ui` directory (e.g. `modal.tsx` is custom, not a shadcn add)
- `nav-projects.tsx` and `team-switcher.tsx` are unused shadcn template leftovers — not imported anywhere
- `FallingReceipts.astro` emits global CSS via `<style is:global>` — the lavalamp/bg classes are available everywhere without per-page `<style>` blocks
- Use Tailwind v4 `bg-linear-to-*` for gradients — `bg-gradient-to-*` (v3) silently does nothing
- Dashboard page titles/headings are plain `text-foreground` uppercase — no more gradient text
