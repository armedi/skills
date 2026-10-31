---
name: routing
description: "Routing for coding work: agent type, model, effort, and the command that launches it. Use before handing a task to another agent."
allowed-tools:
  - Bash(hc run * cmd *--yolo*)
---

## Agent types

### Executor

Takes every task written as a **spec**: a prompt that passes the **spec test**, where a careful
newcomer to the repo could finish it from the prompt and the tree alone, choosing nothing. Runs on
deepseek-v4.1-flash. A spec ends with: "Follow the spec. If its approach doesn't fit the code,
stop and report why."

### Specialists

Take a task that fails the spec test, from a **brief**: the outcome, the constraints, and what
counts as done, leaving the design to the specialist. A brief asks for objections to it, with
evidence.

| Agent type | Takes | Model |
|---|---|---|
| **Hardest** | architecture, subtle bugs, concurrency, money, data migrations, public APIs, build/CI or tooling failures of unknown cause | opus-5.5 at `high` |
| **Greenfield** | a new program or module built from a requirements document | opus-5.5 |
| **Port** | rewriting code in another language | gpt-6.1-sol; sonnet-5.5 into Python |
| **Terminal** | build/CI fixes of known cause, shell scripts, environment and tooling work | gpt-6.1-sol |
| **Algorithm** | performance-critical or algorithm-heavy logic | gpt-6.1-sol at `xhigh` |
| **Visual** | a visual bug shown in a screenshot (image paths in the brief), or visual design work | opus-5.5 |
| **Security** | vulnerabilities, auth, access control, crypto, secrets | gpt-6.1-sol |
| **Reverse engineering** | binaries and undocumented protocols | gpt-6.1-sol at `xhigh` |
| **Science** | scientific and numerical code | opus-5.5 |
| **General** | a feature, refactor, or migration no other row names | deepseek-v4.1-flash |

### Read-only

| Agent type | Takes | Model |
|---|---|---|
| **Lookup** | questions whose answer is used as-is: find X, list call sites | deepseek-v4.1-flash |
| **Explorer** | how something works, or any answer that shapes a plan | gpt-6.1-sol |
| **Computer use** | reproducing or verifying behaviour by driving a browser or desktop GUI | gpt-6.1-terra |
| **Investigator** | diagnosing a failure the evidence doesn't explain | second opinion |
| **Plan critic** | checking a plan and its prompts against the code before dispatch | second opinion |
| **Reviewer** | reviewing a finished change against its prompt | second opinion |

A **second opinion** comes from a model whose maker differs from yours and from the
implementer's. Of those, take the one with an Intelligence Index entry closest to the
implementer's model at its effort; on a tie, the higher.

## Models

Dispatch only these six; another model only when the user names it.

| Short name | Intelligence Index | Launch | Provider |
|---|---|---|---|
| opus-5.5 | medium: 48, high: 52, xhigh: 57, max: 58 | `claude --model claude-opus-5-5 --effort <e>` | Anthropic |
| sonnet-5.5 | medium: 30, high: 41, xhigh: 50, max: 54 | `claude --model claude-sonnet-5-5 --effort <e>` | Anthropic |
| gpt-6.1-sol | medium: 46, high: 50, xhigh: 52, max: 55 | `codex -m gpt-6.1-sol -c model_reasoning_effort=<e>` | OpenAI |
| gpt-6.1-terra | medium: 38, high: 42, xhigh: 45, max: 51 | `codex -m gpt-6.1-terra -c model_reasoning_effort=<e>` | OpenAI |
| grok-4.7 | high: 35, xhigh: 34 | `grok -m grok-4.7 --effort <e>` | SpaceXAI |
| deepseek-v4.1-flash | max: 32 | `cmd --trust -m deepseek/deepseek-v4.1-flash --effort <e>` | Command Code |

- **Concurrency.** Run at most 3 agents at once, not counting deepseek-v4.1-flash runs.
- **Failed runs.** When a run fails with a provider error rather than the model's work, retry the
  same prompt once; if that also fails, move to another model from the table that fits the task.
  On a usage-limit error, switch models straight away and skip every model from that provider.

## Effort

Pick the **lowest** effort that can do the task. Use `xhigh` or `max` only when the agent type
names it, or when escalating after a failed run.

- **Shrink the task before raising effort**: split it, and spec the parts that pass the spec test.
- **Read-only agent types** take the effort of the task they serve, not its implementer's.
- **Effort caps.** gpt-6.1-sol and opus-5.5 at `xhigh`: `max` costs about 1.7× for one or two
  points. grok-4.7 at `high`: `xhigh` scores no higher. sonnet-5.5 and gpt-6.1-terra at `max`:
  each level up still buys real gains.
- **Escalating** after a failed run: pick the model and effort with the next higher Intelligence
  Index than every run that failed the task, within the **Effort caps**; on a tie, prefer a model
  that hasn't failed it.

## Launching

Start each agent as an hc child with its model's **Launch** command plus the flag for the
permission mode you run in:

| Your mode | claude | codex | grok | cmd |
|---|---|---|---|---|
| manual | `--permission-mode manual` | `-s workspace-write -a on-request` | `--permission-mode default` | `--permission-mode default` |
| acceptEdits | `--permission-mode acceptEdits` | `-s workspace-write -a on-request` | `--permission-mode acceptEdits` | `--permission-mode accept-edits` |
| auto | `--permission-mode auto` | `--approve-for-me` | `--permission-mode auto` | `--yolo` |
| bypassPermissions | `--permission-mode bypassPermissions` | `--dangerously-bypass-approvals-and-sandbox` | `--permission-mode bypassPermissions` | `--yolo` |

A read-only agent type runs in your checkout. An agent that edits gets its own worktree at
`~/.herdr/worktrees/<project>/<task>`.
