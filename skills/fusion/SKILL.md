---
name: fusion
description: Multi-model coding harness on OpenCode subagents. The orchestrator designs and specs, models picked by routing build, another maker reviews.
disable-model-invocation: true
---

You are the orchestrator: you make the design calls, split the work, and review it; subagents,
routed by the `routing` skill, make every edit to the tree, the smallest fix included. Invoke
`routing` before step 1.

1. **Explore.** Read the code the work touches yourself; for a broad sweep, dispatch `explore`
   subagents in the background, one specific question each. While they work, record the
   **baseline**: `git rev-parse HEAD`, the results of checks relevant to the change, and a **snapshot** of
   the tree after the checks ran, so check artifacts aren't mistaken for a child's work. A snapshot is a tree id taken without touching the index:
   `GIT_INDEX_FILE=$(mktemp -u) sh -c 'git add -A && git write-tree'`.

   Done when the baseline is recorded with the checks that were already failing, and every explorer
   has answered with its cited lines spot-checked.

2. **Design.** Write the plan and the task split yourself, and make every judgment call: UX intent,
   API shape, trade-offs. For a bug, hunt the root cause yourself when it is one short chain of
   reasoning. Split until each spec is one concern in a few files; group mechanical edits that
   share one rationale into a single task. Route each task by `routing`. Group tasks to run in
   parallel only when it's safe: none needs another's output, and any file overlap merges easily.

   Done when every task has an agent and a `model#effort`, in the order you will dispatch them,
   with parallel groups marked.

3. **Prompt.** Write each task's prompt: a spec or a brief, as `routing` defines them. Every
   prompt also asks the child to keep to it and leave changes to the plan to you, to commit its
   changes before reporting. If you save a prompt to a file, put it in the OS temp directory
   (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows), not the workspace.

   **Plan critique.** Before the first dispatch, send a second opinion the user's request, your
   plan, and every prompt when the work includes:
   - a high-stakes brief, or a new program or module;
   - a spec that crosses modules or rests on code you haven't read in full.

   Done when every critique finding is judged and the prompts revised.

4. **Dispatch** the next task in plan order, or every task of the next parallel group as
   background subagents, once everything before it has merged. Give each editing child its own
   worktree from `opencode.worktree_create`, checked out at this HEAD (the tool starts at the main
   checkout's). Put the path in its prompt and the instruction to work and commit only there.
   When a run fails, follow `routing`'s **Failures**. When a read-only child finishes, confirm the
   tree still matches the baseline.

5. **Review** in the task's worktree, against the baseline:
   - The child committed all its changes.
   - Read the full `git diff <baseline HEAD>...<its HEAD>`, skimming generated output.
   - Judge whether the child's proof demonstrates that the diff satisfies the request.
   - Tests: weakened, skipped, or deleted tests count as failure; new tests must assert something
     real.
   - Independently verify consequential claims and run checks relevant to the change; a regression
     from the baseline is a defect.

   Done when every check above has passed or its defect is sent to step 7.

6. **Cross-review** only for high-risk changes or unresolved correctness concerns: send a second
   opinion the original prompt, the task's worktree path, and the diff range. Done when
   skipped or every finding is judged.

7. **Rework.**
   - **Same child first.** Send the fix to the child that made it, by its session ID. If a stop
     report shows the task fails the spec test, route it again in step 2.
   - **Escalate** when two follow-ups haven't fixed it (a follow-up correcting your own spec
     doesn't count), or the approach is wrong: replace the child with a new one in the same
     worktree, given the original prompt plus what failed and its evidence, on the agent and
     `model#effort` `routing`'s **Escalation** picks. When the evidence doesn't show the cause,
     first send a second opinion the prompt, the task's worktree path, the diff, and the failure
     evidence.
   - Ask the user when the fix needs scope beyond the prompt.

   Each round goes back through step 5. Done when review passes and every finding is judged, or
   the task is a **blocker**: `routing`'s **Escalation** has no model left for it. On a blocker,
   finish the tasks already running, then go to step 9; otherwise to step 8.

8. **Merge** the task's HEAD into this checkout. On a conflict, have the child rebase onto this
   checkout's HEAD, and review it again from step 5.

   Done when the work is merged with relevant checks showing no regressions. Remove its worktree
   with `opencode.worktree_remove`, update baseline HEAD and snapshot; continue at step 4, or
   finally step 9.

9. **Hand off.** Present the proof and unresolved blockers or risks.
