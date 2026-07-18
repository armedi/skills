---
name: cleanup
description: >-
  Remove dead code and unnecessary code after changes. Use when the user runs
  /cleanup (staged changes) or /cleanup branch (branch vs main/master).
disable-model-invocation: true
---
# Cleanup

Post-change cleanup. Remove dead code and unnecessary code introduced or left behind by recent work.

**Hard rules:** Do not `git add` or `git commit`. Leave all edits unstaged.

## Parse

- `/cleanup` — scope is the **staging area** (staged changes only).
- `/cleanup branch` — scope is the **current branch** compared against `main` or `master`.

```
Usage:
  /cleanup         — clean up dead/unnecessary code in staged changes
  /cleanup branch  — clean up dead/unnecessary code across the branch vs main/master
```

## Step 1: Determine scope

### `/cleanup` (staged)

```bash
git diff --cached --name-only
git diff --cached
```

If nothing is staged, tell the user and stop.

### `/cleanup branch`

Resolve the base branch:

```bash
git rev-parse --verify main 2>/dev/null && echo main
git rev-parse --verify master 2>/dev/null && echo master
```

Prefer `main` when both exist. If neither exists, ask the user which base branch to use.

```bash
git diff --name-only <base>...HEAD
git diff <base>...HEAD
```

If the diff is empty, tell the user and stop.

## Step 2: Identify cleanup targets

Within scope, look for:

- Unused imports, variables, parameters, types, constants, functions, classes, hooks, or exports
- Commented-out code left from refactoring
- Debug logging (`console.log`, `debugger`, temporary prints)
- Orphaned files no longer referenced
- Duplicate or redundant helpers introduced alongside new code
- Over-abstracted one-off utilities that can be inlined
- Unreachable or dead branches
- Empty or stub files left behind
- Stale re-exports or barrel entries pointing at removed symbols
- Test-only scaffolding that is no longer exercised

**Do not remove** code that is:

- Used elsewhere in the repo (search before deleting)
- Required for public API or backward compatibility
- Intentionally kept (feature flags, documented fallbacks, platform branches)
- Part of unchanged, out-of-scope code

When unsure whether something is dead, search the codebase for references before removing.

## Step 3: Clean up

1. Read each in-scope file and its callers.
2. Remove only dead or clearly unnecessary code tied to the scoped changes.
3. Keep diffs minimal — do not refactor unrelated code, reformat, or rename for style.
4. Match surrounding conventions (naming, imports, patterns).
5. Run relevant linters or tests if the project has them; fix issues your removals caused.

## Step 4: Verify

Before finishing:

- [ ] Every removal was verified unused or unnecessary within scope
- [ ] No `git add` or `git commit` was run
- [ ] Working tree has unstaged cleanup edits only
- [ ] Linters/tests pass (or report what failed)

## Report

Summarize briefly:

- Scope used (staged vs branch + base)
- Files touched
- What was removed and why (group by category)
- Anything left intentionally or needing user judgment
