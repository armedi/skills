# Model roles (compiled 2026-10-15; security re-checked 2026-10-16)

Evidence behind the `fusion` skill's **Models**, **Roles**, and **Effort** sections in
[SKILL.md](../../skills/fusion/SKILL.md). SKILL.md routes; this file explains why.

- [Roles](#roles): every role, its model, and the evidence that decided it. Start here.
- [Subscriptions and models](#subscriptions-and-models): what the user can run, and where.
- [Evidence by kind of work](#evidence-by-kind-of-work): the benchmarks per category, with
  [Security](#security) in detail.
- [Effort](#effort): how effort changes the ranking.
- [Refusals and safeguards](#refusals-and-safeguards): where vendor safeguards cost a model.
- [Quotas](#quotas): what each run costs the user's plans.

Conventions:
- Figures as published by the cited source around the date shown. "Vendor" = self-reported by
  the model maker. "Unknown" = not found; nothing invented.
- Different benchmark versions and harnesses are **not** directly comparable: Terminal-Bench
  2.0/2.1 ≠ 4.0; TB4.0 rows are model+harness pairs; Claude Code/Codex ≠ mini-SWE-agent ≠ OpenHands.
- "±" is the source's own standard error (1σ). A gap is compared as diff ÷ √(SE₁² + SE₂²),
  treating rows as independent.
- Claude rows on Vals and Artificial Analysis include attempts that Anthropic's safeguards handed
  to an older Claude model ("fallback-assisted"), which flatters some Claude scores (see
  [Refusals and safeguards](#refusals-and-safeguards)).

## Roles

Each role takes the best measured result at the effort it runs. Where two models score about
equally, it takes the non-Claude one, to keep Claude Pro for the opus-5.5 orchestrator
([Quotas](#quotas)). Where a choice rests on the user's judgment rather than a benchmark, the row
says so.

### Read-only roles

| Role | Model | Why |
|---|---|---|
| **Lookup** | composer-2.5 | The answer is used as-is and its cited lines spot-checked, so the cheapest competent model wins, on the X pool. No codebase-Q&A benchmark covers it; trust the spot-checks, not its scores (vendor [K1,K2]; Vals SWE-bench 79.6 [V13]). |
| **Explorer** | gpt-6.1-sol at `medium` | SWE-Atlas-QnA: sol medium 60.8 vs sonnet medium 44.9 and high 56.5; Claude leads only at xhigh/max; opus refused 14% of these questions, sol none [C1]. Plan-shaping exploration shouldn't go to a weaker model, which "may not have the ability to properly decide what information matters" ([harness-prior-art.md](harness-prior-art.md)). |
| **Investigator** | gpt-6.1-sol at `medium`; opus-5.5 when sol implemented | No benchmark measures stuck-diagnosis; the nearest is codebase Q&A, where sol leads at medium [C1]. A cross-family critic helps when the agent "gets stuck in a loop" (Rubber Duck, harness-prior-art.md), hence the other vendor. |
| **Plan critic** | gpt-6.1-sol | A different family from the orchestrator that wrote the plan; Rubber Duck's biggest wins came from critiquing the plan (harness-prior-art.md). No current benchmark. |
| **Reviewer** | gpt-6.1-sol; opus-5.5 when sol implemented | Always the other vendor, to reduce correlated blind spots; sol keeps reviews of Claude work off Claude Pro. No current review benchmark; the previous generation favoured Claude (opus-5 79.6% vs gpt-5.6-sol 65.6%) [R1]. gpt-6-astra scores higher on AA (61 vs 52) but costs 5× the Codex credits [O1,O6,O9], and the user excluded it. |

### Write roles

| Role | Model | Why |
|---|---|---|
| **Hardest** | opus-5.5 at `high` | At equal effort opus leads sol on TB4.0 by 4–5 points; opus high ties sol max (56.6 vs 56.1) [C3]; #1 on TB4.0 at max [T1]; vendor SWE-bench Pro subset 95.3% at high [A8]. |
| **Greenfield** | opus-5.5 at `high` | ProgramBench fully resolved: opus 18.5, sonnet 6.5, sol 3.0 [V6]. |
| **Feature** | gpt-6.1-sol | DeepSWE: sol medium 72.0 = sonnet max 72.0 > opus max 68.4; opus below max unknown [C1]. Vendor: sol high 75.2% vs opus 74.2% [O8,A5]. Agent Arena: near tie [W2]. About the same quality, off Claude Pro. |
| **Terminal** | gpt-6.1-sol at `xhigh` | opus medium beats sol medium by 4.5 TB4.0 points but only ties sol xhigh (52.5 vs 54.0), at about the same share of each plan's week [C3]. A tie, so the non-Claude model. Unknown-cause build failures stay in Hardest. |
| **Algorithm** | gpt-6.1-sol at `xhigh` | IOI: sol 96.9 ($1.26) vs opus 95.1 ($5.26) [V8], at max; sol's max is no better than xhigh [C1]. |
| **Visual bug** | opus-5.5 | SWE-bench Multimodal: opus 70.2 vs sonnet 58.3 vs sol 43.5 [V4]. Vendor: opus at its lowest effort reads dense charts better than Opus 5 at its highest [A9]. No model takes video or audio. |
| **UI** | sonnet-5.5 | Vibe Code: sonnet 92.4; haiku 90.4 and opus 90.3 within noise; sol 88.9; composer 49.6 [V5]; all at max. WebDev Arena ranks opus #1 [W1]. Claude Code reads images, so the brief carries the mockup paths. |
| **Migration** | gpt-6.1-sol; sonnet-5.5 into Python | Code Migration: sonnet 69.8, opus 66.7, sol 65.1 (±4.3), a tie, so the non-Claude model. Into Python: sol 55.4 vs sonnet 70.6 [V7]. |
| **Security** | gpt-6.1-sol | Only sol and opus are measured on both native and managed-language security work, and they tie: CyberBench Patch opus 85.7 vs sol 78.6 (1.0σ) [V9]; secure Python code sol 34.1 vs opus 33.5 [E1]. The tie goes to sol, which also refused nothing where opus refused 12–14% [C1]. See [Security](#security). |
| **Reverse engineering** | gpt-6.1-sol at `xhigh` | SRE Bench: sol 50.8 vs opus 33.6 (82.8% fallback-assisted) and sonnet 30.2 [V10,V2]; at max, and sol's max is no better than xhigh [C1]. |
| **Science** | opus-5.5 | SciCode: opus 59.3 at medium, 66.9 at max, above sonnet 61.0 and sol ≤55.8 at any effort [C3]. Agentic science ties or leans sol (TB-Science: Vals sol 52.9 vs opus/sonnet 47.1 [V1,V2,V3]; vendor opus 58.7 [A5], sol 57.0 [O8]); the role follows the code benchmark. |
| **Docs** | sonnet-5.5 | The user's choice; no benchmark covers prose. The orchestrator reviews it. |
| **Mechanical, Trivial** | composer-2.5 | Well-specified, low-risk work: a *cascade* where the orchestrator's review and the gates accept the draft or send it up the ladder (HydraFusion, harness-prior-art.md). Cheapest model, on the X pool: $0.50 / $2.50 per 1M [U1]. |
| **Bulk** | composer-2.5 per shard; haiku-5.5 for UI shards | As Mechanical. composer-2.5 scores 49.6 on Vibe Code vs haiku-5.5's 90.4 at $6.07 [V5,V13], so UI shards go to haiku. The Reviewer checks the combined diff. |

Caveats:
- **Hardest and refusals.** opus refused 12% of TB4.0 attempts at max [C1], one reason security
  work has its own role.
- **Security's limits.** sol's CyberBench PoC track shows no measured attempts [V9], so a task that
  needs a crashing input crafted may be blocked on sol; the top-rung vendor swap then moves it to
  opus-5.5. Offensive work (exploits, pentesting) is not the role's work.
- **Memory-safety bugs** go to Security when they are vulnerabilities. A plain crash is an
  ordinary bug: Hardest if the cause is unknown, Feature if known.

### Escalation ladder

`composer-2.5 / haiku-5.5 → grok-4.7 → gpt-6.1-sol or opus-5.5`.
- **grok-4.7 as the middle rung.** DeepSWE 72.6 and QnA 62.9, close to sol [C1]; TB4.0 37.58%,
  above haiku-5.5 (32.8%) [T1,A2]. It is the step up from a failed cheap draft before spending
  Claude or Codex quota, and composer-2.5's fallback. Its own fallback, gpt-6.1-sol, keeps the run
  off Claude Pro. It is no role's primary model: where it ties the leaders (native patching,
  [Security](#security)), nothing measures it on the rest of the role.
- **Build and environment failures skip grok-4.7**: TB4.0 33.3 in Grok Build [C1], 28.8 on Vals
  [V12].
- **sonnet-5.5 is off the ladder.** Below max it buys about what opus-5.5 buys one effort level
  lower [C3,A8], so a failed sonnet-5.5 run moves to the top rung. Its roles are niches: UI and
  migration into Python [V5,V7], and Docs by the user's choice.
- **Top rung, two vendors.** A second failure on one top-rung model goes to the other vendor.

### Removed by the user

Not benchmark decisions:
- **Best-of-2** (opus-5.5 and gpt-6.1-sol on the same brief, keep the better diff): too costly.
- **Cross-vendor alternative lane** (gpt-6.1-sol when Claude models are stuck): redundant with the
  ladder's vendor swap on the top rung.
- **gpt-6-astra**: 5× gpt-6.1-sol's Codex credits per token [O9].

## Subscriptions and models

The skill runs on the user's personal subscriptions: **Claude Pro** (Claude Code), **ChatGPT Plus**
(Codex), and **the X Subscription** (Grok Build, plus Cursor access to the Grok and Composer
models; it replaced SuperGrok on 2026-10-13 [U4]). Checked against the local CLIs on 2026-10-14 as
well as the sources.

- **Claude Pro → Claude Code** (T3 `claudeAgent`). Opus 5.5, Sonnet 5.5, Haiku 5.5. Opus 5.5 is
  included on Pro since 2026-09-22 [P1,P2]; Fable 5.1 is not in Pro's limits (usage credits only)
  [P2], so the skill leaves it out. Claude Code and chat share one quota: a rolling 5-hour window
  plus weekly caps [P3,P4,Q4].
- **ChatGPT Plus → Codex** (T3 `codex`). `codex debug models` lists gpt-6.1-sol, gpt-6-astra,
  gpt-6-sol, gpt-6-luna, and the older 5.6 family. gpt-6.1-sol reached Plus in Codex on 2026-09-29;
  gpt-6-astra in early September [O2,O3]. Plus has a 5-hour window and weekly caps shared between
  Codex and ChatGPT Work, restored on 2026-08-25 [O4]. Ultrafast tiers are not on Plus [O2].
- **X Subscription → Grok Build** (T3 `grok`). `grok models` lists grok-4.7 (default),
  grok-4.7-build-fast, grok-4.6, grok-4.5. Build-fast is the same model at 2× speed and 2× token
  price [X1]; the user has hidden it in T3. Composer 2.5 was announced for Grok Build on 2026-06-01
  but later reports say it is gone from the model list [X2,X3]; the local list confirms.
- **X Subscription → Cursor** (T3 `cursor`, via the Cursor SDK). Grok 4.7, 4.6, 4.5, and Composer
  2.5 sit in the "Cursor Models" pool, with "significantly more included usage" than third-party
  models [U1]. "Grok and Cursor usage draw from the same included pool" [U4], so grok-4.7 and
  composer-2.5 share one quota. (Before the X Subscription, a SuperGrok link granted only Grok Bot
  usage in Cursor [U2,X3].) In T3 the user has hidden every Cursor model except `composer-2.5`
  (settings checked 2026-10-14). Trust what `orchestrator_capabilities` lists.

### The six models

Each runs in its vendor's own harness, the one its TB4.0 row was measured in: Claude models in
Claude Code, GPT models in Codex, grok-4.7 in Grok Build [T1]; composer-2.5 in the Cursor agent,
with no TB4.0 row.

| Model | Harness | List $ per 1M in / out | Context | Coding signals | AA Intelligence Index |
|---|---|---|---|---|---|
| **opus-5.5** | Claude Code | $4 / $20 [A1] | 1M | TB4.0 64.85% in Claude Code (#1) [T1]; vendor SWE-bench Pro 89.9% [A4] | 58 [A4] |
| **sonnet-5.5** | Claude Code | $2 / $10 [A1] | 1M | TB4.0 61.82% in Claude Code (#2) [T1]; vendor SWE-bench Pro 81.3% [A3] | 56 (max) [A2] |
| **haiku-5.5** | Claude Code | $0.10 / $0.50 (≤100k prompt) [A1] | 1M | TB4.0 32.8% (AA, max) [A2]; vendor SWE-bench Pro 64.8% [A3] | 43 (max) [A2] |
| **gpt-6.1-sol** | Codex | $2 / $10 (≤272k) [O1] | 1M | TB4.0 58.18% max in Codex [T1]; Codex: "near-Astra performance at a lower cost" (local model list) | 52 [O1] |
| **grok-4.7** | Grok Build | $2 / $6; Fast $4 / $12 (Cursor) [U1,U3] | 256k, 500k long [U3] | TB4.0 37.58% in Grok Build, xhigh [T1]; TB2.1 76.0% [X1] | unknown (Grok 4.6 high: 61) [O6] |
| **composer-2.5** | Cursor | $0.50 / $2.50; Fast $3 / $15 [U1] | 200k [X2,V13] | vendor TB2.0 69.3%, SWE-bench Multilingual 79.8% ≈ Opus 4.7 [K1,K2]; Vals SWE-bench 79.6 (#25 of 88), TB2.1 58.4 (#41 of 75) [V13]; no TB4.0 row | unknown |

Not used, each compared inside its own price class:
- gpt-6-astra: TB4.0 58.18% max in Codex [T1], AA 61 [O6], but 5× gpt-6.1-sol's Codex credits per
  token [O9]; the user excluded it.
- gpt-6-sol (TB4.0 49.39%) loses to gpt-6.1-sol (58.18%) at the same $2/$10 list price [T1,O7].
- gpt-6-luna ($0.10/$0.50, TB4.0 16.36%) loses to haiku-5.5 at that price (32.8%) [T1,A1,A2,O7].
- grok-4.6 (20.30%) and grok-4.5 (12.42%) lose to grok-4.7 [T1].

Speed: gpt-6.1-sol streams about 48 output tokens/s vs opus-5.5's 95 [C2], but it uses about a
third of the output tokens per task, so its agent wall time is still lower at equal or better
scores [C1,C2].

## Evidence by kind of work

"Winner" means a gap larger than the stated error bars. Costs are each source's own $ per task,
comparable only within a row. Vals runs use max effort unless noted [V1,V2,V3,V11,V12].

| Category | Evidence | Verdict |
|---|---|---|
| **Long-horizon repo implementation** (features, bug fixes) | DeepSWE (native CLI): sol xhigh 73.2, grok xhigh 72.6, sol medium 72.0 = sonnet max 72.0 > opus max 68.4; opus below max unknown [C1]. Vendor: sol high 75.2% [O8], opus 74.2% [A5]; opus internal repo tasks medium 86.6 / high 88.4 [A8]. Datacurve's board has no rows for these versions [D1]. | **sol ≥ Claude**, grok close |
| **Terminal / build / ops / environment** | TB4.0 at max: opus 64.85, sonnet 61.82, sol 58.18 [T1,T2]; Vals: opus 65.15, sonnet 64.14, sol 55.05 [T3]; Mercor (harness unstated): sol 59.6, opus 58.3, sonnet 51.5 [T4]; Snorkel Agentic Coding 2.0: sol 42.8 vs opus 40.4 [T6]. Same effort (AA setup): opus 4–5 pts ahead of sol; sonnet behind both below xhigh [C3]. grok: 33.3 in Grok Build [C1], 28.8 on Vals [V12]. | **opus at equal effort**; sol ≈ opus one level lower; sonnet only at max |
| **Codebase Q&A / exploration** | SWE-Atlas-QnA: sonnet max 66.9, opus max 66.4, grok 62.9, sonnet xhigh 62.1, sol 57.8–61.0, sonnet high 56.5, sonnet medium 44.9 [C1]; opus below max unknown; opus refused 14% [C1]. | **sol at medium/high**; Claude only at xhigh/max |
| **Visual: bugs reported with screenshots** | SWE-bench Multimodal: opus 70.2, sonnet 58.3, haiku 44.0, sol 43.5, grok 42.9 [V4,V11,V12]. Vendor: opus at low reads dense charts better than Opus 5 at its highest effort [A9]. | **opus, clearly** |
| **Frontend / web apps from scratch** | Vibe Code Bench v1.1 (OpenHands): sonnet 92.4 ($31), haiku 90.4 ($6.07), opus 90.3 ($58), sol 88.9 ($6.23), grok 86.2 ($15.83), composer 49.6 (Cursor CLI, $0.50) [V5]. WebDev Arena: opus-5.5-max #1 at 1813 [W1]; sol-max #4 at ~1760 [W3]. | **sonnet**; haiku/opus within noise; sol −3.5 |
| **Program from spec, greenfield** | ProgramBench fully resolved: opus 18.5, sonnet 6.5, sol 3.0, haiku 2.5, grok 0.5 [V6,V11,V12]. | **opus** |
| **Cross-language migration** | Code Migration: sonnet 69.8, opus 66.7, sol 65.1 (±4.3), grok 44.8, haiku 44.6. Into Python: sol 55.4 vs sonnet 70.6 [V7,V11,V12]. | **Tie** sonnet/opus/sol, except Python targets |
| **Algorithms / competitive programming** | IOI: sol 96.9 ($1.26), opus 95.1 ($5.26), sonnet 83.1, grok 57.7, haiku 47.3 [V8,V11,V12]. | **sol ≈ opus** |
| **Scientific computing** | SciCode: opus 66.9 (max) / 59.3 (medium) > sonnet 61.0 > sol ≤55.8 [C3]. TB-Science: Vals sol 52.9 vs opus/sonnet 47.1 [V1,V2,V3]; vendor opus 58.7 [A5], sol 57.0 [O8]. | **opus** on code; tie on agentic science |
| **Security: native vulnerabilities** | CyberBench Patch track: haiku 89.3, opus-CVP 87.5, sonnet 87.5, opus 85.7, grok 83.9, sol 78.6; within ~1σ except sol [V9]. Details in [Security](#security). | **Tie on patching** |
| **Security: secure code, managed languages** | Endor Labs Agent Security League (Python): sol 34.1, opus 33.5, composer 14.0; no sonnet, haiku, or grok rows [E1]. | **sol ≈ opus** |
| **Binary reverse engineering** | SRE Bench: sol 50.8 (#2), opus 33.6, sonnet 30.2, haiku 5.7, grok 3.8 [V10,V11,V12]. | **sol, clearly** |
| **Code review / bug finding** | No current-generation data. Previous generation: opus-5 found 79.6% of pre-merge bugs in its top 5 comments vs gpt-5.6-sol 65.6% and sonnet-5 64.7% [R1]. Vendor: early testers report stronger review from Opus 5.5 than Opus 5 [A9]. | unknown |
| **Mixed real-user agent tasks** | Agent Arena: opus (high) #2 +12.15% $1.31; sonnet (max) #3 +12.5% $2.74; sol (max) #5 +11.23% $0.56 (Arena posts read via search excerpts) [W2]. | **Near tie** |
| **SWE-bench Pro / Verified** | Vendor public set: opus 89.9, sonnet 81.3 [A4,A3]; sol unknown; Scale V2 has no rows [S1]. Vals SWE-bench: composer-2.5 79.6 (#25/88) [V13]. | unknown |
| **TB4.0 per-category** | Per-task data is on the JS-rendered Harbor Hub leaderboard [T5]. Vals shows a few opus cells only [T3]. | unknown |
| **Prose (docs, READMEs)** | No benchmark found. | unknown |

### Security

The Security role takes cybersecurity work: vulnerabilities, auth, access control, crypto,
secrets. In the fusion loop that work is defensive: fix a reported vulnerability, harden code,
write security-sensitive logic correctly. Two benchmarks cover it for current models, one per half.

**CyberBench v1.1** (Vals AI, updated 2026-10-12) [V9] covers native code: OSS-Fuzz crash
regressions from ARVO images in real open-source projects. "Most tasks exercise memory-safety,
sanitizer, or undefined-behavior failures in native code"; web security, identity systems,
malware, and network intrusion are out of scope.
- **PoC track, 60 tasks:** given the source and fuzz target but no crash input or bug description,
  produce an input that crashes the vulnerable build and not the fixed one.
- **Patch track, 56 tasks:** given the source, the crashing input, and the sanitizer report, fix
  it; graded on the crash being gone and on behaviour matching the maintainer's fix on hidden
  checks. This is the role's work.
- The overall score is the unweighted mean of the two tracks (derived from the page data; every
  row checks exactly).
- Harness: mini-swe-agent for every model, not the vendor CLIs. Effort: grok xhigh, sol max,
  Claude max per the Vals model pages [V9,V2,V3,V11]. Refusals count as failures.

Per track, from the data embedded in the page [V9]; $ is mean cost per task:

| Model (Vals run) | Overall | PoC (60) | Patch (56) | Patch $ |
|---|---|---|---|---|
| haiku-5.5 | 75.5 ± 5.2 | 61.7 ± 6.3 | 89.3 ± 4.1 | 0.97 |
| opus-5.5 (CVP) | 74.6 ± 5.3 | 61.7 ± 6.3 | 87.5 ± 4.4 | 3.35 |
| grok-4.7 (xhigh) | 69.5 ± 5.7 | 55.0 ± 6.4 | 83.9 ± 4.9 | 2.82 |
| sonnet-5.5 | 59.6 ± 5.2 | 31.7 ± 6.0 | 87.5 ± 4.4 | 6.51 |
| opus-5.5 (standard) | 55.4 ± 5.1 | 25.0 ± 5.6 | 85.7 ± 4.7 | 4.33 |
| gpt-6.1-sol (max) | 39.3 ± 2.7 | 0 (all 60 failed; latency 0, cost null) | 78.6 ± 5.5 | 0.29 |

- **Patch is a tie.** haiku vs grok 0.8σ, haiku vs opus 0.6σ, grok vs opus 0.3σ, haiku vs sol
  1.6σ, opus vs sol 1.0σ.
- **The overall gaps come from the PoC track**, where safeguards bite: opus standard 25.0 vs 61.7
  with Anthropic's Cyber Verification Program (CVP, a separate Vals entry), 4.4σ. Sonnet drops from
  59.58 to 41.97 when its fallback-assisted tasks count as failures [V3].
- **haiku's lead is lighter safeguards, not capability.** It ran "without a refusal fallback"
  [V11]; its cyber classifiers "trigger on significantly less activity" than those on the larger
  models [A11]. With safeguards off, Anthropic says Haiku 5.5 "fell short of results achieved by
  Opus 5.5, Claude Mythos 5.1, and even Opus 5" [A11]. Elsewhere it is the weakest agent in the
  set (TB4.0 6–30, DeepSWE 45–49 in Claude Code [C1]).
- **sol's PoC row has no latency or cost**, so it likely never made a measured attempt: a block
  or a run error. Vals doesn't say which; sol ships with OpenAI's strongest cyber safeguards
  [O10], which fits a block but doesn't prove it.

**Endor Labs Agent Security League** [E1] covers managed-language code: 200 tasks from 108 Python
projects across 77 CWE classes, extending CMU's SusVibes; each agent runs in its own harness, and
the code must pass both functional and security tests.

| Harness / model | Secure (%) | Functional (%) |
|---|---|---|
| Codex gpt-6.1-sol | 34.1 | 77.7 |
| Claude Code opus-5.5 | 33.5 | 68.7 |
| Cursor composer-2.5 | 14.0 | 75.4 |

No error bars are given (about ±3.3 at n = 200), and there are no sonnet-5.5, haiku-5.5, or
grok-4.7 rows.

**No current rows for these models:** BaxBench (secure backends; newest rows Opus 4.5, GPT-5,
Grok 4) [B1], CyberGym (newest Claude row Opus 4.6) [B2], the original SusVibes board [B3],
Cybench, and SEC-bench [B4].

**Vendor cards, safeguards off.** Each card compares a model only with the same vendor's models,
so none of them ranks across vendors.
- Anthropic's cards report cyber capability with safeguards off, "the capability level that will
  be available to certain users via our Cyber Verification Program" [A11,A12].
- OpenAI treats GPT-6.1 Sol as **Critical** cyber capability under its Preparedness Framework;
  SEC-Bench Pro (vulnerability discovery in V8/SpiderMonkey) 78.8% vs GPT-6 Astra 85.4% [O10].
- xAI: Grok 4.7 shows "small cybersecurity-relevant capability gains over Grok 4.6, concentrated
  in … cyber-defense and vulnerability-mitigation tasks"; CyberGym 80.3% (high) vs GPT-5.6 Sol
  83.6%; CVE-Bench (web-app exploitation) 37.7% (high) [X4].

## Effort

Headline scores are max-effort runs (opus-5.5 and sonnet-5.5 at max, grok-4.7 at xhigh [T1]); the
skill runs children at `low`/`medium`/`high` and names `xhigh` only for some roles and on
escalation. Claude Code defaults Opus 5.5, Sonnet 5.5 and Haiku 5.5 to `medium` [A10].

### Native CLIs: Artificial Analysis Coding Agent Index

The Coding Agent Index runs each model in its own CLI and averages three benchmarks: DeepSWE v1.1
(113 long-horizon repo tasks), SWE-Atlas-QnA (124 codebase questions), and Terminal-Bench 4.0
(66 tasks) [C1]. Values come from the data embedded in the page (accessed 2026-10-15). Cost is the
mean API-list $ per task. Opus 5.5 was run here only at max.

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
  medium: DeepSWE 72.0 vs 65.5, QnA 60.8 vs 44.9, TB4.0 51.5 vs 27.3, for about the same $ per
  task (0.70 vs 0.62) [C1]. Sonnet catches up only at xhigh, where the two tie (62.9) and sonnet
  costs 3.2× more; it leads only at max.
- grok-4.7 matches gpt-6.1-sol on DeepSWE and QnA but scores 33.3 on TB4.0, at $8.82 a task vs sol
  xhigh's $1.04 [C1].

### Opus 5.5 below max

Artificial Analysis has no Coding Agent Index runs of opus-5.5 below max, but its Intelligence
Index ran all four Claude/GPT models at every effort [C3]. Those runs include TB4.0 in Artificial
Analysis's own setup rather than the vendor CLIs, so the scores differ from the table above (opus
max 59.6 here vs 63.1 in Claude Code). Compare *within* this table.

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
- **Opus vs Sonnet.** Opus medium beats Sonnet high everywhere: TB4.0 +8.6 at 1.8× cost and Index
  +4.4 at 1.5× cost [C3]; vendor internal tasks +8.8 at 2.5× cost [A8]. Opus medium matches Sonnet
  xhigh for 0.67× the cost (Index 51.2 vs 51.9, TB4.0 52.5 vs 57.1), and Opus high beats Sonnet
  xhigh on the Index (53.6 vs 51.9) and ties on TB4.0 (56.6 vs 57.1) at 0.9× [C3]. **Below max,
  sonnet-5.5 buys about what opus-5.5 buys one effort level lower, for about the same money**
  [C3,A8]; Sonnet clearly wins only at max (TB4.0 63.6 vs 59.6) [C3] and in the niches in
  [Evidence by kind of work](#evidence-by-kind-of-work). This is API dollars; how Claude Pro meters
  each model is unpublished ([Quotas](#quotas)).
- **The model sets the ceiling; effort tunes within it.** haiku-5.5 goes from Index 37.8 at high
  to 43.4 at max, still below opus-5.5 and gpt-6.1-sol at medium [C3].
- **Quota and latency.** Thinking tokens count against the subscription's limits and add
  wall-clock time on every turn, so the cost grows with the number of tool-use turns. Anthropic:
  higher effort "uses more tokens and reaches usage limits faster" [Q5].

Per model:
- **opus-5.5:** `medium` for most work; `high` for Hardest and Greenfield. `low` ≈ Sonnet `high`
  on vendor SWE-bench Pro; `xhigh` adds 1.4 points there for 2.5× the cost of `high` [A8]; `max`
  adds nothing on TB4.0 over `xhigh` (59.6 both) [C3].
- **sonnet-5.5:** a steep curve. Anthropic recommends `medium` for well-specified agentic coding
  and `high` for harder work [A7], but below `xhigh` it is the weakest frontier model on TB4.0 and
  QnA [C1,C3]. At `max` it uses 27.7M tokens a task [C1] and more often ran the code-review skill
  across subagents, causing timeouts [A6].
- **haiku-5.5:** default `medium` [A7]; its best Coding Agent Index score is at `xhigh` (41.4); `max`
  is lower (36.5) [C1].
- **gpt-6.1-sol:** a flat curve, so `medium` for most work and `xhigh` for the hardest. In the
  native-CLI runs `max` scores below `xhigh` on every benchmark at 1.5× the cost and 1.6× the wall
  time [C1]; OpenAI's DeepSWE figures agree (high 75.2%, xhigh/max 71.9%; vendor, secondhand) [O8].
  Artificial Analysis's own setup shows max slightly above xhigh (TB4.0 56.1 vs 54.0) [C3].
- **grok-4.7:** measured only at `xhigh` [C1]; Grok Build's levels top out there.
- **composer-2.5:** exposes no effort setting.
- Levels above `max`: Codex's `ultra` adds "automatic task delegation", i.e. its own subagents; the
  skill never uses them, since the orchestrator owns delegation.

## Refusals and safeguards

Opus 5.5 and Sonnet 5.5 run safety classifiers for cybersecurity, biology and reasoning
extraction. A declined request either fails or, with fallback configured, is retried on another
model [A9]. In Claude Code it falls back automatically: Opus 5.5 "falls back to Claude Opus 4.8 for
requests that are blocked by our cyber classifier system … automatically in our own applications"
[A12], so a child keeps going on an older model without saying so. Whether a fallback turn counts
against Pro, and at which model's rate, is unknown.

Refusal and fallback in the benchmarks:

| Benchmark | opus-5.5 | sonnet-5.5 | haiku-5.5 | gpt-6.1-sol / grok-4.7 |
|---|---|---|---|---|
| DeepSWE, attempts refused (CLI, max) [C1] | 0.6% (2/339) | 0% | 0% | 0% / 0% |
| SWE-Atlas-QnA [C1] | **14.0%** (52/372) | 10.5% (max), 8.3% (high), 4.6% (medium) | 0% | 0% / 0% |
| TB4.0 [C1] | **12.1%** (24/198) | 3.0% | ≤1.5% | 0% / 0% |
| TB4.0, fallback-assisted (Vals) [T3,V2] | 22/198; score 65.15 → 58.08 if counted as failures | 50.51 if counted (from 53.03) [V3] | — | — |
| SRE Bench (reverse engineering) [V2,V3] | 82.8% fallback-assisted; 33.6 → 5.3 | 30.2 → 19.1 | — | — |
| CyberBench PoC track [V9] | 25.0 standard vs 61.7 with CVP | 59.6 → 42.0 overall if counted [V3] | 61.7, no fallback [V11] | 0, no measured attempts / 55.0 |

Opus's refusal rate is highest on exactly the security, reverse-engineering, and terminal work
where it otherwise scores well. Defensive fixing trips its classifiers least: on CyberBench's
Patch track opus standard scores 85.7 vs 87.5 with CVP [V9].

Cyber safeguards per harness:

| Model | Harness | Cyber safeguards | On a block |
|---|---|---|---|
| opus-5.5 | Claude Code | three stages: activation probe, classifier, judge model; same policy as Opus 5 [A12] | falls back to Opus 4.8 [A12] |
| sonnet-5.5 | Claude Code | the same three-stage system [A13] | falls back; in one coding eval 11% of rollouts were served by the fallback [A13] |
| haiku-5.5 | Claude Code | narrow classifiers for "specific harmful cyber activities" [A11] | no fallback model: the request is blocked [A11] |
| gpt-6.1-sol | Codex | the GPT-6 Astra stack, OpenAI's strongest to date [O10] | refusal or block |
| grok-4.7 | Grok Build | production safeguard stack, tested on HackerBench for harmful compliance vs benign refusal [X4] | refusal; rates in the card's figure could not be read reliably |
| composer-2.5 | Cursor | not documented | unknown |

Ways to fewer restrictions, neither confirmed for the user's plans:
- **Anthropic Cyber Verification Program:** "qualifying security professionals who are blocked by
  our cyber safeguards" get reduced classifiers [A11,A12]. No source says whether it covers Claude
  Code on a personal Pro plan.
- **OpenAI Trusted Access for Cyber ("Daybreak"):** a phased programme for "more advanced,
  authorized work through more precise safeguards" [O10].

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
- **X Subscription.** grok-4.7 and composer-2.5 share one pool [U4], whose size nobody has
  measured.
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

The decisive difference is **who else draws on the pool**. Every Claude child shares Pro with the
opus-5.5 orchestrator [Q4]; Plus carries only the GPT children. Hence SKILL.md's tie-break: where
two models fit a role about equally, the non-Claude one.

## Re-check when

- Artificial Analysis runs opus-5.5 below max on the Coding Agent Index;
- an official Pro per-model multiplier appears;
- TB4.0 per-category data for gpt-6.1-sol appears;
- a current-generation review benchmark lands;
- Vals publishes CyberBench refusal counts or re-runs gpt-6.1-sol's PoC track;
- Endor Labs adds sonnet-5.5, haiku-5.5, or grok-4.7 rows, or another cross-vendor secure-coding
  benchmark covers these models in their vendor CLIs;
- Anthropic says whether the Cyber Verification Program covers Claude Code on Pro.

## Sources (accessed 2026-10-14 to 2026-10-16)

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
- [A11] Anthropic, Claude Haiku 5.5 System Card (§1.5 Safeguards, §3 cyber) — https://www.anthropic.com/claude-haiku-5-5-system-card (redirects to the PDF)
- [A12] Anthropic, Claude Opus 5.5 System Card (§1.5 Safeguards, §3 cyber, fallback to Opus 4.8) — https://www.anthropic.com/claude-opus-5-5-system-card (redirects to the PDF)
- [A13] Anthropic, Claude Sonnet 5.5 System Card (§1.5 Safeguards, cyber, fallback share in coding scenarios) — https://www.anthropic.com/claude-sonnet-5-5-system-card (redirects to the PDF)
- [O1] Artificial Analysis, GPT-6.1 Sol vs GPT-6 Luna — https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-gpt-6-luna
- [O2] OpenAI Help Center, GPT-6 and other models in ChatGPT — https://help.openai.com/es-es/articles/20001354-gpt-6-and-other-models-in-chatgpt
- [O3] Notebookcheck, "GPT-6 Astra is on ChatGPT Plus, but only in Work and Codex" — https://www.notebookcheck.net/GPT-6-Astra-is-on-ChatGPT-Plus-but-only-in-Work-and-Codex.1391574.0.html
- [O4] Notebookcheck, "OpenAI abruptly restores harsh 5-hour Codex and Work limits for ChatGPT Plus" — https://www.notebookcheck.net/OpenAI-abruptly-restores-harsh-5-hour-Codex-and-Work-limits-for-ChatGPT-Plus.1378377.0.html
- [O5] Developers Digest, "Codex Usage Limits and Pricing in 2026" — https://www.developersdigest.tech/blog/codex-usage-limits-pricing-2026
- [O6] Artificial Analysis, GPT-6 Astra (high) vs Grok 4.6 (high) — https://artificialanalysis.ai/ko/models/comparisons/gpt-6-astra-high-vs-grok-4-6
- [O7] OpenAI, API pricing (gpt-6-luna $0.10/$0.50; gpt-6.1-sol $2/$10) — https://developers.openai.com/api/docs/pricing
- [O8] OpenAI, "Introducing GPT-6.1 Sol" — https://openai.com/index/introducing-gpt-6-1-sol/ (HTTP 403 to automated fetch; figures read from Emergent's summary: https://emergent.sh/learn/gpt-6-1-sol-benchmarks)
- [O9] OpenAI, Codex pricing and usage limits — https://learn.chatgpt.com/docs/pricing (redirect from https://developers.openai.com/codex/pricing)
- [O10] OpenAI Deployment Safety Hub, GPT-6.1 Sol system card addendum (§9.1.2 Cybersecurity Capabilities, §9.2 Safeguards, §9.2.1.3 Trusted Access for Cyber) — https://deploymentsafety.openai.com/gpt-6-1-sol ; GPT-6 Astra, Trusted Access for Cyber — https://deploymentsafety.openai.com/gpt-6-astra/cybersecurity---trusted-access-for-cyber ; Daybreak guide — https://developers.openai.com/api/docs/guides/daybreak
- [X1] BenchLM, Grok 4.7 benchmark scores — https://benchlm.ai/md/models/grok-4-7.md ; eesel.ai, Grok 4.7 review — https://www.eesel.ai/blog/grok-4-7-review
- [X2] TestingCatalog on X, Composer 2.5 in Grok Build (2026-06-01) — https://x.com/testingcatalog/status/2061538730167377970
- [X3] Cursor Forum, "Composer 2.5 missing from grok models after alpha 1.0.42" — https://forum.cursor.com/t/grok-build-cli-grok-composer-2-5-missing-from-grok-models-after-alpha-1-0-42-not-cursor-ide-composer/173128
- [X4] xAI, Grok 4.7 Model Card (§6 Cyber capabilities and safeguards: CyberGym, CVE-Bench, HackerBench) — https://cursor.com/resources/grok-4-7-model-card.pdf
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
- [V2] Vals AI, Claude Opus 5.5 — https://www.vals.ai/models/anthropic_claude-opus-5-5 ; Claude Opus 5.5 (CVP) — https://www.vals.ai/models/anthropic_claude-opus-5-5-range
- [V3] Vals AI, Claude Sonnet 5.5 — https://www.vals.ai/models/anthropic_claude-sonnet-5-5
- [V4] Vals AI, SWE-bench Multimodal — https://www.vals.ai/benchmarks/swebench-multimodal
- [V5] Vals AI, Vibe Code Bench — https://www.vals.ai/benchmarks/vibe-code
- [V6] Vals AI, ProgramBench — https://www.vals.ai/benchmarks/programbench
- [V7] Vals AI, Code Migration — https://www.vals.ai/benchmarks/code-migration
- [V8] Vals AI, IOI — https://www.vals.ai/benchmarks/ioi
- [V9] Vals AI, CyberBench v1.1 (updated 2026-10-12; per-track scores, standard errors, per-task results and costs embedded in page) — https://www.vals.ai/benchmarks/cyber
- [V10] Vals AI, SRE Bench — https://www.vals.ai/benchmarks/srebench
- [V11] Vals AI, Claude Haiku 5.5 — https://www.vals.ai/models/anthropic_claude-haiku-5-5
- [V12] Vals AI, Grok 4.7 — https://www.vals.ai/models/grok_grok-4.7
- [V13] Vals AI, Composer 2.5 — https://www.vals.ai/models/cursor_composer-2.5
- [E1] Endor Labs, Agent Security League (AI Coding Agent Security Benchmark; extends SusVibes) — https://www.endorlabs.com/research/ai-code-security-benchmark
- [B1] BaxBench leaderboard — https://baxbench.com/
- [B2] CyberGym leaderboard — https://www.cybergym.io/cybergym/
- [B3] SusVibes leaderboard — https://leililab.github.io/susvibes-leaderboard/
- [B4] Cybench — https://cybench.github.io/ ; SEC-bench — https://sec-bench.github.io/
- [W1] Arena, Code Arena WebDev leaderboard (blocked to automated fetch; 2026-10-08 snapshot read via search excerpt) — https://arena.ai/leaderboard/code/webdev ; changelog — https://arena.ai/blog/leaderboard-changelog/
- [W2] Arena on X: Opus 5.5 — https://x.com/arena/status/2104617283679379704 ; Sonnet 5.5 — https://x.com/arena/status/2106105400487821764 ; GPT-6.1 Sol — https://x.com/arena/status/2106109027923140928 (paywalled to fetch; read via search excerpts)
- [W3] BenchLeader, GPT-6.1 Sol (Arena scores as of 2026-10-15) — https://www.benchleader.com/models/gpt-6-1-sol
- [D1] Datacurve, DeepSWE leaderboard — https://deepswe.datacurve.ai/
- [S1] Scale Labs, SWE-Bench Pro V2 — https://labs.scale.com/leaderboard/swe_bench_pro_public_v2
- [R1] "(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection" — https://arxiv.org/html/2610.13668
