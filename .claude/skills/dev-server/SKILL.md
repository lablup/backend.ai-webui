---
name: dev-server
description: >
  Start the project's development server. For backend.ai-webui this means
  `pnpm dev` (no separate wsproxy needed by default). For other projects,
  read the project's README.md and package.json to determine the right command.
  When a Claude Code `/color <name>` slash command is visible in the current
  conversation history, set THEME_HEADER_COLOR to the matching hex so the dev
  server's header reflects this Claude session's color.
  Trigger on: "start dev server", "run dev", "pnpm dev 띄워", "개발 서버 띄워",
  "dev 서버 시작", "boot the dev environment", "실행해줘 dev".
---

# Dev Server

Starts the dev server with optional `THEME_HEADER_COLOR` derived from the current Claude Code session color.

## 1. Decide the command

### If cwd is `backend.ai-webui` (this project)

Run **only**:

```bash
pnpm dev
```

Do **not** start `pnpm wsproxy` separately unless the user explicitly asks for it. `scripts/dev.mjs` already handles tsc watch + Relay watch + Portless + React dev server. wsproxy is needed only for desktop/Electron flows, not regular web dev.

Pin the React port with `PORT=9081 pnpm dev` only if the user asked for a specific port.

### If cwd is some other project

Do not assume `pnpm dev`. Discover the right command:

1. Read the project's `README.md` (look for "Development", "Getting started", "Run", "Dev server" sections).
2. Read `package.json` `scripts` field. Look for `dev`, `start`, `serve`, `develop` — pick the one the README points to, or the obvious one if README is silent.
3. If neither is conclusive, ask the user which script to run before guessing.
4. Prefer the package manager the project uses: `pnpm-lock.yaml` → `pnpm`, `yarn.lock` → `yarn`, `bun.lockb` → `bun`, otherwise `npm`.

## 2. Detect the Claude Code color from conversation history

Scan the **current conversation** (this session's prior turns, including `<command-name>` blocks and your own messages) for the most recent successful `/color <name>` invocation.

**What counts as "successful":**
- A `<command-name>/color</command-name>` block whose `<command-args>` is exactly one of: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`, `default`.
- AND the accompanying `<local-command-stdout>` does NOT start with `Invalid color`.
- If multiple `/color` calls appear, take the **most recent** one.
- If the most recent successful call is `default`, treat the color as unset (skip `THEME_HEADER_COLOR`).
- If no `/color` was ever invoked in this conversation, the color is unset.

**Hex mapping** (use exactly these values):

| Name | Hex |
|------|-----|
| `red` | `#DC2626` |
| `blue` | `#2563EB` |
| `green` | `#16A34A` |
| `yellow` | `#CA8A04` |
| `purple` | `#7C3AED` |
| `orange` | `#EA580C` |
| `pink` | `#DB2777` |
| `cyan` | `#0891B2` |

Do not invent additional names or alternate hex values. If the user's `/color` arg doesn't match the table exactly, treat it as unset.

## 3. Compose the run

**Default: no env var.** If you cannot resolve a color from step 2 (no `/color` in history, or the most recent was `default`, or anything ambiguous), run the command with **no `THEME_HEADER_COLOR` prefix at all**. Do not invent a color, do not pick a "neutral" default, do not pass an empty string. Just omit the env var.

- **Color resolved** (e.g. `blue` → `#2563EB`):
  ```bash
  THEME_HEADER_COLOR='#2563EB' pnpm dev
  ```
- **Color unset** (no `/color` in history, or last was `default`):
  ```bash
  pnpm dev
  ```

For non-webui projects, substitute the discovered command and package manager but keep the same `THEME_HEADER_COLOR=...` prefix only when (a) a color is actually resolved AND (b) the project consumes the env var (check `vite.config.*`, `craco.config.*`, `next.config.*`, etc., or grep for `THEME_HEADER_COLOR`). If either is false, skip the prefix.

## 4. Run it

Use the Bash tool with `run_in_background: true` since dev servers are long-running. State in one short sentence what you're doing — e.g. `"Starting dev server with header color #2563EB (blue)."` — and which color name (if any) the env was derived from. Don't paste the env table.

## 5. Announce both URLs to the user

Once the server is up, tell the user **both** the Portless (HTTPS) URL and the underlying React (HTTP) URL on separate lines so they can pick whichever they prefer. Do this only after both are actually known — don't fabricate ports.

### For backend.ai-webui

- **Portless URL** — deterministic from the current git branch (mirror `scripts/dev.mjs`'s logic):
  - If the branch matches `/(?:^|[-_/])fr-?(\d+)/i`, the URL is `https://fr-<NNNN>.localhost:1355`.
  - Otherwise it's `https://<portless-app-name>.localhost:1355` where `<portless-app-name>` is whatever Portless printed on startup (read it from the background task's output via Monitor; do not guess).
  - The port is `1355` unless the user set `PORTLESS_PORT` to something else — in that case use that value.
- **React URL** — the local React dev server port:
  - If the user passed `PORT=<n>`, it's `http://localhost:<n>`.
  - Otherwise read the React dev server output for the `Local: http://localhost:<port>` line (Monitor the background task with an until-loop watching for that pattern, or wait for the line via `browser_wait_for`-style polling — but on the bash output, not the browser). Do not pick a port at random.

Use Monitor on the background bash with an until-loop that exits when both URLs have been printed (Portless prints its URL early; React's `Local:` line comes after the bundle compiles). Once both are known, present them like this — exactly two lines, no preamble:

```
Portless: https://fr-2701.localhost:1355
React:    http://localhost:9081
```

If after a reasonable wait (~90s) the React URL still hasn't appeared, announce just the Portless URL and tell the user the React port hasn't been printed yet — don't block indefinitely.

### For other projects

Many projects don't use Portless. Read the dev server's stdout for whatever URL(s) it prints (Vite typically prints `Local:` and `Network:`; Next.js prints `started server on http://localhost:3000`; etc.) and forward all of them to the user verbatim. If the project does use Portless, follow the webui rules above.

## 6. Edge cases

- **User overrides via env**: if `THEME_HEADER_COLOR` is already exported in the inherited env or set in `.env.development.local`, do not override. The user-set value wins. (For webui specifically, `scripts/dev.mjs` reads `.env.development.local` as a fallback — your env-prefixed run will still take precedence over that file because the prefix sets the var explicitly.)
- **User overrides via prompt**: if the user says "use a green header" or "no color this time", honor their words over the conversation-history color.
- **Multiple Claude windows / worktrees**: each Claude Code session has its own conversation, so the color is naturally session-scoped. Don't try to read color state from disk — there is none (built-in `/color` is in-memory only).
- **No `/color` in history but user mentioned a color**: treat the user's mention as the source of truth. If they said "use orange", map `orange` → `#EA580C` and prefix accordingly.

## 7. Out of scope

- Don't write any color file (`.claude/.fw-color`, `.env.development.local`, etc.). The env var prefix is the only side effect on env.
- Don't run `pnpm wsproxy` for webui unless explicitly asked.
- Don't install deps, run lint, or do any other "while we're here" steps. Just start the server.
