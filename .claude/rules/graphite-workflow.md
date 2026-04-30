# Graphite PR Workflow Rules

## Single PR per Spec / Feature

When working on a spec or feature, **never create additional branches or PRs without explicit user instruction**.

- Do NOT use `gt create` to add commits to an existing branch — `gt create` ALWAYS creates a new branch
- All incremental changes (spec updates, fixes, additions) go into the **existing branch** via `gt modify` (`gt m`)
- If the current branch already has a PR open, use `gt modify` to amend — do not create a sibling or child branch

## Correct Flow for Updating an Existing PR

```bash
# Stage changes
git add <files>

# Amend the current branch's commit (gt m = gt modify)
gt modify --commit -m "feat(ISSUE): update description"
# or: gt m --commit -m "feat(ISSUE): update description"

# Push to update the existing PR
gt submit --no-interactive --publish
```

## Wrong Flow (Do NOT do this)

```bash
# ❌ ALWAYS creates a new branch — never use this to update an existing PR
gt create -m "some update"   # creates a new branch + new PR automatically
gt submit                    # results in a new unwanted PR
```

## Why

`gt create` unconditionally creates a new branch and commit on top of the current stack.
`gt modify` (alias `gt m`) amends the **current** branch's tip commit in place.

Using `gt create` to update an existing PR creates extra branches and PRs, clutters the PR list, and requires manual cleanup (fold, close, comment). One spec = one PR.
