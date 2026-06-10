---
name: expense-tracker-skill
description: Engineering skill for the Expense Tracker PWA (Next.js 14 App Router + Supabase). Covers project conventions and the migration rule.
---

# Expense Tracker — Engineering Skill

A personal finance PWA built with **Next.js 14 App Router**, **Supabase** (Postgres + Auth), deployed as a PWA.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Backend | Supabase (Postgres, Auth) |
| Styling | Tailwind CSS |
| PWA | next-pwa |
| Language | TypeScript |

## Next.js Conventions

- Default to **Server Components**. Add `"use client"` only for event handlers, `useState`/`useEffect`, or browser APIs.
- Prefer **Server Actions** over API routes for mutations.
- Scope components to features: `components/expenses/`, `components/ui/` for shared primitives.

## Supabase — Migration Rule

**Never run migrations automatically.** When a feature requires a schema change:
1. Describe the required SQL as a comment block.
2. Stop and ask the developer to apply it manually via the Supabase dashboard or SQL editor.
