# N=1 Rigor Upgrade — Task Tracker

## Phase 1: Fix What's Broken ✅
- [x] 1.1 Timezone: accept ?date= param with validation
- [x] 1.2 Autocorrelation: use temporal order via new param
- [x] 1.3 Washout labels: already uses 'WASHOUT'
- [x] 1.4 sampleVariance: already fixed
- [x] 1.5 logicalDate query: already uses gte/lt range
- [x] 1.6 parseISO: already in use

## Phase 2: Statistical Rigor (Gwern Standard) ✅
- [x] 2.0 Fix frontend/backend property mismatch (meanA→conditionAMean, isSignificant→isProblematic)
- [x] 2.1 Block-mean analysis (`performBlockAnalysis` in analysis.ts)
- [x] 2.2 Carryover effect test (`testCarryoverEffect` in analysis.ts)
- [x] 2.3 Period/sequence effect test (`testPeriodEffect` in analysis.ts)
- [x] 2.4 Sequential testing with O'Brien-Fleming alpha spending (`calculateSequentialBoundary`)
- [x] 2.5 Power calc autocorrelation adjustment (variance inflation in `calculatePower`)
- [x] 2.6 Frontend: grouped Data Quality section (collapsible, warnings + block analysis + sequential)
- [x] Bug: `analysisParams` JSON.parse fix in results route
- [x] Bug: `adaptationPeriod` → `washoutPeriod` (matched schema field)
- [x] Bug: Fix Correlation Matrix TypeError & AdHocModal hardening

## Phase 3a: Multi-Condition Schema + UI ✅
- [x] 3a.1 Schema migration, schedule generation, creation form, results route
- [x] 3a.2 Polish: dynamic condition labels, blinding, trial preview, empty label validation

## Phases 3b-5: Deferred
_Paused per product audit recommendation: "Fix the flow first. Fix the math second. Build new features third."_
_Revisit when usage data shows users hitting limits of 2-condition analysis._

---

## Product Audit — Activation & Retention

### Audit Phase 1: Activation & Education ✅
- [x] Protocol bundles (9 bundles in templates.ts)
- [x] Wire bundles into onboarding Step 2→3
- [x] Insights countdown on dashboard (14-day progress bar)
- [x] First-insight celebration modal
- [x] Fix Logs page language (now English)
- [x] Min N changed from 5 to 14
- [x] Empty states with CTAs (CorrelationMatrix, DataDashboard)
- [x] Breadcrumbs component wired into layout
- [x] p-value calculation replaced with proper t-distribution CDF
- [x] Bonferroni correction in stats service
- [x] "Save as Template" on habit edit page
- [x] "New insight discovered" banner on dashboard
- [x] Mobile nav has "+" button for protocol creation

### Audit Phase 2: Retention & Education (CURRENT)

#### A. Template Library Page (biggest remaining activation gap)
- [x] A1. Create `/habits/templates` page — browsable grid of starter + user templates
- [x] A2. Add "Browse Templates" link in sidebar nav and habit creation page
- [x] A3. "Use Template" action → create habit → redirect to dashboard

#### B. Contextual Tooltips (education)
- [x] B1. CorrelationMatrix: already has InfoTooltip in legend explaining r-values
- [x] B2. Dashboard: tooltips on Weekly Completion, This Week stats
- [x] B3. Insight cards: tooltip on "Confidence" explaining what it means

#### C. Weekly Summary Card (retention hook)
- [x] C1. "This Week" summary on dashboard: entries, days active, avg/day

#### D. Backdate Awareness (retention — low effort)
- [x] D1. Backdate hint shown when today is fully logged

### Verification
- [x] `npx tsc --noEmit` clean
- [ ] Spot check new pages/components
