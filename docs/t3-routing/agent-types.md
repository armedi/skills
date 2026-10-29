# t3-routing agent types: why each row (2026-10-29)

The decision record for the agent-type tables in [SKILL.md](../../skills/t3-routing/SKILL.md) [1].
Benchmark numbers live in [model-roles.md](../fusion/model-roles.md) [3]. This file quotes only the
comparison that decides each row and cites the section of [3] that holds the rest.

Rules behind every row:
- A type earns a row only if it changes the model, the effort, the prompt shape, or read-only vs
  write.
- Each row takes the best measured model at the effort it runs. On a tie it takes the non-Claude
  one, since every Claude child shares Claude Pro with the opus-5.5 orchestrator ([3] Quotas).
- Sharing a model is no reason to merge rows: rows name different work and can diverge as models
  change.

## Executor: deepseek-v4.1-flash

- Work written as a spec is checked by the orchestrator's review and the gates, so a cheap draft
  that fails costs little: a *cascade* (HydraFusion [4]).
- deepseek is the cheapest model per task and runs on neither Pro nor Plus.
- In its own harness its Coding Agent Index (46.3) ties grok-4.7 (46.6) and terra at high (46.3)
  ([3] The six models, Effort).

## Specialists

- **Hardest: opus-5.5 at `high`.** At equal effort opus leads sol on TB4.0 by 4–5 points, and it
  leads FrontierCode at max ([3] Evidence, Effort).
  - Its 12% refusal rate on TB4.0 attempts is one reason security work has its own row ([3]
    Refusals).
- **Greenfield: opus-5.5.**
  - ProgramBench: opus 18.5 vs sonnet 6.5 and sol 3.0. No terra row ([3] Evidence).
  - Fusion triggers a plan critique on Greenfield by name [5].
- **Port: gpt-6.1-sol; sonnet-5.5 into Python.**
  - Code Migration v1.1: sol ≈ opus, and deepseek trails sol by 2.4σ, so ports leave General.
  - sonnet leads sol by 2.9σ at 4.6× the cost, and wins clearly into Python (70.6 vs 55.4) ([3]
    Evidence).
  - A port leaves the design to the implementer. Devin's Fusion found opinionated weaker sidekicks
    hurt [10].
- **Terminal: gpt-6.1-sol.**
  - opus at medium ties sol at xhigh on TB4.0 (52.5 vs 54.0) at 3.2× the cost, so the tie goes to
    the non-Claude model ([3] Effort).
  - Failures of unknown cause stay in Hardest.
- **Algorithm: gpt-6.1-sol at `xhigh`.** On IOI, sol (96.9) ties opus (95.1) at a quarter of the
  cost ([3] Evidence).
- **Visual: opus-5.5.**
  - SWE-bench Multimodal: opus 70.2 vs sonnet 58.3 and sol 43.5. No terra row ([3] Evidence).
  - The row also takes visual design work, including UI built from a mockup.
- **Security: gpt-6.1-sol.**
  - The patch track ties across the five models measured. On Python, sol ≈ opus. sol refuses far
    less than opus on agentic work ([3] Security, Refusals).
  - deepseek's CyberBench lead comes from the PoC track, not from patching.
  - sol made no measured PoC attempt, so a task that needs a crashing input crafted may block on
    sol.
- **Reverse engineering: gpt-6.1-sol at `xhigh`.** SRE Bench: sol 50.8 vs opus 33.6, and 82.8% of
  opus's attempts were fallback-assisted ([3] Evidence, Refusals).
- **Science: opus-5.5.**
  - At xhigh on AA TB-Science, opus scores 61.9 vs sol 50.5 (1.7σ).
  - At max, sol (58.1), opus (59.0) and terra (57.6) tie ([3] Effort).
  - The SciCode lead is "under review" at AA.
  - Without this row, numerical code falls to General, and deepseek scores 12.9 there.
- **General: deepseek-v4.1-flash.**
  - FrontierCode: deepseek 46.5 vs sol 49.4 (0.7σ). Vibe Code: within 1.5σ of sonnet ([3]
    Evidence).
  - No benchmark covers in-language refactors.

## Read-only

- **Lookup: deepseek-v4.1-flash.**
  - The answer is used as-is and its cited lines are spot-checked, so the cheapest competent
    model wins.
  - On SWE-Atlas-QnA in its own harness, deepseek ties sol (61.6 vs 59.9).
  - Web lookups need DeepSeek search turned on ([3] Subscriptions). On Finance Agent deepseek ties
    sol, but on AA-Omniscience it guesses wrong more often than any other model (64%) ([3]
    Evidence).
- **Explorer: gpt-6.1-sol.**
  - An answer that shapes a plan shouldn't come from a model that may misjudge what matters [4].
  - deepseek now ties sol on QnA, so the pick rests on sol's higher Intelligence Index (46.1 at
    medium vs 32.5), lower guess rate, and stronger web research. QnA doesn't decide it ([3]
    Evidence).
