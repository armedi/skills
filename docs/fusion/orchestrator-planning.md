# Orchestrator planning (compiled 2026-10-13)

Evidence behind the `fusion` skill's split: the orchestrator plans, briefs, and reviews;
read-only `delegate_task` explorers answer questions over wide code; a cross-vendor model critiques
Hardest and Greenfield plans and multi-file plans in the other critique roles. No controlled study compares
"orchestrator plans" with "planning delegated" for coding; these are the nearest controlled
results and practitioner reports. What the skill takes from the published multi-model harnesses
(Devin Fusion, HydraFusion, Rubber Duck) is in [harness-prior-art.md](harness-prior-art.md).

## Findings

- **The agent that decides owns the plan.** Anthropic's research system has the lead agent plan
  before spawning subagents, and beat single-agent Opus 4 by 90.2%; the same post says coding has
  "fewer truly parallelizable tasks than research" and shared-context domains "are not a good fit
  for multi-agent systems today" [R1]. Cognition: "actions carry implicit decisions", and splitting
  work leaves decision-making "too dispersed" [R2]; in 2026, what works is single-threaded writes
  with extra agents contributing "intelligence rather than actions", and managers without "deep
  codebase context" turn "overly prescriptive" [R3].
- **Sequential work degrades when split.** Across 180 configurations, every multi-agent variant
  lost 39–70% on sequential, state-dependent tasks; a centralized orchestrator scored 0.282 vs a
  single agent's 0.568 on PlanCraft, with 3.8× the turns. Gains came only on parallelizable tasks
  (+80.9%) [R4]. Explore → plan → brief is a sequential chain.
- **Plan quality follows the planner's strength.** Aider's architect/editor split works with the
  strong reasoner planning: o1-preview architect 85% (then SOTA); even self-pairing helped (Sonnet
  77.4% → 80.5%) [R5]. A cheaper planner gives up the step where model strength matters most.
  Both published multi-model harnesses keep the frontier model on the plan: Devin Fusion's lead
  owns "the plan, interpretation of ambiguity, and review" (see harness-prior-art.md).
- **Delegate exploration, not the plan.** Claude Code's docs: "Explore first, then plan, then code";
  the context window is "the most important resource to manage"; "use subagents to investigate X…
  report back summaries" [R6]. Delegate when context needs "dozens of files"; keep sequential,
  dependent work in one session [R7]. Devin Fusion adds a limit: exploration that shapes the plan
  should not go to a weaker model, which "may not have the ability to properly decide what
  information matters" (see harness-prior-art.md); hence the Explorer role, gpt-6.1-sol at
  `medium`, for plan-shaping questions (its rationale is in
  [agent-types.md](../routing/agent-types.md)).
- **Specification is the main failure point.** MAST finds multi-agent failures stem mostly from
  system design and inter-agent misalignment, not model limits [R8]. A delegated plan adds a hop,
  and step 5's review needs first-hand understanding anyway.
- **Fresh-context critique helps.** A clean-context verifier notably improves a generator-verifier
  loop [R3]; agents grading their own work skew positive [R9]. A critic from a different model
  family helps most on multi-file tasks (Rubber Duck; see harness-prior-art.md). Hence the plan
  critique on Hardest and Greenfield tasks and on other critique-role tasks touching 3+ files.
- **Counterexample.** Anthropic's long-running-app harness keeps a separate planner, because the
  generator under-scoped without one [R9]. That planner expands a one-line prompt into a greenfield
  product spec, sits at the top with no orchestrator above it, and avoids technical detail because
  "errors in the spec would cascade". It is not planning changes to an existing codebase.

Untested here: the size of these effects on this repo's tasks. The hand-off lists every run
(explorers, critiques, retries, rework rounds); compare run counts and gate failures across
hand-off reports to calibrate. `task_status` reports no token usage, so cost per run isn't
measured.

## Sources (accessed 2026-10-13)

- [R1] Anthropic, "How we built our multi-agent research system" — https://www.anthropic.com/engineering/multi-agent-research-system
- [R2] Cognition, "Don't Build Multi-Agents" — https://cognition.com/blog/dont-build-multi-agents
- [R3] Cognition, "Multi-Agents: What's Actually Working" — https://cognition.com/blog/multi-agents-working
- [R4] Google Research, "Towards a Science of Scaling Agent Systems" — https://arxiv.org/html/2512.08296v2
- [R5] Aider, "Separating code reasoning and editing" — https://aider.chat/2024/09/26/architect.html
- [R6] Claude Code Docs, Best practices — https://code.claude.com/docs/en/best-practices
- [R7] Claude blog, "How and when to use subagents in Claude Code" — https://claude.com/blog/how-and-when-to-use-subagents-in-claude-code
- [R8] Cemri et al., "Why Do Multi-Agent LLM Systems Fail?" — https://arxiv.org/html/2503.13657v3
- [R9] Anthropic, "Harness design for long-running application development" — https://www.anthropic.com/engineering/harness-design-long-running-apps
