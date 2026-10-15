# Model lanes (compiled 2026-10-14)

Evidence behind the `fusion` skill's lanes table in
[SKILL.md](../../skills/fusion/SKILL.md). The table is what routes; this file explains why.

The skill runs on the user's personal subscriptions: **Claude Pro** (Claude Code), **ChatGPT Plus**
(Codex), and **the X Subscription** (Grok Build, plus Cursor access to the Grok and Composer
models; it replaced SuperGrok on 2026-10-13 [U4]).

Figures as published by the cited source around the date shown. "Vendor" = self-reported by the
model maker. Different benchmark versions/harnesses are **not** directly comparable (Terminal-Bench
2.0/2.1 ≠ 4.0; TB4.0 rows are model+harness pairs). "Unknown" = not found; nothing invented.

## What each subscription offers

Checked against the local CLIs on 2026-10-14 as well as the sources.

- **Claude Pro → Claude Code** (T3 `claudeAgent`). Opus 5.5, Sonnet 5.5, Haiku 5.5. Opus 5.5 is
  included on Pro since 2026-09-22 [P1,P2]; Fable 5.1 is not in Pro's limits (usage credits only)
  [P2], so the skill leaves it out. Claude Code and chat share one quota: a rolling 5-hour window
  plus weekly caps, and Opus drains it far faster than Sonnet [P3,P4].
- **ChatGPT Plus → Codex** (T3 `codex`). `codex debug models` lists gpt-6.1-sol, gpt-6-astra,
  gpt-6-sol, gpt-6-luna, and the older 5.6 family. gpt-6.1-sol reached Plus in Codex on 2026-09-29;
  gpt-6-astra reached Plus in Codex in early September [O4,O5]. Plus has a 5-hour window and weekly
  caps shared between Codex and ChatGPT Work, restored on 2026-08-25; one guide estimates per 5 hours
  ~5–45 Astra messages vs ~15–150 GPT-6 Sol messages [O6,O7]. Ultrafast tiers are not on Plus [O4].
- **X Subscription → Grok Build** (T3 `grok`). `grok models` lists grok-4.7 (default), grok-4.7-build-fast,
  grok-4.6, grok-4.5. Build-fast is the same model at 2× speed and 2× token price [X2]; the user
  has hidden it in T3, so the skill doesn't use it. Composer 2.5 was announced for Grok Build on
  2026-06-01 but later reports say it is gone from the model list [X3,X4]; the local list confirms.
