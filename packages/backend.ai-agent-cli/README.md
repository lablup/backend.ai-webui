# backend.ai-agent-cli (`bai-agent`)

An agent-facing CLI over a Backend.AI WebUI checkout. It answers questions about
the repository's own data — GraphQL schema, i18n stores, the user manual — so an
agent can look things up with one command instead of a directory sweep.

This package is the skeleton every later command plugs into: one file per
command under `src/commands/`, a shared output layer, and a shared repo-context
locator. Node ≥ 22, ESM, built with tsup.

## Install

Inside a `backend.ai-webui` checkout the CLI runs from the workspace:

```bash
pnpm --filter backend.ai-agent-cli build   # once; the proxy runs the bundle
pnpm run bai-agent <cmd>                   # from the repository root
```

Anywhere else, from npm:

```bash
npm install -g backend.ai-agent-cli        # or: npx backend.ai-agent-cli <cmd>
bai-agent init                             # endpoint → data sync → login? → skill?
```

`init` is the whole setup (see [The `init` wizard](#the-init-wizard)); after
it, `bai-agent search "…"` and friends work from any directory. The package
bundles its dependencies and ships `mappings/` and the Claude Code skill next
to `dist/`, so the install has no runtime dependency beyond Node ≥ 22 — and
`git`, which `sync` shells out to.

### Versioning and releases

The CLI is versioned on its own — `0.x` in this `package.json` — not on the
WebUI release train, and `Makefile versiontag` leaves it alone. One workflow,
`.github/workflows/publish-backend.ai-agent-cli.yml`, with two triggers:

| Event                                | Publishes                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| push to `main` touching this package | `<version>-canary-<sha>-<date>` under `canary`                                   |
| tag `agent-cli-v<version>`           | `<version>` under `latest`; `-rc.N` → `rc`, `-beta.N` → `beta`, `-alpha` skipped |

The tag must equal the version in `package.json`, and a version already on npm
is skipped rather than failing the run. To release: bump the version in a PR,
merge, then `git tag agent-cli-v<version> && git push origin agent-cli-v<version>` (the tag must equal `package.json`'s version).
The WebUI's `v*` tags deliberately do not publish the CLI — they would republish
the same version on every WebUI release.

**First publish is a one-time bootstrap.** The workflow authenticates with npm
trusted publishing (OIDC, `id-token: write`, no token secret), which is
configured on the package's settings page on npmjs.com — a page that does not
exist until the package has been published once. Until then both triggers fail
with `ENEEDAUTH`. Before the first tag: publish `0.1.0` by hand from a checkout
with a granular npm token (`pnpm --filter backend.ai-agent-cli publish --access
public`), then add this repository's `publish-backend.ai-agent-cli.yml` as a
trusted publisher on the package page. The `backend.ai-docs-toolkit` workflow
went red on every push to `main` until its package was bootstrapped the same
way.

## Where the data comes from

`bai-agent` reads a WebUI checkout live — it copies nothing and takes no
workspace dependency on the packages it reads. Every command that reads
repository data (`version`, `search`, `docs`, `schema`, … — not `manifest`,
`sync` or `--help`) resolves its checkout in this order and stops at the first
hit:

| Order | Source                                                                                 | `source` |
| ----- | -------------------------------------------------------------------------------------- | -------- |
| 1     | an ancestor of `cwd` whose `package.json` is named `backend.ai-webui`                  | `cwd`    |
| 2     | `$BAI_AGENT_CHECKOUT` (a checkout root; anything else is an error, not a fall-through) | `env`    |
| 3     | the data checkout `bai-agent sync` maintains (see below)                               | `synced` |

It then verifies the three data sources exist:

| Source         | Path                              |
| -------------- | --------------------------------- |
| GraphQL schema | `data/schema.graphql`             |
| i18n stores    | `resources/i18n/`                 |
| User manual    | `packages/backend.ai-webui-docs/` |

`doctor` is the exception: it locates the root the same way but reports each
source's status (and which source it came from) instead of failing, so it is
the command to run when another one exits 1.

`resolveRepoContext(cwd)` returns absolute paths (`repoRoot`, `schemaPath`,
`i18nDir`, `docsDir`), the checkout's `package.json` version and the `source`
above. With no checkout in reach it fails with exit code 1 (`repo_not_found`)
and hints `bai-agent sync`.

### `sync` — the data without the repository

Outside a checkout — an `npm install -g` on another machine — `sync` fetches
just the data:

```bash
bai-agent sync                  # the ref last synced (main the first time)
bai-agent sync --ref v26.8.1    # a WebUI release tag, or any branch
bai-agent sync --force          # throw the checkout away and clone again
```

It is a shallow (`--depth 1`), blob-filtered (`--filter=blob:none`) clone of
`lablup/backend.ai-webui` under a non-cone sparse checkout of exactly what the
commands read: `package.json`, `data/`, `resources/i18n/`, the manual without
its `images/` (~170 MB across four languages, none of it searched), and the
`react/src/**/*.tsx` files the i18n reverse index scans. About 16 MB on disk,
a few seconds against GitHub. `git` must be on `PATH`.

The checkout lives at `${XDG_DATA_HOME:-~/.local/share}/backend.ai-agent/checkout`
(`$BAI_AGENT_DATA_DIR` overrides the parent), and each run records
`{ ref, commit, syncedAt }` under `sync` in the [config file](#configjson).
Re-running fetches the ref and resets to it — the sparse patterns are
re-applied every time, so a CLI upgrade that widens them takes effect on the
next sync. The reset also discards a locally `schema sync`ed SDL: the ref's
own snapshot is the contract, so run `schema sync` again afterwards if you
had aligned it to a backend release. `doctor` warns when the synced data is
older than 30 days.

### `config.json`

`${XDG_CONFIG_HOME:-~/.config}/backend.ai-agent/config.json` (or under
`$BAI_AGENT_CONFIG_DIR`, next to `sessions/`) holds machine-wide state that
is not a session: the `endpoint` the user named, and the `sync` record above.
It is written by `sync`; sessions never go in it.

## Commands

```bash
bai-agent version              # CLI version, detected checkout root, repo version
bai-agent manifest             # every command with its description and flags
bai-agent init                 # set this machine up (see The init wizard below)
bai-agent init --features agents  # the CLAUDE.md agent block (see The agent block below)
bai-agent doctor               # environment + checkout + auth diagnostics
bai-agent sync                 # fetch the checkout data for use outside a checkout
bai-agent search "<query>"     # one ranked list over docs + schema + terminology
bai-agent docs search "<q>"    # alias of `search --domain docs`
bai-agent docs show <id>       # print one manual section (`--full` for the page)
bai-agent schema search "<q>"  # alias of `search --domain schema`
bai-agent schema show <name>   # print one type, field or enum value
bai-agent schema sync          # refresh the SDL from a backend.ai release
bai-agent login                # hand this machine a WebUI session (see Auth below)
bai-agent whoami               # who the stored session belongs to
bai-agent logout               # delete the stored session file
bai-agent query '<document>'   # raw GraphQL, SDL-validated (see Query below)
bai-agent explain <target>     # what a type, field or value means to a user
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

### `schema sync`

The committed SDL is a snapshot of a backend release. `schema sync` refreshes it
from the `supergraph.graphql` asset of a `lablup/backend.ai` GitHub release —
the same federation-composed shape (`@join__*` directives) `data/schema.graphql`
already has — and records where it came from:

```bash
bai-agent schema sync --dry-run              # highest released version, write nothing
bai-agent schema sync --tag 26.4.10          # a named release
```

Without `--tag` the CLI ranks the published releases and takes the **highest
version**, skipping pre-releases. It deliberately does not read
`releases/latest`: that endpoint answers GitHub's `Latest` badge, which the
backend keeps on whichever maintenance branch shipped last (26.4.10 while 26.8.1
was out), so trusting it downgrades the SDL.

```
bai-agent schema sync --dry-run
would update data/schema.graphql to 26.4.10

tag:           26.4.10
tagSource:     latest
outcome:       dry-run
schemaChanged: true
remoteSha256:  36282b9d854f3b9a0e69a218c7bb0f95fbc819665766d0b4f324446ad0633198
localSha256:   f729eacb619295163dc34257d898945297eeae22b7eaad44dbaca3ecb82c400f
remoteBytes:   644301
localBytes:    692483
byteDelta:     -48182
```

`--dry-run` prints that and writes nothing. A real run writes the asset to
`data/schema.graphql` and `data/schema.meta.json` next to it:

```json
{
  "tag": "26.4.10",
  "sha256": "36282b9d…",
  "fetchedAt": "2026-08-29T04:00:00.000Z",
  "source": "https://github.com/lablup/backend.ai/releases/download/26.4.10/supergraph.graphql"
}
```

`outcome` says what happened: `updated`, `unchanged` (same tag and same
sha256 — a no-op), `meta-recorded` (the bytes already matched, but not under
this tag) or `dry-run`. **Nothing else in the CLI ever runs it**: no command
syncs implicitly, and no command other than `login` / `whoami` / `doctor` and
the version gate below touches the network at all.

Two GitHub API calls per run (the release lookup, then the asset), so an
unauthenticated run stays inside the anonymous rate limit. `GITHUB_TOKEN` is
used when set — on `api.github.com` only, never on the asset CDN. A rate-limit
answer hints `GITHUB_TOKEN=<token> bai-agent schema sync`.

`bai-agent version` prints the recorded `schemaTag`, and `doctor`'s **schema
alignment** group reports the SDL, the meta file (its tag, its age, and whether
its `sha256` still matches the file on disk), the manager version when a session
exists, and a verdict.

### Version alignment

The SDL is a snapshot; the manager you are talking to is not necessarily at the
same version. `whoami`, `schema show` — and `query` / `explain` once they land —
compare the manager against the `Added in` / `Deprecated since` markers and warn
once, on **stderr**:

```
warning: schema is not aligned with manager 26.8.0rc1: 97 not in the manager yet
(AppConfigAllowList.rank 26.8.0, …, and 94 more); 19 deprecated by the manager
(BulkCreateUsersV2Payload 26.4.4, …); hint: bai-agent schema sync --tag 26.8.0rc1
```

`--strict` refuses instead: exit **1**, code `version_mismatch`, same hint. The
verdict is also part of the data, so `--json` carries it.

The manager version is read from `GET <endpoint>/func/`, which answers
`{ version, manager }` — the same call the WebUI client makes
(`packages/backend.ai-client/src/client.ts`, `get_manager_version` →
`getServerVersion` → `newPublicRequest('GET', '/')`, rewritten to `/func/` in
SESSION mode). `/server/version` is the fallback. The answer is cached per
process, so a run asks once. Introspection is attempted **opportunistically**
(`{ __schema { queryType { name } } }`, once) purely to confirm the GraphQL
endpoint answers; a manager with introspection disabled reports nothing and the
schema still comes from the committed SDL. Without a stored session none of this
happens and no request is made.

Field-level markers are compared through `markerSource`: a member with no marker
of its own inherits its type's. A **named** selection uses that effective marker;
a whole-schema comparison counts only markers a member owns, because its type
already stands for the members that inherit from it.

#### For `query` (FR-3768) and `explain` (FR-3769)

The gate is one exported call. The pure comparison:

```ts
import { checkVersionAlignment } from 'backend.ai-agent-cli';

const alignment: VersionAlignment = checkVersionAlignment(
  schemaCtx,          // { schema: SchemaIndex } — schemaContext(repo) satisfies it
  managerVersion,     // e.g. '26.8.0rc1'
  selectedFields?,    // ['ComputeSessionNode.status', …]; omit for the whole schema
);
```

and the wrapper that finds the session, reads the manager version, warns or
throws:

```ts
const { alignment, manager } = await applyVersionAlignmentGate({
  cwd: context.cwd,
  schemaCtx,
  selectedFields: [...],       // the ids the command actually touched
  strict: context.flags.strict === true,
  notify: context.notify,      // stderr, so --json stdout stays one envelope
});
```

It returns `{}` — silently, with no request — when nothing is stored or the
manager is unreachable. Put `alignment` on the command's data object and render
it with `renderAlignment(alignment)` so text and JSON stay one surface. All four
(`checkVersionAlignment`, `applyVersionAlignmentGate`, `renderAlignment` and the
`STRICT_FLAG` spec) live in `src/version-align.ts`.

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
builder is exported (`buildI18nReverseIndex`) and `explain` uses it for the
`auto` tier of its `label` piece.

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

## Auth

`bai-agent` never asks for a password. It borrows a session the WebUI already
holds, confirmed once in the browser:

```bash
bai-agent login --endpoint http://manager.example.com:8090
```

1. The CLI opens a listener on a random loopback port and prints a URL plus a
   short verification code:
   `https://fr-3763.localhost:1355/cli-login?port=<p>&state=<nonce>`.
2. The browser opens `/cli-login`. The page shows the account, the endpoint and
   the same verification code, and asks you to attest that you started the
   login yourself.
3. On confirm it POSTs `{ sessionId, endpoint, state }` to
   `http://127.0.0.1:<p>/callback`. The listener rejects a payload whose
   `state` or `endpoint` does not match what it started with.
4. The CLI stores the session and immediately runs `whoami` to prove it works.

`--webui <origin>` names the WebUI serving `/cli-login`; it defaults to this
checkout's Portless dev origin (`https://fr-XXXX.localhost:1355`, see
`DEV_ENVIRONMENT.md`). `--timeout <seconds>` bounds the wait (default 300).
`--no-browser` prints the URL instead of trying to open one. Progress lines go
to **stderr**, so `--json` stdout stays a single envelope.

When the browser cannot reach the listener — a remote WebUI, a locked-down
browser — the page reveals the session id for manual transfer:

```bash
bai-agent login --paste --endpoint http://manager.example.com:8090
```

It prompts for the session id without echoing it. `--session-id <id>` supplies
it non-interactively.

### Where the session lives

```
$BAI_AGENT_CONFIG_DIR                      # test/CI override, else:
${XDG_CONFIG_HOME:-~/.config}/backend.ai-agent/sessions/<host>.json
```

Directory `0700`, file `0600`, one file per endpoint host (`host:port`
sanitised). It holds `{ endpoint, webui, sessionId, savedAt }`. The session id
is **masked** (`abcd…wxyz`) in every text and JSON output; only the paste
prompt handles it in the clear, and it does not echo.

`bai-agent logout` deletes that file and nothing else — the WebUI session
itself stays alive until you sign out of the browser or it expires.

### When the session dies

The manager answers a dead session with HTTP 200 whose GraphQL `errors[]` wrap
its own 401 (`error_code: user_auth_unauthorized`), so status alone is not a
usable signal. `manager.ts` treats both a real 401 and that wrapped shape as an
auth failure. `whoami` then deletes the stored session, exits **3**
(`auth_required`) and hints `bai-agent login --endpoint <endpoint>`. It never
re-authenticates on its own.

### Endpoint resolution

`--endpoint` wins; otherwise the single stored session (the one you can
actually query); otherwise `[general] apiEndpoint` from the checkout's own
`config.toml`; otherwise the `endpoint` recorded in
[`config.json`](#configjson). Two or more stored sessions is an error, not a
guess.

## Query

`bai-agent query` sends a raw GraphQL document to the manager, but never
blindly: it is validated against **this checkout's** SDL first, so a document
written from a stale mental model fails locally instead of burning a round trip.

```bash
bai-agent query 'query { compute_session_nodes(first: 3) { edges { node { id row_id name status } } } }'
bai-agent query --file ./sessions.graphql --var first=10
cat sessions.graphql | bai-agent query --var first=10 --json
```

The document comes from the positional argument, `--file <path>`, or stdin — in
that order, and passing both an argument and `--file` is a usage error.
`--var k=v` is repeatable; each value is JSON when it parses (`--var first=10`,
`--var ids=["a","b"]`) and a plain string otherwise.

### Pre-validation

`data/schema.graphql` is built with `buildASTSchema(..., { assumeValidSDL: true })`
— it is a composed federation supergraph, so its `@join__*` / `@link` plumbing
would fail a strict SDL check, and the directives are declared in the document
itself so nothing has to be stripped. `data/client-directives.graphql` is
concatenated in, so a document carrying `@since` / `@skipOnClient` (which the
WebUI client strips before sending) still validates.

A document the schema rejects exits **1** with code `schema_mismatch`, every
validator message under `suggestions`, and a hint naming the nearest type:

```
error: The document does not match the checkout's schema (1 problem(s)).
code:  schema_mismatch
- Cannot query field "nope_field" on type "ComputeSessionNode".
hint:  bai-agent schema show ComputeSessionNode
```

A message that names only built-in scalars — a variable's nullability, say —
falls back to the operation's root field (`bai-agent schema show
Query.compute_session_list`), and to `bai-agent schema sync` only when even that
is unavailable — see [`schema sync`](#schema-sync).

Pagination arguments are **not** special-cased here — the one-mode rule
(`first`/`after` XOR `last`/`before` XOR `limit`/`offset`, see
`.claude/rules/graphql-pagination.md`) is enforced by the manager at runtime,
and mixing modes on a `*V2` connection fails there, not in validation.

### Mutations

Executing **any** mutation needs `--allow-mutation`, and the field must be on
the static allow-list in `src/mutation-allowlist.ts`. Either miss exits **4**
with code `mutation_refused` **before any network call**, hinting the WebUI page
where a human can do it instead:

```
error: Mutation "createVfolderV2" needs --allow-mutation.
code:  mutation_refused
hint:  /data
```

The seed list is deliberately tiny, and destructive fields (`delete*`, `purge*`,
`terminate*`, `revoke*`) are never on it:

| Mutation                 | Page                 |
| ------------------------ | -------------------- |
| `createVfolderV2`        | `/data`              |
| `createVFolderInProject` | `/data`              |
| `create_resource_preset` | `/admin/environment` |

**There is no compute-session creation mutation in the schema** — Backend.AI
creates sessions over REST (`POST /session`), not GraphQL — so the "create a
session" seed this list was specified with does not exist and VFolder creation
plus one safe admin creation stand in its place.

### Result budget

`--max-bytes` (default 65536) is a **target, not a hard bound**. The result is
trimmed towards it **deepest-first**: innermost arrays and strings are halved
before the shape around them is, so the envelope keeps its structure. Every cut
path is listed in `data.truncated`.

The trim is best-effort. `id` / `row_id` / `endpoint_id` and the `webui_path` /
`webui_url` derived from them are **never removed** (half an id is a wrong id,
and a halved link opens nothing), numeric and boolean leaves are left alone,
and the pass loop stops after 32 rounds. A result made mostly of protected
leaves can therefore stay over budget — `data.bytes` always reports the real
size, so check it rather than assuming the budget was met.

Links are attached **before** the cut, so they count against the budget rather
than blowing past it, and a row that does not survive drops out of
`data.links` too.

### WebUI links

Every node whose root field returns a type with a resource page is annotated in
place with `webui_path` (and `webui_url` when an origin is known), and the same
set is listed in `data.links`. The origin is `--webui`, else the stored
session's `webui` field; with neither, only `webui_path` is emitted.

The type table (`src/query/links.ts`) is small and hand-maintained on purpose —
an unrecognised type produces no link rather than a guessed one. One container
level is unwrapped: a Relay `*Connection` (`edges { node }`), a Graphene `*List`
(`items`), or a single-field Strawberry `*Payload`.

| Return type                                         | Resource   | Page                          |
| --------------------------------------------------- | ---------- | ----------------------------- |
| `ComputeSessionNode`, `ComputeSession`, `SessionV2` | session    | `/session?sessionDetail=<id>` |
| `VirtualFolderNode`, `VirtualFolder`, `VFolder`     | vfolder    | `/data?folder=<id>`           |
| `Endpoint`, `EndpointNode`                          | deployment | `/deployments/<id>`           |
| `ModelCard`, `ModelCardV2`                          | model_card | `/model-store?modelCard=<id>` |
| `Role`, `RoleNode`                                  | role       | `/admin/rbac?roleDetail=<id>` |
| `Artifact`, `ArtifactNode`                          | artifact   | `/admin/reservoir/<id>`       |

The id is the first of `row_id`, `endpoint_id`, `id` that carries a non-empty
string. **Known limitation:** Strawberry types (`VFolder`, `SessionV2`, …)
expose no `row_id`, so their annotation falls back to the base64 Relay global
id, which the pages do not accept. Graphene `*Node` types, which do carry
`row_id`, produce links that open.

### Path rules are restated, not imported

`src/webui-path.ts` mirrors the WebUI's routes and URL params (`routes.tsx`,
`pathBuilder.ts`, `legacyRedirects.tsx`); the CLI takes no dependency on the
host app, so nothing is imported. `src/webui-path.fixture.json` pins the
expected path per resource ref and `webui-path.test.ts` asserts every case.
When the app renames a route or a query param, update the rule and the fixture
together.

## Explain

`schema show` says what the SDL declares. `explain` says what it **means to a
user** — and, for every piece of the answer, where that meaning came from:

```bash
bai-agent explain ComputeSessionNode                  # a type
bai-agent explain ComputeSessionNode.status           # a field
bai-agent explain ComputeSessionNode.status=RUNNING   # one of its values
```

```
label

derived:  auto
label:    Status
key:      session.Status
lang:     en

meaning

derived:  curated
text:     The containers are up and accepting work; apps and the terminal can be opened.
via:      ComputeSessionNode.status=RUNNING
```

Five pieces, each tagged `derived: auto | heuristic | curated | MISSING`:

| Piece     | `auto`                                            | `heuristic`                                   | `curated`               |
| --------- | ------------------------------------------------- | --------------------------------------------- | ----------------------- |
| `schema`  | the SDL entry, always                             | —                                             | —                       |
| `label`   | the [i18n reverse index](#the-i18n-reverse-index) | a same-named i18n key (`agent.Schedulable`)   | the mapping's `label`   |
| `concept` | —                                                 | a terminology term spelled like the name      | the mapping's `concept` |
| `meaning` | —                                                 | —                                             | the mapping's `meaning` |
| `docs`    | —                                                 | the top docs hit for the label, at score ≥ 80 | the mapping's `docs`    |

Nothing is invented: a piece with no source prints `MISSING`, which is the
nudge to curate it. `--lang <code>` re-reads the label from that language's
i18n store and maps the docs link to that language's anchor, exactly as
`search` does — it never changes what resolves.

`=VALUE` refines the answer: the `meaning`, `concept` and `docs` pieces prefer
the value's own curated entry over the field's, and a `value` block carries the
value's UI label, its Astryx badge variant, and — when the field's type is an
enum — that enum value's SDL description.

### Mappings

The curated tier lives in `mappings/<Type>.yaml`, one file per type, validated
against `mappings/schema.json` (JSON Schema draft-07) by `ajv`:

```yaml
type: ComputeSessionNode
concept: compute-session # a concept id in terminology.json
docs: sessions_all#session-detail-panel
fields:
  status:
    meaning: Lifecycle state of the session as the manager scheduled and ran it.
    docs: sessions_all#session-detail-panel
    values:
      RUNNING:
        label: Running
        meaning: The containers are up and accepting work.
        variant: success
```

`docs` is `<page-slug>#<english-heading-anchor>`; the resolver checks that the
heading exists and builds the deployed URL through the same builder `search`
uses. `variant` is the Astryx `Badge` variant the WebUI paints the value with
(`packages/backend.ai-ui/src/helper/astryxTagVariant.ts`), which is also where
the value vocabularies were read off.

Only types worth a human's sentence are curated — the ones whose values the UI
renders as badges and whose meaning the SDL does not carry. Everything else
answers from `auto`/`heuristic` and prints `MISSING` for the rest; a new schema
field is never a hard failure.

### Staleness

Every reference a mapping makes points outside itself, so anything else in the
repo can orphan it. `bai-agent doctor --mappings` re-resolves all of them:

```
status: ok
check:  references resolve
detail: 61 concept(s) and 129 docs link(s) resolve
```

It `fail`s on a type or field that left the SDL, a value that is not in the
field's enum, a concept id that is not in `terminology.json`, and a
`slug#heading` with no matching heading in the English manual — and exits 1, so
it gates. It `warn`s on a partly-curated enum and on UI-rendered enum fields
that nothing curates. The same check runs in `scripts/verify.sh`
("Agent mappings"), in `.github/workflows/agent-mappings.yml` on the paths that
can orphan a reference, and in `src/mappings/mappings.test.ts`.

## The `init` wizard

`bai-agent init` with no `--features` sets a machine up in one pass:

```
? Backend.AI endpoint URL [https://manager.example.com]:
Manager 26.8.1 at https://manager.example.com.
Cloning https://github.com/lablup/backend.ai-webui.git (v26.8.1, data paths only) into ~/.local/share/backend.ai-agent/checkout…
? Log in now? (Y/n)
? Install the Claude Code skill into ~/.claude/skills/bai-agent? (Y/n)
```

1. **Endpoint** — asked for (the recorded one is the default); `--endpoint`
   skips the question. Saved to `config.json` even when nothing else runs,
   so `login`, `whoami` and `doctor` find it later.
2. **Manager version** — `GET <endpoint>/func/`, which needs no session.
3. **Ref** — the highest WebUI tag sharing the manager's `major.minor`
   (`26.8.1` → `v26.8.1`, `26.9.0rc1` → `v26.9.0-rc.3`), listed with
   `git ls-remote`; no such tag, or no manager version, means `main` with a
   warning. `--ref` overrides.
4. **Sync** — `sync` at that ref, then `schema sync --tag <manager version>`
   so the SDL matches the backend release exactly (left at the tag's
   snapshot, with a warning, when the release carries no asset).
5. **Login?** — asked (`--login` / `--no-login`); yes runs `login` with the
   same `--paste` / `--webui` flags. A failed login is reported as a skipped
   step, not an abort.
6. **Skill?** — asked (`--skill` / `--no-skill`); yes installs the
   `bai-agent` skill into `~/.claude/skills/bai-agent/` (or under
   `$CLAUDE_CONFIG_DIR`) and writes `references/agent-block.md` beside it: the
   agent block below, worded for a machine with no checkout, generated from
   the installed CLI's registry. Re-running `init` refreshes both.

Inside a WebUI checkout the wizard uses the checkout's own data — no sync,
and its committed SDL is left alone — and refreshes the `BAI-AGENT` block in
its `CLAUDE.md` instead.

Without a TTY, every question must be answered by its flag; an unanswered one
exits 2 (`usage`) naming the flag, so an agent running `init` never hangs:

```bash
bai-agent init --endpoint https://manager.example.com --no-login --skill
```

`--json` prints every step's outcome — or why it was skipped — in one envelope.

## The agent block

The CLI is only useful to an agent that knows it exists. `init` prints the
`BAI-AGENT` block for the checkout's `CLAUDE.md` — the header line, the
discover-don't-guess workflow, the output contract, the rules, and a one-line
table of every command — **generated from `src/registry.ts`**, so it can never
advertise a command the CLI does not have.

```bash
bai-agent init --features agents          # print it
bai-agent init --features agents --write  # replace it in CLAUDE.md, idempotently
```

`--features agents` is the only feature (a bare `init` is the setup wizard
above). The same generator renders a **standalone** variant — `bai-agent
<cmd>` instead of the pnpm proxy, the installed skill instead of
`.claude/skills/`, no checkout-relative file references — which `init`
writes into the installed skill as `references/agent-block.md`.
`--write` replaces everything between
`<!-- BAI-AGENT:start -->` and `<!-- BAI-AGENT:end -->`; prose outside the
markers survives, and a second run is a no-op (`outcome: unchanged`). With no
markers in the file it inserts after the ASTRYX block and its notes.

In this checkout `CLAUDE.md` is a symlink to `AGENTS.md`, so `--write` edits the
file behind it and git reports `AGENTS.md` as the changed path.

`src/init/block.test.ts` asserts the committed block equals the generator's
output, so a CLI change that is not re-synced fails the suite:

```bash
pnpm --filter backend.ai-agent-cli build && pnpm run bai-agent init --features agents --write
```

The `bai-agent` skill lives in this package (`skill/`), ships in the npm
tarball as-is, and is installed per user by `init` — it is deliberately not
a repository-level `.claude/skills` entry, so a checkout gets it the same way
any other machine does (`pnpm run bai-agent init --skill --no-login`). It
carries what the block deliberately does not: the preflight and login procedure, when to answer
directly versus point the user at the WebUI, the neighbouring skills'
boundaries, and `references/query-cookbook.md` — ready-to-run documents that
`src/init/skill.test.ts` re-validates against the SDL.

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
  "error": "No backend.ai-webui checkout: ...",
  "code": "repo_not_found",
  "suggestions": ["data/schema.graphql", "..."],
  "hint": "bai-agent sync"
}
```

`hint` is always a concrete next command to run, never prose.

Global flags: `--json`, `--dense` and `--detail` (mutually exclusive text
verbosity levels), `-h, --help`, `--version`.

## Exit codes

| Code | Meaning                                                                  |
| ---- | ------------------------------------------------------------------------ |
| 0    | success                                                                  |
| 1    | error (`version_mismatch`, `schema_mismatch`, "no checkout in reach", …) |
| 2    | usage — unknown command, unknown flag, bad flag value                    |
| 3    | `auth_required` — no session, or the manager rejected it                 |
| 4    | `mutation_refused`                                                       |
| 5    | `not_found`                                                              |

Errors are raised as a typed `CliError` carrying `code`, `exitCode`, `hint` and
`suggestions`; a single top-level handler in `src/run.ts` renders it in text or
JSON and returns the exit code.

## Development

```bash
pnpm --filter backend.ai-agent-cli build   # dist/cli.js (executable bin)
pnpm --filter backend.ai-agent-cli test
pnpm --filter backend.ai-agent-cli lint
```

`graphql`, `ajv` and `yaml` are devDependencies and are bundled into `dist/`,
so the published package has no runtime dependency. `mappings/` ships as data
next to `dist/`; the loader finds it by walking up from its own module, so it
resolves the same from `src/` and from the bundle.

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
