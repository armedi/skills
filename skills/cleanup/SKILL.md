---
name: cleanup
description: Remove dead code and other cruft left by recent changes.
argument-hint: "[...<range|path|focus>]"
disable-model-invocation: true
---

# Cleanup

Leave every edit unstaged. Do not `git add` or `git commit`.

## Scope

Take uncommitted changes against `HEAD`, so staged work is included. A range argument replaces that diff. Bare `main` or `master` means `<base>...HEAD`; prefer `main` when both exist.

A path or glob limits you to matching files in the diff. Empty diff: stop. If an explicit path matches nothing in the diff, ask which scope to use.

## Cruft

Any other argument is a focus: clean only that kind of cruft. With no focus, clean:

- Unused symbols: imports, bindings, types, exports, and re-exports
- Commented-out code and unreachable branches
- Debug logging (`console.log`, `debugger`, temporary prints)
- Files and barrels the change left unreferenced, including empty stubs
- Duplicate helpers the change added, folded into the existing helper
- One-off utilities whose only caller is in scope, inlined at that caller
- Test scaffolding the change left uncalled

Delete code only when a repo search shows it is unused. Keep public or compatibility APIs and intentional branches (feature flags, documented fallbacks, platform splits) even when nothing in the repo calls them.

## Edit

Limit the diff to those removals and the call sites they affect. Leave formatting, names, and unrelated code as they are.

Run the relevant linters or tests and fix failures the edit caused.

## Report

- Scope and any focus
- Files touched
- What you removed or inlined, and why
- What you kept on purpose, or could not decide
- Checks you ran, and any failure or check you could not run
