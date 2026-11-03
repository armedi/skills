---
name: launch
description: Launch one agent for a task as a top-level session on its own worktree, or as a fusion orchestrator with --fusion.
argument-hint: "[--fusion] <task>"
disable-model-invocation: true
---

Invoke `routing` first.

Expand the task so the prompt stands alone; the launched agent has none of this conversation.

1. Infer the task's likely edit scope, then run `scripts/launch.sh --sessions`. File `status` is
   relative to this worktree; an active session with no files may simply not have edited yet.
   Judge overlap from file paths and session titles. Launch unrelated work directly; mention
   small, localized overlaps without blocking. Resolve every likely large conflict with me before
   launching: reuse the worktree/session, wait for integration, or proceed regardless.

2. Launch. The worktree starts at this checkout's HEAD; uncommitted changes stay behind.

   ```
   scripts/launch.sh --model <model> --title <title> [--fusion] <prompt>
   ```

   - **With `--fusion`:** pass it on, with the task as the prompt and the model `routing` picks for
     a fusion orchestrator.
   - **Without:** write the prompt as a spec or a brief, as `routing` defines them, on the model
     `routing` gives that handoff; tell the agent to work and commit only in its worktree.
   - `<title>`: names the session, the worktree, and its new branch. Write a headline naming the change, e.g.
     `Fix login redirect loop`, distinct from its siblings at a glance.

3. Report the session ID and the worktree path.