- **Cursor** (T3 `cursor`, via the Cursor SDK). Grok 4.7, 4.6, 4.5, and Composer 2.5 sit in the
  "Cursor Models" pool, with "significantly more included usage" than third-party models [U1].
  The user's Cursor access comes from the X Subscription, launched 2026-10-13, which bundles
  Grok, Cursor, and X Premium; "Grok and Cursor usage draw from the same included pool" [U4], so
  grok-4.7 and composer-2.5 share one quota. (Before it, a SuperGrok link granted only Grok Bot
  usage in Cursor and Composer wasn't part of Grok plans [U2,X4].) In T3 the user has hidden every Cursor model except `composer-2.5`
  (settings checked 2026-10-14: `composer-2`, `grok-4.7`, and 43 others hidden), so composer-2.5 is
  the only Cursor model the skill uses. Trust what `orchestrator_capabilities` lists.

## Models

| Model | Harness | List $ per 1M in / out | Context | Coding signals | AA Intelligence Index |
|---|---|---|---|---|---|
| **opus-5.5** | Claude Code | $4 / $20 [A1] | 1M | TB4.0 64.85% in Claude Code (#1) [H1]; vendor SWE-bench Pro 89.9% [A5] | 58 [A5] |
| **sonnet-5.5** | Claude Code | $2 / $10 [A1] | 1M | TB4.0 61.82% in Claude Code (#2) [H1]; vendor SWE-bench Pro 81.3% [A4] | 56 (max) [A3] |
| **haiku-5.5** | Claude Code | $0.10 / $0.50 (≤100k prompt) [A1] | 1M | TB4.0 32.8% (AA, max) [A3]; vendor SWE-bench Pro 64.8% [A4] | 43 (max) [A3] |
| gpt-6-astra (not used) | Codex | unknown here | 1M [O8] | TB4.0 58.18% max, 57.88% high, 54.24% medium in Codex (#3) [H1] | 61 (max), 60 (high) [O8] |
| **gpt-6.1-sol** | Codex | $2 / $10 (≤272k) [O2] | 1M | TB4.0 58.18% max in Codex [H1]; Codex: "near-Astra performance at a lower cost" (local model list) | 52 [O2] |
| **grok-4.7** | Grok Build | $2 / $6; Fast $4 / $12 (Cursor) [U1,U3] | 256k, 500k long [U3] | TB4.0 37.58% in Grok Build, xhigh [H1]; TB2.1 76.0% [X2] | unknown (Grok 4.6 high: 61) [O8] |
| **composer-2.5** | Cursor | $0.50 / $2.50; Fast $3 / $15 [U1] | 200k [X3] | vendor TB2.0 69.3%, SWE-bench Multilingual 79.8% ≈ Opus 4.7 [K1,K2]; no TB4.0 row | unknown |

Not used, each compared inside its own price class: gpt-6-astra (excluded for its Codex usage
cost); gpt-6-sol (TB4.0 49.39%) loses to gpt-6.1-sol (58.18%) at the same $2/$10 list price [H1,O9];
gpt-6-luna ($0.10/$0.50, TB4.0 16.36%) loses to haiku-5.5 at that price (TB4.0 32.8%) [H1,A1,A3,O9], and
the skill's cheap lane uses composer-2.5 on the X Subscription instead; grok-4.6 (20.30%) and
grok-4.5 (12.42%) lose to grok-4.7 [H1].

## Harness

Each model now runs in its vendor's own harness, the one its TB4.0 row was measured in: Claude
models in Claude Code, GPT models in Codex, grok-4.7 in Grok Build [H1]. composer-2.5 runs in the
Cursor agent, its native harness, with no TB4.0 row. Rank by the model scores, trust the gates.

## Why each lane

Best result first; quota only breaks ties.

- **Hard and Normal.** opus-5.5 and sonnet-5.5 hold #1/#2 on TB4.0 (64.85% / 61.82%) [H1].
- **Reviewers, plan critique, stuck-diagnosis, and Cross-vendor alternative.** gpt-6.1-sol, the
  strongest non-Anthropic model in the set (TB4.0 58.18%, the same max score as gpt-6-astra) [H1];
  a different vendor reduces correlated blind spots. gpt-6-astra scores higher on AA (61 vs 52)
  [O2,O8] but drains Codex usage several times faster [O7], and the user excluded it.
- **Plan-shaping exploration.** sonnet-5.5: a weaker model may not judge which information matters
  to the plan (see [harness-prior-art.md](harness-prior-art.md)).
- **Visual input.** Claude Code reads images, so sonnet-5.5 implements
  from screenshot paths in the brief. No model in the set takes video or audio.
- **Exploration lookups used as-is, Mechanical, Bulk, Trivial.** Well-specified, low-risk work, so
  the cheapest competent model wins the tie: composer-2.5, on the X Subscription pool rather than
  the Claude Pro quota the orchestrator also uses. Its scores are vendor-reported on older benchmarks [K1]:
  trust the gates, not the scores.
- **grok-4.7 as the ladder's second rung.** TB4.0 37.58% sits above haiku-5.5 (32.8%) and below
  the Sonnet/GPT tier [H1,A3]. It is the step up from a failed composer-2.5 draft before spending
  Claude or Codex quota, the target for a failing Bulk shard, and composer-2.5's fallback. Its
  own fallback is gpt-6.1-sol, which keeps the run off Claude Pro.
- **haiku-5.5 as a fallback only.** It draws on Claude Pro, which the orchestrator needs, and scores
  below grok-4.7.
- **Bulk reviewer gpt-6.1-sol, not sonnet-5.5.** Same tier, different vendor from Cursor, and it
  keeps the review off Claude Pro.

## Effort

Why SKILL.md's **Effort** starts low and steps the model before the effort:
- Published scores are measured at high effort: opus-5.5 and sonnet-5.5 at max, grok-4.7 at xhigh
  [H1]. gpt-6-astra shows the spread: 50.61% low → 54.24% medium → 57.88% high → 58.18% max [H1].
  That doesn't matter for well-briefed tasks, which don't need the extra reasoning.
- **The model sets the ceiling; effort tunes within it.** haiku-5.5 goes from AA 38 at high to 43
  at max [A3], still far below sonnet-5.5's 56.
- **Quota and latency.** Thinking tokens count against the subscription's limits and add wall-clock
  time on every turn of an agentic run, so the cost grows with the number of tool-use turns.
- Codex's `ultra` level adds "automatic task delegation", i.e. its own subagents; the skill never
  uses it, since the orchestrator already owns delegation.

## Sources (accessed 2026-10-14)

- [P1] Notebookcheck, "Claude Opus 5.5 is included with Pro" — https://www.notebookcheck.net/Claude-Opus-5-5-is-included-with-Pro-and-Free-still-misses-out.1406452.0.html
- [P2] Christopher Alarcon, "Claude Opus 5.5 vs Fable 5.1: … which plan gets it" — https://christopheralarcon.com/blog/claude-opus-5-5-vs-fable/
- [P3] Anthropic Help Center, "Does the Pro plan have any usage limits?" — https://support.anthropic.com/en/articles/8325612-does-the-pro-plan-have-any-usage-limits
- [P4] ClaudeLog, Claude Code usage limits — https://claudelog.com/faqs/claude-code-usage-limits/
- [A1] Anthropic, Claude Opus 5.5 overview (model table incl. Sonnet/Haiku 5.5) — https://platform.claude.com/docs/en/models/opus-5-5/overview.md
- [A3] Artificial Analysis, Claude Haiku 5.5 vs Sonnet 5.5 — https://artificialanalysis.ai/models/releases/comparisons/claude-haiku-5-5-vs-claude-sonnet-5-5
- [A4] BatchHaiku, "Claude Haiku 5.5 Benchmarks" (2026-10-08) — https://batchhaiku.dev/blog/haiku-5-5-benchmarks/
- [A5] HokAI, Claude Opus 5.5 — https://hokai.io/hub/models/claude-opus-5.5
- [O2] Artificial Analysis, GPT-6.1 Sol vs GPT-6 Luna — https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-gpt-6-luna
- [O4] OpenAI Help Center, GPT-6 and other models in ChatGPT — https://help.openai.com/es-es/articles/20001354-gpt-6-and-other-models-in-chatgpt
- [O5] Notebookcheck, "GPT-6 Astra is on ChatGPT Plus, but only in Work and Codex" — https://www.notebookcheck.net/GPT-6-Astra-is-on-ChatGPT-Plus-but-only-in-Work-and-Codex.1391574.0.html
- [O6] Notebookcheck, "OpenAI abruptly restores harsh 5-hour Codex and Work limits for ChatGPT Plus" — https://www.notebookcheck.net/OpenAI-abruptly-restores-harsh-5-hour-Codex-and-Work-limits-for-ChatGPT-Plus.1378377.0.html
- [O7] Developers Digest, "Codex Usage Limits and Pricing in 2026" — https://www.developersdigest.tech/blog/codex-usage-limits-pricing-2026
- [O8] Artificial Analysis, GPT-6 Astra (high) vs Grok 4.6 (high) — https://artificialanalysis.ai/ko/models/comparisons/gpt-6-astra-high-vs-grok-4-6
- [O9] OpenAI, API pricing (gpt-6-luna $0.10/$0.50; gpt-6.1-sol $2/$10) — https://developers.openai.com/api/docs/pricing
- [X2] BenchLM, Grok 4.7 benchmark scores — https://benchlm.ai/md/models/grok-4-7.md ; eesel.ai, Grok 4.7 review — https://www.eesel.ai/blog/grok-4-7-review
- [X3] TestingCatalog on X, Composer 2.5 in Grok Build (2026-06-01) — https://x.com/testingcatalog/status/2061538730167377970
- [X4] Cursor Forum, "Composer 2.5 missing from grok models after alpha 1.0.42" — https://forum.cursor.com/t/grok-build-cli-grok-composer-2-5-missing-from-grok-models-after-alpha-1-0-42-not-cursor-ide-composer/173128
- [U1] Cursor Docs, Models and pricing — https://cursor.com/docs/models
- [U2] Cursor Help, Grok Bot plans and billing — https://cursor.com/help/grok-bot/plans
- [U3] Cursor Docs, Grok 4.7 — https://cursor.com/docs/models/grok-4-7
- [U4] Cursor Help, "What is The X Subscription?" — https://cursor.com/help/the-x-subscription/overview ; Engadget, "X bundles Premium, Grok and Cursor under a single monthly subscription" — https://www.engadget.com/2284943/x-subscription-bundles-premium-grok-cursor/
- [K1] DataCamp, Composer 2.5 — https://www.datacamp.com/blog/composer-2-5
- [K2] The New Stack, Cursor Composer benchmarks — https://thenewstack.io/cursor-composer-benchmarks/
- [H1] BenchLM, Terminal-Bench 4.0 leaderboard mirror (snapshot 2026-10-12) — https://benchlm.ai/benchmarks/terminal-bench-4
