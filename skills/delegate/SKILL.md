---
name: delegate
description: Launch one agent for a task, on its own worktree and a routed model, or on /fusion with --fusion.
argument-hint: "[--fusion] <task>"
disable-model-invocation: true
allowed-tools:
  - Skill
  - Bash(hc *)
  - Bash(git *)
---

Invoke `routing` and `herdr-core` first.

Launch one agent for the task, in an hc terminal on its own worktree, following `routing`'s
**Launching** rules. The task may point at something agreed earlier in this conversation; expand
it so the prompt stands alone.

- **With `--fusion`:** launch opus-5.5 at `high` with the prompt `/fusion <task>`.
- **Without:** route the task by `routing`.

Before launching, check hc for agents already running. When one likely touches the same files
enough to risk a large conflict, name the overlap and let me pick: add the task to that agent,
wait for it to finish and then launch, or launch now regardless.

Give the launch its own Herdr space: `--no-parent --label herdr.space=delegate-<task-slug>`.
