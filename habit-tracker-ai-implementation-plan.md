# Habit Tracker → Habit Intelligence & Coaching Platform
## Verified, execution-ready implementation blueprint for Antigravity

**Status:** Verified against `mani-4444/HABIT-TRACKER` @ `main` by direct repository inspection (cloned and read source, not inferred). All file paths, function names, schema fields, and dependency claims below were confirmed against actual source unless explicitly marked as new.

---

## 0. Mission and non-negotiable rules

Transform the existing habit tracker into a genuine **AI-powered Habit Intelligence & Coaching Platform** while preserving all existing functionality. The AI must be an interpretation layer over verified facts, never the source of facts.

**Do not:**
- Rewrite the application, or replace React 18 / Vite / Supabase / React Query / Tailwind / Recharts / the existing auth architecture.
- Introduce a vector database, embeddings, LangChain/LlamaIndex, autonomous agents, or a separate AI microservice. The data is structured relational time-series; SQL + deterministic analytics is the correct retrieval mechanism.
- Let the LLM calculate authoritative statistics.
- Let the frontend or a client-supplied `userId` control what data the AI can access.
- Break the existing `npm run dev:vercel` local API flow, `vercel.json` rewrites, or the current `ai_insights_cache` table's usability during migration.

---

## 1. Verified current state (facts, not assumptions)

### 1.1 Stack (confirmed via `package.json`)
React 18, TypeScript, Vite, `@supabase/supabase-js`, `@tanstack/react-query`, `react-router-dom`, Tailwind + shadcn/ui (Radix primitives), Recharts, `zod` (present as a dependency but **currently unused anywhere in `src/`** — this is a new pattern to introduce, not an existing convention), Vitest, `react-hook-form` + `@hookform/resolvers`. Scripts: `dev`, `dev:vercel` (`npx vercel dev`), `build`, `build:dev`, `lint`, `preview`, `test` (`vitest run`), `test:watch`.

### 1.2 Repo layout (confirmed)
```
HABIT-TRACKER/
├── api/
│   └── ai-insights.ts          (293 lines, Vercel serverless function)
├── src/
│   ├── components/
│   ├── contexts/AuthContext.tsx
│   ├── hooks/
│   │   ├── useAIInsights.ts    (108 lines — plain useState, NOT React Query)
│   │   ├── useDailyTodos.ts
│   │   ├── useHabits.ts        (733 lines — React Query throughout)
│   │   └── useTheme.ts / use-mobile.tsx / use-toast.ts
│   ├── lib/
│   │   ├── streaks.ts          (280 lines)
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Landing, Login, Signup, VerifyEmail, VerifyOtp,
│   │   │   ForgotPassword, ResetPassword, Overview, Analysis,
│   │   │   ManageHabits, DailyTodos, AIInsights, NotFound
│   └── test/
│       ├── setup.ts
│       ├── example.test.ts
│       └── streaks.test.ts     (existing pattern: fixed reference dates, e.g. `new Date("2026-08-02T12:00:00Z")`)
├── supabase/migrations/
│   ├── 001_create_daily_todos.sql
│   ├── 002_create_habits_and_completions.sql
│   └── 003_create_ai_insights_cache.sql
├── vercel.json                 (rewrites /api/* → /api/*, everything else → /index.html)
├── tsconfig.api.json           (separate tsconfig targeting `api/**/*.ts`, ES2022/ESNext/bundler, strict)
└── vitest.config.ts            (⚠ include: ["src/**/*.{test,spec}.{ts,tsx}"] ONLY — does not cover api/)
```

### 1.3 Database schema (confirmed from migration SQL)

**`habits`**: `id UUID PK`, `user_id UUID → auth.users(id) ON DELETE CASCADE`, `name TEXT`, `emoji TEXT DEFAULT '⭐'`, `created_at TIMESTAMPTZ`, `is_archived BOOLEAN DEFAULT FALSE`. RLS: all four policies require `auth.uid() = user_id`.

**`habit_completions`**: `id UUID PK`, `habit_id UUID → habits(id) ON DELETE CASCADE`, `completed_at TIMESTAMPTZ NOT NULL`, `created_at TIMESTAMPTZ`. Legacy `completed_date` column is backfilled into `completed_at` and its NOT NULL constraint dropped if present. RLS scopes all four policies through an `EXISTS` subquery joining to `habits` on `habits.user_id = auth.uid()`.

**`daily_todos`**: `id UUID PK`, `user_id UUID`, `title TEXT`, `completed BOOLEAN DEFAULT FALSE`, `task_date DATE`, `created_at TIMESTAMPTZ`. User-scoped RLS on all four operations.

