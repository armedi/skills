---
name: t3-routing
description: "Routing for coding work dispatched to another model in T3 Code: agent type, model, and effort. Use before delegating a task, launching a thread for one, or picking a reviewer."
---

## Agent types

### Executor

Takes every task written as a **spec**: a prompt that passes the **spec test**, where a careful
newcomer to the repo could finish it from the prompt and the tree alone, choosing nothing. Runs on
deepseek-v4.1-flash at `max`. It executes a design well and makes a poor one. A spec ends with:
"Follow the spec. If its approach doesn't fit the code, stop and report why. Work alone, with the
file, search, and shell tools."

### Specialists

Take a task that fails the spec test, from a **brief**: the outcome, the constraints, and what
counts as done, leaving the design to the specialist. A brief asks for objections to it, with
evidence.

| Agent type | Takes | Model |
|---|---|---|
| **Hardest** | architecture, subtle bugs, concurrency, money, data migrations, public APIs, build/CI or tooling failures of unknown cause | opus-5.5 at `high` |
| **Greenfield** | a new program or module built from a requirements document | opus-5.5 at `high` |
| **Open feature** | a feature, refactor, or migration no other row names | gpt-6.1-sol |
| **Terminal** | build/CI fixes of known cause, shell scripts, environment and tooling work | gpt-6.1-sol at `xhigh` |
| **Algorithm** | performance-critical or algorithm-heavy logic | gpt-6.1-sol at `xhigh` |
| **Visual** | a visual bug shown in a screenshot (image paths in the brief), or visual design work | opus-5.5 |
| **Security** | vulnerabilities, auth, access control, crypto, secrets | gpt-6.1-sol |
| **Reverse engineering** | binaries and undocumented protocols | gpt-6.1-sol at `xhigh` |
| **Science** | scientific and numerical code | opus-5.5 |

None of the models take video or audio: ask the user for frames or a transcript.

### Read-only

| Agent type | Takes | Model |
|---|---|---|
| **Lookup** | questions whose answer is used as-is: find X, list call sites | deepseek-v4.1-flash |
| **Explorer** | how something works, or any answer that shapes a plan | gpt-6.1-sol |
| **Investigator** | diagnosing a failure the evidence doesn't explain | second opinion |
| **Plan critic** | checking a plan and its prompts against the code before dispatch | second opinion |
| **Reviewer** | reviewing a finished change against its prompt | second opinion |

A **second opinion** comes from a model whose maker differs from yours and from the
implementer's. Of those, take the one with an Intelligence Index entry closest to the
implementer's model at its effort; on a tie, the higher.

## Effort

For every agent type but the Executor, pick the **lowest** level whose row matches:

| Effort | When the task looks like this |
|---|---|
| `medium` (default) | A brief with a clear scope: the outcome and constraints are settled, the code is not. |
| `high` | The implementer must find something out or design something: unknown root cause, invariants across many files, concurrency, security, money, or migration correctness. |
| `xhigh` / `max` | Only when the agent type names it, or when escalating after a failed run. |

- An agent type that names an effort sets the default; drop a level when the task is clearly simpler.
- **Shrink the task before raising effort**: split it, and spec the parts that pass the spec test.
- **Read-only agent types** take the effort of the task they serve, not its implementer's: `medium`
  for explorers and for checking a spec, `high` for a `high`-class task.
- **Escalating** after a failed run: pick the model and effort with the next higher Intelligence
  Index than every run that failed the task, within the **Effort caps**; on a tie, prefer a model
  that hasn't failed it.

## Models

Dispatch only these six; another model only when the user names it.

| Short name | Intelligence Index | `providerInstanceId` | Provider |
|---|---|---|---|
| opus-5.5 | medium: 51, high: 54, xhigh: 56, max: 58 | `claudeAgent` | Anthropic |
| sonnet-5.5 | medium: 41, high: 47, xhigh: 52, max: 56 | `claudeAgent` | Anthropic |
| gpt-6.1-sol | medium: 48, high: 50, xhigh: 51, max: 52 | `codex` | OpenAI |
| gpt-6.1-terra | medium: 41, high: 44, xhigh: 45, max: 48 | `codex` | OpenAI |
| grok-4.7 | high: 46, xhigh: 46 | `grok` | SpaceXAI |
| deepseek-v4.1-flash | max: 45 | `acpRegistry_deepseek_harness` | Command Code |

- Pass effort in `target.options` under the option id `orchestrator_capabilities` advertises.
  When a model lacks the chosen effort, use the next level up it supports, or its highest within
  the caps below.
- **Effort caps.** gpt-6.1-sol at `xhigh`: `max` nearly doubles the cost for about one point.
  opus-5.5 and sonnet-5.5 at `max`: each level up still buys real gains.
- Under `auto`, the DeepSeek Harness runs shell commands and edits without approval, inside a
  workspace-write sandbox.
- **Failed runs.** When a run fails with a provider error rather than the model's work, retry the
  same prompt once; if that also fails, move to another model from the table that fits the task.
  On a usage-limit error, switch models straight away and skip every model from that provider.
