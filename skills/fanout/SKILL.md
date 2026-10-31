---
name: fanout
description: Launch one agent per work item, each on its own worktree and a routed model, or on /fusion for the items you mark.
argument-hint: "<items, and which run with fusion>"
disable-model-invocation: true
allowed-tools:
  - Skill
  - Bash(hc *)
  - Bash(git *)
---

Launch one agent per work item, each an hc child on its own worktree that outlives you,
following the `routing` skill's **Launching** rules. The user says which items run with fusion;
an item they don't mark runs without.

- **With fusion:** launch opus-5.5 at `high`; its task is `/fusion ` followed by the item, made
  self-contained.
- **Without fusion:** route the item by `routing`; its task is the spec or brief its agent type
  takes.

Give each launch its own Herdr space: `--label herdr.space=fanout-<task>`.
