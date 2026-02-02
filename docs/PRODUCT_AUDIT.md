# Datalyst Product Audit

**Date:** January 29, 2026
**Auditor role:** Senior Product Manager / UX Lead
**Scope:** Full product audit — UX, features, strategy, technical gaps, roadmap

---

## Executive Summary

Datalyst is a solid MVP with a clear differentiator: **"N=1 experimentation"** instead of generic habit tracking. The correlation engine, experiment lab, and data-first positioning set it apart from Habitica, Streaks, and similar apps.

**The core problem today is not missing features — it's that existing features aren't connected into a coherent user journey.** The template system is fully built on the backend but invisible in the UI. The onboarding collects a "focus area" but does nothing with it. The insights engine exists but users have no guidance on how to reach it. The product has all the pieces; they just aren't wired together.

**Strategic recommendation:** Stop building new backend capabilities. Spend the next cycle on **flow, education, and activation** — making what exists actually work for users.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Critical Issues (P0)](#2-critical-issues-p0)
3. [High-Impact Opportunities (P1)](#3-high-impact-opportunities-p1)
4. [Medium Priority (P2)](#4-medium-priority-p2)
5. [Low Priority / Future (P3)](#5-low-priority--future-p3)
6. [What NOT to Build](#6-what-not-to-build)
7. [Feature Inventory & Gap Analysis](#7-feature-inventory--gap-analysis)
8. [UX Friction Map](#8-ux-friction-map)
9. [Retention Analysis](#9-retention-analysis)
10. [Statistical Engine Assessment](#10-statistical-engine-assessment)
11. [Technical Debt](#11-technical-debt)
12. [Competitive Positioning](#12-competitive-positioning)
13. [Recommended Roadmap](#13-recommended-roadmap)

---

## 1. Current State Summary

### What exists and works

| Area | Status | Notes |
|------|--------|-------|
| Auth (email, Google, magic link) | Complete | Registration, login, password reset all functional |
| Onboarding (3 steps) | Functional but shallow | Collects focus area, creates first habit, offers demo data |
| Dashboard | Good | Stats cards, today's log widget, insights, floating action button |
| Protocol creation | Good | Name, schedule, time block, subvariables, color/icon picker |
| Quick logging | Excellent | TodaysLogWidget is the best part of the app — 1-2 taps to log |
| Data/Analytics | Functional | Line/bar charts per variable, history table, CSV export |
| Lab/Experiments | Functional | Create experiments, correlation matrix heatmap |
| Correlation engine | Works but weak math | Same-day only, bad p-value approximation, N=5 minimum |
| Templates (backend) | Complete | Full CRUD, search, usage tracking — all API routes working |
| Templates (UI) | Minimal | Only a search dropdown in habit creation form. No management, no library |
| Settings | Basic | Profile, theme, locale, health consent, data export, account deletion |
| PWA | Basic | Manifest, simple service worker, no install prompt, no push |
| GDPR/Privacy | Strong | Consent management, data export, full deletion, privacy policy |
| SEO | Basic | Meta tags and OG tags present. No sitemap, robots.txt, or structured data |
| Mobile responsiveness | Good | Bottom nav, responsive grids, safe area support |
| Accessibility | Weak | Semantic HTML only. No ARIA labels, no skip nav, no screen reader optimization |
| i18n | Broken | App is English except the Logs page which is in Portuguese |

### What's missing entirely

- Push notifications / reminders
- Template library UI and management
- Protocol bundles tied to focus areas
- In-app education (tooltips, tours, contextual help)
- Pagination on data-heavy pages
- Achievements / milestones
- Social sharing of insights
- Proper error logging (only console.log)
- Automated tests

---

## 2. Critical Issues (P0)

These are bugs or UX failures that actively hurt the product right now.

### 2.1 Language inconsistency

The Logs page (`src/app/(app)/logs/page.tsx`) is entirely in Portuguese while the rest of the app is in English. This looks broken, not bilingual.

**Fix:** Translate logs page to English, or implement proper i18n. Don't ship a half-translated app.

### 2.2 Mobile navigation is missing key features

The mobile bottom nav only has 4 items: Dashboard, Lab, Data, Logs. Users on mobile **cannot access**:
- Settings (only via user menu modal — buried)
- Create New Protocol (only in user menu modal)
- About page

**Fix:** The mobile user menu modal does include "New Protocol" and "Settings" but the discoverability is poor. Add a prominent "+" button to the bottom nav for protocol creation, which is the single most important action for new users.

### 2.3 Minimum sample size is N=5

The stats engine (`stats.service.ts`) allows insights to generate with only 5 data points. This produces correlations that are statistically meaningless but displayed with confidence to users.

**Fix:** Change minimum N from 5 to 14. This is a one-line change with outsized impact on credibility.

### 2.4 Empty states without actionable CTAs

Several components show empty text with no button or guidance:
- `CorrelationMatrix`: "Need at least 2 variables with data" — no CTA
- `DataDashboard` (no habits): "No habit found. Create a habit to view data." — no button
- Logs page: "Nenhum log encontrado." — Portuguese, no guidance

**Fix:** Every empty state needs: (1) illustration or icon, (2) explanation of what will appear, (3) primary CTA button to take the next action.

---

## 3. High-Impact Opportunities (P1)

These are the features and improvements that will most move the needle on activation and retention.

### 3.1 Wire templates into the onboarding flow

**Current state:** User picks a focus area (Productivity, Health, etc.) in Step 2 of onboarding. This data is stored but **never used**. Step 3 just shows a blank "create your first habit" field.

**What to build:**
- After selecting a focus area, show 3-4 curated **protocol bundles** for that area
- Example for "Physical Health": Sleep Quality bundle (Hours, Quality, Refreshed), Workout bundle (Duration, Effort, Soreness), Nutrition bundle (Water intake, Meals, Energy)
- User picks 2-3 bundles → protocols are auto-created → user lands on a populated dashboard
- This dramatically reduces time-to-value and teaches users what "good protocols" look like

**Why this matters:** The hardest moment in any tracking app is the blank canvas. Users don't know what to track or how to structure variables. Bundles solve this completely.

### 3.2 Create the "Why" screen before insights

Users need to understand the payoff of logging consistently. Right now there's no education about what happens after 14 days of data.

**What to build:**
- A progress indicator on the dashboard: "7/14 days logged — insights unlock in 7 more days"
- When insights aren't ready: show a preview card explaining what correlations look like, with example data
- When insights are ready: celebration moment, then show real correlations

**Why this matters:** Without a clear promise, users stop logging around day 3-4. A visible countdown creates anticipation.

### 3.3 Build the template library UI

The entire backend exists. You need:
- A "Templates" section accessible from the habit creation flow (not a separate page — keep it in-context)
- "Save as Template" button on the habit edit page
- Template preview showing what variables will be created
- Starter templates per focus area (create 15-20 curated templates)

### 3.4 Curated protocol bundles (the killer feature you haven't built)

This is different from individual templates. A bundle is a **set of 2-3 protocols designed to be tracked together** because they correlate.

Examples:
| Bundle Name | Protocols | Why they correlate |
|-------------|-----------|-------------------|
| Sleep Optimization | Sleep Quality, Caffeine Intake, Screen Time | Classic causal chain |
| Workout Recovery | Training Intensity, Sleep Quality, Soreness | Recovery science 101 |
| Focus & Productivity | Deep Work Hours, Exercise, Sleep Quality | Cognitive performance triangle |
| Mood Baseline | Mood Rating, Exercise, Social Interaction | Well-established in psychology |
| Energy Management | Energy Level, Meal Timing, Sleep Duration | Metabolic basics |

**Why this is the killer feature:** Bundles make the correlation engine useful from day 1. Instead of hoping users track the right things, you **design** protocols that will produce meaningful insights. This is the "wired flow" you mentioned wanting.

### 3.5 Add contextual help and tooltips

Zero tooltips exist anywhere in the app. Key places that need them:
- Correlation matrix: "What does this number mean?"
- Insights cards: "How is confidence calculated?"
- Subvariable types: "When should I use Scale vs Numeric?"
- Experiment creation: "What's the difference between independent and dependent variables?"
- Dashboard stats: "How is consistency calculated?"

Build a simple `<Tooltip>` component wrapping a `?` icon. No library needed.

---

## 4. Medium Priority (P2)

### 4.1 Push notification reminders

The PWA service worker is registered but has no push capability. Users need configurable reminders:
- Per time block (Morning/Afternoon/Evening)
- Customizable time
- Permission request during onboarding (not on first visit)

### 4.2 Breadcrumb navigation

Nested pages (`/lab/[id]`, `/habits/[id]/edit`) have no back navigation context. Add a simple breadcrumb: `Lab > My Experiment`.

### 4.3 Pagination on data-heavy pages

Logs, entries, and data tables load everything at once. This will break with 6+ months of data. Add cursor-based pagination.

### 4.4 Proper delete confirmations

`EntryEditForm` uses native `confirm()` dialogs. Replace with the existing `Modal` component for consistent UX.

### 4.5 Streak protection

Users lose their streak if they miss one day. This is demoralizing. Options:
- "Freeze day" (1 per week, automatic or manual)
- Partial credit (logged 2/5 protocols still counts)
- Grace period (can backlog yesterday's entries)

Note: Backdating already works in QuickEntryForm, so the grace period is partially solved. Just needs to be communicated to users.

### 4.6 Add sitemap.xml and robots.txt

Basic SEO hygiene. Create `public/sitemap.xml` with static pages and `public/robots.txt` allowing crawling of marketing pages while blocking app routes.

### 4.7 Insights "what changed" notifications

When new correlations are discovered or existing ones strengthen, surface this proactively:
- Dashboard banner: "New insight: Your sleep quality correlates with exercise (r=0.72)"
- This gives users a reason to check the app even on days they've already logged

---

## 5. Low Priority / Future (P3)

### 5.1 Social sharing
- Generate shareable insight cards (image) for social media
- "My 30-day experiment results" summary

### 5.2 Apple Health / Google Fit integration
- Auto-import sleep, steps, heart rate data
- Reduces manual logging friction significantly

### 5.3 Achievements system
- "First Insight Unlocked" (14 days logged)
- "Scientist" (completed first experiment)
- "Consistent" (30-day streak)
- Low effort to build, meaningful for retention

### 5.4 Weekly email digest
- Summary of the week's data
- New correlations discovered
- Streak status
- Brings users back to the app

### 5.5 Full i18n
- Only if targeting Brazilian market specifically
- Otherwise, commit to English and fix the Portuguese artifacts

### 5.6 Advanced statistical features
- Lag analysis (t-1 correlations)
- Bonferroni correction for multiple comparisons
- Proper t-distribution CDF (replace linear approximation)
- These matter but only after the product is retaining users

### 5.7 Dark mode polish
- Theme toggle exists and works but dark mode styling may need component-level QA

---

## 6. What NOT to Build

These are features that seem tempting but would be net-negative right now.

| Feature | Why not |
|---------|---------|
| Community / social feed | Privacy-first positioning is your differentiator. Don't dilute it. |
| AI-powered insights text | The math needs to be right first. GPT-generated interpretations of bad statistics is worse than no insights. |
| Gamification (levels, XP, leaderboards) | Conflicts with "scientific" brand. Light achievements are fine; don't become Habitica. |
| Calendar view | Engineering effort doesn't justify value. The dashboard already shows today's state well. |
| Rich text / journaling | Scope creep. You're a data tool, not a journal app. Keep notes as simple text. |
| Admin dashboard UI | The `/api/admin/retention` endpoint exists but building a full admin panel is premature. Use direct DB queries. |
| Advanced chart types | Current line/bar charts are sufficient. Don't add scatter plots, histograms, etc. until users ask. |

---

## 7. Feature Inventory & Gap Analysis

### Backend exists, UI missing

| Feature | Backend | UI | Gap |
|---------|---------|-----|-----|
| Template CRUD | Full API, service layer | Search dropdown only | No management, no library, no "save as template" |
| Template usage tracking | useCount, lastUsedAt | Not displayed | Could show popularity in template selector |
| Goal direction | goalDirection field on Subvariable | Not used anywhere | Could power "are you improving?" messaging |
| Event tracking | UserEvent model, 9 event types | Not surfaced | Could power activity feed or analytics |
| Session logging | AppSessionLog model | Not surfaced | Could show "time spent" metrics |
| Insights caching | InsightsCache model, 1-hour TTL | Works silently | Could show "last updated" timestamp |
| Experiment results | `/api/experiments/[id]/results` | Partial (lab detail page) | Needs better result visualization |

### UI exists, needs improvement

| Component | Current state | Issue |
|-----------|--------------|-------|
| CorrelationMatrix | Heatmap with color coding | No explanation, no tooltip, empty state has no CTA |
| DataDashboard | Charts + table | Category type shows "coming soon" placeholder |
| Logs page | Event list | In Portuguese, no pagination, no filters |
| Settings | Basic form | Missing notification prefs, missing password change |
| Landing page | Hero + 3 cards | No social proof, no screenshots, no "how it works" section |

---

## 8. UX Friction Map

### Onboarding → First Value

```
Register → Email confirm → Onboarding Step 1 → Step 2 (focus) → Step 3 (first habit) → Dashboard
                                                    |                    |
                                                    |                    └─ FRICTION: Blank form.
                                                    |                       User doesn't know what to track.
                                                    |                       Focus area data is wasted.
                                                    |
                                                    └─ OK: Demo data option helps,
                                                       but demo data ≠ user's own data.
                                                       They still need to create real protocols.
```

**Time to first insight:** Minimum 5 days (current). Should be 14 days (with corrected min N). With protocol bundles, users would have structured tracking from day 1, making the 14-day wait feel purposeful rather than aimless.

### Daily Logging Flow

```
Open app → Dashboard → TodaysLogWidget
                           |
                           ├─ BEST PATH: 1-2 taps per variable (slider/toggle)
                           |   This is excellent UX. Protect it.
                           |
                           └─ FRICTION: If widget is collapsed, user must
                              expand it. No visual nudge to log.
```

**Logging friction is already low.** The TodaysLogWidget is the best-designed component in the app. Don't change it — build the rest of the experience around it.

### Discovery of Insights

```
User logs for 14+ days → Insights appear on dashboard → User sees correlation
                                                             |
                                                             └─ FRICTION: No notification.
                                                                No celebration.
                                                                User might not scroll down
                                                                to the insights section.
```

**Fix:** When first insights are available, show a modal/banner: "Your first correlation is ready." Make it a moment.

---

## 9. Retention Analysis

### Current retention hooks

| Hook | Strength | Notes |
|------|----------|-------|
| Streak counter | Medium | Visible on dashboard, but no protection against loss |
| Progress percentage | Medium | "Today's Progress" card motivates daily completion |
| Insights/correlations | Weak | Only appears after many days, no notification |
| Completion celebration | Medium | "All logged for today" message with emoji |

### Missing retention hooks

| Hook | Impact | Effort |
|------|--------|--------|
| Push notification reminders | High | Medium — needs push subscription + notification service |
| "Insights unlock" countdown | High | Low — just UI on the dashboard |
| Weekly summary (in-app) | Medium | Low — aggregate existing stats |
| First-insight celebration | High | Low — one modal component |
| Streak recovery / freeze | Medium | Low — backend logic + UI toggle |
| Email digest (weekly) | High | Medium — needs email service integration |

### Predicted drop-off points

1. **Day 0:** User creates account, sees blank dashboard, doesn't know what to track → churns
2. **Day 3-4:** User has been logging but sees no payoff → "why am I doing this?" → churns
3. **Day 14+:** Insights appear but user already stopped logging → never sees them

**The protocol bundle + countdown approach addresses all three drop-off points.**

---

## 10. Statistical Engine Assessment

### Current implementation

| Aspect | Implementation | Problem |
|--------|---------------|---------|
| Correlation type | Pearson (continuous) + Spearman (ordinal) | Correct choice |
| Significance threshold | p < 0.05, \|r\| > 0.3 | Thresholds are reasonable |
| P-value calculation | `1.0 / (1 + absT)` linear approximation | Mathematically wrong — not a real t-distribution |
| Minimum sample size | N = 5 | Far too low for meaningful results |
| Multiple comparisons | No correction | Will produce false positives with many variables |
| Lag effects | None — same-day only | Misses most real biological correlations |
| Caching | 1-hour TTL in database | Good for performance |

### Recommended fixes (in priority order)

1. **Change min N to 14** — One line in `stats.service.ts`. Do this immediately.
2. **Replace p-value approximation** — Use `jstat` library or a proper t-distribution CDF. The current formula gives wrong answers.
3. **Add Bonferroni correction** — Divide significance threshold by number of tests. Simple formula: `p < 0.05 / numTests`.
4. **Lag analysis** — Calculate correlations at t-1 offset for specific intervention→outcome pairs. This is the most complex change but also the most scientifically valuable.

### What to communicate to users

Don't show p-values or statistical jargon. Instead:
- "Strong correlation" (|r| > 0.7, p < adjusted threshold)
- "Moderate correlation" (|r| > 0.5)
- "Possible correlation" (|r| > 0.3)
- "Not enough data yet" (N < 14)

The current insight text generator already does something like this. Just make sure the underlying math is correct before surfacing it.

---

## 11. Technical Debt

| Item | Risk | Notes |
|------|------|-------|
| No automated tests | High | Zero test files detected. Any refactoring is risky. |
| Console.log error handling | Medium | No error reporting service (Sentry, etc.) |
| No pagination | Medium | Logs, entries, data tables will break at scale |
| Legacy `schedule` JSON field | Low | Coexists with new `scheduleType`/`scheduleDays` fields |
| Basic service worker | Low | No Workbox, no advanced caching strategies |
| No bundle size monitoring | Low | Recharts is heavy (~100KB) but acceptable for now |
| Category subvariable type | Low | Backend supports it, UI shows "coming soon" for charts |

### Recommended: Add basic test coverage before major feature work

At minimum:
- API route integration tests (auth, CRUD operations)
- Stats engine unit tests (correlation calculations)
- Critical flow E2E tests (register, create habit, log entry)

---

## 12. Competitive Positioning

### Current positioning: "N=1 Self-Experimentation Platform"

This is strong and differentiated. The About page explains it well. The problem is that the product doesn't fully deliver on this promise yet.

### Competitor comparison

| Feature | Datalyst | Habitica | Streaks | Exist | Bearable |
|---------|----------|----------|---------|-------|----------|
| Custom variables | Yes | No | No | Partial | Yes |
| Correlation engine | Yes | No | No | No | Yes |
| Experiment framework | Yes | No | No | No | No |
| Gamification | Minimal | Heavy | Light | None | None |
| Privacy-first | Yes | No | Yes | No | Partial |
| Free | Yes | Freemium | Paid | Freemium | Freemium |
| Guided protocols | No (gap) | Yes | No | Yes | Yes |

**Key differentiator to protect:** The experiment lab + correlation engine. No competitor combines structured experiments with automated correlation discovery.

**Key gap vs competitors:** Guided onboarding and templates. Bearable and Exist both provide pre-built tracking categories. Datalyst makes users figure it out themselves.

---

## 13. Recommended Roadmap

### Phase 1: Activation & Education (next cycle)

Focus: Get users from sign-up to first meaningful insight.

1. Create 15-20 curated protocol templates across 5 focus areas
2. Build protocol bundles (sets of 2-3 related protocols)
3. Wire bundles into onboarding Step 2 → Step 3 flow
4. Add "insights countdown" to dashboard (X/14 days remaining)
5. Add first-insight celebration modal
6. Fix Portuguese text on Logs page
7. Change min N from 5 to 14 in stats engine
8. Add tooltips to correlation matrix and insights cards
9. Fix empty states with proper CTAs

### Phase 2: Retention (following cycle)

Focus: Keep users coming back daily.

1. Push notification reminders (per time block)
2. Streak freeze / grace period
3. "New insight discovered" notification banner
4. Weekly summary card on dashboard
5. Replace p-value approximation with proper t-distribution
6. Add Bonferroni correction
7. Add breadcrumb navigation
8. Pagination on logs and data tables

### Phase 3: Depth (later)

Focus: Make the science actually rigorous.

1. Lag analysis (t-1 correlations)
2. Experiment results visualization improvements
3. Template management UI (save, edit, delete templates)
4. Data export improvements (PDF reports, shareable insight cards)
5. Add basic automated test suite
6. SEO improvements (sitemap, structured data)

---

## Final Note

The person who audited your statistical engine wasn't wrong about the math. They were wrong about what matters right now. A perfectly calibrated correlation engine is worthless if users churn on day 2 because they didn't know what to track.

**Fix the flow first. Fix the math second. Build new features third.**

The protocol bundles concept is the single highest-leverage thing you can build. It solves onboarding, it solves the "what do I track" problem, it makes the correlation engine produce meaningful results by design, and it gives users a clear reason to come back for 14 days.
