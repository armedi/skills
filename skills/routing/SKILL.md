---
name: routing
description: "Model selection, second opinions, and escalation for OpenCode subagents. Use before every subagent call."
---

Pick the agent by its description, then its row under **Models**. Always pass `model` as
`<id>#<effort>`.

## Handoffs

In every handoff, ask: "Return proof that the work satisfies the request."

A **spec** passes the **spec test**: a careful newcomer could finish from the prompt and tree
alone, making no design decisions. Send it to `general`, ending with: "Follow the spec. If its
approach doesn't fit the code, stop and report why."

A **brief** gives the outcome, constraints, and completion criteria, leaving design decisions to
the child. Send it to `specialist`, asking for objections with evidence.

A **second opinion** goes to a fresh `critic`: pick the first model in
`opus#high` → `sol#high` → `neon#high` whose maker differs from the planner/orchestrator and the
builder, skipping unavailable or excluded providers. If none qualifies, report that no
independent `critic` is available.

## Models

Use these unless the user names another. Verify the ID in the model catalog. Maker means creator,
not serving provider. Only listed efforts are allowed.

**Benchmark** gives scores with API-priced USD cost per task (checked 2026-11-21):
FrontierCode 2.0 (would a maintainer merge the change) from
[Cognition](https://cognition.com/frontiercode) and
[Artificial Analysis](https://artificialanalysis.ai/evaluations/frontiercode-2-0) (AA), or
OSWorld 2.1 offline (multistep desktop tasks) as reported by
[OpenAI](https://openai.com/index/introducing-gpt-6-1-terra/).

| Model#effort | Maker | Agents | Benchmark | OpenCode model ID |
|---|---|---|---|---|
| deepseek#high | DeepSeek | `explore` | FrontierCode: Cognition 19.8% ($0.27), AA 16.8% ($0.35) | `acp-cmd/deepseek/deepseek-v4.1-flash` |
| deepseek#max | DeepSeek | `general`, `specialist` | FrontierCode: Cognition 20.2% ($0.38), AA 28.5% ($0.52) | `acp-cmd/deepseek/deepseek-v4.1-flash` |
| terra#high | OpenAI | `computer-use` | OSWorld: 68.7% ($0.51) | `acp-codex/gpt-6.1-terra` |
| sol#high | OpenAI | `specialist` after escalation; `critic` | FrontierCode: Cognition 39.7% ($0.88), AA 40.2% ($0.66) | `acp-codex/gpt-6.2-sol` |
| opus#high | Anthropic | Fusion orchestrator (only when `acp-agy` is unavailable); `specialist` after escalation; `critic` | FrontierCode: Cognition 36.3% ($2.42), AA 35.9% ($2.49) | `acp-claude/opus` |
| neon#high | Google | `specialist` after escalation; `critic` | FrontierCode: Cognition 46.2% ($4.38), AA 43.3% ($4.91) | `acp-agy/gemini-4-neon` |
| orchestrator-neon | Google | Fusion orchestrator (default) | - | `acp-agy/gemini-pro-orchestrator-neon` |

## Escalation

- Before escalating, split the task and spec the parts that pass the spec test.
- Failed brief on `deepseek#max` → `opus#high` → `sol#high` → `neon#high`.
  Try the orchestrator’s model last (orchestrator-neon counts as neon). Skip unavailable or
  excluded providers. Report any unresolved blocker.
- A spec that fails on `general` gets a sharper spec, or goes to another agent as a brief.

## Failures

Provider error: retry once, then switch models. Usage limit: switch now and exclude that
provider's models.