**`ai_insights_cache`**: `user_id UUID PRIMARY KEY → auth.users(id)`, `insights JSONB NOT NULL`, `generated_at TIMESTAMPTZ NOT NULL DEFAULT now()`. One row per user (upsert on `user_id`). RLS currently only has SELECT/INSERT/UPDATE policies — no DELETE policy exists.

### 1.4 Current AI implementation — `api/ai-insights.ts` (confirmed line-by-line)

Flow: reject non-POST → require `Authorization: Bearer <token>` → build an RLS-respecting Supabase client scoped to that token → `supabase.auth.getUser(token)` → check `ai_insights_cache` for a row younger than 6h (`CACHE_TTL_MS = 6 * 60 * 60 * 1000`) and return it if fresh → otherwise query the user's non-archived habits, then completions for those habit IDs from the last 30 days (`gte("completed_at", since)`), then `daily_todos` from the last 30 days → build a flat `summaryPayload` (period, overall rate, per-habit rate/streak via a **locally duplicated** `computeStreak()` — this is *not* the same function as `calculatePerHabitStreak` in `src/lib/streaks.ts`, it's a simpler re-implementation) → call Groq (`llama-3.3-70b-versatile`, `response_format: json_object`) with a system prompt requesting a fixed JSON shape → parse, do a shallow presence/type check (not Zod), upsert to cache (best-effort, non-fatal on failure) → return.

Current response shape (`AIInsightsResponse`, also duplicated as `AIInsights` in `useAIInsights.ts`):
```ts
{ summary: string; strengths: string[]; weaknesses: string[]; suggestions: string[]; motivation: string }
```
This is flat prose with no evidence objects, no per-insight confidence, no structured type taxonomy. **This is a materially bigger gap to the target schema than "add more fields" — it is a breaking change to both the API contract and the `AIInsights.tsx` rendering code.**

