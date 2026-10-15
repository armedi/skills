# Harness prior art (compiled 2026-10-13)

What the `fusion` skill takes from the two published multi-model coding harnesses, Cognition's
Devin Fusion and GitHub's HydraFusion, and from GitHub's Rubber Duck critic. These are vendor
results on vendor benchmarks, mostly with models other than this skill's; they justify the shape
of the workflow, not exact thresholds. Companion to
[orchestrator-planning.md](orchestrator-planning.md), which covers why the orchestrator keeps
the plan.

## The two harnesses

- **Devin Fusion** [F1,F2]. A frontier *lead* and a cheaper *sidekick* run as two agents, each
  with its own persistent context. The lead owns "the plan, interpretation of ambiguity, and
  review", hands the sidekick a brief "with constraints and success criteria", and can take work
  back. They exchange only briefs, results, and feedback. Fable 5.1 + SWE-2 scored 61.7 on the
  AA Coding Agent Index vs Claude Code with Fable 5.1 (max) at 62.2, for 36% lower cost; on
  DeepSWE 1.1, 63.1 vs 64.3 at −46% [F1]. Not every score holds: Astra + SWE-2 on Terminal-Bench 4
  fell from 55.6 to 50.0 [F1]. Argues against up-front routing: a prompt doesn't reveal difficulty,
  and switching models mid-task breaks the prompt cache [F1,F2].
