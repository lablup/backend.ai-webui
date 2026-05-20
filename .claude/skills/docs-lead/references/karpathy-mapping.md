# Karpathy LLM Wiki — mapping for docs-lead

docs-lead is a partial adoption of Andrej Karpathy's "LLM Wiki" pattern
(gist `442a6bf555914893e9891c11519de94f`, April 2026). Read this file when you
need to reason about why the skill is shaped the way it is, or when extending
the skill in ways that touch the layer/op model.

## Three-layer architecture

| Layer | In Karpathy's pattern | In Backend.AI WebUI docs |
|---|---|---|
| Raw Sources | Immutable reference docs (articles, papers, PDFs) | React source, i18n JSON, PR history, Jira issues — **not** owned by docs-lead |
| Wiki | LLM-generated markdown with cross-refs, summaries, entity pages | `packages/backend.ai-webui-docs/src/{en,ko,ja,th}/**` — sometimes human-edited, but the LLM is the primary writer |
| Schema | Configuration documenting wiki structure and workflows | `TERMINOLOGY.md`, `DOCUMENTATION-STYLE-GUIDE.md`, `TRANSLATION-GUIDE.md`, `SCREENSHOT-GUIDELINES.md`, `book.config.yaml` |

## Three operations — what we adopted

### Ingest (✅ adopted)

In Karpathy's pattern: when a new raw source arrives, the LLM extracts key info
and integrates it across 10–15 wiki pages simultaneously.

In docs-lead: a user-facing PR (or feature description) triggers the
`docs-update-planner` → `docs-update-writer` chain. The planner identifies which
pages are affected (matching Karpathy's "across N pages" insight); the writer
produces the multi-page updates. Approval gate sits between planner and writer
because the user manual is human-curated, not autonomously rewritten.

### Lint (✅ adopted)

In Karpathy's pattern: periodic health checks identify contradictions, stale
claims, orphaned pages, and data gaps.

In docs-lead: the `docs-lint` subagent runs five checks (terminology drift,
translation parity gap, stale screenshot candidates, broken cross-ref / image
link, PR coverage gap). Output is diagnosis-only — auto-fix is forbidden, even
when the fix is trivial. The user remains the editorial gate.

### Query (❌ not adopted — by design)

In Karpathy's pattern: ask questions against the wiki; valuable answers become
new pages, compounding value.

Why we skipped it for docs-lead:

- The user manual is a *curated* artifact with editorial constraints (release
  cuts, version pinning, translation parity). Auto-generated pages would
  violate these constraints.
- Users reading the manual go through the website / PDF, not through a query
  agent. No clear user demand.
- "Query → new page" is the part of Karpathy's pattern that most easily drifts
  away from human oversight. Excluding it keeps the skill aligned with the
  user-controls-final-output requirement.

If a Query channel is added later, gate it the same way Ingest is gated:
proposed-page output goes through user approval (and likely the
docs-update-reviewer pass) before landing in `src/`.

## Why this matters for future maintainers

- **Do not let workers create pages without going through the planner.** The
  planner is what enforces "across N pages" + book.config.yaml registration.
- **Do not weaken the lint→diagnosis-only rule.** That is what keeps human
  editors in control. The auto-fix temptation is real (terminology drift looks
  trivially fixable) but it is the path that turns a user manual into an
  LLM-curated wiki, which is not what the project wants.
- **If you add a Query op, copy the Ingest approval-gate pattern.** Don't ship
  it as a side door.
