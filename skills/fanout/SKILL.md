---
name: fanout
description: Launch one T3 thread per work item, each on its own worktree and a routed model, or on /fusion for the items you mark.
argument-hint: "<items, and which run with fusion>"
disable-model-invocation: true
allowed-tools:
  - Skill
  - mcp__t3-code__orchestrator_capabilities
  - mcp__t3-code__t3_thread_launch
  - mcp__t3-code__t3_thread_list
  - mcp__t3-code__t3_thread_read
  - mcp__t3-code__t3_thread_wait
  - mcp__t3-code__t3_thread_send
  - mcp__t3-code__t3_thread_interrupt
---

Launch one new top-level thread per work item, each on its own worktree. The user says which items
run with fusion; an item they don't mark runs without.

- **With fusion:** `modelSelection` is `{"provider": "claudeAgent", "model": "claude-opus-5-5",
  "options": [{"id": "effort", "value": "high"}]}`, and the message is `/fusion ` followed by the
  item, made self-contained.
- **Without fusion:** route the item with the `t3-routing` skill; the message is the spec or brief
  its agent type takes.
