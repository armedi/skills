# Model evidence (compiled 2026-10-15; rebuilt 2026-10-29 on Intelligence Index v5.0, with gpt-6.1-terra)

Per-model evidence behind the **Models** and **Effort** sections of
[routing](../../skills/routing/SKILL.md). Why each agent type gets its model is in
[agent-types.md](../routing/agent-types.md), which cites this file for its numbers.

- [Subscriptions and harnesses](#subscriptions-and-harnesses): what the user can run, and where.
- [The six models](#the-six-models): price, speed, and headline scores.
- [Evidence by kind of work](#evidence-by-kind-of-work), with [Security](#security) in detail.
- [Effort](#effort): how effort changes each model's score and cost.
- [Refusals and safeguards](#refusals-and-safeguards) and [Quotas](#quotas).

Conventions:
- Figures as published by the cited source around the date shown. "Vendor" = self-reported by
  the model maker. "Unknown" = not found; nothing invented.
- Different benchmark versions and harnesses are **not** directly comparable. Compare within a row
  or table.
- "±" is the source's own standard error (1σ). A gap is diff ÷ √(SE₁² + SE₂²), treating rows as
  independent. Where a source publishes no σ, the binomial √(p(1−p)/n) over attempts is used; repeats
  of one task are correlated, so it understates the true σ.
- `deepseek-v4.1-flash` is the 1017 build, which DeepSeek serves as `deepseek-flash` [F1]. "Sept
  build" is its 2026-09-10 predecessor, cited only where 1017 has no row.
- Claude rows on Vals and Artificial Analysis (AA) include attempts that Anthropic's safeguards
  handed to an older Claude model ("fallback-assisted"); see
  [Refusals and safeguards](#refusals-and-safeguards).
- Vals runs use max effort unless noted.

## Subscriptions and harnesses

Each model runs in its maker's harness, launched as an hc child. Checked against the local CLIs on
2026-10-14 and 2026-10-31.

- **Claude Pro → Claude Code** (`claude`): opus-5.5, sonnet-5.5. Opus 5.5 is on Pro since
  2026-09-22 [P1]. Claude Code and chat share one quota: a rolling 5-hour window plus weekly caps
  [Q4].
- **ChatGPT Plus → Codex** (`codex`): gpt-6.1-sol and gpt-6.1-terra, both in Codex and Work on
  Plus [O2,O9]. A 5-hour window and weekly caps, shared with ChatGPT Work [O4,O9].
- **X Subscription → Grok Build** (`grok`): grok-4.7, at `low`, `high`, or `xhigh` [C3]. Its pool
  is shared with Cursor's models [U4]. grok-4.7-build-fast is the same model at 2× speed and price
  [X1].
- **Command Code CLI** (`cmd`): deepseek-v4.1-flash, as `deepseek/deepseek-v4.1-flash` on Command
  Code's own provider. Replaces the DeepSeek Harness (dsh), which T3 ran over ACP [G9,H1]; dsh has
  no interactive terminal profile for hc to run.

Not used:
- gpt-6-astra: AA 61 [O6], but 5× sol's Codex credits per token [O9]; the user excluded it.
- haiku-5.5 and composer-2.5 are dropped from dispatch.
- Fable 5.1 is not in Pro's limits [P2].
- gpt-6-sol, gpt-6-luna, grok-4.6 and grok-4.5 lose to their successors at the same price [T1].

## The six models

| Model | Harness | List $ per 1M in / out | Context | Output tok/s | Intelligence Index (top effort) | Coding Agent Index, own harness (top effort) | TB4.0 on Vals |
|---|---|---|---|---|---|---|---|
| **opus-5.5** | Claude Code | $4 / $20 [A1] | 1M | 98 | 58.4 (max) | 61.7 (max) | 65.2 |
| **sonnet-5.5** | Claude Code | $2 / $10 [A1] | 1M | 137 | 54.2 (max) | 59.3 (max) | 64.1 ±1.0 |
| **gpt-6.1-sol** | Codex | $2 / $10 (≤272k) [O1] | 1M | 79 | 54.5 (max) | 54.1 (max) | 55.1 ±1.8 |
| **gpt-6.1-terra** | Codex | $1 / $5 [C3] | 1M | 91 | 51.0 (max) | 48.2 (xhigh) | 49.5 ±1.8 |
| **grok-4.7** | Grok Build | $2 / $6 [U3] | 500k | 104 | 35.0 (high) | 46.6 (xhigh) | 28.8 ±2.3 |
| **deepseek-v4.1-flash** | DeepSeek Harness | $0.15 / $0.60 off-peak, 2× peak [F1] | 1M | 178 | 32.5 (max) | 46.3 (max) | 31.8 ±2.6 |

Context and output speed come from AA at the top effort [C3,C4]. The Intelligence Index is AA's
v5.0 composite [C3,C4]. The Coding Agent Index averages FrontierCode v1.1, SWE-Atlas-QnA, and TB4.0,
each run in the model's own harness [C1]. The TB4.0 column is from Vals [T3].

## Evidence by kind of work

"Winner" means a gap larger than the stated error bars. Costs are each source's own $ per task,
comparable only within a row. "No row" = the source didn't run that model.

| Category | Evidence | Verdict |
|---|---|---|
| **Repo implementation** (features, bug fixes) | **FrontierCode v1.1, own harness, top effort:** opus 56.0, sol 49.4, sonnet 47.6, deepseek 46.5, terra 44.9 (xhigh), grok 43.6 (σ ≈ 2.9) [C1]. **Earlier DeepSWE run (2026-10-15):** grok xhigh 72.6, sol medium 72.0 = sonnet max 72.0, opus max 68.4 [C1]. | **opus** at max (1.6σ over sol); the rest within 2σ of each other |
| **Terminal / build / ops** | **Vals TB4.0:** opus 65.2, sonnet 64.1, sol 55.1, terra 49.5, deepseek 31.8, grok 28.8 [T3]. **Own harness:** sonnet 66.2, opus 63.1, sol 53.0, terra 48.5, grok 33.3, deepseek 30.8 [C1]. At equal effort, see [Effort](#effort). | **opus/sonnet**; terra 2.2σ below sol; grok and deepseek far behind |
| **Codebase Q&A** | **SWE-Atlas-QnA, own harness, top effort:** opus 65.9, sonnet 64.2, grok 62.9, deepseek 61.6, sol 59.9, terra 54.0 (σ ≈ 2.5) [C1]. **Earlier run:** sol medium 60.8 vs sonnet medium 44.9 and sonnet high 56.5 [C1]. | **Claude** at max; grok, deepseek and sol tie; terra behind |
| **Web research** | **Vals Finance Agent v2.1** (web search + filings + fetch): opus 67.8, sonnet 67.3, deepseek 62.9, sol 61.8, grok 60.6, terra 56.0 (each ±2.1) [V16]. **Vals Legal Research:** opus 50.5, sonnet 48.1, grok 47.1, deepseek 45.2, sol 38.5, terra 26.0 (±3.0–3.5) [V17]. dsh's search backend: **AA Search Index** puts DeepSeek Search API at 69.1 vs OpenAI web search 74.4, same answer model (15th of 25) [S2]. | **Claude** leads; deepseek ties sol and grok; terra trails |
| **Recall without tools** | **AA-Omniscience at top effort** (accuracy / share of misses answered wrongly instead of abstaining): opus 65.5 / 50.3, sol 61.8 / 51.9, sonnet 51.5 / 43.3, terra 47.6 / 34.5, grok 42.7 / 20.0, deepseek 39.6 / 64.1 [C3,C4]. | opus and sol know most; deepseek guesses most, grok least |
| **Visual: bugs shown in screenshots** | **SWE-bench Multimodal:** opus 70.2, sonnet 58.3, Sept build 46.5, sol 43.5, grok 42.9; terra no row [V4]. | **opus, clearly** |
| **Computer use** | **Vals CUA-bench:** opus 14.0; no row for the other five [V18]. **Vendor:** opus OSWorld 2.1 81.8% [A5]; terra's OSWorld result is compared only with GPT-5.6 Terra [O11]; Codex calls terra "a fast, efficient choice for … computer use" [O13]. | unknown |
| **Frontend from text** | **Vibe Code, OpenHands:** sonnet 92.4 ±1.3, opus 90.3 ±1.5, sol 88.9 ±1.9, deepseek 87.7 ±2.8, grok 86.2 ±2.2, terra 84.0 ±2.9 [V5]. | **sonnet**; all but terra (2.6σ) within 2σ |
| **Greenfield from a spec** | **ProgramBench, fully resolved:** opus 18.5, sonnet 6.5, sol 3.0, grok 0.5, Sept build 0.5; terra no row [V6]. | **opus** |
| **Cross-language port** | **Code Migration v1.1:** sonnet 86.9 ±1.5, opus 81.0 ±3.2, sol 77.3 ±3.0, deepseek 67.5 ±2.8, grok 53.2 ±2.6; terra no row [V15]. **Into Python (v1):** sonnet 70.6 vs sol 55.4 [V7]. | **sonnet** (2.9σ over sol); sol ≈ opus; deepseek 2.4σ below sol |
| **Algorithms** | **IOI:** sol 96.9 ($1.26), opus 95.1 ($5.26), sonnet 83.1, grok 57.7, Sept build 40.3; terra no row [V8]. | **sol ≈ opus** |
| **Scientific computing** | **AA TB-Science, top effort:** opus 61.9 (xhigh), sol 58.1, terra 57.6, sonnet 53.3, deepseek 12.9, grok 9.5 (σ ≈ 5) [C3,C4]. **Vals TB-Science:** sol 52.9, opus 47.1, sonnet 47.1, grok 10.0, Sept build 0.0 [V19]. **SciCode (AA marks it "under review"):** opus 66.9, sonnet 61.0, grok 57.8, deepseek 55.9, sol 55.8, terra 55.1 [C3,C4]. | **opus ≈ sol ≈ terra** at top effort; grok and deepseek far behind |
| **Security: native code** | **CyberBench, overall:** deepseek (Sept build) 73.7, grok 69.5, sonnet 59.6, opus 55.4, sol 39.3; terra no row. The patch track is a tie [V9]. See [Security](#security). | **Tie on patching** |
| **Security: managed languages** | **Endor Labs (Python):** sol 34.1, opus 33.5; no other rows [E1]. | **sol ≈ opus** |
| **Binary reverse engineering** | **SRE Bench:** sol 50.8, opus 33.6, sonnet 30.2, grok 3.8, Sept build 0.8; terra no row [V10]. | **sol, clearly** |
| **Code review** | No current-generation data. Previous generation: opus-5 79.6% of pre-merge bugs found vs gpt-5.6-sol 65.6% [R1]. | unknown |
| **Prose** | No benchmark found. | unknown |

### Security

Security covers vulnerabilities, auth, access control, crypto, and secrets, and in the fusion
loop the work is defensive. Two benchmarks cover current models, one for each half of the work.

**CyberBench v1.1** (Vals, 2026-10-12) [V9]: OSS-Fuzz crash regressions in native code. All models
run in mini-swe-agent, and refusals count as failures.
- **PoC track (60 tasks):** craft an input that crashes the vulnerable build.
- **Patch track (56 tasks):** fix the bug, given the crash and the sanitizer report. This is the
  role's work.

| Model (Vals run) | Overall | PoC (60) | Patch (56) |
|---|---|---|---|
| deepseek (Sept build, high) | 73.7 ±5.3 | 61.7 | 85.7 |
| opus-5.5 (Cyber Verification Program) | 74.6 ±5.3 | 61.7 ±6.3 | 87.5 ±4.4 |
| grok-4.7 (xhigh) | 69.5 ±5.7 | 55.0 ±6.4 | 83.9 ±4.9 |
| sonnet-5.5 | 59.6 ±5.2 | 31.7 ±6.0 | 87.5 ±4.4 |
| opus-5.5 (standard) | 55.4 ±5.1 | 25.0 ±5.6 | 85.7 ±4.7 |
| gpt-6.1-sol (max) | 39.3 ±2.6 | 0 (no measured attempt) | 78.6 ±5.5 |

- **Patch is a tie:** every pair is within 1.6σ.
- **The overall gaps come from safeguards on PoC.** opus scores 25.0 standard vs 61.7 under the
  Cyber Verification Program (CVP), a 4.4σ gap. sol's PoC row has no latency or cost, so it most
  likely never made a measured attempt. deepseek and grok, with lighter safeguards, lead.
- haiku-5.5 (not dispatched) tops Patch at 89.3. It runs with no fallback, and its classifiers
  trigger on less [A11].

**Endor Labs Agent Security League** [E1]: 200 Python tasks across 77 CWE classes, each agent in
its own harness. Code must pass both functional and security tests.
- Codex sol: secure 34.1, functional 77.7.
- Claude Code opus: secure 33.5, functional 68.7.
- About ±3.3 each; no other models measured.

**No current rows** for these models on BaxBench, CyberGym, SusVibes, Cybench, or SEC-bench
[B1–B4]. Vendor cards compare only within one vendor:
- OpenAI rates GPT-6.1 Sol **Critical** for cyber capability [O10].
- xAI reports Grok 4.7 CyberGym at 80.3% [X4].
- Anthropic reports safeguards-off capability, which is what CVP users get [A12].

## Effort

AA's Intelligence Index v5.0 runs each model at every effort it offers, in AA's own harness rather
than the vendor CLIs [C3,C4]. Compare within these tables.

Index / TB4.0 / $ per Index task (TB4.0 σ ≈ 3.5, binomial over 198 attempts):

| Model | low | medium | high | xhigh | max |
|---|---|---|---|---|---|
| opus-5.5 | 34.5 / 31.3 / $0.98 | 48.1 / 52.5 / $2.45 | 51.7 / 56.6 / $3.47 | 57.0 / 59.6 / $6.05 | 58.4 / 59.6 / $10.04 |
| sonnet-5.5 | 25.3 / 20.7 / $0.51 | 30.3 / 29.8 / $0.78 | 41.1 / 43.9 / $1.64 | 49.6 / 57.1 / $4.09 | 54.2 / 63.6 / $10.02 |
| gpt-6.1-sol | 34.5 / 30.8 / $0.16 | 46.1 / 48.0 / $0.36 | 50.2 / 51.5 / $0.59 | 52.3 / 54.0 / $0.76 | 54.5 / 56.1 / $1.27 |
| gpt-6.1-terra | 29.2 / 15.2 / $0.07 | 38.1 / 32.3 / $0.17 | 42.3 / 41.9 / $0.26 | 45.0 / 46.5 / $0.40 | 51.0 / 55.6 / $0.96 |
| grok-4.7 | 30.9 / 16.2 / $2.92 | — | 35.0 / 24.7 / $6.18 | 34.3 / 25.8 / $7.51 | — |
| deepseek-v4.1-flash | — | — | — | — | 32.5 / 33.8 / $0.60 (peak price) |

TB-Science (about 105 tasks, σ ≈ 5) [C3,C4]:

| Model | low | medium | high | xhigh | max |
|---|---|---|---|---|---|
| opus-5.5 | 24.3 | 43.3 | 49.0 | **61.9** | 59.0 |
| sonnet-5.5 | 10.5 | 16.2 | 34.3 | 52.4 | 53.3 |
| gpt-6.1-sol | 11.0 | 37.1 | 46.2 | 50.5 | 58.1 |
| gpt-6.1-terra | 7.6 | 24.8 | 33.3 | 41.9 | 57.6 |
| grok-4.7 | 4.8 | — | 9.5 | 4.8 | — |
| deepseek-v4.1-flash | — | — | — | — | 12.9 |

What the data shows:
- **opus vs sol.**
  - At the same effort, opus leads TB4.0 by 4–5 points (medium 52.5 vs 48.0, high 56.6 vs 51.5)
    and the Index by 1.5–5.
  - opus medium matches sol xhigh on TB4.0 (52.5 vs 54.0) at 3.2× the $ per Index task.
- **opus vs sonnet.** Above `low`, opus one level lower scores as high for less. For example, opus
  medium (48.1, $2.45) matches sonnet xhigh (49.6, $4.09), and opus xhigh (57.0, $6.05) beats
  sonnet max (54.2, $10.02). sonnet leads only TB4.0 at max (63.6 vs 59.6).
- **sol vs terra.**
  - sol one level lower matches terra at about the same cost: sol medium 46.1 ($0.36) vs terra
    xhigh 45.0 ($0.40); sol high 50.2 ($0.59) vs terra max 51.0 ($0.96).
  - terra is cheaper per point only below sol medium's price.
  - Codex meters terra at half sol's credits per token [O9], so Plus quota follows API $.
- **deepseek vs terra.**
  - On the Index, terra medium (38.1, $0.17) beats deepseek max (32.5, $0.60 at peak).
  - On the Coding Agent Index, in each model's own harness, deepseek max (46.3, $0.30) beats terra
    medium (42.0, $0.39) [C1].
  - deepseek runs off the Plus quota.
- **grok.** `xhigh` scores no higher than `high` at 1.2× the cost. It costs the most per Index point
  of the six.
- **Thinking costs quota and time.** Thinking tokens count against subscription limits and add
  wall time on every tool turn [Q5].

Per model:
- **opus-5.5:**
  - Claude Code defaults to `medium` [A10]. `xhigh` → `max` buys +1.4 at 1.7× the cost.
  - Vendor: running `low`, then re-running failures at `high`, solved about 97% for $0.17. All at
    `high` solved 95.3% for $0.29 [A8].
- **sonnet-5.5:** the steepest curve, from Index 30.3 at `medium` to 54.2 at `max`. At `max`, a
  Coding Agent Index task takes 80 minutes [C1].
- **gpt-6.1-sol:** the flattest curve, 46.1 → 54.5 from `medium` to `max`. `xhigh` → `max` buys +2.2
  at 1.7× the cost. An earlier Codex run scored `max` below `xhigh` on every benchmark [C1].
- **gpt-6.1-terra:** steep at the top. `xhigh` → `max` buys +6.0 at 2.4× the cost on the Index. On
  the Coding Agent Index, `xhigh` and `max` tie (48.2 vs 48.1) at 0.56× the cost [C1].
- **grok-4.7:** offers `low`, `high`, and `xhigh`; `high` ≥ `xhigh`.
- **deepseek-v4.1-flash:** measured only at `max` [C1,C4]. Whether Command Code forwards each
  effort level upstream is unverified [M4].
- Codex's `ultra` adds its own subagents; unused, since the orchestrator owns delegation.

## Refusals and safeguards

Opus 5.5 and Sonnet 5.5 run safety classifiers for cybersecurity, biology, and reasoning
extraction [A9]. In Claude Code, a blocked Opus 5.5 request falls back to Opus 4.8 automatically
[A12]. A child therefore keeps going on an older model without saying so.

| Measure | opus-5.5 | sonnet-5.5 | gpt-6.1-sol | gpt-6.1-terra | grok-4.7 | deepseek |
|---|---|---|---|---|---|---|
| SWE-Atlas-QnA attempts refused [C1] | **14.0%** | 10.5% | 4.0% | 0% | 0% | 0% |
| TB4.0 attempts refused [C1] | **12.1%** | 3.0% | 0% | 0% | 0% | 0% |
| FrontierCode attempts refused [C1] | 0% | 0% | 0% | 0% | 0% | 0% |
| SRE Bench fallback-assisted [V2,V3] | 82.8%; 33.6 → 5.3 if failed | 30.2 → 19.1 if failed | — | — | — | — |
| CyberBench PoC [V9] | 25.0 (61.7 with CVP) | 31.7 | 0, no measured attempt | no row | 55.0 | 61.7 (Sept build) |
| Cyber safeguards | three-stage classifier; falls back to Opus 4.8 [A12] | same system; falls back [A13] | GPT-6 Astra stack [O10] | prompt-injection robustness similar to Sol and Astra [O12]; cyber stack not checked | production stack [X4] | none documented [H1] |

Two programmes loosen these restrictions; neither is confirmed for the user's plans:
- **Anthropic Cyber Verification Program:** reduced classifiers for qualifying security
  professionals [A11,A12].
- **OpenAI Trusted Access for Cyber ("Daybreak")** [O10].

## Quotas

Anthropic, OpenAI, and the X Subscription publish no absolute limits.

- **Claude Pro:** a 5-hour session limit plus a weekly limit, shared across Claude and Claude Code
  [Q4]. No per-model weight is published.
  - API list price makes Opus 2× Sonnet [A1].
  - Wokey measured Opus 5.5 at about 0.6× the limit per token of other Opus models [Q1].
  - The "Opus uses 5× Sonnet" figure has no source [Q6].
  - Working assumption: Pro consumption tracks API price. Check `/usage` to verify.
- **ChatGPT Plus (Codex):** per 5 hours, sol gets 15–160 local messages and terra 35–285 (Astra
  5–45) [O9]. Credits per 1M tokens (input / cached / output): sol 50 / 2.5 / 250, terra 25 / 1.25 /
  125 [O9].
- **X Subscription:** grok-4.7 shares a pool with Cursor's models [U4]; its size is unmeasured.
- **Command Code GOAT:** deepseek-v4.1-flash gets a boosted $80 monthly credit with "no end date"
  [M3]. GOAT caps a 5-hour window at $14 and a week at $35 for its $70 pool; no page says whether
  the boost raises them [M1,M3]. `/extra` pay-as-you-go credit is spent once a window is exceeded
  [M1].

Measured plan size, with the full limit priced at API list rates. The two sources disagree:

| Measure | Claude Pro | ChatGPT Plus |
|---|---|---|
| Wokey, real traffic, per week [Q1,Q2] | $170 | $92 |
| SemiAnalysis, agentic mix (via a secondary write-up) [Q3] | ≈ $272/week | ≈ $49/week |

Per-task burn: one Index task as a share of a week's plan, from the two plan sizes above. A Coding
Agent Index task costs about 1.1–1.3× these [C1].

| Effort | opus-5.5 (Pro) | sonnet-5.5 (Pro) | gpt-6.1-sol (Plus) | gpt-6.1-terra (Plus) |
|---|---|---|---|---|
| medium | 0.9–1.4% | 0.3–0.5% | 0.4–0.7% | 0.2–0.3% |
| high | 1.3–2.0% | 0.6–1.0% | 0.6–1.2% | 0.3–0.5% |
| xhigh | 2.2–3.6% | 1.5–2.4% | 0.8–1.6% | 0.4–0.8% |
| max | 3.7–5.9% | 3.7–5.9% | 1.4–2.6% | 1.0–2.0% |

At about equal Index, opus high (51.7) costs 1.3–2.0% of a Pro week and sol high (50.2) costs
0.6–1.2% of a Plus week. Every Claude child also shares Pro with the opus-5.5 orchestrator [Q4],
which is why ties go to the non-Claude model.

## Re-check when

- AA runs opus, sonnet, or sol below max on the current Coding Agent Index;
- a current-generation code-review benchmark lands;
- a computer-use benchmark covers terra and sol (CUA-bench, OSWorld);
- Vals adds terra to SWE-bench Multimodal, Code Migration, IOI, SRE Bench, or CyberBench;
- AA resolves SciCode's "under review" flag;
- Vals publishes CyberBench refusal counts, or re-runs sol's PoC track;
- Anthropic says whether CVP covers Claude Code on Pro;
- a benchmark runs deepseek with DeepSeek search in its own harness;
- dsh fixes its 429 handling or the ACP stdout log line [H3];
- an official Pro per-model multiplier appears.

## Sources (accessed 2026-10-14 to 2026-10-29; C1, C3, C4, L1, O9, and V16–V19 re-checked 2026-10-29)

- [P1] Notebookcheck, "Claude Opus 5.5 is included with Pro" — https://www.notebookcheck.net/Claude-Opus-5-5-is-included-with-Pro-and-Free-still-misses-out.1406452.0.html
- [P2] Christopher Alarcon, "Claude Opus 5.5 vs Fable 5.1: … which plan gets it" — https://christopheralarcon.com/blog/claude-opus-5-5-vs-fable/
- [Q1] Wokey, Claude usage limits (measured, data 2026-10-12; per-model weight from a regression on Pro accounts, 2026-09-28) — https://wokey.ai/claude-usage-limits
- [Q2] Wokey, Codex usage limits (measured, data 2026-10-08) — https://wokey.ai/codex-usage-limits
- [Q3] explainx.ai, summary of SemiAnalysis subscription-value testing (2026-10-06; original paywalled) — https://www.explainx.ai/blog/semianalysis-claude-vs-chatgpt-subscription-api-value-limit-testing-2026
- [Q4] Claude Help Center, "Use Claude Code with your Pro or Max plan" — https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan
- [Q5] claudeusage.dev, Opus 5.5 usage limits — https://www.claudeusage.dev/opus-5-5/
- [Q6] ClaudeLog, Claude Code limits (source of the unsourced "Opus ≈ 5× Sonnet" figure) — https://claudelog.com/claude-code-limits/
- [A1] Anthropic, Claude Opus 5.5 overview (model table incl. Sonnet/Haiku 5.5) — https://platform.claude.com/docs/en/models/opus-5-5/overview.md
- [A5] Anthropic, "Introducing Claude Opus 5.5" — https://www.anthropic.com/news/claude-opus-5-5 ; Opus 5.5 DeepSWE 74.2% via llm-stats — https://llm-stats.com/blog/research/claude-opus-5-5-launch
- [A8] Anthropic docs, Optimizing for cost and intelligence (effort sweeps, model comparison; vendor-internal) — https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence
- [A9] Anthropic docs, Prompting Claude Opus 5.5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 ; What's new in Claude Opus 5.5 — https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
- [A10] Claude Code docs, Model configuration (default model and effort per plan) — https://code.claude.com/docs/en/model-config
- [A11] Anthropic, Claude Haiku 5.5 System Card (§1.5 Safeguards, §3 cyber) — https://www.anthropic.com/claude-haiku-5-5-system-card (redirects to the PDF)
- [A12] Anthropic, Claude Opus 5.5 System Card (§1.5 Safeguards, §3 cyber, fallback to Opus 4.8) — https://www.anthropic.com/claude-opus-5-5-system-card (redirects to the PDF)
- [A13] Anthropic, Claude Sonnet 5.5 System Card (§1.5 Safeguards, cyber, fallback share in coding scenarios) — https://www.anthropic.com/claude-sonnet-5-5-system-card (redirects to the PDF)
- [O1] Artificial Analysis, GPT-6.1 Sol vs GPT-6 Luna — https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-gpt-6-luna
- [O2] OpenAI Help Center, GPT-6 and other models in ChatGPT — https://help.openai.com/es-es/articles/20001354-gpt-6-and-other-models-in-chatgpt
- [O4] Notebookcheck, "OpenAI abruptly restores harsh 5-hour Codex and Work limits for ChatGPT Plus" — https://www.notebookcheck.net/OpenAI-abruptly-restores-harsh-5-hour-Codex-and-Work-limits-for-ChatGPT-Plus.1378377.0.html
- [O6] Artificial Analysis, GPT-6 Astra (high) vs Grok 4.6 (high) — https://artificialanalysis.ai/ko/models/comparisons/gpt-6-astra-high-vs-grok-4-6
- [O9] OpenAI, Codex pricing and usage limits (local messages per 5 hours per model; credits per 1M tokens; GPT-6.1 Terra in Work and Codex) — https://learn.chatgpt.com/docs/pricing
- [O10] OpenAI Deployment Safety Hub, GPT-6.1 Sol system card addendum (§9.1.2 Cybersecurity Capabilities, §9.2 Safeguards, §9.2.1.3 Trusted Access for Cyber) — https://deploymentsafety.openai.com/gpt-6-1-sol ; GPT-6 Astra, Trusted Access for Cyber — https://deploymentsafety.openai.com/gpt-6-astra/cybersecurity---trusted-access-for-cyber ; Daybreak guide — https://developers.openai.com/api/docs/guides/daybreak
- [O11] OpenAI, "Introducing GPT-6.1 Terra" — https://openai.com/index/introducing-gpt-6-1-terra/
- [O12] OpenAI, GPT-6.1 Terra system card — https://deploymentsafety.openai.com/gpt-6-1-terra
- [O13] OpenAI Codex docs, Models — https://learn.chatgpt.com/docs/models
- [X1] BenchLM, Grok 4.7 benchmark scores — https://benchlm.ai/md/models/grok-4-7.md ; eesel.ai, Grok 4.7 review — https://www.eesel.ai/blog/grok-4-7-review
- [X4] xAI, Grok 4.7 Model Card (§6 Cyber capabilities and safeguards: CyberGym, CVE-Bench, HackerBench) — https://cursor.com/resources/grok-4-7-model-card.pdf
- [U3] Cursor Docs, Grok 4.7 — https://cursor.com/docs/models/grok-4-7
- [U4] Cursor Help, "What is The X Subscription?" — https://cursor.com/help/the-x-subscription/overview ; Engadget, "X bundles Premium, Grok and Cursor under a single monthly subscription" — https://www.engadget.com/2284943/x-subscription-bundles-premium-grok-cursor/
- [C1] Artificial Analysis, Coding Agent Index (per-agent data embedded in page; re-checked 2026-10-29: FrontierCode v1.1, SWE-Atlas-QnA, TB4.0; rows for DeepSeek Harness – V4.1 Flash 1017 and Codex – GPT-6.1 Terra; per-eval refusal counts. Earlier figures from the 2026-10-15 version with DeepSWE v1.1) — https://artificialanalysis.ai/agents/coding-agents
- [C3] Artificial Analysis, model release pages (Intelligence Index v5.0 per effort, TB4.0, TB-Science, SciCode, AA-Omniscience, cost per Index task, price, context, output speed; embedded in page) — https://artificialanalysis.ai/models/releases/claude-opus-5-5 ; https://artificialanalysis.ai/models/releases/claude-sonnet-5-5 ; https://artificialanalysis.ai/models/releases/gpt-6-1-sol ; https://artificialanalysis.ai/models/releases/gpt-6-1-terra ; https://artificialanalysis.ai/models/releases/grok-4-7
- [C4] Artificial Analysis, DeepSeek V4.1 Flash 1017 model page (Intelligence Index v5.0 at max, same fields as C3; listed price $0.30 / $1.20) — https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017
- [T1] BenchLM, Terminal-Bench 4.0 leaderboard mirror (snapshot 2026-10-12) — https://benchlm.ai/benchmarks/terminal-bench-4
- [T3] Vals AI, Terminal-Bench 4.0 — https://www.vals.ai/benchmarks/terminal-bench-4
- [V2] Vals AI, Claude Opus 5.5 — https://www.vals.ai/models/anthropic_claude-opus-5-5 ; Claude Opus 5.5 (CVP) — https://www.vals.ai/models/anthropic_claude-opus-5-5-range
- [V3] Vals AI, Claude Sonnet 5.5 — https://www.vals.ai/models/anthropic_claude-sonnet-5-5
- [V4] Vals AI, SWE-bench Multimodal — https://www.vals.ai/benchmarks/swebench-multimodal
- [V5] Vals AI, Vibe Code Bench (per-model accuracy, stderr, cost, and harness embedded in page) — https://www.vals.ai/benchmarks/vibe-code
- [V6] Vals AI, ProgramBench — https://www.vals.ai/benchmarks/programbench
- [V7] Vals AI, Code Migration — https://www.vals.ai/benchmarks/code-migration
- [V8] Vals AI, IOI — https://www.vals.ai/benchmarks/ioi
- [V9] Vals AI, CyberBench v1.1 (updated 2026-10-12; per-track scores, standard errors, per-task results and costs embedded in page) — https://www.vals.ai/benchmarks/cyber
- [V10] Vals AI, SRE Bench — https://www.vals.ai/benchmarks/srebench
- [V15] Vals AI, Code Migration v1.1 (updated 2026-10-19; per-model standard errors and costs embedded in page) — https://www.vals.ai/benchmarks/code-migration-v1-1
- [V16] Vals AI, Finance Agent v2.1 (updated 2026-10-27; per-model accuracy, stderr, cost embedded in page) — https://www.vals.ai/benchmarks/fabv2-1
- [V17] Vals AI, Legal Research Bench (updated 2026-10-27) — https://www.vals.ai/benchmarks/legal_research
- [V18] Vals AI, CUA-bench — https://www.vals.ai/benchmarks/cua_bench
- [V19] Vals AI, Terminal-Bench-Science (updated 2026-10-25) — https://www.vals.ai/benchmarks/terminal-bench-science
- [S2] Artificial Analysis, Search API Index (data 2026-10-19) — https://artificialanalysis.ai/agents/search-api ; methodology — https://artificialanalysis.ai/methodology/search-api
- [E1] Endor Labs, Agent Security League (AI Coding Agent Security Benchmark; extends SusVibes) — https://www.endorlabs.com/research/ai-code-security-benchmark
- [B1] BaxBench leaderboard — https://baxbench.com/
- [B2] CyberGym leaderboard — https://www.cybergym.io/cybergym/
- [B3] SusVibes leaderboard — https://leililab.github.io/susvibes-leaderboard/
- [B4] Cybench — https://cybench.github.io/ ; SEC-bench — https://sec-bench.github.io/
- [R1] "(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection" — https://arxiv.org/html/2610.13668
- [F1] DeepSeek API docs, Models & Pricing (`deepseek-flash` = DeepSeek-V4.1-Flash-1017; 1M context, 384K max output; off-peak $0.15 / $0.60, cache hit $0.003; peak $0.30 / $1.20, cache hit $0.006; no separate standard rate; peak hours) — https://api-docs.deepseek.com/quick_start/pricing/
- [F3] DeepSeek API docs, Search & Fetch (billing $0.75/1k successful searches, 100 searches/s, query operators, errors) — https://api-docs.deepseek.com/guides/search
- [F4] DeepSeek Privacy Policy (2026-02-10; data stored in the PRC) — https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html
- [M1] Command Code docs, Usage Limits (plan table: price, monthly usage, 5-hour and weekly caps; rolling windows, limit message, `/extra`, `/upgrade`) — https://commandcode.ai/docs/resources/usage-limits ; GOAT plan — https://commandcode.ai/docs/plans/goat
- [M3] Command Code docs, Pricing Limits (DeepSeek V4.1 Flash boosted monthly credit: Go $10, GOAT $80, Pro $90; "no end date") — https://commandcode.ai/docs/resources/pricing-limits
- [M4] Command Code docs, Provider API (base URL; Chat Completions, Responses, and Messages endpoints; `vendor/model` ids; "Every plan except the Go plan has API access"; error codes) — https://commandcode.ai/docs/provider
- [L1] The user's dsh `acp` profile, `~/.dsh/profiles/acp/cordis.patch.yml` (dsh 0.2.1-rc.3, read 2026-10-29): provider default `reasoning: high`, `reasoningEfforts` off/low/high/max, `llm-deepseek` and `llm-deepseek-account` disabled, `web-search-deepseek` and `web-deepseek-api` disabled, `fetchProvider: http`
- [G9] T3 Code at `163bdeaa11` (2026-10-21): ACP provider docs, "Add a local command: For DeepSeek Harness, use `dsh` with arguments `--profile` and `acp`", permissions, models and options — https://github.com/pingdotgg/t3code/blob/main/docs/user/providers-acp.md ; orchestration docs, "ACP Registry V2" and "Provider Support" — docs/orchestration-v2/orchestrator-mcp-server.md ; instance id `acpRegistry_deepseek_harness` from a local command (apps/web/src/components/settings/AddProviderInstanceDialog.environment.browser.test.tsx) ; option application, unadvertised values skipped (packages/provider-acp/src/server/adapter.ts)
- [H1] DeepSeek Harness at `687f282e86` (0.2.1-rc.2, 2026-10-17) — https://github.com/deepseek-ai/deepseek-harness : README and SAFETY.md; docs/cli-help.md (`dsh acp`); docs/user/guide/providers.md (custom providers, reasoning effort, `off` caveat, image input); packages/acp/acp/README.md and src/model-control.ts (ACP surface, `reasoning_effort`, JSON `[provider, model]` ids); packages/bundle/acp-app (profile, default route); packages/bundle/base/cordis.patch.yml (tools, sandbox, approval, `DSH_PERMISSION_MODE`, web search key); packages/sandbox/sandbox-policy/README.md; packages/fs/tool-fs/README.md (`read_image`); packages/llm/llm-pi-ai (models.ts: offered levels; stream.ts: error classification); packages/llm/llm/src/error.ts (quota wording) ; npm `@deepseek-ai/dsh` 0.2.1-rc.2 (MIT) — https://www.npmjs.com/package/@deepseek-ai/dsh
- [H3] DeepSeek Harness discussions (open): #7926 and #8992 (`Retry-After` dropped, local backoff), #9636 (401/403 before 429), #3338 (quota wording terminal), #9966 (`acp` profile stdout log line, T3 on Windows), #4276 (permission requests carry only a tool-call id) — https://github.com/deepseek-ai/deepseek-harness/discussions/7926 (others at the same path by number)
- [H4] DeepSeek Harness web packages (master `f3803c9`, 2026-10-27): `packages/web/web-deepseek-api`, `web-search-deepseek`, `tool-web`, `web-fetch-http` READMEs; `docs/subsystems/web.md` (readiness stays true with no provider; fetch reaches private hosts); `packages/credentials/credentials-local` (`DEEPSEEK_API_KEY` lookup) — https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/web
