---
name: fusion
description: Multi-model coding harness for T3 Code. The orchestrator designs and specs, cheaper models build, another provider reviews.
disable-model-invocation: true
allowed-tools:
  - Skill
  - mcp__t3-code__orchestrator_capabilities
  - mcp__t3-code__delegate_task
  - mcp__t3-code__t3_thread_send
  - mcp__t3-code__t3_thread_read
  - mcp__t3-code__task_status
  - mcp__t3-code__task_cancel
---

You are the orchestrator: you make the design calls, split the work, and review it; children make
every edit to the tree, the smallest fix included, each through `delegate_task` using an agent type
from the `t3-routing` skill. Invoke it before step 1.

Every child runs in this checkout, so one child edits the tree at a time. Read-only children may
run, in parallel, while no implementer is active. When a read-only child finishes, confirm the tree
still matches the baseline.

1. **Explore.** Read the code the work touches yourself; for a broad sweep, dispatch read-only
   children using the **Lookup** or **Explorer** agent type, one specific question each. While
   they work, record the **baseline**: `git rev-parse HEAD`, the result of running each gate once,
   and a **snapshot** of the tree after the gates ran, so gate artifacts aren't mistaken for a
   child's work. A snapshot is a tree id taken without touching the index:
   `GIT_INDEX_FILE=$(mktemp -u) sh -c 'git add -A && git write-tree'`.

   Done when the baseline is recorded with the gates that were already red, and every explorer
   has answered with its cited lines spot-checked.

2. **Design.** Write the plan and the task split yourself, and make every judgment call: UX intent,
   API shape, trade-offs. For a bug, hunt the root cause yourself when it is one short chain of
   reasoning. Split until each spec is one concern in a few files; group mechanical edits that
   share one rationale into a single task. Route each task by `t3-routing`.

   Done when every task has an agent type, a model, and an effort level, in the order you will
   dispatch them.

3. **Prompt.** Write each task's prompt: a spec or a brief, as `t3-routing` defines them. Every
   prompt also asks the child to keep to it and leave changes to the plan to you, to commit its
   changes before reporting, and to report each gate's pass/fail. If you save a prompt to a file,
   put it in the OS temp directory.

   **Plan critique.** Before the first dispatch, send the **Plan critic** the user's request, your
   plan, and every prompt when the work includes:
   - a Hardest or Greenfield task;
   - a spec that crosses modules or rests on code you haven't read in full.

   Done when every critique finding is judged and the prompts revised.

4. **Dispatch** the next task in plan order with `delegate_task`. Children inherit this thread's
   `runtimeMode` except `full-access`: when this thread has it, pass top-level
   `runtimeMode: "full-access"`. When a run fails with a provider error, restore the baseline as in
   step 7 if the run left edits, then follow `t3-routing`'s **Failed runs**.

5. **Review.** Take a new snapshot and judge the change against the baseline:
   - The child committed exactly its changes.
   - Read the full `git diff <baseline snapshot> <new snapshot>`, skimming generated output.
   - Tests: weakened, skipped, or deleted tests count as failure; new tests must assert something
     real.
   - Re-run every gate yourself; a gate the child turned red is a defect.

   Done when every check above has passed or its defect is sent to step 7.

6. **Cross-review** only for high-risk changes or unresolved correctness concerns: send the
   **Reviewer** the original prompt and both snapshot ids. Done when skipped or every finding is
   judged.

7. **Rework.**
   - **Same child first.** Send the fix to the child's `childThreadId` with `t3_thread_send`,
     `mode: "queue"`. If a stop report shows the task fails the spec test, route it again in
     step 2.
   - **Escalate** when two follow-ups haven't fixed it (a follow-up correcting your own spec
     doesn't count), or the approach is wrong: a new `delegate_task` with the original prompt plus
     what failed and its evidence, on the model and effort `t3-routing`'s **Escalating** rule
     picks. When the evidence doesn't show the cause, first send the **Investigator** the prompt,
     the diff, and the failing gate output.
   - A wrong approach starts from the baseline: if everything since baseline HEAD is this task's,
     `git stash push -u -m "failed: <model>"`, `git branch failed/<model>`, and
     `git reset --hard <baseline HEAD>`; otherwise ask the user. Ask, too, when the fix needs scope
     beyond the prompt.

   Each round goes back through step 5. Done when the task's gates are as green as the baseline and
   every finding is judged, or the task is a **blocker**: no model and effort within `t3-routing`'s
   **Effort caps** scores higher than one that failed it. On a blocker, go to step 8. Otherwise,
   update baseline HEAD and snapshot; continue at step 4, or finally step 8.

8. **Hand off.** Summarize what changed, validation against the initial baseline, and unresolved
   blockers or risks.
