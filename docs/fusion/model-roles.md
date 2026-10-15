# Model roles (compiled 2026-10-15)

Evidence behind the `fusion` skill's **Roles**, **Models**, and **Effort** sections in
[SKILL.md](../../skills/fusion/SKILL.md). The table routes; this file explains why.

The skill runs on the user's personal subscriptions: **Claude Pro** (Claude Code), **ChatGPT Plus**
(Codex), and **the X Subscription** (Grok Build, plus Cursor access to the Grok and Composer
models; it replaced SuperGrok on 2026-10-13 [U4]).

Conventions:
- Figures as published by the cited source around the date shown. "Vendor" = self-reported by
  the model maker. "Unknown" = not found; nothing invented.
- Different benchmark versions and harnesses are **not** directly comparable: Terminal-Bench
  2.0/2.1 ≠ 4.0; TB4.0 rows are model+harness pairs; Claude Code/Codex ≠ mini-SWE-agent ≠ OpenHands.
- Claude rows on Vals and Artificial Analysis include attempts that Anthropic's safeguards handed
  to an older Claude model ("fallback-assisted"), which flatters some Claude scores (see
  [Refusals](#refusals-and-fallback)).

## What each subscription offers

Checked against the local CLIs on 2026-10-14 as well as the sources. Limits are in
[Quotas](#quotas).

- **Claude Pro → Claude Code** (T3 `claudeAgent`). Opus 5.5, Sonnet 5.5, Haiku 5.5. Opus 5.5 is
  included on Pro since 2026-09-22 [P1,P2]; Fable 5.1 is not in Pro's limits (usage credits only)
  [P2], so the skill leaves it out. Claude Code and chat share one quota: a rolling 5-hour window
  plus weekly caps [P3,P4,Q4].
- **ChatGPT Plus → Codex** (T3 `codex`). `codex debug models` lists gpt-6.1-sol, gpt-6-astra,
  gpt-6-sol, gpt-6-luna, and the older 5.6 family. gpt-6.1-sol reached Plus in Codex on 2026-09-29;
  gpt-6-astra reached Plus in Codex in early September [O2,O3]. Plus has a 5-hour window and weekly
  caps shared between Codex and ChatGPT Work, restored on 2026-08-25 [O4]. Ultrafast tiers are not
  on Plus [O2].
- **X Subscription → Grok Build** (T3 `grok`). `grok models` lists grok-4.7 (default),
  grok-4.7-build-fast, grok-4.6, grok-4.5. Build-fast is the same model at 2× speed and 2× token
  price [X1]; the user has hidden it in T3, so the skill doesn't use it. Composer 2.5 was announced
  for Grok Build on 2026-06-01 but later reports say it is gone from the model list [X2,X3]; the
  local list confirms.
- **Cursor** (T3 `cursor`, via the Cursor SDK). Grok 4.7, 4.6, 4.5, and Composer 2.5 sit in the
  "Cursor Models" pool, with "significantly more included usage" than third-party models [U1].
  The user's Cursor access comes from the X Subscription, launched 2026-10-13, which bundles
  Grok, Cursor, and X Premium; "Grok and Cursor usage draw from the same included pool" [U4], so
  grok-4.7 and composer-2.5 share one quota. (Before it, a SuperGrok link granted only Grok Bot
  usage in Cursor and Composer wasn't part of Grok plans [U2,X3].) In T3 the user has hidden every
  Cursor model except `composer-2.5` (settings checked 2026-10-14: `composer-2`, `grok-4.7`, and 43
  others hidden), so composer-2.5 is the only Cursor model the skill uses. Trust what
  `orchestrator_capabilities` lists.

## Models

| Model | Harness | List $ per 1M in / out | Context | Coding signals | AA Intelligence Index |
|---|---|---|---|---|---|
| **opus-5.5** | Claude Code | $4 / $20 [A1] | 1M | TB4.0 64.85% in Claude Code (#1) [T1]; vendor SWE-bench Pro 89.9% [A4] | 58 [A4] |
| **sonnet-5.5** | Claude Code | $2 / $10 [A1] | 1M | TB4.0 61.82% in Claude Code (#2) [T1]; vendor SWE-bench Pro 81.3% [A3] | 56 (max) [A2] |
| **haiku-5.5** | Claude Code | $0.10 / $0.50 (≤100k prompt) [A1] | 1M | TB4.0 32.8% (AA, max) [A2]; vendor SWE-bench Pro 64.8% [A3] | 43 (max) [A2] |
| gpt-6-astra (not used) | Codex | unknown here | 1M [O6] | TB4.0 58.18% max, 57.88% high, 54.24% medium in Codex (#3) [T1] | 61 (max), 60 (high) [O6] |
| **gpt-6.1-sol** | Codex | $2 / $10 (≤272k) [O1] | 1M | TB4.0 58.18% max in Codex [T1]; Codex: "near-Astra performance at a lower cost" (local model list) | 52 [O1] |
| **grok-4.7** | Grok Build | $2 / $6; Fast $4 / $12 (Cursor) [U1,U3] | 256k, 500k long [U3] | TB4.0 37.58% in Grok Build, xhigh [T1]; TB2.1 76.0% [X1] | unknown (Grok 4.6 high: 61) [O6] |
| **composer-2.5** | Cursor | $0.50 / $2.50; Fast $3 / $15 [U1] | 200k [X2,V13] | vendor TB2.0 69.3%, SWE-bench Multilingual 79.8% ≈ Opus 4.7 [K1,K2]; Vals SWE-bench 79.6 (#25 of 88) [V13]; no TB4.0 row | unknown |

Not used, each compared inside its own price class:
- gpt-6-astra: costs 5× gpt-6.1-sol's Codex credits per token [O9], and the user excluded it.
- gpt-6-sol (TB4.0 49.39%) loses to gpt-6.1-sol (58.18%) at the same $2/$10 list price [T1,O7].
- gpt-6-luna ($0.10/$0.50, TB4.0 16.36%) loses to haiku-5.5 at that price (32.8%) [T1,A1,A2,O7].
- grok-4.6 (20.30%) and grok-4.5 (12.42%) lose to grok-4.7 [T1].

## Harness

Each model runs in its vendor's own harness, the one its TB4.0 row was measured in: Claude models
in Claude Code, GPT models in Codex, grok-4.7 in Grok Build [T1]. composer-2.5 runs in the Cursor
agent, its native harness, with no TB4.0 row. Rank by the model scores, trust the gates.

## Effort changes the ranking

Headline scores are max-effort runs (opus-5.5 and sonnet-5.5 at max, grok-4.7 at xhigh [T1]); the
skill runs children at `low`/`medium`/`high` and names `xhigh` only for some roles and on
escalation. Claude Code defaults Opus 5.5, Sonnet 5.5 and Haiku 5.5 to `medium` [A10].

### Native CLIs: Artificial Analysis Coding Agent Index

The Coding Agent Index runs each model in its own CLI and averages three benchmarks: DeepSWE v1.1
(113 long-horizon repo tasks), SWE-Atlas-QnA (124 codebase questions), and Terminal-Bench 4.0
(66 tasks) [C1]. The values below come from the data embedded in the page (accessed 2026-10-15).
Cost is the mean API-list $ per task. Opus 5.5 was run here only at max.

| Agent (effort) | Index | DeepSWE | SWE-Atlas-QnA | TB4.0 | $ / task | Wall time / task | Tokens / task (out) |
|---|---|---|---|---|---|---|---|
| Codex gpt-6.1-sol (low) | 57.2 | 67.6 | 55.1 | 49.0 | 0.50 | 8.6 min | 1.7M (15k) |
| Codex gpt-6.1-sol (medium) | **61.4** | **72.0** | 60.8 | 51.5 | 0.70 | 10.9 min | 2.3M (22k) |
| Codex gpt-6.1-sol (high) | 60.1 | 70.5 | 60.0 | 50.0 | 0.89 | 13.3 min | 2.8M (29k) |
| Codex gpt-6.1-sol (xhigh) | 62.9 | **73.2** | 61.0 | 54.5 | 1.04 | 15.5 min | 3.2M (35k) |
| Codex gpt-6.1-sol (max) | 60.1 | 69.6 | 57.8 | 53.0 | 1.55 | 24.4 min | 4.0M (62k) |
| Claude Code sonnet-5.5 (low) | 42.1 | 62.0 | 39.0 | 25.3 | 0.48 | 6.3 min | 1.0M (16k) |
| Claude Code sonnet-5.5 (medium) | 45.9 | 65.5 | 44.9 | 27.3 | 0.62 | 8.5 min | 1.3M (21k) |
| Claude Code sonnet-5.5 (high) | 55.0 | 66.7 | 56.5 | 41.9 | 1.24 | 12.3 min | 2.7M (41k) |
| Claude Code sonnet-5.5 (xhigh) | 62.9 | 68.4 | 62.1 | 58.1 | 3.33 | 27.0 min | 7.1M (126k) |
| Claude Code sonnet-5.5 (max) | **68.4** | **72.0** | **66.9** | **66.2** | 14.19 | 87.4 min | 27.7M (601k) |
| Claude Code opus-5.5 (max) | 66.0 | 68.4 | 66.4 | 63.1 | 13.04 | 64.5 min | 15.6M (333k) |
| Claude Code haiku-5.5 (medium) | 33.6 | 47.5 | 41.7 | 11.6 | 0.23 | 14.0 min | 3.5M (67k) |
| Claude Code haiku-5.5 (xhigh) | 41.4 | 49.0 | 51.6 | 23.7 | 0.61 | 25.9 min | 7.1M (189k) |
| Grok Build grok-4.7 (xhigh) | 56.3 | 72.6 | 62.9 | 33.3 | 8.82 | 39.2 min | 14.3M (123k) |

- **At the skill's working efforts, gpt-6.1-sol leads sonnet-5.5 on all three benchmarks.** At
  medium the scores are DeepSWE 72.0 vs 65.5, QnA 60.8 vs 44.9, and TB4.0 51.5 vs 27.3, for about
  the same $ per task (0.70 vs 0.62) [C1]. Sonnet only catches up at xhigh, where the two tie
  (62.9) and sonnet costs 3.2× more; it leads only at max.
- gpt-6.1-sol's effort curve is flat: max scores below xhigh and medium [C1]. OpenAI reports the
  same shape on DeepSWE (high 75.2%, xhigh/max 71.9%; vendor, secondhand) [O8]. sonnet-5.5's
  curve is steep [C1].
- grok-4.7 matches gpt-6.1-sol on DeepSWE and QnA, but scores 33.3 on TB4.0 [C1].

### Opus 5.5 below max

Artificial Analysis has no Coding Agent Index runs of opus-5.5 below max, but its Intelligence
Index ran all four Claude/GPT models at every effort [C3]. Those runs include TB4.0, through
Artificial Analysis's own setup rather than the vendor CLIs, so the scores differ from the table
above (opus max 59.6 here vs 63.1 in Claude Code). Use them for comparisons *within* this table.

| Effort | opus-5.5: Index / TB4.0 / $ per TB4 task | sonnet-5.5 | gpt-6.1-sol | haiku-5.5 |
|---|---|---|---|---|
| low | 42.3 / 31.3 / $2.08 | 35.9 / 20.7 / $1.28 | 42.1 / 30.8 / $0.38 | 29.5 / 12.6 / $0.12 |
| medium | 51.2 / **52.5** / $4.04 | 40.8 / 29.8 / $1.58 | 47.8 / 48.0 / $0.61 | 34.5 / 15.2 / $0.19 |
| high | 53.6 / **56.6** / $5.12 | 46.8 / 43.9 / $2.19 | 50.2 / 51.5 / $0.83 | 37.8 / 21.7 / $0.33 |
| xhigh | 56.0 / 59.6 / $8.78 | 51.9 / 57.1 / $6.08 | 51.0 / 54.0 / $1.03 | 41.2 / 29.3 / $0.46 |
| max | 57.6 / 59.6 / $13.11 | 56.0 / **63.6** / $12.65 | 51.8 / 56.1 / $1.82 | 43.4 / 32.8 / $0.65 |

Mean Intelligence Index cost per task (all ten evals) [C3]:

| Model | low | medium | high | xhigh | max |
|---|---|---|---|---|---|
| opus-5.5 | $0.55 | $1.34 | $1.82 | $3.46 | $5.98 |
| sonnet-5.5 | $0.35 | $0.48 | $0.88 | $2.01 | $5.46 |
| gpt-6.1-sol | $0.13 | $0.21 | $0.32 | $0.39 | $0.72 |
| haiku-5.5 | $0.02 | $0.05 | $0.08 | $0.12 | $0.21 |

SciCode (scientific code) [C3]:

| Model | medium | max |
|---|---|---|
| opus-5.5 | 59.3 | 66.9 |
| sonnet-5.5 | 52.9 | 61.0 |
| gpt-6.1-sol | 53.2 | 54.2 (55.8 best, at high) |

Vendor effort sweeps (Anthropic-internal, plain API agent, not Claude Code) [A8]:

| Benchmark | Model | low | medium | high | xhigh |
|---|---|---|---|---|---|
| SWE-bench Pro subset, 478 tasks (score, $/task) | opus-5.5 | 87.4%, $0.11 | 92.8%, $0.21 | 95.3%, $0.29 | 96.7%, $0.74 |
| | sonnet-5.5 | — | ~80.6% (7 pts below high) | 87.6% | — |
| Internal repo tasks, 370 tasks (solved, $/attempt) | opus-5.5 | 74.8%, $0.35 | 86.6%, $0.84 | 88.4%, $1.38 | 91.1%, $4.11 |
| | sonnet-5.5 | — | 62.7%, $0.16 | 77.8%, $0.33 | — |

The same source also reports:
- Opus 5.5 at `low` matched Sonnet 5.5 at `high` on SWE-bench Pro within noise, for about 7% more
  per solved task.
- At their defaults, opus `medium` vs sonnet `high`, Opus solved about 5 points more for about
  twice the cost.
- Running Opus at `low` and re-running its failures at `high` solved about 97% for about $0.17,
  vs 95.3% for $0.29 running everything at `high`.

Anthropic's launch post (vendor) says medium Opus 5.5 scores 54.6% on FrontierCode, above its
own 54.4% at max, and 52.5% on CursorBench vs 57.8% at peak [A5].

### What the effort data shows

- **opus-5.5 vs gpt-6.1-sol, same effort, terminal work.** opus leads by about 4–5 points on
  TB4.0: medium 52.5 vs 48.0, high 56.6 vs 51.5 [C3].
- **opus-5.5 vs gpt-6.1-sol, equal quality.** opus medium ≈ sol xhigh (TB4.0 52.5 vs 54.0; Index
  51.2 vs 51.0), at 3.4–3.9× the API cost. opus high ≈ sol max on TB4.0 (56.6 vs 56.1) at 2.8× the
  cost [C3].
- **opus-5.5 below max on repo implementation and codebase Q&A** (DeepSWE, SWE-Atlas-QnA):
  unknown. At max, opus trails sol medium on DeepSWE (68.4 vs 72.0) [C1].
- **Opus medium vs Sonnet high.** Opus medium beats Sonnet high everywhere: TB4.0 +8.6 at 1.8×
  cost and Index +4.4 at 1.5× cost [C3]; vendor internal tasks +8.8 at 2.5× cost [A8].
- **Opus medium vs Sonnet xhigh.** Opus medium is cheaper for about the same quality: Index 51.2
  vs 51.9 at 0.67× the cost, TB4.0 52.5 vs 57.1 at 0.66× the cost [C3].
- **Opus high vs Sonnet xhigh.** Opus high beats Sonnet xhigh on the Index (53.6 vs 51.9) and
  ties on TB4.0 (56.6 vs 57.1), at 0.9× the cost [C3].
- **Overall, below max, sonnet-5.5 buys about what opus-5.5 buys one effort level lower, for about
  the same money** [C3,A8]. Sonnet only clearly wins at max (TB4.0 63.6 vs 59.6) [C3], and in the
  task niches in the category table below. This is API dollars; how Claude Pro meters each model
  is unpublished (see [Quotas](#quotas)).
- **The model sets the ceiling; effort tunes within it.** haiku-5.5 goes from Index 37.8 at high
  to 43.4 at max, still below opus-5.5 and gpt-6.1-sol at medium [C3].
- **gpt-6.1-sol tops out at `xhigh`.** In the native-CLI runs its max scores below xhigh on every
  benchmark, at 1.5× the cost and 1.6× the wall time [C1]; OpenAI's DeepSWE figures agree [O8].
  Artificial Analysis's own setup shows max slightly above xhigh (TB4.0 56.1 vs 54.0) [C3].
- **Quota and latency.** Thinking tokens count against the subscription's limits and add wall-clock
  time on every turn of an agentic run, so the cost grows with the number of tool-use turns.
  Anthropic: higher effort "uses more tokens and reaches usage limits faster" [Q5].
- Codex's `ultra` level adds "automatic task delegation", i.e. its own subagents; the skill never
  uses levels above `max`, since the orchestrator already owns delegation.

## Refusals and fallback

Opus 5.5 and Sonnet 5.5 run safety classifiers for cybersecurity, biology and reasoning
extraction. A declined request either fails or, with fallback configured, is retried on another
model [A9]. Anthropic: "most cybersecurity tasks will be re-routed to Opus 4.8" and "fall back to
another model transparently" [A5]. Whether a fallback turn in Claude Code counts against Pro, and
at which model's rate, is unknown.

| Benchmark | opus-5.5 | sonnet-5.5 | haiku-5.5 | gpt-6.1-sol / grok-4.7 |
|---|---|---|---|---|
| DeepSWE, attempts refused (CLI, max) [C1] | 0.6% (2/339) | 0% | 0% | 0% / 0% |
| SWE-Atlas-QnA [C1] | **14.0%** (52/372) | 10.5% (max), 8.3% (high), 4.6% (medium) | 0% | 0% / 0% |
| TB4.0 [C1] | **12.1%** (24/198) | 3.0% | ≤1.5% | 0% / 0% |
| TB4.0, fallback-assisted (Vals) [T3,V2] | 22/198; score 65.15 → 58.08 if counted as failures | 50.51 if counted (from 53.03) [V3] | — | — |
| SRE Bench (reverse engineering) [V2,V3] | 82.8% fallback-assisted; 33.6 → 5.3 | 30.2 → 19.1 | — | — |
| CyberBench (find/patch memory bugs) [V9,V3] | 55.4 standard vs **74.6** with Cyber Verification Program | 59.6 → 42.0 if counted | 75.5, no note | sol 39.3 / grok 69.5 |

Opus's refusal rate is highest on exactly the security, reverse-engineering, and terminal work
where it otherwise scores well.

## Per-category evidence

"Winner" means a gap larger than the stated error bars. Costs are each source's own $ per task,
comparable only within a row. Vals runs use max effort unless noted [V1,V2,V3,V11,V12].

| Category | Evidence | Verdict |
|---|---|---|
| **Long-horizon repo implementation** (features, bug fixes) | DeepSWE (native CLI): sol xhigh 73.2, grok xhigh 72.6, sol medium 72.0 = sonnet max 72.0 > opus max 68.4; opus below max unknown [C1]. Vendor: sol high 75.2% [O8], opus 74.2% [A5]; opus internal repo tasks medium 86.6 / high 88.4 [A8]. Datacurve's board has no rows for these versions [D1]. | **sol ≥ Claude**, grok close |
| **Terminal / build / ops / environment** | TB4.0 at max: opus 64.85, sonnet 61.82, sol 58.18 [T1,T2]; Vals: opus 65.15, sonnet 64.14, sol 55.05 [T3]; Mercor (harness unstated): sol 59.6, opus 58.3, sonnet 51.5 [T4]; Snorkel Agentic Coding 2.0: sol 42.8 vs opus 40.4 [T6]. Same effort (Artificial Analysis setup): opus 4–5 pts ahead of sol; sonnet behind both below xhigh [C3]. | **opus at equal effort**; sol ≈ opus one level lower; sonnet only at max |
| **Codebase Q&A / exploration** | SWE-Atlas-QnA: sonnet max 66.9, opus max 66.4, grok 62.9, sonnet xhigh 62.1, sol 57.8–61.0, sonnet high 56.5, sonnet medium 44.9 [C1]; opus below max unknown; opus refused 14% [C1]. | **sol at medium/high**; Claude only at xhigh/max |
| **Visual: bugs reported with screenshots** | SWE-bench Multimodal: opus 70.2, sonnet 58.3, haiku 44.0, sol 43.5, grok 42.9 [V4,V11,V12]. Vendor: opus at low reads dense charts better than Opus 5 at its highest effort [A9]. | **opus, clearly** |
| **Frontend / web apps from scratch** | Vibe Code Bench v1.1 (OpenHands): sonnet 92.4 ($31), haiku 90.4 ($6.07), opus 90.3 ($58), sol 88.9 ($6.23), grok 86.2 ($15.83), composer 49.6 (Cursor CLI, $0.50) [V5]. WebDev Arena: opus-5.5-max #1 at 1813 [W1]; sol-max #4 at ~1760 [W3]. | **sonnet**; haiku/opus within noise; sol −3.5 |
| **Program from spec, greenfield** | ProgramBench fully resolved: opus 18.5, sonnet 6.5, sol 3.0, haiku 2.5, grok 0.5 [V6,V11,V12]. | **opus** |
| **Cross-language migration** | Code Migration: sonnet 69.8, opus 66.7, sol 65.1 (±4.3), grok 44.8, haiku 44.6. Into Python: sol 55.4 vs sonnet 70.6 [V7,V11,V12]. | **Tie** sonnet/opus/sol, except Python targets |
| **Algorithms / competitive programming** | IOI: sol 96.9 ($1.26), opus 95.1 ($5.26), sonnet 83.1, grok 57.7, haiku 47.3 [V8,V11,V12]. | **sol ≈ opus** |
| **Scientific computing** | SciCode: opus 66.9 (max) / 59.3 (medium) > sonnet 61.0 > sol ≤55.8 [C3]. TB-Science: Vals sol 52.9 vs opus/sonnet 47.1 [V1,V2,V3]; vendor opus 58.7 [A5], sol 57.0 [O8]. | **opus** on code; tie on agentic science |
| **Security: find and patch memory-safety bugs** | CyberBench: haiku 75.5 ($1.25), opus with Cyber Verification Program 74.6, grok 69.5 ($8.54), sonnet 59.6, opus 55.4, sol 39.3 ($0.29, 3.7 min) [V9]. | **haiku ≈ grok**; Claude Opus/Sonnet held back by safeguards |
| **Binary reverse engineering** | SRE Bench: sol 50.8 (#2), opus 33.6, sonnet 30.2, haiku 5.7, grok 3.8 [V10,V11,V12]. | **sol, clearly** |
| **Code review / bug finding** | No current-generation data. Previous generation: opus-5 found 79.6% of pre-merge bugs in its top 5 comments vs gpt-5.6-sol 65.6% and sonnet-5 64.7% [R1]. Vendor: early testers report stronger review from Opus 5.5 than Opus 5 [A9]. | unknown |
| **Mixed real-user agent tasks** | Agent Arena: opus (high) #2 +12.15% $1.31; sonnet (max) #3 +12.5% $2.74; sol (max) #5 +11.23% $0.56 (Arena posts read via search excerpts) [W2]. | **Near tie** |
| **SWE-bench Pro / Verified** | Vendor public set: opus 89.9, sonnet 81.3 [A4,A3]; sol unknown; Scale V2 has no rows [S1]. Vals SWE-bench: composer-2.5 79.6 (#25/88) [V13]. | unknown |
| **TB4.0 per-category** | Per-task data is on the JS-rendered Harbor Hub leaderboard [T5]. Vals shows a few opus cells only [T3]. | unknown |
| **Prose (docs, READMEs)** | No benchmark found. | unknown |

Speed: gpt-6.1-sol streams about 48 output tokens/s vs opus-5.5's 95 [C2], but it uses about a
third of the output tokens per task. Its agent wall time is still lower at equal or better
scores [C1,C2].

## Quotas

**Neither vendor publishes absolute subscription limits or per-model multipliers.**

- **Claude Pro.** A 5-hour session limit plus a weekly limit, shared across Claude and Claude Code
  [Q4]. Pro's default model in Claude Code is Opus 5.5 [A10]. No message, token, or hour counts
  are published, and no official source says how much faster Opus 5.5 drains the limit than
  Sonnet 5.5 [Q4,Q5]. 5-hour limits were raised at the Opus 5.5 launch by an unpublished amount
  [A5]; SemiAnalysis measured about +50% on Pro [Q3].
- **Opus vs Sonnet on Pro.**
  - API list price: Opus is exactly 2× Sonnet per token [A1,A8].
  - Wokey's regression on Pro accounts: "Per token, Opus 5.5 uses about 0.6× the limit of other
    Opus and Fable models". It gives no Sonnet weight [Q1].
  - A widely quoted "Opus uses 5× Sonnet" figure has no source and predates these models [Q6].
  - **Working assumption in this file: Pro consumption tracks API price.** This is unverified;
    check `/usage` before and after a run.
- **ChatGPT Plus (Codex).** Official estimate: 15–160 gpt-6.1-sol local messages per 5 hours
  (gpt-6-astra 5–45, gpt-6-luna 350–3,000). These are "not fixed message limits", and "weekly
  limits may also apply" [O9]. Usage is metered in credits per token: gpt-6.1-sol costs 50 input /
  2.5 cached / 250 output per 1M, 5× cheaper than Astra [O9]. The effect of reasoning effort is
  not quantified [O9]. An earlier third-party guide gave similar ranges [O5].
- **Measured plan size** (third-party, full limit priced at API list rates; the two sources
  disagree):

| Measure | Claude Pro | ChatGPT Plus |
|---|---|---|
| Wokey, real traffic, per week [Q1,Q2] | $170 (157M tokens, 84% cache reads; model mix unstated) | $92 (222M tokens, ~90% cache reads; "mostly Sol-class") |
| SemiAnalysis, agentic mix, per month (paywalled; via a secondary write-up) [Q3] | $1,178 on Opus 5.5 (≈ $272/week) | $211 on gpt-6.1-sol (≈ $49/week) |

- **Per-task burn.** Each figure is one hard agentic task (TB4.0, Artificial Analysis setup) [C3]
  as a share of a week's plan budget, using the two plan measurements above. Coding Agent Index
  tasks cost about 0.4–1.2× these figures [C1].

| Effort | opus-5.5 (Pro) | sonnet-5.5 (Pro) | gpt-6.1-sol (Plus) | haiku-5.5 (Pro) |
|---|---|---|---|---|
| low | 0.8–1.2% | 0.5–0.8% | 0.4–0.8% | <0.1% |
| medium | 1.5–2.4% | 0.6–0.9% | 0.7–1.3% | ~0.1% |
| high | 1.9–3.0% | 0.8–1.3% | 0.9–1.7% | 0.1–0.2% |
| xhigh | 3.2–5.2% | 2.2–3.6% | 1.1–2.1% | 0.2–0.3% |
| max | 4.8–7.7% | 4.7–7.4% | 2.0–3.7% | 0.2–0.4% |

  **At equal quality, the two plans drain at about the same rate:**
  - opus medium (TB4.0 52.5) costs 1.5–2.4% of a Pro week; sol xhigh (54.0) costs 1.1–2.1% of a
    Plus week.
  - opus high (56.6) costs 1.9–3.0%; sol max (56.1) costs 2.0–3.7%.

  The decisive difference is **who else draws on the pool**. Every Claude child shares Pro with
  the opus-5.5 orchestrator [Q4]; Plus carries only the GPT children. grok-4.7 and composer-2.5
  draw on the X Subscription pool [U4], whose size nobody has measured. Hence SKILL.md's tie-break:
  where two models fit a role about equally, the non-Claude one.

## Per-model strengths

One entry per model in the skill's set. "Cost" is API $ per hard TB4.0 task in the Artificial
Analysis setup unless noted [C3]. Quota shares come from the per-task burn table.

### opus-5.5 (Claude Code, Claude Pro)

- **Best at:**
  - Terminal/build/environment work at any effort: +4–5 TB4.0 over sol at the same effort [C3].
  - Greenfield programs from a spec: ProgramBench 18.5, next best 6.5 [V6].
  - Screenshot bugs: Multimodal 70.2 [V4].
  - Scientific code: SciCode 59.3 at medium, above sol at any effort; 66.9 at max is the top score
    [C3].
  - Web UI by human preference: WebDev Arena #1 [W1].
  - Long repo tasks, per vendor: internal repo tasks 86.6% at medium [A8].
- **Effort:** `medium` (Claude Code default [A10]) for most work; `high` for Hardest and
  Greenfield. low ≈ Sonnet high on vendor SWE-bench Pro [A8]. xhigh adds +1.4 pts on SWE-bench Pro
  for 2.5× the cost of high [A8]. max adds nothing on TB4.0 over xhigh in the Artificial Analysis
  setup (59.6 both) [C3].
- **Weak at:**
  - Security and reverse-engineering, because of safeguards: CyberBench 55.4 [V9]; SRE Bench
    82.8% fallback-assisted [V2].
  - Refusals on codebase Q&A (14%) and TB4.0 (12%) [C1].
  - DeepSWE at max trails sol medium (68.4 vs 72.0) [C1].
- **Quota:** Claude Pro, shared with the orchestrator. 1.5–2.4% of a Pro week per hard task at
  medium; the most expensive model per task at every effort in the Artificial Analysis setup [C3].

### sonnet-5.5 (Claude Code, Claude Pro)

- **Best at:**
  - At max: TB4.0 (66.2 in Claude Code, 63.6 Artificial Analysis setup) and the Coding Agent
    Index (68.4), the top scores measured [C1,C3].
  - Web apps from scratch: Vibe Code 92.4, #1 [V5].
  - Cross-language migration: 69.8, #1 [V7].
- **Effort:** steep curve. Anthropic recommends `medium` for well-specified agentic coding and
  `high` for harder work [A7], but below xhigh it is the weakest of the three frontier models on
  TB4.0 and QnA [C1,C3].
- **Weak at:**
  - Medium/high generally: dominated by opus one level lower at about the same API cost [C3,A8].
  - Max-effort token blowup: 27.7M tokens per task [C1].
  - IOI 83.1 [V8].
  - At max, it more often ran the code-review skill across subagents, causing timeouts [A6].
- **Quota:** Claude Pro. 0.6–0.9% of a Pro week per hard task at medium; same as opus at max [C3].

### haiku-5.5 (Claude Code, Claude Pro)

- **Best at:**
  - Cheap UI builds: Vibe Code 90.4, #3, $6.07 vs sonnet $31 [V5].
  - Native-code vulnerability find/patch: CyberBench 75.5, #6, best in the set, $1.25 [V9].
  - Screenshot bugs on par with sol: Multimodal 44.0 [V11].
- **Effort:** default `medium` [A7]. Its best Coding Agent Index score is at xhigh (41.4); max is
  lower (36.5) [C1].
- **Weak at:**
  - Terminal and repo agent work: Claude Code TB4.0 6–30, DeepSWE 45–49 [C1].
  - Algorithms: IOI 47.3 [V11].
  - Migration: 44.6 [V11].
  - Greenfield programs: ProgramBench 2.5 [V11].
  - Reverse engineering: SRE Bench 5.7 [V11].
- **Quota:** Claude Pro, but about 1/20 of opus per task: ~0.1% of a week at medium [C3].

### gpt-6.1-sol (Codex, ChatGPT Plus)

- **Best at:**
  - Long-horizon repo implementation: DeepSWE 72.0 at medium, 73.2 at xhigh, the best in the set
    [C1].
  - Codebase Q&A at medium/high: 60.8 [C1].
  - Algorithms: IOI 96.9 [V8].
  - Reverse engineering: SRE Bench 50.8 [V10].
  - Agentic science: TB-Science 52.9 [V1].
  - Zero refusals in every Artificial Analysis run [C1].
- **Effort:** `medium` for most work, `xhigh` for the hardest; max is no better [C1].
- **Weak at:**
  - Screenshot bugs: Multimodal 43.5 [V4].
  - Greenfield programs: ProgramBench 3.0 [V6].
  - Memory-safety bugs: CyberBench 39.3 [V9].
  - Terminal work at the same effort as opus: −4–5 [C3].
  - Migration into Python: 55.4 [V7].
  - Slow streaming: 48 tok/s [C2].
- **Quota:** ChatGPT Plus, not shared with the orchestrator. 0.7–1.3% of a Plus week per hard
  task at medium [C3,Q2,Q3].

### grok-4.7 (Grok Build, X Subscription)

- **Best at:**
  - Repo implementation and codebase Q&A, close to sol: DeepSWE 72.6, QnA 62.9 at xhigh in Grok
    Build [C1].
  - Memory-safety bugs: CyberBench 69.5, within error of haiku [V9].
- **Effort:** only xhigh measured [C1]. Grok Build's levels top out at `xhigh` (SKILL.md).
- **Weak at:**
  - Terminal work: TB4.0 33.3 in Grok Build [C1], 37.58 per BenchLM [T1], 28.8 on Vals [V12].
  - Algorithms: IOI 57.7 [V12].
  - Greenfield programs: ProgramBench 0.5 [V12].
  - Reverse engineering: SRE Bench 3.8 [V12].
  - Migration: 44.8 [V12].
  - Screenshot bugs: Multimodal 42.9 [V12].
  - Expensive at API prices: $8.82 per Coding Agent task vs sol xhigh $1.04 [C1].
- **Quota:** X Subscription pool, shared with composer-2.5 [U4]. Pool size and per-task share
  unknown.

### composer-2.5 (Cursor, X Subscription)

- **Best at:** cheap well-specified edits. Vals SWE-bench 79.6, #25 of 88 [V13]. Vendor: TB2.0
  69.3 and SWE-bench Multilingual 79.8 [K1,K2].
- **Effort:** none exposed (SKILL.md).
- **Weak at:**
  - Web apps from scratch: Vibe Code 49.6, #56 of 112 [V5,V13].
  - Terminal-Bench 2.1: 58.4, #41 of 75 [V13].
  - No TB4.0 or Coding Agent Index data.
  - 200k context [V13].
- **Quota:** X Subscription pool [U4]. $0.50 / $2.50 per 1M tokens [U1]; $0.50 per Vibe Code app
  [V5]. Pool share unknown.

## Why each role

Best measured result at the effort the role runs; where two models score about equally, the
non-Claude one, to keep Claude Pro for the orchestrator ([Quotas](#quotas)). Where a choice rests
on the user's judgment rather than a benchmark, the entry says so.

### Read-only roles

- **Lookup → composer-2.5.** The answer is used as-is and its cited lines spot-checked, so the
  cheapest competent model wins the tie, on the X pool rather than Claude Pro. No codebase-Q&A
  benchmark covers composer-2.5; its scores are vendor-reported on older benchmarks [K1,K2] plus
  Vals SWE-bench 79.6 [V13]: trust the spot-checks, not the scores.
- **Explorer → gpt-6.1-sol at `medium`.** SWE-Atlas-QnA: sol medium 60.8 vs sonnet medium 44.9 and
  high 56.5; Claude leads only at xhigh/max [C1]. opus below max is unknown, and opus refused 14%
  of these questions at max; sol refused none [C1]. Plan-shaping exploration should not go to a
  weaker model, which "may not have the ability to properly decide what information matters" (see
  [harness-prior-art.md](harness-prior-art.md)).
- **Investigator → gpt-6.1-sol at `medium`; opus-5.5 when gpt-6.1-sol implemented.** No benchmark
  measures stuck-diagnosis; the nearest is codebase Q&A, where sol leads at medium [C1]. Rubber Duck
  found a cross-family critic helps when the agent "gets stuck in a loop" (see
  harness-prior-art.md), hence the other vendor when sol was the implementer.
- **Plan critic → gpt-6.1-sol.** A different model family from the opus-5.5 orchestrator that wrote
  the plan; Rubber Duck's biggest wins came from critiquing the plan (see harness-prior-art.md).
  No current-generation benchmark measures plan critique.
- **Reviewer → gpt-6.1-sol; opus-5.5 when gpt-6.1-sol implemented.** The reviewer is always the
  other vendor, to reduce correlated blind spots, and sol keeps reviews of Claude work off Claude
  Pro. No current-generation review benchmark exists; the previous generation favoured Claude
  (opus-5 79.6% vs gpt-5.6-sol 65.6%) [R1]. gpt-6-astra scores higher on AA (61 vs 52) [O1,O6] but
  costs 5× its Codex credits per token [O9], and the user excluded it.

### Write roles

- **Hardest → opus-5.5 at `high`.** At equal effort opus leads sol on TB4.0 by 4–5 points, and opus
  high ties sol max (56.6 vs 56.1) [C3]; #1 on TB4.0 at max [T1]; vendor SWE-bench Pro subset 95.3% at
  high [A8]. Caveat: opus refused 12% of TB4.0 attempts at max [C1], so security-heavy work may hit
  safeguards ([Refusals](#refusals-and-fallback)).
- **Greenfield → opus-5.5 at `high`.** ProgramBench fully resolved: opus 18.5, sonnet 6.5, sol 3.0
  [V6].
- **Feature → gpt-6.1-sol.** DeepSWE: sol medium 72.0 = sonnet max 72.0 > opus max 68.4; opus below
  max unknown [C1]. Vendor: sol high 75.2% vs opus 74.2% [O8,A5]. Agent Arena: near tie [W2].
  Off Claude Pro at about the same quality.
- **Terminal → gpt-6.1-sol at `xhigh`.** opus medium beats sol medium by 4.5 TB4.0 points but only
  ties sol xhigh (52.5 vs 54.0), at about the same share of each plan's week [C3]. A tie, so the
  non-Claude model. (Unknown-cause build failures stay in Hardest.)
- **Algorithm → gpt-6.1-sol at `xhigh`.** IOI: sol 96.9 ($1.26) vs opus 95.1 ($5.26) [V8], measured
  at max; sol's max scores no better than xhigh [C1].
- **Visual bug → opus-5.5.** SWE-bench Multimodal: opus 70.2 vs sonnet 58.3 vs sol 43.5 [V4]. Opus
  at its lowest effort reads dense charts better than Opus 5 at its highest (vendor) [A9]. None of
  the models takes video or audio.
- **UI → sonnet-5.5.** Vibe Code: sonnet 92.4, haiku 90.4 and opus 90.3 within noise, sol 88.9,
  composer 49.6 [V5]; all at max. WebDev Arena ranks opus #1 [W1]. Claude Code reads images, so the
  brief carries the mockup paths.
- **Migration → gpt-6.1-sol; sonnet-5.5 into Python.** Code Migration: sonnet 69.8, opus 66.7, sol
  65.1 (±4.3), a tie, so the non-Claude model. Into Python: sol 55.4 vs sonnet 70.6 [V7].
- **Security → grok-4.7; a failure moves to haiku-5.5.** CyberBench: haiku 75.5, opus 74.6 only
  under the Cyber Verification Program, grok 69.5, within each other's error bars; the tie goes to
  the non-Claude grok-4.7 [V9]. Opus scores 55.4 standard and sonnet loses 30% of its score if
  fallback counts as failure [V9,V3]; sol scores 39.3 [V9]. haiku-5.5, not the ladder's top rung,
  is the next step.
- **Reverse engineering → gpt-6.1-sol at `xhigh`.** SRE Bench: sol 50.8 vs opus 33.6 (82.8%
  fallback-assisted) and sonnet 30.2 [V10,V2]. Measured at max; sol's max is no better than xhigh
  [C1].
- **Science → opus-5.5.** SciCode: opus 59.3 at medium, 66.9 at max, above sonnet 61.0 and sol
  ≤55.8 at any effort [C3]. Agentic science is a tie or leans sol (Vals TB-Science sol 52.9 vs
  opus/sonnet 47.1 [V1,V2,V3]; vendor opus 58.7 [A5], sol 57.0 [O8]); the role follows the code
  benchmark.
- **Docs → sonnet-5.5.** The user's choice: no benchmark covers prose. The orchestrator reviews it.
- **Mechanical, Trivial → composer-2.5.** Well-specified, low-risk work: a *cascade* where the
  orchestrator's review and the gates accept the draft or send it up the ladder (HydraFusion; see
  harness-prior-art.md). Cheapest model, on the X pool: $0.50 / $2.50 per 1M [U1]; Vals SWE-bench
  79.6 [V13].
- **Bulk → composer-2.5 one shard at a time; haiku-5.5 for UI shards.** As Mechanical; composer-2.5
  scores 49.6 on Vibe Code vs haiku-5.5's 90.4 at $6.07 [V5,V13], so UI shards go to haiku. The
  Reviewer checks the combined diff.

### Escalation ladder

`composer-2.5 / haiku-5.5 → grok-4.7 → gpt-6.1-sol or opus-5.5`.
- **grok-4.7 as the middle rung.** DeepSWE 72.6 and QnA 62.9, close to sol [C1]; TB4.0 37.58%,
  above haiku-5.5 (32.8%) [T1,A2]. It is the step up from a failed cheap draft before spending
  Claude or Codex quota, and composer-2.5's fallback. Its own fallback, gpt-6.1-sol, keeps the run
  off Claude Pro.
- **Build and environment failures skip grok-4.7**: TB4.0 33.3 in Grok Build [C1], 28.8 on Vals
  [V12].
- **sonnet-5.5 is off the ladder.** Below max it buys about what opus-5.5 buys one effort level
  lower [C3,A8], so a failed sonnet-5.5 run moves to the top rung. Its roles are niches: UI and
  migration into Python [V5,V7], and Docs by the user's choice.
- **Top rung, two vendors.** A second failure on one top-rung model goes to the other vendor.

### Removed by the user

Not benchmark decisions:
- **Best-of-2** (opus-5.5 and gpt-6.1-sol on the same brief, keep the better diff): removed as too
  costly.
- **Cross-vendor alternative lane** (gpt-6.1-sol when Claude models are stuck): redundant with the
  escalation ladder's vendor swap on the top rung.

## Re-check when

- Artificial Analysis runs opus-5.5 below max on the Coding Agent Index;
- an official Pro per-model multiplier appears;
- TB4.0 per-category data for gpt-6.1-sol appears;
- a current-generation review benchmark lands.

## Sources (accessed 2026-10-14 and 2026-10-15)

- [P1] Notebookcheck, "Claude Opus 5.5 is included with Pro" — https://www.notebookcheck.net/Claude-Opus-5-5-is-included-with-Pro-and-Free-still-misses-out.1406452.0.html
- [P2] Christopher Alarcon, "Claude Opus 5.5 vs Fable 5.1: … which plan gets it" — https://christopheralarcon.com/blog/claude-opus-5-5-vs-fable/
- [P3] Anthropic Help Center, "Does the Pro plan have any usage limits?" — https://support.anthropic.com/en/articles/8325612-does-the-pro-plan-have-any-usage-limits
- [P4] ClaudeLog, Claude Code usage limits — https://claudelog.com/faqs/claude-code-usage-limits/
- [Q1] Wokey, Claude usage limits (measured, data 2026-10-12; per-model weight from a regression on Pro accounts, 2026-09-28) — https://wokey.ai/claude-usage-limits
- [Q2] Wokey, Codex usage limits (measured, data 2026-10-08) — https://wokey.ai/codex-usage-limits
- [Q3] explainx.ai, summary of SemiAnalysis subscription-value testing (2026-10-06; original paywalled) — https://www.explainx.ai/blog/semianalysis-claude-vs-chatgpt-subscription-api-value-limit-testing-2026
- [Q4] Claude Help Center, "Use Claude Code with your Pro or Max plan" — https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan
- [Q5] claudeusage.dev, Opus 5.5 usage limits — https://www.claudeusage.dev/opus-5-5/
- [Q6] ClaudeLog, Claude Code limits (source of the unsourced "Opus ≈ 5× Sonnet" figure) — https://claudelog.com/claude-code-limits/
- [A1] Anthropic, Claude Opus 5.5 overview (model table incl. Sonnet/Haiku 5.5) — https://platform.claude.com/docs/en/models/opus-5-5/overview.md
- [A2] Artificial Analysis, Claude Haiku 5.5 vs Sonnet 5.5 — https://artificialanalysis.ai/models/releases/comparisons/claude-haiku-5-5-vs-claude-sonnet-5-5
- [A3] BatchHaiku, "Claude Haiku 5.5 Benchmarks" (2026-10-08; Sonnet/Haiku 5.5 SWE-bench Pro, vendor) — https://batchhaiku.dev/blog/haiku-5-5-benchmarks/
- [A4] HokAI, Claude Opus 5.5 (SWE-bench Pro, vendor) — https://hokai.io/hub/models/claude-opus-5.5
- [A5] Anthropic, "Introducing Claude Opus 5.5" — https://www.anthropic.com/news/claude-opus-5-5 ; Opus 5.5 DeepSWE 74.2% via llm-stats — https://llm-stats.com/blog/research/claude-opus-5-5-launch
- [A6] Anthropic, "Introducing Claude Sonnet 5.5" — https://www.anthropic.com/claude-sonnet-5-5
- [A7] Anthropic docs, Effort (per-model recommended levels) — https://platform.claude.com/docs/en/build-with-claude/effort
- [A8] Anthropic docs, Optimizing for cost and intelligence (effort sweeps, model comparison; vendor-internal) — https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence
- [A9] Anthropic docs, Prompting Claude Opus 5.5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 ; What's new in Claude Opus 5.5 — https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
- [A10] Claude Code docs, Model configuration (default model and effort per plan) — https://code.claude.com/docs/en/model-config
- [O1] Artificial Analysis, GPT-6.1 Sol vs GPT-6 Luna — https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-gpt-6-luna
- [O2] OpenAI Help Center, GPT-6 and other models in ChatGPT — https://help.openai.com/es-es/articles/20001354-gpt-6-and-other-models-in-chatgpt
- [O3] Notebookcheck, "GPT-6 Astra is on ChatGPT Plus, but only in Work and Codex" — https://www.notebookcheck.net/GPT-6-Astra-is-on-ChatGPT-Plus-but-only-in-Work-and-Codex.1391574.0.html
- [O4] Notebookcheck, "OpenAI abruptly restores harsh 5-hour Codex and Work limits for ChatGPT Plus" — https://www.notebookcheck.net/OpenAI-abruptly-restores-harsh-5-hour-Codex-and-Work-limits-for-ChatGPT-Plus.1378377.0.html
- [O5] Developers Digest, "Codex Usage Limits and Pricing in 2026" — https://www.developersdigest.tech/blog/codex-usage-limits-pricing-2026
- [O6] Artificial Analysis, GPT-6 Astra (high) vs Grok 4.6 (high) — https://artificialanalysis.ai/ko/models/comparisons/gpt-6-astra-high-vs-grok-4-6
- [O7] OpenAI, API pricing (gpt-6-luna $0.10/$0.50; gpt-6.1-sol $2/$10) — https://developers.openai.com/api/docs/pricing
- [O8] OpenAI, "Introducing GPT-6.1 Sol" — https://openai.com/index/introducing-gpt-6-1-sol/ (HTTP 403 to automated fetch; figures read from Emergent's summary: https://emergent.sh/learn/gpt-6-1-sol-benchmarks)
- [O9] OpenAI, Codex pricing and usage limits — https://learn.chatgpt.com/docs/pricing (redirect from https://developers.openai.com/codex/pricing)
- [X1] BenchLM, Grok 4.7 benchmark scores — https://benchlm.ai/md/models/grok-4-7.md ; eesel.ai, Grok 4.7 review — https://www.eesel.ai/blog/grok-4-7-review
- [X2] TestingCatalog on X, Composer 2.5 in Grok Build (2026-06-01) — https://x.com/testingcatalog/status/2061538730167377970
- [X3] Cursor Forum, "Composer 2.5 missing from grok models after alpha 1.0.42" — https://forum.cursor.com/t/grok-build-cli-grok-composer-2-5-missing-from-grok-models-after-alpha-1-0-42-not-cursor-ide-composer/173128
- [U1] Cursor Docs, Models and pricing — https://cursor.com/docs/models
- [U2] Cursor Help, Grok Bot plans and billing — https://cursor.com/help/grok-bot/plans
- [U3] Cursor Docs, Grok 4.7 — https://cursor.com/docs/models/grok-4-7
- [U4] Cursor Help, "What is The X Subscription?" — https://cursor.com/help/the-x-subscription/overview ; Engadget, "X bundles Premium, Grok and Cursor under a single monthly subscription" — https://www.engadget.com/2284943/x-subscription-bundles-premium-grok-cursor/
- [K1] DataCamp, Composer 2.5 — https://www.datacamp.com/blog/composer-2-5
- [K2] The New Stack, Cursor Composer benchmarks — https://thenewstack.io/cursor-composer-benchmarks/
- [C1] Artificial Analysis, Coding Agent Index (per-agent data embedded in page) — https://artificialanalysis.ai/agents/coding-agents
- [C2] Artificial Analysis, GPT-6.1 Sol vs Claude Opus 5.5 — https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-claude-opus-5-5
- [C3] Artificial Analysis, model release pages with per-effort Intelligence Index data (embedded in page) — https://artificialanalysis.ai/models/releases/claude-opus-5-5 ; https://artificialanalysis.ai/models/releases/claude-sonnet-5-5 ; https://artificialanalysis.ai/models/releases/gpt-6-1-sol ; https://artificialanalysis.ai/models/releases/claude-haiku-5-5
- [T1] BenchLM, Terminal-Bench 4.0 leaderboard mirror (snapshot 2026-10-12) — https://benchlm.ai/benchmarks/terminal-bench-4
- [T2] Snorkel AI, Terminal-Bench 4.0 leaderboard — https://snorkel.ai/leaderboard/terminal-bench/
- [T3] Vals AI, Terminal-Bench 4.0 — https://www.vals.ai/benchmarks/terminal-bench-4
- [T4] Mercor APEX, Terminal-Bench 4.0 leaderboard — https://www.mercor.com/apex/oss-benchmarks/oss-terminal-bench-4-0-leaderboard/
- [T5] Terminal-Bench, 4.0 release notes — https://www.tbench.ai/news/terminal-bench-4-0 ; Harbor Hub dataset — https://hub.harborframework.com/datasets/terminal-bench/terminal-bench/4
- [T6] Snorkel AI, Agentic Coding 2.0 — https://snorkel.ai/leaderboard/agentic-coding-2/
- [V1] Vals AI, GPT-6.1 Sol — https://www.vals.ai/models/openai_gpt-6.1-sol
- [V2] Vals AI, Claude Opus 5.5 — https://www.vals.ai/models/anthropic_claude-opus-5-5
- [V3] Vals AI, Claude Sonnet 5.5 — https://www.vals.ai/models/anthropic_claude-sonnet-5-5
- [V4] Vals AI, SWE-bench Multimodal — https://www.vals.ai/benchmarks/swebench-multimodal
- [V5] Vals AI, Vibe Code Bench — https://www.vals.ai/benchmarks/vibe-code
- [V6] Vals AI, ProgramBench — https://www.vals.ai/benchmarks/programbench
- [V7] Vals AI, Code Migration — https://www.vals.ai/benchmarks/code-migration
- [V8] Vals AI, IOI — https://www.vals.ai/benchmarks/ioi
- [V9] Vals AI, CyberBench — https://www.vals.ai/benchmarks/cyber
- [V10] Vals AI, SRE Bench — https://www.vals.ai/benchmarks/srebench
- [V11] Vals AI, Claude Haiku 5.5 — https://www.vals.ai/models/anthropic_claude-haiku-5-5
- [V12] Vals AI, Grok 4.7 — https://www.vals.ai/models/grok_grok-4.7
- [V13] Vals AI, Composer 2.5 — https://www.vals.ai/models/cursor_composer-2.5
- [W1] Arena, Code Arena WebDev leaderboard (blocked to automated fetch; 2026-10-08 snapshot read via search excerpt) — https://arena.ai/leaderboard/code/webdev ; changelog — https://arena.ai/blog/leaderboard-changelog/
- [W2] Arena on X: Opus 5.5 — https://x.com/arena/status/2104617283679379704 ; Sonnet 5.5 — https://x.com/arena/status/2106105400487821764 ; GPT-6.1 Sol — https://x.com/arena/status/2106109027923140928 (paywalled to fetch; read via search excerpts)
- [W3] BenchLeader, GPT-6.1 Sol (Arena scores as of 2026-10-15) — https://www.benchleader.com/models/gpt-6-1-sol
- [D1] Datacurve, DeepSWE leaderboard — https://deepswe.datacurve.ai/
- [S1] Scale Labs, SWE-Bench Pro V2 — https://labs.scale.com/leaderboard/swe_bench_pro_public_v2
- [R1] "(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection" — https://arxiv.org/html/2610.13668
