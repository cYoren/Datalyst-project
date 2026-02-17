# Datalyst — February 2026 Sprint Mandate

> Hand this file to a new Claude session. It has everything needed to work autonomously.

## What This App Is
Next.js web app for quantified-self habit tracking with real statistical analysis. Users log habits daily, and after 14 days Datalyst runs Pearson/Spearman correlations with p-values to surface insights. Differentiator: real math, not fake "AI insights". Deployed on Vercel.

## Current Status (Feb 17 2026)
- ✅ Deployed and live (prj_xJxYmM51Go9QHMNHZw43MrYWDSay)
- ✅ Latest deploy READY — homepage HTTP 200, login/dashboard working
- ✅ package.json name fixed to "datalyst" (was "habit-tracker")
- ✅ EAS SDK, Capacitor, and viem (blockchain) removed from package.json
- ⚠️ Dashboard page is 580 lines — needs component extraction
- ⚠️ Both Prisma AND Supabase as data layers — overlapping responsibility
- ⚠️ `any` types on habit and corr objects throughout dashboard

## Sprint Goals — Ship by Feb 28

### Priority 1: Run `npm install` to clean up removed dependencies
```bash
cd /Users/gustavomarcelino/Documents/Coding/Datalyst
npm install
npm run build
# Verify build passes without EAS/Capacitor/viem
git add package.json package-lock.json
git commit -m "chore: remove unused Capacitor, EAS, and blockchain dependencies"
git push
```

### Priority 2: Fix TypeScript `any` types in dashboard
File: `src/app/(app)/dashboard/page.tsx`
- `selectedHabit: any` → create/import proper `Habit` type from `src/types/index.ts`
- `corr: any` in insights map → use `CorrelationResult` from `src/stats/correlations.ts`
- `insights?.correlations.map((corr: any, ...)` → type it properly

### Priority 3: Extract dashboard into smaller components
The 580-line dashboard should be split:
- `<InsightsBanner />` — the new insight detection + display
- `<StatsGrid />` — the 4 stat cards
- `<ProtocolList />` — the pending/completed habits sections
Keep logic in the page, extract only rendering.

### Priority 4: Clarify Prisma vs Supabase boundaries
Document in a comment at the top of `lib/prisma.ts` and `lib/supabase/`:
- Prisma: used for complex relational queries (habits, entries, correlations, experiments)
- Supabase: used for auth only
If both are genuinely doing data work, consolidate to Prisma only (migrate auth to next-auth or keep Supabase auth but remove Supabase data queries).

## Key Paths
- Project root: `/Users/gustavomarcelino/Documents/Coding/Datalyst/`
- Source: `./src/`
- Stats engine: `./src/stats/` — DO NOT TOUCH (working correctly)
- Dashboard: `./src/app/(app)/dashboard/page.tsx`
- Types: `./src/types/index.ts`
- Vercel project ID: `prj_xJxYmM51Go9QHMNHZw43MrYWDSay`
- Team: `team_OAusCk0ZnqbnyWQ1jHrIyPuK`

## Deploy
```bash
git add . && git commit -m "description" && git push origin main
# Vercel auto-deploys
```

## Do NOT Touch
- `src/stats/` — the correlation/regression engine is correct
- `prisma/schema.prisma` — schema is stable
- `src/lib/supabase/` — auth layer is working