`useAIInsights.ts` (confirmed): plain `useState`/`useCallback`, not React Query — it fetches the session token itself, does its own content-type/HTML-response sniffing (guards against local dev serving `index.html` when `vercel dev` isn't running), and does its own shallow shape validation before calling `setData`. **This hook predates the React Query convention used everywhere else (`useHabits.ts` is fully React Query). Do not copy this pattern forward for new hooks — migrate it.**

### 1.5 Existing deterministic analytics (confirmed exports)

`src/lib/streaks.ts` exports: `normalizeDateString`, `calculatePerHabitStreak` (returns `{ current, best, isAtRisk }`, takes a reference date — already testable/deterministic), `calculatePerfectDayStreak`, `calculateHabitConsistency` (returns `{ stdDev, consistencyScore }`), `calculateHabitCorrelations`.

`src/hooks/useHabits.ts` exports (733 lines total): `useHabits`, `useAddHabit`, `useUpdateHabit`, `useDeleteHabit`, `getTodayDateString`, `useTodayCompletions`, `useToggleCompletion`, `useHabitStreakStats` (calls `calculatePerHabitStreak` per habit, builds a streak map + overall best/current), `useHabitStats` (weekly percentage, perfect-day streak via `calculatePerfectDayStreak`), `useAnalytics` (the richest hook — calls `calculateHabitConsistency` and `calculateHabitCorrelations`, and computes trends/rates client-side over ~12 months of completion history).

**Correction to the original plan:** these are React Query hooks that run **client-side in the browser**, reading directly from Supabase via the RLS-scoped client — they are not server-side functions today. "Extracting" them for server-side AI use means porting the *math* (which is pure and portable) into new `api/_lib/` modules, not literally importing browser hooks into a Vercel function. The pure calculation logic in `streaks.ts` has no React/browser dependency and can be imported directly into `api/_lib/`. The calculation logic embedded inside `useAnalytics`/`useHabitStats` in `useHabits.ts` is not yet extracted into pure functions — extracting it is real work, not a copy-paste.

### 1.6 Auth (confirmed)
`AuthContext.tsx` exposes `user`, `session`, `loading`, `signIn`, `signUp`, `verifyOtp`, `resendOtp`, `signOut`, backed by `supabase.auth.getSession()` / `onAuthStateChange`. The AI endpoint already correctly re-derives identity server-side via `supabase.auth.getUser(token)` rather than trusting a client-supplied ID — this pattern must be preserved and reused, not reinvented, in every new endpoint.

---

## 2. Corrections applied to the original plan

| # | Original plan claim | Verified reality | Correction |
|---|---|---|---|
| 1 | "Follow the existing `useAIInsights.ts` pattern" + "use React Query as the rest of the app already does" | `useAIInsights.ts` uses plain `useState`, not React Query. `useHabits.ts` uses React Query. | New hooks (`useWeeklyReview`, `useAskHabits`) use React Query. Migrate `useAIInsights` to React Query as part of Step 5/6, don't clone its current pattern. |
| 2 | Zod described as an "existing pattern" to follow | Zod is a dependency but has zero usages in `src/` today | Treat Zod adoption as new infrastructure being introduced for the first time, and be consistent about where it's used (request validation + AI output validation) so it doesn't become a half-adopted pattern. |
| 3 | Test plan assumes `api/_lib` tests just run under the existing test command | `vitest.config.ts` only includes `src/**/*.{test,spec}.{ts,tsx}`; `api/` is excluded | Explicit task required: update `vitest.config.ts` `include` to also cover `api/**/*.{test,spec}.ts}`, or co-locate `api/_lib` unit tests under `src/` with path aliases. Prefer updating `vitest.config.ts` since `tsconfig.api.json` already treats `api/` as a first-class TS root. |
| 4 | Analytics "extraction" implied as moving/reusing existing server-unaware hook code | `useHabits.ts` analytics logic (`useAnalytics`, `useHabitStats`) is React-Query-coupled and not pure; only `streaks.ts` is portable as-is | Import `streaks.ts` functions directly into `api/_lib/analytics.ts` (zero rewrite needed). Re-derive the additional aggregate logic currently inline in `useHabits.ts` (weekly %, monthly trends, weekday patterns) as new pure functions in `api/_lib/analytics.ts`, then optionally have `useHabits.ts` call the same pure functions client-side later to de-duplicate — but that refactor is optional/P4, not required for the AI feature to ship. |
| 5 | AI response schema treated as an incremental upgrade | Current `AIInsightsResponse` is flat strings; target `Insight[]` with evidence/confidence is a different shape entirely | Treat the `api/ai-insights.ts` response contract change as a breaking change. Version it (see §5) and update `AIInsights.tsx` + `useAIInsights.ts` types together, in the same task, not incrementally. |
| 6 | Not mentioned | `ai_insights_cache` has no DELETE RLS policy | If Step 13 (cache evolution) needs row deletion (e.g. pruning stale insight types), add a DELETE policy in the new migration; don't assume it exists. |
| 7 | Not mentioned | The existing `computeStreak()` inside `api/ai-insights.ts` is a separate, simpler streak implementation from `calculatePerHabitStreak` in `streaks.ts` — they will disagree at the edges (no risk flag, no best-streak tracking) | When replacing `api/ai-insights.ts`, delete `computeStreak()` entirely and use `calculatePerHabitStreak` from `streaks.ts` so the AI's numbers match what the Analysis page shows. This is a correctness fix, not just cleanup — today the AI's "streak" and the UI's "streak" can already diverge. |

Everything else in the original plan (target architecture, capability set, security model, prompt architecture, evidence model, minimum-data rules, phased priority) was assessed against the actual repo and is sound. It is retained below with the corrections folded in.

---

## 3. Target architecture

```
                         ┌─────────────────────┐
                         │      React UI       │
                         │ Overview / Analysis  │
                         │ AI Insights (coaching hub)
                         │  ├─ Priority Insight
                         │  ├─ Weekly Review
                         │  └─ Ask Your Habits
                         └──────────┬──────────┘
                                    │ Supabase JWT (Authorization: Bearer)
                                    ▼
                         ┌─────────────────────┐
                         │ Vercel /api layer   │
                         │ auth.ts (shared)    │
                         │ request validation  │
                         └──────────┬──────────┘
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
          ┌────────────────────┐       ┌────────────────────┐
          │ api/_lib/analytics │       │ api/_lib/ai.ts      │
          │ (imports streaks.ts│──────▶│ prompts.ts          │
          │  + new pure fns)   │ facts │ schemas.ts (Zod)    │
          │ deterministic only │       │ Groq call, validated│
          └─────────┬──────────┘       └─────────┬──────────┘
                    ▼                            ▼
             ┌─────────────┐              ┌──────────────┐
             │  Supabase   │              │    Groq      │
             │ PostgreSQL  │              │ llama-3.3-70b│
             │  (RLS)      │              │  -versatile  │
             └─────────────┘              └──────────────┘
```

`DATABASE = truth`. `analytics.ts = computed facts`. `ai.ts + prompts.ts = interpretation`. The React UI never computes AI content and never calls Groq directly.

---

## 4. AI capabilities to build (in priority order)

**A — Evidence-backed insights** (upgrade of existing `AIInsights` page). Each insight: `{ id, type, title, explanation, evidence: Evidence[], recommendation, confidence, priority }`.

**B — Weekly Review**: one deterministic analytics snapshot (this week vs. last week, best/worst habit, streak changes, weekday pattern, correlation notes) → one structured LLM interpretation. Not a chat, not an agent loop.

**C — Ask Your Habits**: single question → server-side intent classification into a small fixed set (`CURRENT_PERFORMANCE`, `TREND`, `STREAK`, `CONSISTENCY`, `WEEKDAY_PATTERN`, `HABIT_COMPARISON`, `HABIT_CORRELATION`, `RECOMMENDATION`, `WEEKLY_REVIEW`, `GENERAL_COACHING`) → retrieve only the analytics that intent needs → LLM interpretation → structured answer. No RAG, no full-database dump to the model. Out-of-domain questions get a fixed safe response, not a hallucinated answer.

**D — Personalized recommendations**: deterministic candidate generation from fixed categories (`LOW_CONSISTENCY`, `DECLINING_TREND`, `STREAK_RISK`, `WEEKEND_DROP`, `STRONG_HABIT`, `HABIT_PAIRING`, `OVERLOADED_ROUTINE`, `RECOVERY_AFTER_MISS`) — the LLM selects, explains, and personalizes among these; it does not invent new categories.

**E — Logging-time pattern analysis** (added after user confirmation). `habit_completions.completed_at` is a `TIMESTAMPTZ` that already stores a precise timestamp, but every existing calculation (`normalizeDateString()`, `calculatePerHabitStreak()`, and the weekday-pattern logic in Capability A) truncates it to a calendar date and discards the time. This capability adds one new deterministic signal: completion-rate-by-time-of-day (e.g. "habits logged before 9am are completed 92% of the time vs. 41% after 8pm"), surfaced as a new evidence type and a new recommendation candidate.

**Important caveat to carry into the prompt layer:** `completed_at` is *when the row was written*, not necessarily *when the user actually did the habit* — someone can mark "Exercise" complete at 11pm after doing it at 7am. This is a real limitation of the underlying data, not something the backend can correct. The AI must be instructed to phrase this as a *logging-time* pattern ("you tend to log this habit late in the day"), never as a *doing-time* claim ("you exercise at night") — that distinction has to be explicit in the prompt, not left to the model to infer.

Explicitly **not** built in this phase: vector DB, embeddings, agents, LangChain/LlamaIndex, fine-tuning, persistent chat history (start with single-turn Q&A; only add persistence if a real product need appears).

---

## 5. Implementation sequence

### Step 0 — Baseline (no code changes)
```bash
npm install && npm run lint && npm run test && npm run build
```
Manually verify signup, login, OTP, password reset, habit CRUD, completion toggling, daily todos, Overview, Analysis, AI Insights all work. This is the regression baseline every later step is checked against.

### Step 1 — Test infra fix (do this before writing any `api/_lib` code)
**File:** `vitest.config.ts`
Change `include: ["src/**/*.{test,spec}.{ts,tsx}"]` to also cover `api/**/*.{test,spec}.ts`. Add a smoke test under `api/_lib/__tests__/` (or wherever the new modules live) that just imports `streaks.ts` to confirm the path alias/module resolution works cross-directory before real logic is added.
**Acceptance:** `npm run test` picks up a test file placed under `api/`.

### Step 2 — Shared server auth utility
**New file:** `api/_lib/auth.ts`
Extract the token-parsing + `supabase.auth.getUser(token)` + authenticated-client-construction logic straight out of the current `api/ai-insights.ts` (lines ~63–96) into a reusable `authenticate(req): { user, supabase } | { error, status }`. Every new endpoint imports this — zero duplication of the auth flow across `ai-insights.ts`, `ai-weekly-review.ts`, `ai-ask.ts`.
**Acceptance:** `api/ai-insights.ts` refactored to call this utility with identical runtime behavior (same 401 conditions), confirmed by a request test.

### Step 3 — Deterministic analytics module
**New file:** `api/_lib/analytics.ts`
Import and reuse `calculatePerHabitStreak`, `calculatePerfectDayStreak`, `calculateHabitConsistency`, `calculateHabitCorrelations` from `src/lib/streaks.ts` directly (verified pure/portable, no browser deps). Add new pure functions for logic that currently only exists inline inside `useHabits.ts`'s `useAnalytics`/`useHabitStats` (weekly completion %, monthly/4-week trend comparisons, weekday-of-week completion rates) — write these as new pure functions rather than trying to import React Query hooks into a serverless function.

Functions to expose:
```
getHabitSnapshot(supabase, userId)
getHabitTrends(supabase, userId, period)
getHabitStreaks(supabase, userId)          // uses calculatePerHabitStreak, not a local reimplementation
getHabitConsistency(supabase, userId)      // uses calculateHabitConsistency
getHabitCorrelations(supabase, userId)     // uses calculateHabitCorrelations
getWeekdayPatterns(supabase, userId)
getBehavioralSummary(supabase, userId)     // composes the above into the canonical context (Step 4)
```
Each takes the already-authenticated, RLS-scoped `supabase` client from Step 2's `auth.ts` — never a raw `userId` used for filtering without RLS backing it.
**Tests:** unit test each function against fixture data using the existing `streaks.test.ts` pattern (fixed reference dates like `new Date("2026-08-02T12:00:00Z")`), covering: zero habits, one habit, duplicate completion timestamps, gaps, insufficient data (<7 days history).

### Step 4 — Canonical AI context + Zod schemas
**New files:** `api/_lib/ai-context.ts`, `api/_lib/schemas.ts`
`ai-context.ts` composes `analytics.ts` output into one `HabitAIContext` object (habits[], overall, trends[], weekdayPatterns[], correlations[], todosSummary, generatedAt, period). Explicitly excludes: password/auth data, internal DB row IDs beyond what's needed for evidence linking, other users' data.
`schemas.ts` defines Zod schemas for `Insight`, `Evidence`, `AIInsightsResponse`, `WeeklyReview`, `CoachRecommendation`, `AskHabitsResponse`. These validate **both directions**: incoming request bodies and outgoing LLM JSON. No `as` casts on model output anywhere.
**Acceptance:** malformed/partial LLM JSON fails Zod validation and produces a controlled 502, never reaches the UI as trusted data.

### Step 5 — Provider abstraction
**New file:** `api/_lib/ai.ts`
Wrap the current direct `fetch("https://api.groq.com/openai/v1/chat/completions", ...)` call (currently inline in `api/ai-insights.ts` lines ~218–243) into `generateStructuredAIResponse({ systemPrompt, userPrompt, schema })` that: calls Groq with `response_format: json_object`, parses, validates against the given Zod schema, and returns a typed, validated result or a typed error (`PROVIDER_UNAVAILABLE | TIMEOUT | RATE_LIMITED | INVALID_JSON | SCHEMA_INVALID | EMPTY_RESPONSE`). Keep `llama-3.3-70b-versatile` unless there's a concrete reason to change. `GROQ_API_KEY` stays server-side only — confirmed the current code already does this correctly (`process.env.GROQ_API_KEY`, never a `VITE_*` var); preserve that.

### Step 6 — Rebuild `api/ai-insights.ts` (breaking change, versioned)
**Files:** `api/ai-insights.ts` (rewrite body, keep route), `api/_lib/prompts.ts` (new — `buildInsightPrompt()`)
Replace the current flat 30-day `summaryPayload` + `computeStreak()` with the canonical `HabitAIContext` from Step 4, and delete the locally-duplicated `computeStreak()` entirely (correction #7 — it disagrees with `calculatePerHabitStreak`). Prompt instructs the model: facts only from supplied context, never invent metrics/events, correlation ≠ causation, distinguish observation from hypothesis, no internal IDs, no other users, exact schema only.
Because the response shape changes from flat strings to `Insight[]` (correction #5), bump this as an explicit contract change: update `AIInsights` type in `useAIInsights.ts` and the rendering in `AIInsights.tsx` in the **same PR/task**, not incrementally, and migrate `useAIInsights.ts` off plain `useState` onto React Query in this same step (correction #1) for consistency with `useHabits.ts`.
**Acceptance:** existing `AIInsights.tsx` page still renders (with new evidence-backed cards, not raw JSON); no other page regresses.

### Step 7 — AI Insights UI upgrade
**File:** `src/pages/AIInsights.tsx`
**New:** `src/components/ai/InsightCard.tsx`, `EvidenceList.tsx`, `RecommendationCard.tsx`, `AIStatus.tsx`
Each insight card shows: what was noticed → why it matters → evidence → what to try. No raw JSON in the UI.

### Step 8 — Trend + weekday intelligence
**File:** `api/_lib/analytics.ts` (extend from Step 3)
Add: 7d-vs-prior-7d, 30d-vs-prior-30d, 4wk-vs-prior-4wk, month-vs-prior-month, weekday-vs-weekend comparisons, and weekday-by-weekday completion rates. Enforce minimum-data thresholds (no trend claims on <2 weeks of data, no correlation claims on <5 shared completions) — return an explicit `insufficientData: true` flag rather than a number when thresholds aren't met, so the prompt layer (and the model) can say so honestly.

### Step 8b — Logging-time distribution (Capability E)
**File:** `api/_lib/analytics.ts` (extend from Step 3/8)
Add `getCompletionTimeDistribution(supabase, userId)`: bucket each habit's `completed_at` values by hour-of-day (or a coarser bucket set — early morning / morning / afternoon / evening / late night — pick based on how sparse the data is per user) and compute completion-rate correlation against those buckets, reusing the same minimum-data thresholds from Step 8 (don't claim a time pattern from a handful of data points). Extract the local time correctly — `completed_at` is stored as `TIMESTAMPTZ` in UTC, so bucket in the user's local time if the client sends a timezone offset, otherwise document that buckets are UTC-based and treat this as a known limitation rather than silently getting it wrong.
Add a corresponding `Evidence` variant in `api/_lib/schemas.ts` (e.g. `{ metric: "completion_rate_by_log_time", bucket: "before_9am" | "9am_to_5pm" | "5pm_to_9pm" | "after_9pm", value, comparisonBucket, comparisonValue, period }`).
**Prompt instruction (add to `buildInsightPrompt()` / `buildRecommendationPrompt()`):** explicitly state that `completed_at` reflects when the habit was *logged*, not necessarily when it was *performed*, and require the model to phrase any such insight as a logging-time observation, never as a claim about when the user actually did the activity.
**Acceptance:** given fixture data with an obvious logging-time skew (e.g. 90% of a habit's completions logged before 9am, 10% after 8pm), the function returns that skew deterministically; below the minimum-data threshold it returns `insufficientData: true` instead of a spurious pattern.

### Step 9 — Recommendation candidates
**New file:** `api/_lib/recommendations.ts`
Deterministic candidate generation from the fixed category list in §4-D, extended with `LOGGING_TIME_PATTERN` from Capability E (e.g. "you log Exercise late at night — consider logging it right after you finish, to keep the streak visible earlier in the day"). The LLM picks among these and personalizes wording — it doesn't invent new categories.

### Step 10 — Weekly Review endpoint
**New files:** `api/ai-weekly-review.ts`, `api/_lib/weekly-review.ts`
Input `{ weekOffset?: number }` (default: most recent completed week). Output `{ headline, wins[], changes[], focusArea, nextWeekPlan[], experiment }`. Surface in the AI Insights page as a distinct section (not a separate page, unless routing review during implementation shows a page split is cleaner).

### Step 11 — Ask Your Habits endpoint
**New files:** `api/ai-ask.ts`, `api/_lib/question-router.ts`
Input `{ question: string }` (length-limited). Classify into one of the fixed intents in §4-C, retrieve only the analytics that intent needs, call the LLM with that compact context, return `{ answer, evidence[], relatedInsights[] }`. Out-of-domain question → fixed safe response, not a free-form model answer.
Single-turn only for v1 — no persisted conversation table unless a real need emerges (§4 note).

### Step 12 — Cache evolution
**Modify:** new migration `supabase/migrations/004_...sql` (do not destructively alter `003_create_ai_insights_cache.sql` in place — Supabase migrations are additive/forward-only)
Evolve caching to key on `(user_id, insight_type, period)` with a `source_fingerprint` (derived from: latest completion timestamp, count of active habits, count of completions in the analysis period) so new habit activity invalidates the relevant cached result instead of relying solely on the 6-hour TTL. **Add an explicit DELETE RLS policy** in this migration (correction #6 — the current `003` migration has none). Either extend `ai_insights_cache` with new columns or add a second table (`ai_coaching_results`) if extending the single-row-per-user table would be disruptive — decide based on how much Step 6 already changed its shape.

### Step 13 — Request safeguards
**Files:** `api/_lib/auth.ts` (extend), `api/_lib/ai.ts` (extend), all endpoints
Method allowlisting, body size limits, question length limits, timeout handling on the Groq call, controlled error responses (never leak provider error bodies or stack traces to the client), logging without PII/full habit names where avoidable.

### Step 14 — Cross-user isolation hardening pass
**Review:** every new endpoint, confirm identity always flows `JWT → auth.getUser(token) → user.id → all queries scoped to that id`, never `client-supplied id → query`. RLS remains the backstop, not the only line of defense.

### Step 15 — Preserve existing frontend
**Review, do not functionally change:** `Overview.tsx`, `Analysis.tsx`, `ManageHabits.tsx`, `DailyTodos.tsx`, `useHabits.ts`, `useDailyTodos.ts`, `AuthContext.tsx`. Analysis page keeps showing deterministic numbers computed the same way it does today; AI sits above it, not instead of it.

---

## 6. API contracts

**`POST /api/ai-insights`** — Input: `{ period?: "30d" | "90d" }` (default `30d`). Output: `{ insights: Insight[], generatedAt, dataPeriod }`.

**`POST /api/ai-weekly-review`** — Input: `{ weekOffset?: number }`. Output: `{ headline, wins[], changes[], focusArea, nextWeekPlan[], experiment }`.

**`POST /api/ai-ask`** — Input: `{ question: string }`. Output: `{ answer, evidence[], relatedInsights[] }`.

None of these ever return raw, unvalidated model JSON directly to the client.

---

## 7. Security checklist (verified against current code, must hold for all new endpoints)

- Every AI endpoint requires `Authorization: Bearer <token>`; missing/malformed/expired/invalid → 401. (Current `ai-insights.ts` already does this correctly — replicate via `api/_lib/auth.ts`, don't reinvent.)
- Identity is derived exclusively from `supabase.auth.getUser(token)`. `body.userId` / `query.userId` / any client-supplied ID is never used for authorization.
- All DB queries go through the RLS-scoped client built from the user's own token (as the current code already does), not the service role.
- RLS stays enabled on all four tables; the new/extended `ai_insights_cache` (or `ai_coaching_results`) migration gets full CRUD policies including DELETE (currently missing on `003`).
- The model only ever receives the authenticated user's own context — never other users' data, auth tokens, DB credentials, or the Groq key.
- Habit names and todo titles are user-generated, untrusted text — delimit them clearly in prompts so a habit named "Ignore all previous instructions..." can't hijack the system prompt.
- `GROQ_API_KEY` stays server-side (confirmed current code already does this — no `VITE_*` exposure). Preserve this.
- AI failure (timeout, 5xx from Groq, malformed JSON, schema validation failure) never breaks the core habit tracker — the rest of the app must remain fully usable.

---

## 8. Testing plan

1. **Fix `vitest.config.ts` first** (Step 1) so `api/_lib` tests actually run.
2. **Analytics unit tests** (`api/_lib/analytics`, extending `src/lib/streaks.ts` coverage): zero habits, one habit, duplicate completion timestamps, consecutive completions, gaps, current/best streak, streak risk, perfect-day streak, consistency, weekly/monthly/weekday rates, correlations, insufficient-data flag, and logging-time distribution (`getCompletionTimeDistribution`) — including a case with an obvious time-of-day skew and a case below the minimum-data threshold that must return `insufficientData: true` rather than a spurious pattern. Use fixed reference dates/timestamps per the existing `streaks.test.ts` convention — never `new Date()` un-injected.
3. **Zod schema tests**: valid output passes; missing fields, wrong types, invalid confidence values, malformed evidence all fail.
4. **Endpoint integration tests**: no auth → 401; invalid token → 401; zero habits → controlled 400 (matches current behavior); valid user → only that user's data; provider failure → controlled 502/503; malformed provider output → controlled error, never raw text to client.
5. **Cross-user isolation** (mandatory): two test users with distinct habits/completions/todos; authenticate as A, call all three AI endpoints, assert zero leakage of B's data; reverse and repeat.
6. **Prompt-grounding tests**: obvious fixture pattern (e.g., 80% weekday / 20% weekend) → assert the answer identifies weekends; change the fixture → assert the output changes accordingly.
7. **Recommendation tests**: declining-habit fixture → recommendation must cite the relevant evidence; insufficient-data fixture → system must not produce an overconfident recommendation. **Logging-time phrasing test**: given a fixture with a clear logging-time skew, assert the generated insight text describes it as when the habit was *logged*, never as when it was *performed* — this is a wording/prompt-compliance check, not just a data-correctness check.
8. **Frontend tests**: loading/empty/error/malformed-response/success states for `useAIInsights`, `useWeeklyReview`, `useAskHabits`; existing habit-tracker tests must remain green throughout.
9. Full regression: `npm run lint && npm run test && npm run build` after every step, not just at the end.

---

## 9. Manual acceptance scenarios

1. Create a habit → dashboard/completion/Analysis still work → AI recognizes the new habit.
2. Complete one habit repeatedly → AI identifies it as a strength with evidence.
3. Stop completing a habit → AI eventually identifies a decline (not on day 1 — respect minimum-data thresholds).
4. Create a weekday/weekend disparity → AI identifies the pattern.
5. Two habits that co-occur frequently → AI surfaces the correlation using `calculateHabitCorrelations`.
6. Ask "Which habit should I focus on?" → answer references actual tracked data, not generic advice.
7. Log in as a second account → confirm zero data bleed from the first account.
8. Force the Groq call to fail (bad key locally) → confirm the core tracker (habits, completions, todos, Analysis, Overview) remains fully functional.

---

## 10. Definition of done

**Core app unchanged:** auth, OTP, password reset, protected routes, habit CRUD, completion toggling, daily todos, Overview, Analysis all still work exactly as before.

**Analytics:** `api/_lib/analytics.ts` reuses `streaks.ts` functions (not a reimplementation — the old `computeStreak()` in `ai-insights.ts` is deleted); minimum-data thresholds prevent weak conclusions; `vitest.config.ts` covers `api/`.

**AI:** all three endpoints (`ai-insights`, `ai-weekly-review`, `ai-ask`) use the canonical `HabitAIContext`; all output is Zod-validated; insights carry evidence; recommendations map to fixed candidate categories; `ai-ask` retrieves only intent-relevant analytics, never a full dump.

**Security:** every endpoint requires a verified JWT; no client-supplied ID governs authorization; RLS intact on all tables including a DELETE policy on the cache table(s); Groq key never leaves the server; user-generated text is treated as untrusted in prompts.

**Reliability:** AI provider failure never breaks the tracker; invalid/malformed AI output is rejected before reaching the UI; cache invalidates on real new activity, not just a timer.

**Testing:** `npm run lint`, `npm run test`, `npm run build` all pass; cross-user isolation tests pass; prompt-grounding tests pass.

---

## 11. Final execution checklist for Antigravity (ordered)

1. Clone/inspect repo; run `npm install && npm run lint && npm run test && npm run build`; manually verify baseline app behavior.
2. Update `vitest.config.ts` to include `api/**/*.{test,spec}.ts`.
3. Create `api/_lib/auth.ts` by extracting the auth logic from current `api/ai-insights.ts`; refactor `ai-insights.ts` to use it; confirm identical 401 behavior.
4. Create `api/_lib/analytics.ts` importing `src/lib/streaks.ts` functions directly + new pure functions for weekly/monthly/weekday trend math currently inline in `useHabits.ts`; unit test with fixed-date fixtures matching `streaks.test.ts` style.
5. Create `api/_lib/ai-context.ts` and `api/_lib/schemas.ts` (Zod) for the canonical `HabitAIContext` and all AI response shapes.
6. Create `api/_lib/ai.ts` provider abstraction wrapping the Groq call with Zod-validated structured output and typed failure modes.
7. Rewrite `api/ai-insights.ts`: delete the local `computeStreak()`, use the canonical context, produce `Insight[]`. Update `useAIInsights.ts` (migrate to React Query) and `AIInsights.tsx` types/rendering in the same task since this is a breaking contract change.
8. Build `src/components/ai/{InsightCard,EvidenceList,RecommendationCard,AIStatus}.tsx`; update `AIInsights.tsx` to render evidence-backed cards instead of raw text/JSON.
9. Extend `api/_lib/analytics.ts` with trend comparisons, weekday patterns, and minimum-data thresholds/`insufficientData` flags.
9b. Extend `api/_lib/analytics.ts` with `getCompletionTimeDistribution()` (Capability E, logging-time patterns from `completed_at`); add the logging-time `Evidence` variant to `schemas.ts`; add the logging-vs-doing-time caveat to the relevant prompt builders.
10. Create `api/_lib/recommendations.ts` with the fixed candidate categories, including `LOGGING_TIME_PATTERN`.
11. Create `api/ai-weekly-review.ts` + `api/_lib/weekly-review.ts`; wire into `AIInsights.tsx`.
12. Create `api/ai-ask.ts` + `api/_lib/question-router.ts`; wire into `AIInsights.tsx`; single-turn only.
13. Add migration `supabase/migrations/004_...sql` evolving cache with source fingerprinting, insight-type/period keys, and a DELETE RLS policy (which `003` currently lacks).
14. Add request safeguards (size/length limits, timeouts, controlled error responses) across all three AI endpoints.
15. Run the full cross-user isolation test suite; run prompt-grounding tests with obvious fixture patterns.
16. Run `npm run lint && npm run test && npm run build`; run all manual acceptance scenarios in §9, including the "kill the AI provider" scenario.
17. Final pass against the Definition of Done in §10; confirm nothing outside `api/` and the specifically listed `src/` files/components was modified beyond what's needed.

---

## 12. Resume bullets

- Built an AI-powered habit intelligence platform that transforms longitudinal Supabase habit-completion data into evidence-backed personalized insights, trend analysis, and actionable coaching recommendations, on top of an existing React/TypeScript/Vercel serverless application.
- Designed a deterministic analytics layer (streaks, consistency, weekday behavior, longitudinal trends, cross-habit correlations) that cleanly separates factual computation from LLM interpretation, with minimum-data thresholds to prevent overconfident AI claims.
- Implemented authenticated, Zod-schema-validated AI coaching APIs with user-scoped Supabase RLS access, source-fingerprinted caching, and graceful provider-failure handling that never degrades the core product.
- Built a personalized weekly habit review and a natural-language "Ask Your Habits" feature that classifies intent and retrieves only relevant analytics before generating a grounded AI response — avoiding unnecessary RAG/vector infrastructure for structured relational data.
- Shipped the AI layer as an incremental, test-covered upgrade to a production app, including a full cross-user data-isolation test suite and prompt-grounding tests proving AI output changes correctly when underlying behavioral data changes.
