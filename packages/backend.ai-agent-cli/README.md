# backend.ai-agent-cli (`bai-agent`)

An agent-facing CLI over a Backend.AI WebUI checkout. It answers questions about
the repository's own data — GraphQL schema, i18n stores, the user manual — so an
agent can look things up with one command instead of a directory sweep.

This package is the skeleton every later command plugs into: one file per
command under `src/commands/`, a shared output layer, and a shared repo-context
locator. Node ≥ 22, ESM, built with tsup.

## Repo mode

`bai-agent` reads the checkout live — it copies nothing and takes no workspace
dependency on the packages it reads. Every command that reads repository data
(`version`, `search`, `docs`, `schema`, … — not `manifest` or `--help`)
resolves its context by walking up from the current working directory until it finds a `package.json`
named `backend.ai-webui`, then verifies the three data sources exist:

| Source         | Path                              |
| -------------- | --------------------------------- |
| GraphQL schema | `data/schema.graphql`             |
| i18n stores    | `resources/i18n/`                 |
| User manual    | `packages/backend.ai-webui-docs/` |

`doctor` is the exception: it locates the root the same way but reports each
source's status instead of failing, so it is the command to run when another
one exits 1.

`resolveRepoContext(cwd)` returns absolute paths (`repoRoot`, `schemaPath`,
`i18nDir`, `docsDir`) plus the checkout's `package.json` version. Outside a
checkout it fails with exit code 1 and an error naming what was not found.

## Commands

```bash
bai-agent version              # CLI version, detected checkout root, repo version
bai-agent manifest             # every command with its description and flags
bai-agent doctor               # environment + checkout diagnostics
bai-agent search "<query>"     # ranked manual sections + terminology entries
bai-agent docs search "<q>"    # alias of `search --domain docs`
bai-agent docs show <id>       # print one manual section (`--full` for the page)
bai-agent --help               # generated from the same registry as `manifest`
```

Commands are registered in one table (`src/registry.ts`), so `--help` and
`manifest` never drift from what the CLI can actually do.

## Search

The index is **English only** and is built by parsing the manual markdown live
on every query — no build step, no cached index on disk. The result unit is the
deepest heading (h2–h4); the h1 is the page container. Every hit carries
`{ id, domain, score, reason, title, path?, url, command }`, so the follow-up is
already written out:

```
id:      docs:admin_menu#admin_menu-manage-resource-preset
domain:  docs
score:   80
title:   Manage resource preset
url:     https://webui.docs.backend.ai/next/en/admin_menu.html#admin_menu-manage-resource-preset
reason:  heading-phrase
command: bai-agent docs show docs:admin_menu#admin_menu-manage-resource-preset
```

Ids are stable: `docs:<slug>#<english-anchor>` and `term:<concept-id>`.
`docs show` also tolerates a bare `<slug>#<anchor>`, and a bare `<slug>` prints
the whole page. An unknown id exits 5 (`not_found`) with up to five close ids.

### Domains

`--domain docs | terminology | all` (default `all`). `docs` reads
`packages/backend.ai-webui-docs/src/en/**`, `terminology` reads
`packages/backend.ai-webui-docs/terminology.json`. The list is extensible — a
`schema` domain joins it in a later ticket.

### Query normalisation

Exact, case-insensitive matches of the query against terminology terms (any
language) and i18n label values are printed once as a header line and expand the
query with the canonical English term. There is no morphological handling.

```
normalised: "환경 변수" -> Environment Variables (i18n ko adminDeploymentPreset.EnvironmentVariables)
```

Non-English i18n stores are consulted only for a query carrying non-ASCII
characters — the same work for every `--lang`, so recall never depends on the
display language.

### Ranking

| Score | Reason           | Fires when                                                                                    |
| ----- | ---------------- | --------------------------------------------------------------------------------------------- |
| 100   | `exact-title`    | the heading / term equals the query                                                           |
| 85    | `alias`          | another spelling of the term equals the query                                                 |
| 80    | `heading-phrase` | the query is a substring of the heading                                                       |
| 40–75 | `heading-tokens` | every query token is in the heading; scaled by how much of the heading the query accounts for |
| 10–60 | `body-tokens`    | the prose matches; a body-only hit is capped at 60                                            |

Ties break on body coverage, then title length, then heading depth, then id, so
the order is stable. Each domain keeps up to two reserved slots for hits scoring
≥ 40, so docs volume can never bury a strong terminology hit.

### Languages and deployed-docs links

`--lang <code>` (default `en`) changes the titles shown and the link, never
recall: hits are found in English and mapped to the target language by heading
index, which the four manuals share. A missing translation falls back to
English. The anchor is computed on the **target** language's own heading, so
Korean anchors are Korean:

```
https://webui.docs.backend.ai/next/ko/vfolder.html#vfolder-스토리지-폴더-생성
```

The `{version}` segment is the checkout's `major.minor`; a prerelease maps to
`next` and an unreadable version to the label marked `latest: true` in
`packages/backend.ai-webui-docs/docs-toolkit.config.yaml` (the site publishes
only redirect stubs under `latest/`). `--docs-version <v>` overrides it.
The slugify used for anchors is the docs toolkit's
(`packages/backend.ai-docs-toolkit/src/markdown-processor.ts`) — the anchors
must match the deployed pages byte for byte.

## Output contract

Text is the default and mirrors the JSON surface: both are rendered from the
same data object (`run()` produces data; `render(data, options)` renders it).
Records are aligned `key: value` lines, separated by a blank line, so a field
can be grepped: `bai-agent manifest | grep '^command:'`.

`--json` prints an envelope on stdout:

```json
{ "apiVersion": "bai-agent/v1", "type": "version", "data": { "...": "..." } }
```

Failures print an envelope on stderr and never on stdout:

```json
{
  "apiVersion": "bai-agent/v1",
  "error": "Not inside a backend.ai-webui checkout: ...",
  "code": "repo_not_found",
  "suggestions": ["data/schema.graphql", "..."],
  "hint": "cd <backend.ai-webui checkout> && bai-agent doctor"
}
```

`hint` is always a concrete next command to run, never prose.

Global flags: `--json`, `--dense` and `--detail` (mutually exclusive text
verbosity levels), `-h, --help`, `--version`.

## Exit codes

| Code | Meaning                                               |
| ---- | ----------------------------------------------------- |
| 0    | success                                               |
| 1    | error (including "not inside a checkout")             |
| 2    | usage — unknown command, unknown flag, bad flag value |
| 3    | `auth_required`                                       |
| 4    | `mutation_refused`                                    |
| 5    | `not_found`                                           |

Errors are raised as a typed `CliError` carrying `code`, `exitCode`, `hint` and
`suggestions`; a single top-level handler in `src/run.ts` renders it in text or
JSON and returns the exit code.

## Development

```bash
pnpm --filter backend.ai-agent-cli build   # dist/cli.js (executable bin)
pnpm --filter backend.ai-agent-cli test
pnpm --filter backend.ai-agent-cli lint
```
