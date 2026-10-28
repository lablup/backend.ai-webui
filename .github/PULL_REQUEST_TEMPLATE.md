resolves #NNN
<!-- replace NNN with the GitHub issue number and title the PR `prefix(#NNN): title`. -->
<!-- Legacy: a PR already in flight against a Jira issue may keep `resolves #NNN (FR-MMM)` and `prefix(FR-MMM): title`. -->
<!-- Do not use that form for new work, including issues whose body ends with `JIRA Issue: FR-MMM`. -->

<!--
Please precisely, concisely, and concretely describe what this PR changes, the rationale behind codes,
and how it affects the users and other developers.
-->

**Testing:**
<!-- What you ran and its result: commands, manual checks, the `bash scripts/verify.sh` result line (the ready gate pastes it if empty). -->

**Risk:**
<!-- The ready gate rewrites the block below from `REVIEW.md` (## Risk tiers): tier, matched paths, suggested approvals. Anything inside it is replaced; write risk notes you want kept on the lines after the block. -->
<!-- fw-risk-tier -->
<!-- /fw-risk-tier -->

**How to revert:**
<!-- Default below; say more when a data migration, a stored setting or `config.toml` is involved. -->

Revert the merged commit(s) of this PR.

**Checklist:** (if applicable)

- [ ] Documentation
- [ ] Minimum required manager version (the supported floor is `pnpm run dev-env compat`, not a number in the repository)
- [ ] Specific setting for review (eg., KB link, endpoint or how to setup)
