---
name: serve-release
description: >
  Download a released backend.ai-webui bundle from GitHub Releases and serve it
  locally via Portless so the URL carries the version name
  (e.g. `https://v26-4-8-rc-3.localhost:1355`). Uses `scripts/serve-release.sh`
  under the hood, which fetches the bundle, copies the local `config.toml` /
  plugins into the extracted folder, and runs `serve` behind Portless.
  Trigger on: "릴리즈 띄워", "릴리즈 버전 실행", "serve release", "run release",
  "release 띄워줘", "특정 버전 띄워줘", "released bundle 띄워줘", "stage release",
  or any request that names a specific webui release version (e.g. "v26.4.8-rc.3
  실행해줘", "26.4.7 띄워줘").
---

# Serve Release

Serves an already-published `backend.ai-webui` release bundle locally so it can
be tested under a stable, version-named Portless URL. Wraps
`scripts/serve-release.sh` — do not reinvent the download/extract logic.

## 1. Resolve the version

Pick a version with this priority:

1. **User-provided version in the prompt** — accept `26.4.8-rc.3`, `v26.4.8-rc.3`,
   or a release URL (`.../releases/tag/v26.4.8-rc.3`). Strip the leading `v` if
   present; everything downstream uses the bare semver.
2. **Most recent release** — if the user said "릴리즈 띄워줘" without a version,
   fetch the latest tag with:
   ```bash
   gh release list --repo lablup/backend.ai-webui --limit 10
   ```
   Show the top 5–10 entries with `AskUserQuestion` so the user can pick (include
   stable and prerelease releases; mark prereleases). Do **not** silently default
   to the absolute latest — the user usually wants a specific one.
3. **Tag exists check** — before running the script, confirm the tag exists:
   ```bash
   gh release view v<VERSION> --repo lablup/backend.ai-webui --json tagName -q .tagName
   ```
   If the tag does not exist, surface the error and offer the `gh release list`
   output so the user can correct the version. Do not try fuzzy matching.

The bundle asset must exist on the release. The script downloads
`backend.ai-webui-bundle-<VERSION>.zip` from
`https://github.com/lablup/backend.ai-webui/releases/download/v<VERSION>/...`.
If the user picked a release where this asset is missing (rare, mostly for
hotfix-only tags), the `curl` step will fail with 404 — surface the failure and
suggest a different version rather than retrying.

## 2. Pre-flight checks

Before invoking the script, verify:

- **`config.toml` exists** in the project root. The script copies it into the
  extracted folder so the served bundle points at your local backend. If missing,
  copy `config.toml.sample` to `config.toml` first and remind the user to edit
  endpoints if needed.
- **`serve` is on PATH** (`command -v serve`). If absent, tell the user to run
  `npm install -g serve` — the script also errors with the same hint.
- **`portless` is on PATH** (`command -v portless`). If absent, the script
  silently falls back to plain `serve` on `http://localhost:<SERVE_PORT>`; tell
  the user the URL will be HTTP-only without Portless and suggest
  `npm install -g portless` (or `pnpm add -g portless`) if they want the
  named-subdomain experience.

## 3. Decide ports

The script reads two optional env vars:

- `SERVE_PORT` — the HTTP port `serve` listens on (default `9091`). Pin only
  if the user asked for a specific port, or `9091` is occupied.
- `PORTLESS_PORT` — the Portless daemon port (default `1355`, same as
  `scripts/dev.mjs`). Do not change unless the user explicitly asks.

Quick check for port conflict on the default:

```bash
lsof -nP -iTCP:9091 -sTCP:LISTEN 2>/dev/null | head -1
```

If something's already on `9091`, pick the next free port in the 9091–9099 range
and pass `SERVE_PORT=<port>`.

## 4. Compute the Portless URL

The script derives the Portless app slug from the version. Replicate the same
sanitization so you can announce the URL before the server is fully up:

```
v<VERSION> -> lowercased
            -> [^a-z0-9-] replaced with -
            -> repeated - collapsed
            -> leading/trailing - trimmed
            -> capped at 40 chars
```

Examples:
- `26.4.8-rc.3` -> app `v26-4-8-rc-3` -> `https://v26-4-8-rc-3.localhost:1355`
- `26.4.7`      -> app `v26-4-7`      -> `https://v26-4-7.localhost:1355`
- `25.7.1`      -> app `v25-7-1`      -> `https://v25-7-1.localhost:1355`

Use the standard daemon port (`1355`) unless the user pinned `PORTLESS_PORT`.

## 5. Run the script

Always run **in the background** — `serve-release.sh` blocks on `serve`/`portless`
and the user will need their shell back to interact with the served instance.
Run from the project root so the `config.toml` and `dist/plugins` lookup paths
resolve correctly.

Default invocation:

```bash
./scripts/serve-release.sh <VERSION>
```

With a custom serve port:

```bash
SERVE_PORT=9092 ./scripts/serve-release.sh <VERSION>
```

Use `run_in_background: true` and announce in one short sentence what's
happening (e.g. *"Downloading v26.4.8-rc.3 bundle and serving via Portless at
https://v26-4-8-rc-3.localhost:1355."*).

## 6. Wait for the ready signal

The script prints a few stages — download, extract, copy `config.toml`, then
finally Portless + `serve` startup. The script's own `Press Ctrl+C to stop the
server` line is printed *before* `exec portless ... -- serve`, so it tells you
the script is about to hand off, not that the port is bound.

Poll the background task's output with a short until-loop (cap ~30s for first
download, ~5s if the bundle is cached) for **the line `serve` itself emits
once it's actually listening** — typically `Accepting connections at` (the
"INFO" banner from the `serve` npm package). That's the earliest moment HTTP
requests will succeed. If you also see Portless's `→ https://<app>.localhost…`
banner, that's confirmation Portless registered the subdomain — but `serve`'s
own readiness line is the reliable one.

If `curl` fails (404 / network error), the script exits non-zero — surface the
last ~20 lines of output to the user and don't pretend it's running.

## 7. Announce both URLs

After the server is up, present **two** URLs on separate lines so the user can
pick whichever they prefer — Portless (HTTPS, named) and direct (HTTP, port).
Format exactly like this, no preamble:

```
Portless: https://v26-4-8-rc-3.localhost:1355
Direct:   http://localhost:9091
```

If Portless wasn't available and the script fell back to plain `serve`, show
only the Direct line and call out the fallback once.

## 8. Common follow-ups

- **"Stop the server"** — kill the background task. Don't `portless proxy stop`
  unless asked; that kills *all* portless apps including any running dev server.
- **"Serve a different version"** — stop the current background task first
  (port collision otherwise), then invoke the script with the new version.
- **"Switch the backend endpoint"** — the served bundle uses the project-root
  `config.toml` that was copied at script-start. To change endpoints, edit
  `config.toml`, then **restart** the script (the in-place copy is one-shot).
- **Cached extraction** — the script reuses `scripts/temp-releases/webui-<VERSION>/`
  if it exists, skipping download. If the user reports stale content, delete that
  directory and rerun.

## 9. Out of scope

- Do not modify `scripts/serve-release.sh` for one-off behaviour changes —
  prefer driving via env vars (`SERVE_PORT`, `PORTLESS_PORT`).
- Do not try to install `serve` or `portless` for the user; surface the missing
  binary and let them choose.
- Do not run alongside `pnpm dev` on the same Portless daemon if you suspect a
  port conflict between `serve` (9091) and the React dev server (Portless picks
  free port, but pinned `PORT=9081`/etc. from the user could collide). When in
  doubt, check `lsof` first.
