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
  URL reflects the session name; dev.mjs prepends the branch's FR number and
  the PR number itself, and derives a word from the PR title when there is no
  /rename, so pass the word only. When the current branch's PR description names
  a backend test server (bare IP, `host:port`, or full URL), set
  VITE_DEFAULT_API_ENDPOINT so the login screen pre-fills that endpoint; when a
  live session is connected to a different backend a dev-only banner flags the
  mismatch instead of forcing a logout. When the user supplies dev test
  credentials, set VITE_DEFAULT_EMAIL / VITE_DEFAULT_PASSWORD to pre-fill the
  login form too. Dev servers run without the resident TypeScript program
  (~1.3 GB per server) by default; pass VITE_DEV_TYPECHECK=on only when the
  user explicitly asked for type checking, and say either way in the reply.
  Trigger on: "start dev server", "run dev", "pnpm dev 띄워", "개발 서버 띄워",
  "dev 서버 시작", "boot the dev environment", "실행해줘 dev".
---

# Dev Server

Starts the dev server with optional `VITE_THEME_HEADER_COLOR`, `PORTLESS_APP_NAME`, `VITE_DEFAULT_API_ENDPOINT`, `VITE_DEV_TYPECHECK`, and (when the user supplies them) `VITE_DEFAULT_EMAIL` / `VITE_DEFAULT_PASSWORD`, derived from this Claude Code session's `/color` / `/rename` history, the current branch's PR description, and the user's stated test credentials.

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

`PORTLESS_APP_NAME` supplies **only the descriptive word**. `scripts/dev.mjs` composes the
full subdomain itself, putting the identifiers first and the word last:

```
https://fr-3665-pr9049-statusline.localhost:1355
        \_____/ \____/ \________/
        branch  looked  PORTLESS_APP_NAME
        issue   up by   (this is the only part you supply)
                dev.mjs
```

So there is exactly one question for you to answer: **is there a `/rename` to use?**

1. **Most recent successful `/rename <name>`** — slugify the arg (rules below) and pass it.
   The dev URL then carries the human-readable session name alongside the identifiers.
2. **No `/rename`** — **omit the env var.** `dev.mjs` falls back to a few words from the PR
   title, then to the identifiers alone (`fr-3665-pr9049`), then to Portless's auto-derived
   name. Every fallback is already handled.

**Never pass the FR number or the PR number yourself.** `dev.mjs` derives the issue key from
the branch and looks the PR up with one cached `gh` call, and it strips either identifier from
your string if you pass it anyway — so `PORTLESS_APP_NAME=fr-3665` just yields `fr-3665-pr9049`,
losing the descriptive part for nothing.

**Slug rules** (apply to the `/rename` arg before passing as `PORTLESS_APP_NAME`):
- Lowercase.
- Replace any character that isn't `[a-z0-9-]` with `-` (spaces, underscores, dots, slashes, non-ASCII all become `-`).
- Collapse repeated `-` into a single `-`.
- Trim leading/trailing `-`.
- Keep it short — a word or three. `dev.mjs` caps the whole hostname at 50 chars and truncates
  the descriptive tail first, so a long name loses its own end, not the identifiers.
- If the result is empty after sanitization, treat as unset.

`dev.mjs` re-applies the same sanitization defensively, so it's safe to pass a slightly imperfect
string. It is **not** safe to predict the hostname from your string alone any more — the issue and
PR parts are added after you. Read the URL Portless prints, or the statusline's Portless link,
before announcing it.

`PORTLESS_APP_NAME_EXACT=1` turns the composition off and uses your string verbatim. It exists for
callers that own the whole hostname (a release preview, say); a dev server for a branch should not
use it.

