---
name: routing
description: "Model selection, second opinions, and escalation for OpenCode subagents. Use before every subagent call."
---

Pick the agent by its description. Always pass `model` as `<id>#<effort>`, choosing a row by its
**Use** column.

## Handoffs

In every handoff, ask: "Return proof that the work satisfies the request."

A **spec** passes the **spec test**: a careful newcomer could finish from the prompt and tree
alone, making no design decisions. Send it to `general`, ending with: "Follow the spec. If its
approach doesn't fit the code, stop and report why."

A **brief** gives the outcome, constraints, and completion criteria, leaving design decisions to
the child. Send it to `specialist`, asking for objections with evidence.

A **second opinion** goes to a fresh `critic` whose maker differs from the parent's, and from the
implementer's once one exists.

## Models

Use these unless the user names another. Verify the ID in the model catalog. Maker means creator,
not serving provider. Only listed efforts are allowed. The brief ladder under Escalation never steps
from a smarter model to a less smart one: Sol, then Opus.

FrontierCode is Artificial Analysis's FrontierCode 2.0 pass rate (would a maintainer merge it);
CursorBench is CursorBench 4.0 (ambiguous multi-file tasks); "–" means not measured. Each `$/task`
is that benchmark's USD cost per task; compare costs only within the same column. CursorBench has no
GPT-6.1 data, so OpenAI rows rest on FrontierCode alone.

| Model#effort | Maker | Use | FrontierCode | FrontierCode $/task | CursorBench | CursorBench $/task | OpenCode model ID |
|---|---|---|---|---|---|---|---|
| deepseek#max | DeepSeek | `general` and `explore` | 28.5% | 0.52 | 47.7% | 0.98 | `commandcode/deepseek/deepseek-v4.1-flash` |
| terra#medium | OpenAI | `computer-use` | 34.5% | 0.26 | – | – | `openai/gpt-6.1-terra` |
| sol#medium | OpenAI | Brief with clear scope and existing patterns to follow | 33.4% | 0.41 | – | – | `openai/gpt-6.1-sol` |
| sol#high | OpenAI | Brief spanning several files in one module, or a bug that needs diagnosis first | 36.7% | 0.63 | – | – | `openai/gpt-6.1-sol` |
| sol#xhigh | OpenAI | Brief with design decisions inside one module; OpenAI critic of Opus work | 38.5% | 0.70 | – | – | `openai/gpt-6.1-sol` |
| sol#max | OpenAI | Brief with design decisions across modules, or in code with no pattern to follow | 40.6% | 1.13 | – | – | `openai/gpt-6.1-sol` |
| opus#medium | Anthropic | Anthropic critic of Sol work | 33.1% | 1.71 | 52.5% | 2.91 | `claude-agent/opus` |
| opus#high | Anthropic | Fusion orchestrator; high-stakes brief (security, migrations, data integrity, public API) | 35.9% | 2.49 | 56.0% | 3.97 | `claude-agent/opus` |
| opus#xhigh | Anthropic | Brief with cross-cutting design, concurrency, subtle correctness, or no known path to a solution | 43.8% | 6.49 | 56.0% | 6.98 | `claude-agent/opus` |
| grok#high | xAI | Critic when Anthropic and OpenAI are both excluded | – | – | 43.9% | 4.69 | `xai/grok-4.7` |

## Escalation

- Start at the row whose Use matches the task's difficulty, not the cheapest row. A failed run
  costs its own price plus your review and re-dispatch, so when torn between two rows, take the
  higher.
- Before escalating, split the task and spec the parts that pass the spec test.
- On failure, re-judge the difficulty with what the failure revealed, then take the matching
  brief row above the failed one: sol#medium, sol#high, sol#xhigh, sol#max, opus#xhigh. A failed
  opus#high run moves to opus#xhigh. Past opus#xhigh, report the blocker.
- A spec that fails on `general` gets a sharper spec, or goes to another agent as a brief.

## Failures

Provider error: retry once, then switch models. Usage limit: switch now and exclude that
provider's models.
