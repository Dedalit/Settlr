<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/status-active-8B5CF6?style=for-the-badge">
  <img alt="Status" src="https://img.shields.io/badge/status-active-7C3AED?style=for-the-badge">
</picture>
&nbsp;
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/astro-7-8B5CF6?style=for-the-badge&logo=astro">
  <img alt="Astro" src="https://img.shields.io/badge/astro-7-7C3AED?style=for-the-badge&logo=astro">
</picture>
&nbsp;
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/react-19-8B5CF6?style=for-the-badge&logo=react">
  <img alt="React" src="https://img.shields.io/badge/react-19-7C3AED?style=for-the-badge&logo=react">
</picture>
&nbsp;
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/supabase-8B5CF6?style=for-the-badge&logo=supabase">
  <img alt="Supabase" src="https://img.shields.io/badge/supabase-7C3AED?style=for-the-badge&logo=supabase">
</picture>

<br>

<h1 align="center">
  <br>
  <span style="font-size: 4rem; font-weight: 900; letter-spacing: 0.05em; background: linear-gradient(135deg, #fff, #e9d5ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
    SETTLR
  </span>
  <br>
</h1>

<p align="center">
  <b>Split bills, track shared expenses, and settle up with friends — in seconds.</b>
</p>

<p align="center">
  Group expenses are messy. Settlr makes them clear, fair, and easy to settle.
</p>

<br>

## ✦ Features

- **Groups** — Create groups for trips, roommates, friends, anything
- **Expenses** — Add shared costs with payer and split details
- **Flexible splits** — Equal, custom, or percentage-based
- **Live balances** — Real-time tracking of who owes whom
- **Settle up** — Clear debts with a single click

## ✦ Tech Stack

| Layer | Tool |
|---|---|
| **Framework** | Astro 7 (SSR, server output) |
| **UI** | React 19 + Tailwind CSS v4 + shadcn/ui (Base UI) |
| **Auth & DB** | Supabase (SSR, cookie-based sessions) |
| **Runtime** | Node ≥ 22.12.0, pnpm |

## ✦ Getting Started

```bash
pnpm install
pnpm dev        # → http://localhost:4321
```

Copy `.env.example` → `.env` and fill in your Supabase credentials.

### Local Supabase

```bash
supabase start
# Auth emails go to http://127.0.0.1:54324 (Inbucket)
# Confirmations are disabled locally
```

## ✦ Authors

- **Gothloverino**
- **Mikbrog**
- **SadSuite**

## ✦ License

MIT
