---
description: Do not review the contents of generated or vendored files (Relay `__generated__`, lockfiles, build artifacts); review the inputs that produce them instead
---

# Review-Ignored Paths Rule

When reviewing a PR or a diff — whether as a human-facing summary, an automated agent
(`fw:lead-frontend-review`, `dev-workflow:code-reviewer`, `pr-reviewer`, etc.), or a bot —
**do not review the line-by-line contents of generated or vendored files.** Review the
*inputs* that produce them instead.

## Why

Generated files are a deterministic function of their inputs. A reviewer comment on a
generated file is noise: the author cannot act on it (the next build overwrites their
edit), and it draws attention away from the hand-written source that actually changed.

The canonical example in this repo is Relay compiler output under `**/__generated__/**`.
A single new fragment can add hundreds–thousands of lines of generated types, alias
boilerplate, and `readonly` array patterns. Bots (especially Copilot) routinely leave
useless comments on these. The real review surface is:

- the `graphql\`...\`` tags inside `.tsx` / `.ts` files, and
- `data/schema.graphql` (the schema the queries are written against).

The generated output is just those two inputs run through `pnpm relay`, and
`scripts/verify.sh` (Relay compile + `tsc`) already guarantees they stay in sync.

## Rules

1. **Do not review the contents of these paths:**
   - `**/__generated__/**` — Relay compiler output
   - `pnpm-lock.yaml`, `**/*.lock`, `**/*.lock.yml` — lockfiles (see [[pnpm-lockfile-conflicts]])
   - `*.d.ts` and other artifacts under `dist/` or `build/`
2. **Review the inputs, not the output.** For Relay changes, review the `graphql` tags
   and `data/schema.graphql`. For dependency changes, review `package.json` /
   `pnpm-workspace.yaml`, not the regenerated lockfile.
3. **One thing is still worth a glance — the *set* of changed generated files, not their
   content.** Flag only structural mismatches:
   - A `graphql` tag was added/changed but no corresponding `__generated__` file appears
     in the diff (author forgot to run `pnpm relay` / commit the output).
   - `__generated__` files changed but no `graphql` tag or schema change explains them
     (stray or stale artifacts).
   Beyond that existence/scope check, leave generated files alone.
4. **Never ask the author to hand-edit a generated file.** If the output looks wrong, the
   fix is in the query/schema input or a `pnpm relay` re-run — say that instead.

## Enforcement points

- `.gitattributes` marks `react/src/__generated__/**` and
  `packages/backend.ai-ui/src/__generated__/**` as `linguist-generated=true`, so GitHub
  collapses them in PR diffs automatically.
- `.github/copilot-instructions.md` ("What NOT to comment on") tells Copilot to skip these
  paths.
- This rule covers the Claude-side review agents and any ad-hoc review you perform.

## Related

- `.gitattributes` — the `linguist-generated=true` entries for `__generated__`.
- `.github/copilot-instructions.md` — Copilot's matching skip list.
- [[pnpm-lockfile-conflicts]] — why the lockfile is auto-generated and never hand-merged.
- `relay-patterns` skill — the fragment architecture whose `graphql` tags ARE the review surface.
