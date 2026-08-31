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
bai-agent search "<query>"     # one ranked list over docs + schema + terminology
bai-agent docs search "<q>"    # alias of `search --domain docs`
bai-agent docs show <id>       # print one manual section (`--full` for the page)
bai-agent schema search "<q>"  # alias of `search --domain schema`
bai-agent schema show <name>   # print one type, field or enum value
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

Ids are stable: `docs:<slug>#<english-anchor>`, `term:<concept-id>`,
`schema:<Type>`, `schema:<Type>.<field>` and `schema:<Enum>.<VALUE>`.
`docs show` also tolerates a bare `<slug>#<anchor>`, and a bare `<slug>` prints
the whole page; `schema show` takes the id with or without its `schema:` prefix.
An unknown id exits 5 (`not_found`) with up to five close ids.

A schema hit that the WebUI renders carries the i18n label it is shown under:

```
id:       schema:ComputeSessionNode.status
domain:   schema
score:    80
title:    ComputeSessionNode.status
url:      https://github.com/lablup/backend.ai-webui/blob/main/data/schema.graphql#L3310
UI label: Status (session.Status, en)
reason:   name-tokens
command:  bai-agent schema show ComputeSessionNode.status
```

### Domains

`--domain docs | schema | terminology | all` (default `all`). `docs` reads
`packages/backend.ai-webui-docs/src/en/**`, `terminology` reads
`packages/backend.ai-webui-docs/terminology.json`, and `schema` reads
`data/schema.graphql`. **i18n is not a domain** — the i18n stores normalise
queries and label schema hits, they are never a result on their own.

### Query normalisation

Exact, case-insensitive matches of the query against terminology terms (any
language) and i18n label values are printed once as a header line and expand the
query with the canonical English term. There is no morphological handling.

```
normalised: "환경 변수" -> Environment Variables (i18n ko adminDeploymentPreset.EnvironmentVariables)
normalised: "Resource Group" -> Resource Group (i18n en session.ResourceGroup -> ComputeSessionNode.scaling_group)
```

