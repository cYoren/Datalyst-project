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

## Phase 3: Multi-Condition & Dose-Finding
- [ ] 3.1 Schema migration for multi-arm
- [ ] 3.2 Generalize blocked randomization to N conditions
- [ ] 3.3 Multi-arm statistics
- [ ] 3.4 API & UI updates

## Phase 4: Blinding & Integrity
- [ ] 4.1 Per-block blind guess collection
- [ ] 4.2 Aggregate Bang Index
- [ ] 4.3 Physical blinding guide

## Phase 5: Results Gating & Transparency
- [ ] 5.1 Gate results behind end date
- [ ] 5.2 Pre-registration immutability
- [ ] 5.3 Enhanced audit report

---

## Review Notes
_(Added after each phase completion)_
