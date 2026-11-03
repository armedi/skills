---
name: land
description: Merge a finished session's worktree into this checkout and remove the worktree.
argument-hint: "<session>"
disable-model-invocation: true
---

The session named in my message is done. Land its worktree branch here.

1. If the session is still in `opencode api session.active`, stop and tell me.

2. Dry-run the merge against this checkout's HEAD SHA: `git merge-tree --write-tree <sha> <branch>`.

3. If it conflicts or the worktree has uncommitted work, the session resolves it, not you. Ask it
   to commit and rebase onto `<sha>`, then wait for it, with a 30-minute shell timeout:

   ```
   opencode api session.prompt --param sessionID=<id> -d '{"text": "<message>"}'
   opencode api experimental.session.wait --param sessionID=<id>
   ```

   Then recheck both conditions once. If either still holds or the wait times out, report the
   session's state to me.

4. `git merge --no-ff <branch>`, naming the session title in the message.

5. Remove the worktree with OpenCode's `worktree_remove` so its records stay in sync, then
   `git branch -d <branch>`.
