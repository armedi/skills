---
name: launch-with-fusion
description: Launch a new T3 thread running the fusion skill with the given request.
argument-hint: "<request>"
disable-model-invocation: true
allowed-tools:
  - mcp__t3-code__t3_thread_launch
  - mcp__t3-code__t3_thread_send
  - mcp__t3-code__t3_thread_read
  - mcp__t3-code__t3_thread_wait
  - mcp__t3-code__t3_thread_interrupt
---

Launch a new T3 thread for the user's request, with `modelSelection` set to `{"provider": "claudeAgent", "model": "claude-opus-5-5", "options": [{"id": "effort", "value": "high"}]}`. Its initial message is `/fusion ` followed by the request, made self-contained, since the new thread can't see this conversation. Done when you've replied with the thread link.
