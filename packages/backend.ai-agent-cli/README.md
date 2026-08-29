# backend.ai-agent-cli (`bai-agent`)

An agent-facing CLI over a Backend.AI WebUI checkout. It answers questions about
the repository's own data — GraphQL schema, i18n stores, the user manual — so an
agent can look things up with one command instead of a directory sweep.

This package is the skeleton every later command plugs into: one file per
command under `src/commands/`, a shared output layer, and a shared repo-context
locator. Node ≥ 22, ESM, built with tsup.

## Repo mode

`bai-agent` reads the checkout live — it copies nothing and takes no workspace
dependency on the packages it reads. Every command resolves its context by
walking up from the current working directory until it finds a `package.json`
named `backend.ai-webui`, then verifies the three data sources exist:

| Source         | Path                              |
| -------------- | --------------------------------- |
| GraphQL schema | `data/schema.graphql`             |
| i18n stores    | `resources/i18n/`                 |
| User manual    | `packages/backend.ai-webui-docs/` |

`resolveRepoContext(cwd)` returns absolute paths (`repoRoot`, `schemaPath`,
`i18nDir`, `docsDir`) plus the checkout's `package.json` version. Outside a
checkout it fails with exit code 1 and an error naming what was not found.

## Commands

```bash
bai-agent version     # CLI version, detected checkout root, repo version
bai-agent manifest    # every command with its description and flags
bai-agent doctor      # environment + checkout diagnostics
bai-agent --help      # generated from the same command registry as `manifest`
```

Commands are registered in one table (`src/registry.ts`), so `--help` and
`manifest` never drift from what the CLI can actually do.

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
