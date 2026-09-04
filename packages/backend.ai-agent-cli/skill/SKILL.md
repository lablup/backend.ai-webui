---
name: bai-agent
description: >
  Answer a Backend.AI question, or do a Backend.AI task, from this checkout with the
  `bai-agent` CLI — the manual, the GraphQL schema, the i18n stores and the live manager.
  Trigger on: what a Backend.AI concept, field or status value means ("what does session
  status PENDING mean", "what is a resource group", "what does this field mean"),
  "find it in the manual", "search the docs", "query the manager", "run a GraphQL query",
  "how many sessions are running", "show me my sessions / folders / agents / users",
  "give me the WebUI link for this session", "where do I see that folder in the WebUI",
  or "bai-agent".
  Use `backend-ai-guide` instead for platform architecture with no live data, and
  `docs-lead` for writing the manual rather than reading it.
---

# bai-agent

`bai-agent` answers Backend.AI questions from a WebUI checkout — the one you
are in, or the data copy `bai-agent init` synced — and points the user at the
WebUI page for what it found. The workflow contract is the generated
`BAI-AGENT` block: in a checkout it is in `CLAUDE.md`, and an installed copy
of this skill carries it as `references/agent-block.md`. Read it there, it is
not repeated here. This file is the parts the CLI cannot tell you: when to log
in, when to answer versus link, and which neighbour owns what.

## Preflight

Run `bai-agent doctor --json` once, from wherever you already are — never `cd`
first. Its `checkout detection` check says whether you are in a checkout or
running on synced data; its session/auth check says whether you are logged
in. Run `bai-agent whoami` only when that check is `warn`.

The workflow contract is already loaded: in a checkout it is the `BAI-AGENT`
block in `CLAUDE.md`; installed, it is `references/agent-block.md`. Read
whichever applies — don't `cat` it unless the block is absent — and don't grep
for a CLAUDE.md outside a checkout; there isn't one.

**When `whoami` says `auth_required` (exit 3):**

- Get the endpoint and the account from the **`webui-connection-info`** skill
  in a checkout; elsewhere the endpoint is the one `init` recorded (`doctor`
  prints it). Never ask the user for a password, and never put one in a
  command.
- Browser on this machine: `bai-agent login --endpoint <url>`, then confirm on
  the `/cli-login` page it opens. That page is the WebUI's; in a checkout it
  is the dev server, elsewhere the endpoint's own origin — pass
  `--webui <origin>` when the UI lives somewhere else.
- Browser anywhere else, or a tunnelled/HTTPS tab: `bai-agent login --paste
  --endpoint <url>` and paste the session id the page reveals.
- `bai-agent logout` when you are done with a borrowed session.

**`search`, `docs show`, `schema show` and `explain` need no session at all.**
A "what does X mean" question never requires logging in — go straight to it.

## Answer, or link

| The user wants | Do this |
| --- | --- |
| to understand a status value ("what does status X mean") | Try `explain <Type>.<field>=<VALUE>` first — e.g. `explain ComputeSessionNode.status=PENDING`, `explain UserNode.status=before-verification`. Fall back to `explain <Type>.<field>` (no value) or `docs show` for a term or field in general. |
| to understand a term or field | `explain` (meaning) or `docs show` (the manual). Answer in the words the UI uses, and cite the deployed-docs `url` the CLI returned. |
| a count, a list, a value | `query` — start from the Cookbook below, adapt, never invent a shape. Summarise the rows; do not paste the raw envelope. |
| to see it, or act on it | Give the `webui_url` (or `webui_path`) `query` already annotated onto the row, under `data.links`, so the user can open it themselves. Never describe a click path you could report directly. If `data.links` is empty for a result, say the resource has no addressable page — do not compose a path by hand. When several rows share a name, pick the link by `id`, never by name. |
| something destructive | Give them the `hint` page from the refusal and stop. A `mutation_refused` (exit 4) is the answer, not an obstacle to route around. |

`explain` prints `MISSING` for a piece nothing curates. Say it is not documented
and offer the SDL entry — never fill the gap from memory. If the answer would be
better as a curated sentence, that is a `mappings/<Type>.yaml` change, not a
guess at runtime.

## Neighbours

| Skill | Owns | Not this |
| --- | --- | --- |
| `webui-connection-info` | Which dev server is up, its URL and port, the API endpoint, the test credentials. | It does not read data — it tells you where to point `login`. |
| `backend-ai-guide` | Backend.AI architecture and product Q&A with no live data: what Sokovan is, how the agent talks to the manager. | The moment the question is about *this* deployment's data or a schema field's meaning, it is `bai-agent`. |
| `docs-lead` | Writing and maintaining the user manual, terminology, translations, screenshots. | Reading the manual to answer a question is `bai-agent search` / `docs show`. |
| `bai-cli` (backend repo) | `./bai`, the backend's own REST CLI, inside a `backend.ai` checkout. | In **this** repo use `bai-agent`; `./bai` does not exist here. |

## Gotchas the CLI cannot warn you about

- **Search in English UI terms.** The index is English-only. A Korean or
  Japanese query is normalised through the i18n stores, not translated, so
  "Resource Group" beats "scaling group" and both beat a paraphrase.
- **One pagination mode per connection.** `first`+`after` XOR `last`+`before`
  XOR `limit`+`offset`. The local SDL accepts a mix; the `*V2` connections
  reject it at runtime (the checkout's `.claude/rules/graphql-pagination.md`).
- **`--allow-mutation` is not a bypass.** The field must also be on the CLI's
  mutation allow-list (`src/mutation-allowlist.ts` in the package). Widening
  that list is a reviewed PR, never an in-session decision.
- **Session detail views share one URL.** `/session?sessionDetail=<id>` is a
  drawer, the only addressable surface — there is no per-row session link to
  offer beyond that.
- **Never read the session file, or reuse its session id, outside `bai-agent`.**
  It exists so the CLI itself can hold the credential; the mutation gate only
  applies when calls go through the CLI, so bypassing it defeats the point.
- **The synced data copy holds schema, i18n and docs only — no React source.**
  Do not grep it for `.tsx`, and never report that emptiness as a fact about
  the WebUI itself.

## Cookbook

`<this skill's directory>/references/query-cookbook.md` (next to this file) —
11 documents that validate against the checkout's SDL, one per resource, plus
the allow-listed mutation and the refused destructive one. A test re-validates
them, so a stale one fails CI, not a user. Checkout location:
`packages/backend.ai-agent-cli/skill/references/query-cookbook.md`; installed:
`~/.claude/skills/bai-agent/references/query-cookbook.md`, or
`$CLAUDE_CONFIG_DIR/skills/...` when that is set. Never search the filesystem
for it.

## Keeping this in sync (maintainers, in a checkout)

Re-run `pnpm --filter backend.ai-agent-cli build && pnpm run bai-agent init
--features agents --write` after any change to the CLI, and re-sync the
`BAI-AGENT` block in `CLAUDE.md`. This directory ships in the npm package
as-is, so an installed copy updates on the next `bai-agent init`; it is not
a repository-level skill — install it with `bai-agent init --skill`. Rules
are linked from here, never copied: if you find
yourself restating what `manifest --json`, the block or `--help` already
says, delete it instead.
