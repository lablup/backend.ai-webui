---
name: dev-server
description: >
  Start the project's development server. For backend.ai-webui this means
  `pnpm dev` (no separate wsproxy needed by default). For other projects,
  read the project's README.md and package.json to determine the right command.
  When a Claude Code `/color <name>` slash command is visible in the current
  conversation history, set VITE_THEME_HEADER_COLOR to the matching hex so the dev
  server's header reflects this Claude session's color. When `/rename <name>`
  is visible, slugify the name and pass it as PORTLESS_APP_NAME so the dev
  URL reflects the session name (falls back to FR-XXXX from the branch, then
  to the current PR number). When the current branch's PR description names
  a backend test server (bare IP, `host:port`, or full URL), set
  VITE_DEFAULT_API_ENDPOINT so the login screen pre-fills that endpoint and
  any stale session targeting a different backend is logged out.
  Trigger on: "start dev server", "run dev", "pnpm dev 띄워", "개발 서버 띄워",
  "dev 서버 시작", "boot the dev environment", "실행해줘 dev".
---

# Dev Server

Starts the dev server with optional `VITE_THEME_HEADER_COLOR`, `PORTLESS_APP_NAME`, and `VITE_DEFAULT_API_ENDPOINT` derived from this Claude Code session's `/color` / `/rename` history and the current branch's PR description.

## 1. Decide the command

### If cwd is `backend.ai-webui` (this project)

Run **only**:

```bash
pnpm dev
```

Do **not** start `pnpm wsproxy` by default. `scripts/dev.mjs` already handles tsc watch + Relay watch + Portless + Vite dev server, and the webui can connect to a backend without the local wsproxy in normal browser-based development. `pnpm wsproxy` is **optional** — start it only when the user explicitly asks (e.g. desktop/Electron flow, or a backend setup that needs the local WebSocket proxy on port 5050).

Pin the React port with `PORT=9081 pnpm dev` only if the user asked for a specific port.

### If cwd is some other project

Do not assume `pnpm dev`. Discover the right command:

1. Read the project's `README.md` (look for "Development", "Getting started", "Run", "Dev server" sections).
2. Read `package.json` `scripts` field. Look for `dev`, `start`, `serve`, `develop` — pick the one the README points to, or the obvious one if README is silent.
3. If neither is conclusive, ask the user which script to run before guessing.
4. Prefer the package manager the project uses: `pnpm-lock.yaml` → `pnpm`, `yarn.lock` → `yarn`, `bun.lockb` → `bun`, otherwise `npm`.

## 2a. Detect the Claude Code color from conversation history