Non-English i18n stores are consulted only for a query carrying non-ASCII
characters — the same work for every `--lang`, so recall never depends on the
display language. When several keys carry the same label, the header announces
the one the [i18n reverse index](#the-i18n-reverse-index) can attribute to a
schema field, and names that field.

### Ranking

| Score | Reason           | Fires when                                                                                    |
| ----- | ---------------- | --------------------------------------------------------------------------------------------- |
| 100   | `exact-title`    | the heading / term equals the query                                                           |
| 85    | `alias`          | another spelling of the term equals the query                                                 |
| 80    | `heading-phrase` | the query is a substring of the heading                                                       |
| 40–75 | `heading-tokens` | every query token is in the heading; scaled by how much of the heading the query accounts for |
| 10–60 | `body-tokens`    | the prose matches; a body-only hit is capped at 60                                            |

The schema domain runs the same table against identifiers instead of prose:

| Score | Reason        | Fires when                                                                                             |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------ |
| 100   | `name-exact`  | the query equals a type name, a bare field name, or a qualified `Type.field` / `Enum.VALUE`            |
| 85    | `alias`       | the query equals a field's UI label                                                                    |
| 80    | `name-phrase` | the query is a phrase inside the entry's **own** name tokens                                           |
| 40–75 | `name-tokens` | every query token is in the entry's name tokens; scaled by how much of the name the query accounts for |
| 10–35 | `desc-tokens` | the SDL description carries the query's tokens                                                         |

Names are compared **spelling-independently**: `scaling_group`, `scalingGroup`
and `ScalingGroup` are one key, so `--domain schema` answers the same for all
three. A field's name tokens are its declaring type's plus its own, which is why
`ComputeSessionNode status` is an exact match, and its _own_ tokens are what the
phrase band sees.

**Long identifiers match on their tail.** An identifier of four or more tokens
only takes part in name-token matching through its last two:
`admin_keypair_resource_policies_v2` answers to "resource policies", not to
"admin". A trailing API-version token (`v2`) does not count towards the length
and rides along, so `KeypairResourcePolicyV2` still matches
"resource policy keypair" in full.

**A field the WebUI renders reaches the phrase band.** When a name-token match
covers at least one of the field's own tokens _and_ the field carries a UI
label, its score is lifted to 80: `ComputeSessionNode.status` is what
"session status" means, even though `ComputeSession.status` is the shorter name.

Ties break on body coverage, then title length, then heading depth, then id, so
the order is stable; within one domain a UI-linked schema hit wins first. A
schema hit only carries description coverage into the tie-break when the
description is what matched it. Each domain keeps up to two reserved slots for
hits scoring ≥ 40, so docs volume can never bury a strong terminology hit — and
schema volume can never bury either.

Two diversity rules keep the schema domain from filling the page with near
identical rows:

- **Same-named members collapse.** The schema declares `status` on dozens of
  types; one representative per member name is returned — the best-scoring one,
  preferring the one the WebUI renders. Disambiguate by qualifying the query
  (`bai-agent schema search "KernelNode status"`).
- **Relay plumbing is not indexed.** `*Connection`, `*Edge` and `PageInfo` never
  appear as hits. `schema show` still prints them.

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

## Schema

`data/schema.graphql` (~692 KB of federation-composed SDL) is parsed with the
`graphql` package's own parser, once per process and keyed on the file's mtime.
Types, fields, arguments, enum values, descriptions, `@deprecated` and the
`@join__type` subgraphs are kept; `join__*` / `link__*` plumbing is dropped.

```bash
bai-agent schema show ComputeSessionNode.status
bai-agent schema show Query.adminKeypairResourcePoliciesV2
bai-agent schema show SessionV2Status.RUNNING
```

```
id:           ComputeSessionNode.status
entryKind:    field
graphqlKind:  object
declaredIn:   ComputeSessionNode
type:         String
addedIn:      24.09.0
markerSource: type
UI label:     Status (session.Status, en)
path:         data/schema.graphql:3310
url:          https://github.com/lablup/backend.ai-webui/blob/main/data/schema.graphql#L3310
```

A name resolves exactly, then case-insensitively, then spelling-independently
(`computesessionnode.STATUS` works). An unknown name exits 5 (`not_found`) with
up to five close names — from the type's own members when the type resolved.

### Version markers

Strawberry writes `Added in 25.6.0. …` / `Deprecated since 24.09.0. …` into
descriptions. Those are parsed out into `addedIn` / `deprecatedSince` /
`deprecatedNote`. A member with no marker of its own **inherits its type's**, and
`markerSource` says which happened: `own`, `type` or `none`. `bai-agent doctor`
reports the coverage (currently ~83% of types and ~81% of fields, of which ~16%
carry their own).

### Connection fields

A field that takes pagination arguments prints the modes it actually offers and
the one rule that matters, because the Strawberry V2 connections reject mixed
arguments at runtime:

```
Pagination

rule:      Use exactly one pagination mode; mixing arguments from two modes is rejected at runtime.
modes:     forward cursor (first + after) | backward cursor (last + before) | offset (limit + offset)
reference: .claude/rules/graphql-pagination.md
```

## The i18n reverse index

The schema says `ComputeSessionNode.status`; the UI says "Status". The reverse
index connects the two by scanning `react/src/**/*.tsx` once per process:

1. every `` graphql`…` `` tag in a file is read for `fragment … on <Type>`, so a
   file declares which types it renders;
2. inside the same file, `dataIndex` / `key` entries are paired with the nearest
   `title: t('<key>')` within ~320 characters;
3. a pair is kept only when the field actually exists on one of the file's
   fragment types, which is what filters out action buttons and other
   `key`-carrying objects.

The result is `Type.field -> [i18n key]` and its reverse, plus the English label
for each key. `search` prints it under a schema hit and `schema show` prints it
as `UI label`; `--lang` re-reads the label from that language's store. The
builder is exported (`buildI18nReverseIndex`) for the `explain` command.

**Limits.** This is a regex pass, not a type-aware one, so it finds what host
table columns declare and nothing else:

- Only `react/src/**/*.tsx`. BUI components (`packages/backend.ai-ui`) bind to
  their own i18next instance and locale files, and are not scanned.
- Only literal `t('key')` titles. A title from a variable, a helper or a
  `<Trans>` element is invisible.
- Only literal `dataIndex` / `key` strings. `dataIndex: ['a', 'b']` is skipped.
- A file spreading fragments on several types attributes a column to **every**
  one of them that has a field of that name, so a shared column can label two
  types.
- Descriptions, form fields and detail panels are not columns, so they
  contribute nothing.

It currently attributes **68 `Type.field` entries** across 63 i18n keys, from
156 of the 580 scanned files. That is deliberately thin: a wrong label is worse
than a missing one, because a labelled field is ranked higher.

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

`graphql` is a devDependency and is bundled into `dist/`, so the published
package has no runtime dependency.

### Ranking regression

`src/search.regression.test.ts` runs a fixed 14-query set against the real
manual, terminology and SDL in the checkout, and asserts the top hit, its
`reason`, the ids that must appear, the canonical terms the normalisation header
announces, and the UI labels the schema hits carry. Every expectation was
hand-checked against the source it points at. Changing the ranking means
re-checking the table, not relaxing it.

Two budgets are asserted from cold caches, deliberately generous because CI is
slower and noisier than a dev box: a full docs+schema+terminology `search` under
1500 ms, and `schema show` under 500 ms. Measured on the dev box: SDL parse
~190 ms, i18n reverse index ~85 ms, schema candidates ~50 ms, docs corpus
~60 ms, scoring ~110 ms — about 500 ms cold for `search` end to end and ~120 ms
warm, and ~150 ms cold for `schema show` (which never builds the candidates).
