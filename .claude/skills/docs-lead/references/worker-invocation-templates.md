# Worker invocation templates

Copy-ready `Agent` invocation prompts for the four docs workers. Read this when
you (docs-lead) are about to call a worker and want the prompt to be
self-contained, idempotent, and aligned with how each worker expects to be
briefed.

## Conventions for every worker prompt

- **The templates below are illustrative shapes, not literal JS strings.**
  When constructing the actual `Agent({...})` call, build the `prompt` value
  as plain prompt text and substitute values (topic slug, PR title, lint
  excerpts, file lists) directly into that string. The backtick-quoted
  templates below read like JS template literals, but a PR title containing
  a backtick or `${…}` would break a verbatim template-literal copy. Treat
  these blocks as a *shape contract* — what to include, in what order, with
  what tone — not as code to paste.
- **Self-contained.** Workers see a fresh context window — repeat anything they
  need, including the topic slug, the source PR / feature description, the
  affected sections, and the lint findings (if lint-driven). Do not assume the
  worker can read prior conversation.
- **Topic slug consistency.** Use the same kebab-case slug across all four
  workers in a chain (`vfolder-bulk-delete`, `model-serving-revisions`, etc.).
  This is what makes `docs-update-plan-{topic}.md` and
  `docs-review-report-{topic}.md` line up.
- **Explicit output paths.** Tell each worker where its output goes, even
  though the worker's own SKILL.md/agent.md already specifies it. Belt and
  suspenders.

## `docs-update-planner`

```
Agent({
  description: "Plan docs update for <topic>",
  subagent_type: "docs-update-planner",
  prompt: `Source: <PR # / feature description / lint-driven>
Topic slug: <kebab-case>
<If lint-driven:> Motivating lint findings (verbatim from latest docs-lint-report.md):
<paste 3–10 line excerpt>
<If PR-driven:> PR title / FR-XXXX / summary of user-facing change
<If feature-driven:> Free-text description of the feature

Produce a plan at packages/backend.ai-webui-docs/.agent-output/docs-update-plan-<topic>.md following your
standard format (target sections, screenshots needed, languages, navigation
updates). Then report the exact filename you wrote so I can read it.`
})
```

## `docs-update-writer`

```
Agent({
  description: "Write docs from plan",
  subagent_type: "docs-update-writer",
  prompt: `Read packages/backend.ai-webui-docs/.agent-output/docs-update-plan-<topic>.md and execute it end to
end. Write English (src/en/) first, then ko/ja/th. Apply terminology from
TERMINOLOGY.md, formatting from DOCUMENTATION-STYLE-GUIDE.md, and translation
rules from TRANSLATION-GUIDE.md. Leave TODO markers for any screenshots that
the plan requests but cannot yet be captured. When done, list (file path,
language, change type) for every file you touched.`
})
```

## `docs-screenshot-capturer`

```
Agent({
  description: "Capture docs screenshots",
  subagent_type: "docs-screenshot-capturer",
  prompt: `Live app: <URL — typically https://<branch>.localhost:1355>
Sample creds (read from e2e/envs/.env.playwright): use admin or user as the
target screenshot's audience requires.

Capture:
- images/<filename>.png — <one-line description, navigation path, UI state to
  prepare>
- images/<filename2>.png — ...

Capture in all 4 language UI locales (en, ko, ja, th) using window.switchLanguage
per SCREENSHOT-GUIDELINES.md. Use 2× zoom. Crop to the relevant element via
'ref' parameter unless a page-overview capture is explicitly requested. Verify
per-language MD5 uniqueness at the end and report results. Clean up any test
resources created during capture.`
})
```

## `docs-update-reviewer`

```
Agent({
  description: "Review docs changes",
  subagent_type: "docs-update-reviewer",
  prompt: `Topic: <kebab-case>
Plan file: packages/backend.ai-webui-docs/.agent-output/docs-update-plan-<topic>.md
Files touched by writer (from git status --short):
<paste short list>

Run the standard accuracy / consistency / style / translation-quality review.
Write the report to packages/backend.ai-webui-docs/.agent-output/docs-review-report-<topic>.md. Apply
auto-fixable issues directly. In your response, summarize counts by severity
(critical / warning / minor) and call out anything that requires human
attention.`
})
```

## What to do with worker output

- **Planner** — read the plan file, summarize to user in ≤4 bullets, then
  decision-gate via `AskUserQuestion` (see `decision-gate-templates.md`).
- **Writer** — run `git status --short -- packages/backend.ai-webui-docs/src/`
  yourself; don't trust the worker's claimed file list. Real diff is ground
  truth.
- **Screenshot-capturer** — verify the per-language MD5 uniqueness report. If
  the worker silently skipped a language, push back.
- **Reviewer** — read the report file. Surface severity counts; if any
  "critical" exists, surface it to the user before declaring the topic
  completed.
