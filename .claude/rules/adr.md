---
description: Read the ADRs in force before changing what they cover; record a new architecture-level decision as an ADR in the same PR; flag a reversal to a human before landing it
---

# Architecture Decision Records

Architecture-level decisions live in `docs/adr/`, one file per decision, indexed
by `docs/ARCHITECTURE.md`. A decision on `main` is in force. Code that follows
it must not drift from it, and code that needs a new decision must record one.

## Why

Reviewers and agents keep re-deriving *why* the code looks the way it does —
why leaf components take `project` as a required prop, why a hook may not be
imported on some routes — and the reasoning is scattered across Jira threads
and commit bodies. An ADR puts it in one file a reader can open from the code.

## Rules

1. **Read before implementing.** Before changing an area an ADR covers, read
   that ADR and its row in `docs/ARCHITECTURE.md`. Never implement against an
   ADR in force. If you disagree, write a new ADR that supersedes it instead of
   coding around it.
2. **Write when a decision appears.** A change needs an ADR when it adds,
   removes, or replaces a runtime dependency; moves where a kind of state lives
   or who may read it; changes a contract between `react/`,
   `packages/backend.ai-ui/`, Electron, or the manager API; changes routing or
   page structure every page must follow; or introduces a guardrail (an ESLint
   restriction, a required prop pattern) review will enforce from now on. A bug
   fix, a single component, or work that follows an existing ADR needs none.
3. **Write and proceed.** Record the decision in the same branch and keep
   implementing. The PR is where a human reviews it. The ADR, its
   `docs/ARCHITECTURE.md` row, and the code land in one PR.
4. **Flag a reversal early.** A decision that reverses an ADR in force is a
   bigger call: say so in the PR description or the Jira issue before landing.
5. **Name it where the code follows it.** A PR that lands or follows an ADR
   says `ADR NNNN` in its Summary. A source comment that exists because of an
   ADR is the one-line pointer `comment-density.md` allows, aimed at the ADR
   file, as the ESLint message for ADR 0001 is.

Write one with the `adr-writing` skill.
