---
name: routing
description: "Model selection, second opinions, and escalation for OpenCode subagents. Use before every subagent call."
---

Pick the agent by its description. Always pass `model` as `<id>#<effort>`, choosing a row by its
**Use** column. `general` and `explore` always take DeepSeek, to spread usage off the Claude and
OpenAI quotas.

## Handoffs

A **spec** passes the **spec test**: a careful newcomer could finish from the prompt and tree
alone, making no design decisions. Send it to `general`, ending with: "Follow the spec. If its
approach doesn't fit the code, stop and report why."

A **brief** gives the outcome, constraints, and completion criteria, leaving design decisions to
the child. Send it to `specialist`, asking for objections with evidence.

A **second opinion** goes to a fresh `critic` with a model whose maker differs from the parent's,
and from the implementer's once one exists.

## Models

Use these unless the user names another. Verify the ID in the model catalog. Maker means creator,
not serving provider. Only listed efforts are allowed; `xhigh`/`max` are listed only where they
measurably beat the lower effort.

FrontierCode is Artificial Analysis's FrontierCode 2.0 pass rate (would a maintainer merge it);
CursorBench is CursorBench 4.0 (ambiguous multi-file tasks); "–" means not measured. Each `$/task`
is that benchmark's USD cost per task; compare costs only within the same column. CursorBench has no
GPT-6.1 data, so OpenAI rows rest on FrontierCode alone.

| Model#effort | Maker | Use | FrontierCode | FrontierCode $/task | CursorBench | CursorBench $/task | OpenCode model ID |
|---|---|---|---|---|---|---|---|
| deepseek#max | DeepSeek | `general` and `explore`, always | 28.5% | 0.60 | 47.7% | 0.98 | `commandcode/deepseek/deepseek-v4.1-flash` |
| terra#high | OpenAI | Routine brief | 37.5% | 0.26 | – | – | `openai/gpt-6.1-terra` |
| terra#max | OpenAI | Design or multi-file brief; after Terra high fails | 42.3% | 0.96 | – | – | `openai/gpt-6.1-terra` |
| sol#high | OpenAI | OpenAI critic of Opus work; OpenAI retry after Terra fails | 36.7% | 0.59 | – | – | `openai/gpt-6.1-sol` |
| opus#medium | Anthropic | Anthropic critic of Terra high or Sol work | 33.1% | 2.45 | 52.5% | 2.91 | `claude-agent/opus` |
| opus#high | Anthropic | Fusion orchestrator; high-stakes brief (security, migrations, data integrity, public API); after Terra max fails; Anthropic critic of Terra max work | 35.9% | 3.46 | 56.0% | 3.97 | `claude-agent/opus` |
| opus#xhigh | Anthropic | Last resort, after Opus high fails; gains on FrontierCode only | 43.8% | 6.05 | 56.0% | 6.98 | `claude-agent/opus` |
| grok#high | xAI | Critic when Anthropic and OpenAI are both excluded | – | – | 43.9% | 4.69 | `xai/grok-4.7` |

## Escalation

- Before escalating, split the task and spec the parts that pass the spec test.
- On failure, take the row whose Use names that failure; prefer a model that hasn't failed the
  task. If none remains, report the blocker.
- A spec that fails on `general` gets a sharper spec, or goes to another agent as a brief.

## Failures

Provider error: retry once, then switch models. Usage limit: switch now and exclude that
provider's models.