Scan the **current conversation** (this session's prior turns, including `<command-name>` blocks and your own messages) for the most recent successful `/color <name>` invocation.

**What counts as "successful":**
- A `<command-name>/color</command-name>` block whose `<command-args>` is exactly one of: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`, `default`.
- AND the accompanying `<local-command-stdout>` does NOT start with `Invalid color`.
- If multiple `/color` calls appear, take the **most recent** one.
- If the most recent successful call is `default`, treat the color as unset (skip `VITE_THEME_HEADER_COLOR`).
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

## 2b. Decide the Portless app name (webui only)

`scripts/dev.mjs` reads `PORTLESS_APP_NAME` from the env and uses it as the Portless subdomain (`https://<name>.localhost:1355`). Pick a name with this priority:

1. **Most recent successful `/rename <name>` in conversation history** — slugify the arg (see rules below) and use that. This makes the dev URL match the human-readable session name (e.g. `iphoto-disk-cleanup` → `https://iphoto-disk-cleanup.localhost:1355`).
2. **FR-XXXX in the current git branch** — `dev.mjs` already detects this when `PORTLESS_APP_NAME` is unset, so just **omit the env var** and let it derive `fr-XXXX` (e.g. `fr-2794`). Don't recompute and pass it back in.
3. **Open PR number for the current branch** — only if (1) and (2) both miss and the current branch has an open PR. Use `gh pr view --json number -q '.number'` and pass `PORTLESS_APP_NAME=pr-<NNNN>`.
4. **None of the above** — omit the env var; `dev.mjs` falls back to Portless's auto-derived name.

**Slug rules** (apply to `/rename` arg before passing as `PORTLESS_APP_NAME`):
- Lowercase.
- Replace any character that isn't `[a-z0-9-]` with `-` (spaces, underscores, dots, slashes, non-ASCII all become `-`).
- Collapse repeated `-` into a single `-`.
- Trim leading/trailing `-`.
- Cap at ~40 chars (Portless cert generation can choke on very long subdomains).
- If the result is empty after sanitization, treat as unset.

`dev.mjs` re-applies the same sanitization defensively, so it's safe to pass a slightly imperfect string — but compute the clean form yourself so you can announce the right hostname to the user without re-reading Portless output.

**Detecting `/rename` in history**: scan the current conversation for `<command-name>/rename</command-name>` blocks. Take the **most recent** one whose `<local-command-stdout>` does not look like an error (e.g. doesn't start with `Error` / `Invalid`). Use `<command-args>` as the raw input to the slug rules.

## 2c. Decide the default API endpoint (webui only)

`react/src/components/LoginView.tsx` reads `VITE_DEFAULT_API_ENDPOINT` (only when `import.meta.env.DEV` is true) and:

- pre-fills the login form's API endpoint with that value, **overriding** any value in `localStorage.backendaiwebui.api_endpoint` and any `api_endpoint` baked into `config.toml`;
- when an existing in-memory session targets a different backend, logs that session out and shows the login panel instead of attempting silent re-login.

This skill auto-derives the value from the current branch's PR description so dev sessions land on the right per-PR backend without the user re-typing the endpoint on every cold start. Pick a value with this priority:

1. **User explicitly named an endpoint in the prompt or in conversation** (e.g. "use 10.0.1.5 as the test server", "use https://api.staging.lablup.ai") — honor that and convert per the rules below.
2. **Most recent open PR for the current branch** — fetch the PR body and scan it.
   ```bash
   gh pr view --json body -q '.body' 2>/dev/null
   ```
   Skip silently when the branch has no PR.
3. **None of the above** — omit the env var. Do **not** invent a default endpoint.

**Conversion rules** (apply to the candidate string before passing as `VITE_DEFAULT_API_ENDPOINT`):

| Input | Output |
|---|---|
| `10.0.1.5` (bare IPv4) | `http://10.0.1.5:8090` |
| `10.0.1.5:9090` (bare `host:port`) | `http://10.0.1.5:9090` |
| `manager.example.com` (bare hostname) | `http://manager.example.com:8090` |
| `manager.example.com:9090` | `http://manager.example.com:9090` |
| `http://...` / `https://...` (full URL) | use as-is, with any trailing `/` stripped |

The bare-IP-defaults-to-`8090` rule reflects the project convention that PR descriptions usually list just an IP and the WebUI talks to the manager on `:8090`.

**Scanning the PR body** — do this in two passes, top-to-bottom, taking the **first** valid candidate:

**Pass 1 (preferred): contextual match.** Scan only lines that look like they're naming a backend, i.e. the line contains one of these markers (case-insensitive): `test server`, `test backend`, `manager`, `api endpoint`, `endpoint`, `target server`, `dev server` (when adjacent to an address), or the line lives under a heading whose text contains `Backend`, `Test`, `Server`, or `Endpoint`. On those lines, run the address regex below.

**Pass 2 (fallback): full-body match.** Only if Pass 1 found nothing, run the same regex against the whole body.

**Address regex** (apply per pass):

```
(https?:\/\/)?(\b(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}\b|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?::(\d{1,5}))?(?:\/[^\s)]*)?
```

The IPv4 alternative is octet-bounded (rejects `999.999.999.999` and other invalid quads) but still matches version-shaped strings like `1.2.3.4` — Pass 1's contextual filter is what keeps version numbers in changelogs from being adopted. The hostname alternative accepts both 2-label hosts (`example.com`, `manager.com`) and longer ones (`api.staging.example.com`) — TLD is the trailing `[a-z]{2,}` segment.

**Reject the following candidates** even if the regex matches them (apply *after* matching, *before* converting):

- **Documentation / source-control hosts**: any host equal to or ending in `github.com`, `gitlab.com`, `bitbucket.org`, `lablup.atlassian.net`, `readthedocs.io`, or any host starting with `docs.`. These are referenced from PR bodies all the time and are never the dev backend.
- **Filename-shaped tails**: if the matched candidate's last segment (after the final `.`, before any `:port` or `/path`) is in this denylist, drop it: `ts | tsx | js | jsx | mjs | cjs | md | mdx | py | rs | go | json | yaml | yml | toml | html | htm | css | scss | svg | png | jpg | jpeg | gif | webp | sh | lock | txt | log`. Catches `app.test.ts`, `README.md`, `package-lock.json`, etc.
- **Loopback / link-local IPs**: `127.0.0.1`, `0.0.0.0`, `169.254.*.*` — these are almost never the dev backend a PR is targeting; treat as a false match.

If the matched candidate is rejected, keep scanning (within the same pass) for the next candidate. If a pass finishes with all candidates rejected, fall through to the next pass; if both passes finish with no usable candidate, omit `VITE_DEFAULT_API_ENDPOINT`.

**Announce what you did.** When you start the dev server, briefly say which source the endpoint came from and — if you considered and rejected one — what you skipped. Example:

> `VITE_DEFAULT_API_ENDPOINT=http://10.0.1.5:8090` from PR #1234 description (skipped `docs.backend.ai` and `package-lock.json` mentions before it).

Silent misconfiguration is the worst failure mode here — it sends the dev session to the wrong backend without anyone noticing.

If the resolved value matches the existing default backend the WebUI would otherwise use (i.e. it has no effect), still pass it — being explicit avoids the auto-logout silently disagreeing with the form on edge cases.

## 3. Compose the run

**Default: no env vars.** If you cannot resolve a color from step 2a (no `/color` in history, or the most recent was `default`, or anything ambiguous), run the command with **no `VITE_THEME_HEADER_COLOR` prefix at all**. Do not invent a color, do not pick a "neutral" default, do not pass an empty string. Just omit the env var. Same goes for `PORTLESS_APP_NAME` from step 2b.

- **Color resolved** (e.g. `blue` → `#2563EB`):
  ```bash
  VITE_THEME_HEADER_COLOR='#2563EB' pnpm dev
  ```
- **Color unset** (no `/color` in history, or last was `default`):
  ```bash
  pnpm dev
  ```

If step **2b** picked a Portless app name from `/rename` or a PR number, also prefix `PORTLESS_APP_NAME='<slug>'`. If 2b selected the FR-XXXX branch fallback (option 2) or "none" (option 4), **omit** `PORTLESS_APP_NAME` — `dev.mjs` handles those itself.

If step **2c** resolved a default API endpoint, also prefix `VITE_DEFAULT_API_ENDPOINT='<url>'`. If 2c resolved nothing, **omit** the variable entirely — do not pass an empty string.

```bash
VITE_THEME_HEADER_COLOR='#2563EB' PORTLESS_APP_NAME='iphoto-disk-cleanup' VITE_DEFAULT_API_ENDPOINT='http://10.0.1.5:8090' pnpm dev
```

For non-webui projects, substitute the discovered command and package manager. Use whatever color env var the project actually reads (check `vite.config.*`, `next.config.*`, etc., or grep for `*THEME_HEADER_COLOR` / `*_THEME_COLOR`). Apply the prefix only when (a) a color is actually resolved AND (b) the project really consumes that env var. If either is false, skip the prefix. `PORTLESS_APP_NAME` and `VITE_DEFAULT_API_ENDPOINT` are webui-specific.

## 4. Run it

Use the Bash tool with `run_in_background: true` since dev servers are long-running. State in one short sentence what you're doing — e.g. `"Starting dev server with header color #2563EB (blue)."` — and which color name (if any) the env was derived from. Don't paste the env table.

## 5. Announce both URLs to the user

Once the server is up, tell the user **both** the Portless (HTTPS) URL and the underlying React (HTTP) URL on separate lines so they can pick whichever they prefer. Do this only after both are actually known — don't fabricate ports.

### For backend.ai-webui

- **Portless URL** — derived from the app name chosen in step 2b:
  - If you passed `PORTLESS_APP_NAME=<slug>`, the URL is `https://<slug>.localhost:1355`.
  - Else if the branch matches `/(?:^|[-_/])fr-?(\d+)/i`, the URL is `https://fr-<NNNN>.localhost:1355` (dev.mjs derives this).
  - Else it's `https://<portless-app-name>.localhost:1355` where `<portless-app-name>` is whatever Portless printed on startup (read it from the background task's output; do not guess).
  - The port is `1355` unless the user set `PORTLESS_PORT` to something else — in that case use that value.
- **React URL** — the local Vite dev server URL:
  - The webui uses **Vite** (`VITE v6.x ready in <ms>` line), so the `Local:` URL is printed within ~1s of startup — no need to wait for a long bundle compile.
  - If the user passed `PORT=<n>`, the URL is `http://127.0.0.1:<n>/` (Portless launches Vite with `HOST=127.0.0.1`, so Vite prints `127.0.0.1` not `localhost`).
  - Otherwise Portless picks a free port and exports it via `PORT=<n>`; read the React dev server output for the `Local:   http://127.0.0.1:<port>/` line. Do not pick a port at random.

Run a short Bash with an until-loop polling the background bash's output file for the `Local:` line (and a fallback bound of ~10–15s, since Vite is fast). Once both URLs are known, present them like this — exactly two lines, no preamble:

```
Portless: https://fr-2701.localhost:1355
React:    http://127.0.0.1:4627/
```

If after ~15s the React URL still hasn't appeared (very rare with Vite), announce just the Portless URL and tell the user the React port hasn't been printed yet — don't block indefinitely.

### For other projects

Many projects don't use Portless. Read the dev server's stdout for whatever URL(s) it prints (Vite typically prints `Local:` and `Network:`; Next.js prints `started server on http://localhost:3000`; etc.) and forward all of them to the user verbatim. If the project does use Portless, follow the webui rules above.

## 6. Edge cases

- **User overrides via env (webui)**: Vite's `loadEnv()` reads `VITE_THEME_HEADER_COLOR`, `VITE_DEFAULT_API_ENDPOINT` from `.env.development.local` and from the shell automatically. If the user already has any of them set, do not override — the user-set value wins. For `PORTLESS_APP_NAME`, the same rule applies: if it's already exported in the inherited env, treat the user-set value as authoritative.
- **User overrides via prompt**: if the user says "use a green header" or "no color this time" or "name the dev URL <foo>" or "ignore the PR's IP, use 10.0.0.7 instead", honor their words over the conversation-history and PR-description values.
- **Multiple Claude windows / worktrees**: each Claude Code session has its own conversation, so both color and app name are naturally session-scoped. Don't try to read either from disk — there's no shared state (built-in `/color` and `/rename` are in-memory only). For `VITE_DEFAULT_API_ENDPOINT`, the *PR* is the shared source of truth; reading it via `gh pr view` works the same from any worktree on that branch.
- **No `/color` in history but user mentioned a color**: treat the user's mention as the source of truth. If they said "use orange", map `orange` → `#EA580C` and prefix accordingly.
- **PR description mentions multiple addresses or none**: take the **first** match for the multi-match case; for the no-match case, omit `VITE_DEFAULT_API_ENDPOINT` rather than guessing. The login form will fall back to `localStorage` / `config.toml` like before.

## 7. Out of scope

- Don't write any color file (`.claude/.fw-color`, `.env.development.local`, etc.). The env var prefix is the only side effect on env.
- Don't install deps, run lint, or do any other "while we're here" steps. Just start the server.
