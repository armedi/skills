---
name: cleanup
description: Remove dead code and other cruft from a diff, or from a project's current state.
argument-hint: "[...<range|path|focus>]"
disable-model-invocation: true
---

# Cleanup

Leave every edit unstaged, and do not commit.

## Scope

**Diff** (default). Take uncommitted changes against `HEAD`, so staged work is included. A range argument replaces that diff. Bare `main` or `master` means `<base>...HEAD`; prefer `main` when both exist. A path or glob limits you to matching files in the diff. Empty diff: stop. If an explicit path matches nothing in the diff, ask which scope to use.

**Tree.** The word "snapshot" selects this scope: that path's current contents. If they name no path, ask which files.

## Cruft

An argument that names a kind of cruft is a focus and replaces the list below. A range, a path, or "snapshot" is not a focus. With no focus, clean:

- Unused symbols (imports, bindings, types, exports, re-exports) and uncalled test scaffolding
- Commented-out code and unreachable branches
- Debug logging (`console.log`, `debugger`, temporary prints)
- Unreferenced files and barrels, including empty stubs
- Duplicate helpers, folded into the existing one
- One-off helpers with a single in-scope caller, inlined there

In a diff, only cruft the change introduced or left behind.

Delete code only when a repo search shows it is unused. Keep public or compatibility APIs and intentional branches (feature flags, documented fallbacks, platform splits) even when nothing in the repo calls them.

## Edit

Change only those removals and the call sites they affect. Leave formatting and names alone.

Run the relevant linters or tests and fix failures the edit caused.

## Report

- Scope (diff or tree) and any focus
- Files touched
- What you removed or inlined, and why
- What you kept on purpose, or could not decide
- Checks you ran, and any failure or check you could not run
