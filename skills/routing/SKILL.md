---
name: routing
description: "Model selection and dispatch for OpenCode subagents. Use before every subagent call."
---

These are the user's standing model choices: always pass `model` as `<id>#<effort>`, with the ID
from **Models**.

## Dispatch

Every prompt stands alone: the outcome, the files and facts it needs, constraints, and completion
criteria. End with: "Return proof that the work satisfies the request."

`explore` runs on `deepseek#high`.

A **peer task** goes to `general` on `deepseek#max`: a parallel piece of your work, or a sweep that
would flood your context. Send only what a fresh agent can finish from the prompt and the tree;
keep work that hangs on what you learned this session. If it fails, take the work back; its
failure is evidence for your next `backstop` checkpoint.

The **frontier chain** is `opus#high` → `sol#high` → `neon#high`, with your own model moved last.
Skip unavailable or excluded providers.

A **consult** (planning, root-cause diagnosis, diff review; backstop `plan`) goes to a fresh
`oracle` on the first model in the frontier chain.

A **second opinion** (backstop `review`) is a consult that must be independent: take the first
model in the frontier chain whose maker differs from the planner (the `plan` round's model, else
you) and the builder (whoever wrote the diff). If none qualifies, report that no independent
`oracle` is available.

A **handoff** (backstop `handoff`) gives the task's execution to `general` on the first model in
the frontier chain.

## Models

Use these unless the user names another. Verify the ID in the model catalog. Maker means creator,
not serving provider. Only listed efforts are allowed. [`MODELS.md`](MODELS.md) has the benchmarks
behind the chain order.

| Model | Efforts | Maker | OpenCode model ID |
|---|---|---|---|
| deepseek | high, max | DeepSeek | `commandcode/deepseek/deepseek-v4.1-flash` |
| sol | high | OpenAI | `openai/gpt-6.2-sol` |
| opus | high | Anthropic | `claude-agent/opus` |
| neon | high | Google | `acp-agy/gemini-4-neon` |

## Failures

Provider error: retry once, then move to the next model in the frontier chain; a peer task comes
back to you instead. Usage limit: move now and exclude that provider's models. A retry or move
continues the same dispatch, so it spends no backstop round.