- **HydraFusion** [H1]. Picks per request "the least complex workflow expected to meet its needs"
  from three patterns: *Single* (one model), *Cascade* (an efficient model drafts; "a quality gate
  decides whether to accept it or escalate"), *Critique* (one model drafts, "an independent
  read-only critic from a different model family reviews it", the drafter revises once). Vs Opus
  5: TerminalBench 2.1 +4.9 points at 67% lower cost; DeepSWE −1.5 at −36%; CheckpointBench −0.1
  at −65%, all at medium reasoning [H1]. Operating principles: account for every leg's cost
  (including retries and critiques), bound each leg, review in isolated read-only contexts, apply
  no patch from a cancelled or failed workflow, and validate model bindings before running [H1].

## Findings and what the skill does with them

- **The lead's habits drive cost more than its price per token.** Over 3,000 FrontierCode
  sessions with the same sidekick, a Fable 5 lead cost $1.86/run vs an Opus 4.8 lead's $2.04 and
  scored 60.7 vs 54.6, despite 2× the token price. Both delegated about 3 times per run; Fable took
  11.5 lead turns to Opus's 26.5 and a third of the input tokens. In 81% of Fable runs the lead
  never edited code (Opus: 24%) [F3]. Opus re-read ~12 files the sidekick had summarized, pulled
  sidekick files back 2× more often, and made 4× more corrective edits at lead prices, once
  reverting and rewriting the work, without catching more bugs; Fable sent "a second handoff"
  instead [F3]. → SKILL.md step 1: delegate exploration early, don't re-read what an explorer
  summarized; step 5: the orchestrator never edits a child's diff, every fix is a brief.
- **Briefs should carry constraints, not code.** Opus dictated full file contents; Fable wrote "a
  design doc". On one task the requirement was O(1) hashing: Opus implemented it by hand, never
  wrote the requirement down, and shipped linear time (score 25); Fable's brief said "operator()
  must be O(1) in pointer length: NO full token scan" and the sidekick scored 94. Fable's handoffs
  "enumerated constraints, edge cases, and a definition of 'done'" [F3]. GitHub's delegation
  study: a handoff states "what the user asked, what is already known, what the subagent owns, and
  what kind of result the main agent needs back" [H3]. → Step 3: brief adds what is already known,
  the constraints, and the done-criteria.
- **Tune brief detail and pushback to the implementer.** "Paired with a weaker sidekick, Fable 5.1
  needs to provide more prescriptive briefs"; "with stronger sidekicks, encouraging pushback can
  help catch mistakes in the lead's plan. Allowing weaker sidekicks to be opinionated ends up
  hurting overall performance and cost" [F1]. → Step 3: prescriptive briefs and "stop and
  report" for the cheap-model roles (Mechanical, Bulk, Trivial); design briefs and an objections
  section for every other role.
- **Plan-shaping exploration stays with a strong model.** "Exploration needed for planning should
  not be delegated to a weaker sidekick… A weaker sidekick may not have the ability to properly
  decide what information matters" [F1]. → Roles: the Lookup role (composer-2.5) only for
  lookups used as-is; anything that shapes the plan goes to the Explorer role (gpt-6.1-sol at
  `medium`).
- **Keep judgment with the lead.** On a hard React/Redux feature "graded on its judgment calls",
  delegation dropped the score 54 → 27: "When the judgment is the deliverable, delegating it
  backfires" [F2]. Delegation also gains little on short tasks and on "serial debugging tasks where
  the root-cause hunt is one long chain of judgments… the accumulated context is the work" [F3].
  → Step 1: the orchestrator makes the judgment calls and writes them into the briefs as
  constraints, and hunts a short-chain root cause itself before briefing the fix.
- **Cross-family critique, at the right checkpoints.** Rubber Duck (a GPT critic for a Claude
  agent) closed 74.7% of the Sonnet 4.6 → Opus 4.6 gap on SWE-Bench Pro; gains concentrate on
  problems spanning "3+ files" and "70+ steps" (+3.8%, +4.8% on the hardest) [H2]. Checkpoints:
  after the plan ("the biggest wins"), after a complex implementation, after writing tests, and
  reactively when the agent "gets stuck in a loop"; the critic returns "a short, focused list of
  high-value concerns" [H2]. → Step 3: plan critique for Hardest and Greenfield tasks, extended
  to other critique-role tasks touching 3+ files at `medium`; steps 3 and 6: critics list only high-value concerns, most important first;
  step 7: a read-only stuck-diagnosis before moving a rung up.
- **Fail-safe application.** HydraFusion applies no patch from a cancelled or failed workflow [H1].
  Children here edit the shared tree directly, so the equivalent is deciding where the next round
  starts. → Step 7: a small defect keeps the diff; a wrong approach stashes it and restarts from a
  clean baseline, or asks the user.
- **Delegation is a parallelism tool.** GitHub made Copilot CLI "more selective" about subagents
  (−23% tool failures per session, −5% P95 wait, no quality regression): "Subagents should be
  treated as a parallelism tool, not a pause button" [H3]. → Step 1: dispatch explorers, then
  record the baseline while they run.
- **Account per task, across every leg.** "Models (and model-harness combos) should be evaluated on
  price per task rather than price per token" [F1]; a stronger sidekick (SWE-2, +275% per token)
  matched a cheaper one's total cost (−2%) at a higher score because it needed fewer review rounds
  [F1]. HydraFusion counts drafting, critique, revision, escalation, retry, and fallback [H1]. →
  Step 8: the hand-off lists every run. These reports are the data for re-tuning the roles;
  `task_status` reports no token usage, so they count runs rather than tokens.
- **Least elaborate workflow first.** HydraFusion uses extra calls "only when they are likely to
  improve the result" [H1]. → Roles: Mechanical, Bulk, and Trivial are a cascade; the other write
  roles a critique.

## Not adopted

- **Persistent sidekick context.** Fusion keeps the sidekick's context alive and cached across
  handoffs [F1,F2]. `delegate_task` starts a fresh child each round and T3 Code requires a new task
  per round, so each rework round re-reads its files; the "what is already known" brief item
  limits that.
- **Hard timeouts per leg** [H1]. `delegate_task`'s `timeoutMs` bounds only the parent's wait in
  `mode: "wait"` and doesn't cancel the child; `task_cancel` remains the only bound.
- **Tool-less reviewers** [H1]. Children below `full-access` may ask the user to approve tool
  calls; the orchestrator instead verifies `git status --porcelain` and `git diff` are unchanged
  after a review.
- **Learned routing and mid-session model switching** [H1,H4,F2]. Both are trained or tuned
  against benchmarks and production traffic; the skill routes by hand-written roles and climbs the
  escalation ladder on evidence from the gates.
- **Fable 5.1 as the orchestrator.** Cognition's cheaper-Fable-lead result compares Fable 5 with
  Opus 4.8 [F3]; no source measures Opus 5.5 as a lead. The skill keeps opus-5.5; the rules above
  target the habits that made the Opus 4.8 lead expensive.

## Sources (accessed 2026-10-13)

- [F1] Cognition, "Introducing Fusion in Devin Desktop & CLI" — https://cognition.com/blog/local-fusion
- [F2] Cognition, "Devin Fusion" — https://cognition.com/blog/devin-fusion
- [F3] Cognition, "Making Fable Cheaper Than Opus" — https://cognition.com/blog/making-fable-cheaper-than-opus
- [H1] GitHub, "Project HydraFusion: Frontier quality via multi-model orchestration" (2026-09-04) — https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/
- [H2] GitHub, "GitHub Copilot CLI combines model families for a second opinion" (2026-04-06) — https://github.blog/ai-and-ml/github-copilot/github-copilot-cli-combines-model-families-for-a-second-opinion/
- [H3] GitHub, "How we made GitHub Copilot CLI more selective about delegation" (2026-06-12) — https://github.blog/ai-and-ml/how-we-made-github-copilot-cli-more-selective-about-delegation/
- [H4] GitHub, "Getting more from each token: How Copilot improves context handling and model routing" (2026-06-17) — https://github.blog/ai-and-ml/github-copilot/getting-more-from-each-token-how-copilot-improves-context-handling-and-model-routing/