- **Computer use: gpt-6.1-terra.**
  - **Why read-only:** Codex's own `browser_debugger` example is told "Do not edit application
    code" [7]. Codex pitches Computer Use for "reproducing a bug that only appears in a graphical
    interface" [6].
  - **Prompt shape:** T3's preview tools refuse to verify an edit unasked, so the prompt must ask
    for browser work and name the URL [8].
  - **The model pick is cost and speed, not measured skill:**
    - No independent computer-use row exists for terra. opus's 81.8% on OSWorld is vendor-reported
      ([3] Evidence).
    - On the Index, sol one level lower matches terra at about the same cost ([3] Effort).
  - **Unverified:** whether the ChatGPT desktop Computer Use plugin is reachable from a T3 Codex
    child. Assume only the preview and device tools [8].
- **Investigator, Plan critic, Reviewer: second opinion.**
  - A different maker reduces correlated blind spots. Rubber Duck's largest wins came from
    critiquing the plan [4].
  - There is no current review benchmark ([3] Evidence).
  - They stay three rows because fusion triggers each by name, with distinct prompts [5].
- **Second-opinion rule.** Take the closest Intelligence Index from another maker. Under v5.0,
  deepseek work (32.5) gets grok-4.7 at `high` (35.0), not terra.

## Models and effort

- **Intelligence Index:** every Models-table row uses AA v5.0 ([3] Effort).
- **Effort caps:** from the cost of going from `xhigh` to `max`:
  - sol gains +2.2 and opus +1.4, each at about 1.7× the cost, so both cap at `xhigh`.
  - sonnet gains +4.7 and terra +6.0, so both go to `max`.
  - grok scores no higher at `xhigh`, so it caps at `high`.
- **deepseek at `max`:** the profile's `reasoning: high` is only the provider default. The ACP effort
  option still selects `max` ([3] Subscriptions).

## Considered and rejected

- **Merges of rows that share a model:**
  - Reverse engineering into Algorithm.
  - Security into Terminal.
  - Greenfield, Visual and Science into one opus row.
  - One "second opinion" row.
- **Fold Lookup into Explorer:** this would move cheap lookups onto Plus quota.
- **Test writer:** no benchmark separates the six models on tests. A spec'd test is Executor work;
  an open one is General.
- **Docs / prose writer:** removed by the user in 55f9cf3 [2]. No prose benchmark exists.
- **UI from text:** removed in 55f9cf3. deepseek is within 2σ of sonnet on Vibe Code, so General
  fits.
- **Terra for Visual:** it has no SWE-bench Multimodal row.
- **Debugger:** Hardest and Investigator already cover it [9].
- **Mobile and device apps:** T3's device tools [8] serve Computer use, and no model-specific
  evidence exists.
- **Infra/IaC, SRE, data/SQL, ML engineering, long context:** no benchmark separates the six
  models on these.
- **Terra as a cheaper Executor:** that is a model choice, not a type, and it would spend Plus
  quota.
- **Removed by the user:**
  - Best-of-2: too costly.
  - The cross-vendor alternative lane: redundant.
  - gpt-6-astra: 5× sol's credits.
  - The fixed escalation ladder: replaced by the Index rule in 0c7ac1e [2].

## History

- **2026-10-15:** model-roles' first roles table: Feature, UI, Migration and Docs roles, plus an
  escalation ladder [2].
- **2026-10-24:** deepseek added; UI and Docs removed (55f9cf3) [2].
- **2026-10-27:**
  - terra added; the escalation ladder replaced by the Index rule (0c7ac1e).
  - Routing moved into t3-routing (683d742).
  - Open feature replaced by General on deepseek (3122e24) [2].
- **2026-10-29:**
  - Port and Computer use added.
  - Lookup and Explorer split by "used as-is" vs "shapes a plan".
  - Index moved to v5.0 and effort caps rewritten.
  - Rows sharing a model kept apart.

## Open

- **Science:** name `xhigh` in the row. Both candidate models climb steeply with effort.
- **Explorer vs Lookup:** re-weigh now that deepseek ties sol on codebase Q&A.
- **Computer use:** terra vs sol is a cost and speed call, since sol matches terra one effort level
  lower.
- **DeepSeek web search:** check the data policy before enabling it ([3] Subscriptions).

## Sources

1. t3-routing skill (working copy, 2026-10-29) — `skills/t3-routing/SKILL.md`
2. Repo history — `git log -p -- skills/t3-routing/SKILL.md skills/fusion/SKILL.md docs/fusion/model-roles.md`
3. Model evidence — [`docs/fusion/model-roles.md`](../fusion/model-roles.md)
4. Harness prior art (HydraFusion, Rubber Duck, explorer guidance) — [`docs/fusion/harness-prior-art.md`](../fusion/harness-prior-art.md)
5. Fusion skill (consumer of type names) — `skills/fusion/SKILL.md`
6. OpenAI Codex docs, Computer Use — https://learn.chatgpt.com/docs/computer-use
7. OpenAI Codex docs, Subagents (`explorer`, `docs_researcher`, `browser_debugger`) — https://learn.chatgpt.com/docs/agent-configuration/subagents
8. T3 Code at `ccaa3ad295`: preview tools — https://github.com/pingdotgg/t3code/blob/main/apps/server/src/mcp/toolkits/preview/tools.ts ; device toolkit — https://github.com/pingdotgg/t3code/tree/main/apps/server/src/mcp/toolkits/device
9. Claude Code docs, Subagents — https://code.claude.com/docs/en/sub-agents
10. Cognition, "Introducing Fusion in Devin Desktop & CLI" — https://cognition.com/blog/local-fusion
