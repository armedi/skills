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

A **second opinion** goes to a fresh `critic`.

## Models

Use these unless the user names another. Verify the ID in the model catalog. Maker means creator,
not serving provider. Only listed efforts are allowed.

**Benchmark** gives each row's score, with its USD cost per task in parentheses:
FrontierCode 2.0 (would a maintainer merge the change) from
[Cognition](https://cognition.com/frontiercode) and
[Artificial Analysis](https://artificialanalysis.ai/evaluations/frontiercode-2-0) (AA), or
OSWorld 2.1 offline (multistep desktop tasks) as reported by
[OpenAI](https://openai.com/index/introducing-gpt-6-1-terra/).

| Model#effort | Maker | Agents | Use | Benchmark | OpenCode model ID |
|---|---|---|---|---|---|
| deepseek#high | DeepSeek | `explore` | – | FrontierCode: Cognition 18.2% ($0.27), AA 16.8% ($0.35) | `commandcode/deepseek/deepseek-v4.1-flash` |
| deepseek#max | DeepSeek | `general`, `critic` | – | FrontierCode: Cognition 19.3% ($0.38), AA 28.5% ($0.52) | `commandcode/deepseek/deepseek-v4.1-flash` |
| terra#high | OpenAI | `computer-use` | – | OSWorld: 68.7% ($0.51) | `openai/gpt-6.1-terra` |
| sol#medium | OpenAI | `specialist`, `critic` | Brief with clear scope and existing patterns to follow | FrontierCode: Cognition 29.6% ($0.49), AA 33.4% ($0.41) | `openai/gpt-6.1-sol` |
| sol#high | OpenAI | `specialist`, `critic` | Brief spanning several files in one module, design decisions inside one module, or a bug that needs diagnosis first | FrontierCode: Cognition 34.8% ($0.65), AA 36.7% ($0.63) | `openai/gpt-6.1-sol` |
| sol#max | OpenAI | `specialist`, `critic` | Brief with cross-cutting design, concurrency, subtle correctness, code with no pattern to follow, or no known path to a solution; high-stakes brief (security, migrations, data integrity, public API) | FrontierCode: Cognition 39.0% ($1.03), AA 40.6% ($1.13) | `openai/gpt-6.1-sol` |
| opus#medium | Anthropic | `specialist`, `critic` | Brief with clear scope and existing patterns to follow, when OpenAI is excluded | FrontierCode: Cognition 30.1% ($1.70), AA 33.1% ($1.71) | `claude-agent/opus` |
| opus#high | Anthropic | `specialist`, `critic` | Brief beyond clear scope and existing patterns, when OpenAI is excluded | FrontierCode: Cognition 34.5% ($2.42), AA 35.9% ($2.49) | `claude-agent/opus` |
| grok#high | xAI | `critic` | – | FrontierCode: Cognition 26.6% ($11.09), AA 27.8% ($11.06) | `xai/grok-4.7` |

Take a row whose **Agents** lists the agent. When several do, take the one whose **Use** matches
the task's difficulty, not the cheapest: a failed run costs its own price plus your review and
re-dispatch, so when torn between two rows, take the higher.

For a `critic`, first narrow the rows to one maker: the earliest of OpenAI, Anthropic, xAI,
DeepSeek, that differs from the parent's maker, and from the implementer's once one exists. Then match
the difficulty of the work under review.

The fusion orchestrator runs on opus#high.

## Escalation

- Before escalating, split the task and spec the parts that pass the spec test.
- On failure, re-judge the difficulty with what the failure revealed, then take the matching
  brief row above the failed one: sol#medium, sol#high, sol#max; with OpenAI excluded,
  opus#medium, opus#high. Past the top of the ladder, report the blocker.
- A spec that fails on `general` gets a sharper spec, or goes to another agent as a brief.

## Failures

Provider error: retry once, then switch models. Usage limit: switch now and exclude that
provider's models.
