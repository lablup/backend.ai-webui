---
name: bai-agent
description: >
  Answer a Backend.AI question, or do a Backend.AI task, from this checkout with the
  `bai-agent` CLI — the manual, the GraphQL schema, the i18n stores and the live manager.
  Trigger on: what a Backend.AI concept, field or status value means ("what does session
  status PENDING mean", "what is a resource group", "what does this field mean"),
  "find it in the manual", "search the docs", "query the manager", "run a GraphQL query",
  "how many sessions are running", "show me my sessions / folders / agents / users",
  "open this session in the browser", "open that folder in the WebUI", or "bai-agent".
  Use `backend-ai-guide` instead for platform architecture with no live data, and
  `docs-lead` for writing the manual rather than reading it.
---

# bai-agent

`bai-agent` answers Backend.AI questions from the checkout you are already in,
and hands the answer to the browser tab the user is already logged into. The
workflow contract is the generated `BAI-AGENT` block in `CLAUDE.md` — read it
there, it is not repeated here. This file is the parts the CLI cannot tell you:
when to log in, when to answer versus hand off, and which neighbour owns what.

## Preflight

1. `pnpm --filter backend.ai-agent-cli build` — once per session; the
   `pnpm run bai-agent` proxy runs the bundle, not the source.
2. `pnpm run bai-agent doctor --json` — checkout, session and WebMCP tab in one
   pass. Exit 0 and you are ready.
3. `pnpm run bai-agent whoami` — exit 3 (`auth_required`) means log in:
   - Get the endpoint and the account from the **`webui-connection-info`** skill.
     Never ask the user for a password, and never put one in a command.
   - Browser on this machine: `bai-agent login --endpoint <url>`, then confirm on
     the `/cli-login` page it opens. That route needs `enableCliLogin = true` in
     `config.toml` (`DEV_ENVIRONMENT.md`); without it the page 404s.
   - Browser anywhere else, or a tunnelled/HTTPS tab: `bai-agent login --paste
     --endpoint <url>` and paste the session id the page reveals.
   - `bai-agent logout` when you are done with a borrowed session.
4. **`search`, `docs show`, `schema show` and `explain` need no session at all.**
   A "what does X mean" question never requires logging in — go straight to it.

## Answer, or hand off

| The user wants | Do this |
| --- | --- |
| to understand a term, field or status value | `explain` (meaning) or `docs show` (the manual). Answer in the words the UI uses, and cite the deployed-docs `url` the CLI returned. |
| a count, a list, a value | `query` — start from `references/query-cookbook.md`, adapt, never invent a shape. Summarise the rows; do not paste the raw envelope. |
| to see it, or act on it | `bai-agent open <resource> <id>` — the tab is already logged in. Never describe a click path you could have performed. |
| something destructive | `open` the page and stop. A `mutation_refused` (exit 4) is the answer, not an obstacle to route around. |

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
  reject it at runtime. `.claude/rules/graphql-pagination.md`.
- **`--allow-mutation` is not a bypass.** The field must also be on
  `packages/backend.ai-agent-cli/src/mutation-allowlist.ts`. Widening that list
  is a reviewed PR, never an in-session decision.
- **`no_webui_tab` (exit 5) means no tab is connected** — give the user the
  `hint` URL and let them open it. `ambiguous_tab` means several: re-run with
  `--tab <id>` from the suggestions. Never guess which tab.
- **The relay handshake starves on HTTPS.** Chrome's Local Network Access check
  can outlast the widget's probe on a `https://*.localhost:1355` page, so the
  tab never finds the relay. Use the plain `http://127.0.0.1:<port>` URL Vite
  prints. See `DEV_ENVIRONMENT.md`.
- **Session detail views share one URL.** `/session?sessionDetail=<id>` is a
  drawer, the only addressable surface — there is no per-tab session link to
  offer.

## Cookbook

`references/query-cookbook.md` — 11 documents that validate against this
checkout's SDL, one per resource, plus the allow-listed mutation and the refused
destructive one. A test re-validates them, so a stale one fails CI, not a user.

## Keeping this in sync

Re-run `pnpm --filter backend.ai-agent-cli build && pnpm run bai-agent init
--features agents --write` after any change to the CLI, and re-sync the
`BAI-AGENT` block in `CLAUDE.md`. Rules are linked from here, never copied: if
you find yourself restating what `manifest --json`, the block or `--help`
already says, delete it instead.