**Detecting `/rename` in history**: scan the current conversation for `<command-name>/rename</command-name>` blocks. Take the **most recent** one whose `<local-command-stdout>` does not look like an error (e.g. doesn't start with `Error` / `Invalid`). Use `<command-args>` as the raw input to the slug rules.

## 2c. Decide the default API endpoint (webui only)

`react/src/components/LoginView.tsx` reads `VITE_DEFAULT_API_ENDPOINT` (only when `import.meta.env.DEV` is true) and:

- pre-fills the login form's API endpoint with that value for a **fresh login** (it also overrides any `api_endpoint` baked into `config.toml` on first entry);
- does **not** override a live session's backend: if a stored session targets a different server, the app silently reconnects to that server (no bounce to the login screen) and a **dev-only banner** (`DevApiEndpointMismatchAlert`) announces "connected to X, but configured for Y" so multi-server testing doesn't get confusing. There is intentionally no auto-logout on mismatch.

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

If the resolved value matches the existing default backend the WebUI would otherwise use (i.e. it has no effect), still pass it — being explicit keeps the login form's pre-fill and the dev mismatch banner in agreement on edge cases.

## 2d. Decide the default login credentials (webui only, optional)

`LoginView.tsx` also reads `VITE_DEFAULT_EMAIL` / `VITE_DEFAULT_PASSWORD` (dev only) and pre-fills the SESSION-mode email + password fields, so a local dev session can sign in without retyping test credentials. These are a pure convenience pre-fill — they do **not** auto-submit the login form.

**Resolve them conservatively — never guess:**

1. **User explicitly supplied credentials** in the prompt or conversation (e.g. "log in as `admin@lablup.com` / `wJalrXUt`", "use the domain-admin test account") → set both vars from what they said.
2. **A shared team test server's credentials are already known** to this session — credentials the user pasted earlier for that box → reuse them.
3. **Otherwise omit both.** Do **not** scrape passwords out of the PR body, invent credentials, or reuse `e2e/envs/.env.playwright` values unless the user pointed you at them. Set the email alone (without a password) only if that is all the user gave.

**Security caveats (state them when you use these):**

- `VITE_DEFAULT_PASSWORD` bakes a **plaintext password into the dev bundle** at build time. It is dev-only (`import.meta.env.DEV`), but still: only ever pass it on the command line or via the user's git-ignored `.env.development.local` — never write it to a committed file, and never for a production build.
- Prefer non-privileged / disposable test accounts. If the user asks to pre-fill a real admin password, confirm they intend the plaintext-in-dev-bundle tradeoff before doing it.

### 2e. Type checking (`VITE_DEV_TYPECHECK`) — off unless asked

**Omit the variable.** Dev servers run without the type checker by default, so there is nothing to pass in the normal case.

**Pass `VITE_DEV_TYPECHECK=on` only on an explicit request** for type checking in this server ("타입체크 켜서 띄워줘", "I want the type errors in the overlay", or a task that is specifically about fixing type errors).

Do not try to infer the answer from how many servers are running, whether the session looks interactive, or who is going to read the output. Those judgments come out differently every session, which is worse than a flat rule with one explicit override.

`vite-plugin-checker` holds a resident TypeScript program so type errors appear in the dev terminal and as a browser overlay. That program is the single most expensive thing in a dev server — measured on this repo's `react/` server, module graph warmed:

| | vite RSS |
|---|---|
| checker on | 2,195 MB |
| checker off | 853 MB |

A dev server here is usually one of several, next to editors, agents, and other worktrees, so that ~1.3 GB decides how many fit on the machine.

This is the behaviour of `react/vite.config.ts` itself, not something this skill imposes — a hand-typed `pnpm dev` is checker-less too.

**Say which mode you started, in your reply, every time.** Checker off: name the fallback — e.g. *"Type checking is off in this server (the default); `bash scripts/verify.sh` before committing, or `pnpm --filter ./react exec tsc --noEmit` for a one-shot check."* Checker on: say so, and that it costs ~1.3 GB. Vite prints a matching warning on startup when the checker is off. Never let a checker-less server be reported as if it were type-clean.

Running without it costs no real type safety: `scripts/verify.sh`, the Husky pre-commit hook, and CI each run one-shot `tsc --noEmit` independently of the dev server, and the IDE's own tsserver still flags errors while editing. What is lost is only the in-terminal / in-browser feedback loop while the server runs. If a specific check is needed on a checker-less server, run `pnpm --filter ./react exec tsc --noEmit` once rather than restarting with the checker enabled — a one-shot check frees its memory when it exits, a resident watcher does not.

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

If step **2b** found a `/rename` to use, also prefix `PORTLESS_APP_NAME='<slug>'` — the descriptive word only. Otherwise **omit** it; `dev.mjs` derives the word from the PR title and adds the identifiers either way.

If step **2c** resolved a default API endpoint, also prefix `VITE_DEFAULT_API_ENDPOINT='<url>'`. If 2c resolved nothing, **omit** the variable entirely — do not pass an empty string.

If step **2d** resolved login credentials, also prefix `VITE_DEFAULT_EMAIL='<email>'` and `VITE_DEFAULT_PASSWORD='<password>'`. If 2d resolved nothing, **omit** both. Never pass an empty string, and never fabricate a value to "fill the slot."

Per step **2e**, prefix `VITE_DEV_TYPECHECK=on` **only** when the user explicitly asked for type checking; otherwise omit the variable entirely. Either way, say which mode you started in your reply.

On the webui, also prefix `BAI_REVIEW_BOOT_RECORD` from step **5**'s `boot-env` call — the dev
server needs it in its environment before it starts. Omit it when `boot-env` printed nothing.

**Shell-escape every interpolated value.** The endpoint, email, and especially the password come from user/conversation text and may contain an apostrophe or shell metacharacters — interpolating them raw inside `'...'` breaks the command and can turn the rest of the value into executable shell. Before building the command line, quote each value shell-safely (e.g. Bash `printf '%q'`), or set them via the user's git-ignored `.env.development.local` instead of the command line. Do not hand-concatenate an untrusted password into a single-quoted string.

```bash
VITE_THEME_HEADER_COLOR='#2563EB' PORTLESS_APP_NAME='iphoto-disk-cleanup' VITE_DEFAULT_API_ENDPOINT='http://10.0.1.5:8090' VITE_DEFAULT_EMAIL='admin@lablup.com' VITE_DEFAULT_PASSWORD='wJalrXUt' pnpm dev
```

For non-webui projects, substitute the discovered command and package manager. Use whatever color env var the project actually reads (check `vite.config.*`, `next.config.*`, etc., or grep for `*THEME_HEADER_COLOR` / `*_THEME_COLOR`). Apply the prefix only when (a) a color is actually resolved AND (b) the project really consumes that env var. If either is false, skip the prefix. `PORTLESS_APP_NAME` and `VITE_DEFAULT_API_ENDPOINT` are webui-specific.

## 4. Run it

Use the Bash tool with `run_in_background: true` since dev servers are long-running. State in one short sentence what you're doing — e.g. `"Starting dev server with header color #2563EB (blue)."` — and which color name (if any) the env was derived from. Don't paste the env table.

## 5. Advertise the server on every PR it serves (webui)

On a box that has joined the dev gateway (`~/.config/fw/dev-gw.json`), every open PR this
server serves gets one comment carrying a URL a reviewer can open, and the boot is recorded
on disk for later tooling. `.claude/skills/dev-server/scripts/advertise.sh` does all of it —
this skill only calls it, and repeats what it prints.

**Before boot** (step 4), resolve the app name and the record path:

```bash
eval "$(bash .claude/skills/dev-server/scripts/advertise.sh boot-env)"
```

That exports `BAI_DEV_APP` and `BAI_REVIEW_BOOT_RECORD=~/.local/state/fw/dev-servers/<app>.json`.
Add `BAI_REVIEW_BOOT_RECORD` to the `pnpm dev` env prefix — **the dev server must have it in
its environment, but the file is only written after boot**, since the record describes a name
Portless has actually claimed. `boot-env` resolves that name with `scripts/portless-app-name.mjs`,
the same module `dev.mjs` uses, so the prediction cannot drift from what `dev.mjs` requests
(`portless <app> --force` claims exactly it). When `boot-env` prints nothing — Portless will
auto-derive a name — skip this whole section.

**After boot**, once Portless has printed its URL and `portless-doctor` has run:

```bash
bash .claude/skills/dev-server/scripts/advertise.sh advertise --app "$BAI_DEV_APP" --pid <dev.mjs pid>
```

Idempotent: run it again and it edits the same comments. Pass `--teams-thread <url>` (for the
running PR) or `--teams-thread <pr>=<url>` when Jira has no thread recorded for a PR.

**On teardown**, after killing the dev server by pid:

```bash
bash .claude/skills/dev-server/scripts/advertise.sh stop --app "$BAI_DEV_APP"
```

### What the script guarantees

- **A `.localhost` URL never reaches GitHub.** The advertised URL is `share_base` from the
  gateway config with the claimed app name substituted — plain `http`, no port. A box that
  has not joined, a gateway joined with a different Portless port, or a URL that does not
  answer `X-Portless: 1` yields one printed line and no comment. Repeat that line to the
  user; never route around it.
- **One comment per box per PR**, found by the hidden marker `<!-- bai-dev-server box=<box> -->`
  and edited, never duplicated. Another box's `--force` takeover of the same app name carries
  a different marker, so it cannot touch this box's comment.
- **The comment carries the URL and, for a stack, `serves stack #a → #b → #c (running: #c)` —
  nothing else.** The repo is public: no endpoint, e-mail or password ever goes in it (the dev
  bundle already pre-fills login).
- **The served set** is the current branch plus every layer below it from `gh stack view --json`,
  open PRs only; an unstacked branch serves one PR.
- **The Teams thread** for each served PR comes from that PR's `Resolves … (FR-XXXX)` key and one
  Jira GET (`customfield_10176`) at boot — never at request time. Missing is recorded as `null`.

Logic that needs no network is unit-tested: `bash .claude/skills/dev-server/scripts/test-advertise.sh`.

## 6. Announce both URLs to the user

Once the server is up, tell the user **both** the Portless (HTTPS) URL and the underlying React (HTTP) URL on separate lines so they can pick whichever they prefer. Do this only after both are actually known — don't fabricate ports.

### For backend.ai-webui

- **Portless URL** — **always read from Portless's stdout**, do not construct it yourself:
  - Portless prints the full URL (scheme + host + port) on startup, e.g. `https://fr-2701.localhost:1356`. Read that line from the background task's output and use it verbatim.
  - **Never assume port `1355`.** The `dev.mjs` script *requests* `-p 1355`, but if another Portless daemon is already bound there (e.g. another Claude session / worktree), the new instance ends up on a different port (1356, 1357, …). The skill author repeatedly got this wrong by quoting "1355" from this doc instead of reading the actual log line.
  - Same rule for the subdomain: even though step 2b decided the app name, take the hostname Portless prints — it's the source of truth in case Portless re-sanitized or fell back.
- **React URL** — the local Vite dev server URL:
  - The webui uses **Vite** (`VITE v6.x ready in <ms>` line), so the `Local:` URL is printed within ~1s of startup — no need to wait for a long bundle compile.
  - If the user passed `PORT=<n>`, the URL is `http://127.0.0.1:<n>/` (Portless launches Vite with `HOST=127.0.0.1`, so Vite prints `127.0.0.1` not `localhost`).
  - Otherwise Portless picks a free port and exports it via `PORT=<n>`; read the React dev server output for the `Local:   http://127.0.0.1:<port>/` line. Do not pick a port at random.

Run a short Bash with an until-loop polling the background bash's output file for **both** the Portless URL line (the `https://…localhost:<port>` line Portless prints on startup) and Vite's `Local:` line (fallback bound ~10–15s, since Vite is fast). Once both URLs are known, present them like this — exactly two lines, no preamble:

```
Portless: https://fr-2701.localhost:1356
React:    http://127.0.0.1:4627/
```

The Portless port shown above is just an example — use whatever Portless actually printed.

If after ~15s the React URL still hasn't appeared (very rare with Vite), announce just the Portless URL and tell the user the React port hasn't been printed yet — don't block indefinitely.

### For other projects

Many projects don't use Portless. Read the dev server's stdout for whatever URL(s) it prints (Vite typically prints `Local:` and `Network:`; Next.js prints `started server on http://localhost:3000`; etc.) and forward all of them to the user verbatim. If the project does use Portless, follow the webui rules above.

## 7. Edge cases

- **User overrides via env (webui)**: Vite's `loadEnv()` reads `VITE_THEME_HEADER_COLOR`, `VITE_DEFAULT_API_ENDPOINT`, `VITE_DEFAULT_EMAIL`, `VITE_DEFAULT_PASSWORD` from `.env.development.local` and from the shell automatically. If the user already has any of them set, do not override — the user-set value wins. For `PORTLESS_APP_NAME`, the same rule applies: if it's already exported in the inherited env, treat the user-set value as authoritative.
- **User overrides via prompt**: if the user says "use a green header" or "no color this time" or "name the dev URL <foo>" or "ignore the PR's IP, use 10.0.0.7 instead", honor their words over the conversation-history and PR-description values.
- **Multiple Claude windows / worktrees**: each Claude Code session has its own conversation, so both color and app name are naturally session-scoped. Don't try to read either from disk — there's no shared state (built-in `/color` and `/rename` are in-memory only). For `VITE_DEFAULT_API_ENDPOINT`, the *PR* is the shared source of truth; reading it via `gh pr view` works the same from any worktree on that branch.
- **No `/color` in history but user mentioned a color**: treat the user's mention as the source of truth. If they said "use orange", map `orange` → `#EA580C` and prefix accordingly.
- **PR description mentions multiple addresses or none**: take the **first** match for the multi-match case; for the no-match case, omit `VITE_DEFAULT_API_ENDPOINT` rather than guessing. The login form will fall back to `localStorage` / `config.toml` like before.

## 8. Out of scope

- Don't write any color file (`.claude/.fw-color`, `.env.development.local`, etc.).
- **The sanctioned side effects are exactly three**: the env var prefix, and — on a
  gateway-joined box — the dev-server comment on each served PR plus the boot record under
  `~/.local/state/fw/dev-servers/`, both written only by `advertise.sh` (step 5). Nothing
  else touches GitHub, Jira or disk: no labels, no PR body edits, no reviewers, no registry
  entries, and never a comment on a PR this server does not serve.
- Don't install deps, run lint, or do any other "while we're here" steps. Just start the
  server and advertise it.
