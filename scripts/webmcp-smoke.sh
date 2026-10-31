#!/usr/bin/env bash
# Smoke-test the WebUI's app-shell WebMCP tools (ADR 0017) through agent-browser.
# Usage and exit codes: scripts/webmcp-smoke.sh --help

set -uo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/webmcp-smoke.sh [options] <webui-url>

Opens <webui-url> in an agent-browser session and checks that the WebUI's
app-shell WebMCP tools (bai_whoami, bai_get_current_page, bai_navigate) are
registered and answer: bai_whoami and bai_get_current_page return without an
error, and bai_navigate rejects an unknown key with invalid_input. It never
navigates.

Options:
  --session <name>  agent-browser session to use (default: $AGENT_BROWSER_SESSION).
                    It must already be logged in to the WebUI, unless --auth is given.
  --auth <name>     Log in first with this agent-browser auth-vault profile
                    (created with `agent-browser auth save <name> --url <webui-url>
                    --username <email> --password-stdin`). Skipped when the session
                    is already logged in.
  --timeout <sec>   How long to wait for login and tool registration (default: 20).
  --close           Close the session when done (default: leave it open).
  -h, --help        Show this help.

agent-browser reads its own environment, so launch options stay out of this
script, e.g.:
  AGENT_BROWSER_ARGS="--no-sandbox"      Linux boxes whose Chrome needs it
  AGENT_BROWSER_IGNORE_HTTPS_ERRORS=1    the dev server's Portless certificate
They apply when the session's browser launches; close the session to change them.

Exit codes:
  0  every check passed
  1  a tool check failed
  2  usage error, or agent-browser could not open the page
  3  not logged in, or --auth failed: the global tools register only after login
  4  the deployment serves enableWebMCP = false in /config.toml
  5  the browser has no WebMCP (an attached --cdp browser, or --no-webmcp)
EOF
}

SESSION="${AGENT_BROWSER_SESSION:-}"
AUTH=""
TIMEOUT=20
CLOSE=0
URL=""

# `shift 2` on a last argument shifts nothing, so the loop would never end.
need_value() {
  if [ "$2" -lt 2 ]; then
    echo "$1 needs a value." >&2
    usage >&2
    exit 2
  fi
}

while [ $# -gt 0 ]; do
  case "$1" in
    --session) need_value "$1" "$#"; SESSION="$2"; shift 2 ;;
    --auth) need_value "$1" "$#"; AUTH="$2"; shift 2 ;;
    --timeout) need_value "$1" "$#"; TIMEOUT="$2"; shift 2 ;;
    --close) CLOSE=1; shift ;;
    -h | --help) usage; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
    *) URL="$1"; shift ;;
  esac
done

if [ -z "$URL" ]; then
  usage >&2
  exit 2
fi
if [ -z "$SESSION" ]; then
  echo "No agent-browser session: pass --session <name> or set AGENT_BROWSER_SESSION." >&2
  echo "(The default session is shared by every agent on this machine.)" >&2
  exit 2
fi
if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || [ "$TIMEOUT" -lt 1 ]; then
  echo "--timeout must be a positive number of seconds." >&2
  exit 2
fi
for bin in agent-browser node; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "$bin is not on PATH." >&2
    exit 2
  fi
done

TOOLS=(bai_whoami bai_get_current_page bai_navigate)

ab() {
  agent-browser --session "$SESSION" "$@"
}

# Prints the JS expression $1 evaluated against the parsed JSON on stdin as
# `d`; objects are printed as JSON, missing values as an empty string.
jget() {
  # shellcheck disable=SC2016 # a JavaScript template literal, not shell
  node -e '
    let raw = "";
    process.stdin.on("data", (chunk) => (raw += chunk)).on("end", () => {
      let value;
      try {
        value = new Function("d", `return (${process.argv[1]});`)(JSON.parse(raw));
      } catch {
        value = undefined;
      }
      if (value === undefined || value === null) return;
      process.stdout.write(typeof value === "object" ? JSON.stringify(value) : String(value));
    });
  ' "$1"
}

# Evaluates page JavaScript; prints the result, or nothing when evaluation failed.
page_js() {
  printf '%s' "$1" | ab --json eval --stdin 2>/dev/null | jget 'd.success ? d.data.result : undefined'
}

ROWS=()
FAILED=0
row() {
  ROWS+=("$1"$'\t'"$2"$'\t'"$3")
  if [ "$2" = FAIL ]; then FAILED=1; fi
}

DIAGNOSIS=""
EXIT_CODE=0
diagnose() {
  if [ -z "$DIAGNOSIS" ]; then
    DIAGNOSIS="$1"
    EXIT_CODE="$2"
  fi
}

skip_tool_checks() {
  local reason="$1" tool
  for tool in "${TOOLS[@]}"; do row "tool.$tool" SKIP "$reason"; done
  row "invoke.bai_whoami" SKIP "$reason"
  row "invoke.bai_get_current_page" SKIP "$reason"
  row "invoke.bai_navigate(invalid)" SKIP "$reason"
}

report() {
  echo
  {
    printf 'CHECK\tRESULT\tDETAIL\n'
    printf '%s\n' "${ROWS[@]}"
  } | column -t -s $'\t'
  echo
  if [ -n "$DIAGNOSIS" ]; then
    echo "DIAGNOSIS: $DIAGNOSIS"
  fi
  if [ "$FAILED" -eq 0 ]; then
    echo "RESULT: PASS"
  else
    echo "RESULT: FAIL"
    if [ "$EXIT_CODE" -eq 0 ]; then EXIT_CODE=1; fi
  fi
  if [ "$CLOSE" -eq 1 ]; then
    ab close >/dev/null 2>&1 || true
  fi
  exit "$EXIT_CODE"
}

READY_JS='globalThis.backendaiclient?.ready === true'

wait_ready() {
  ab wait --fn "$READY_JS" --timeout "$1" >/dev/null 2>&1
}

open_page() {
  local open_json
  open_json="$(ab --json open "$URL" 2>/dev/null)"
  if [ "$(printf '%s' "$open_json" | jget 'd.success')" != true ]; then
    row "page.open" FAIL "$(printf '%s' "$open_json" | jget 'd.error' | head -c 160)"
    diagnose "open_failed — agent-browser could not load the page. For a Portless dev server set AGENT_BROWSER_IGNORE_HTTPS_ERRORS=1 and close the session so it relaunches." 2
    skip_tool_checks "page did not open"
    report
  fi
  ab wait --load load >/dev/null 2>&1
}

echo "webmcp-smoke: $URL (session: $SESSION)"

# --- 1. Open the page -------------------------------------------------------
open_page
row "page.open" PASS "$(page_js 'location.href')"

# --- 2. Does the browser expose WebMCP? --------------------------------------
list_json="$(ab --json webmcp list 2>/dev/null)"
list_code="$(printf '%s' "$list_json" | jget 'd.success ? "" : (d.code || d.error)')"
has_model_context="$(page_js 'typeof document.modelContext')"
webmcp_ok=1
if [ -n "$list_code" ]; then
  webmcp_ok=0
  row "browser.webmcp" FAIL "$list_code"
  diagnose "browser_unsupported ($list_code) — WebMCP needs a Chrome that agent-browser launched itself; an attached --cdp browser cannot list page tools." 5
elif [ "$has_model_context" != object ]; then
  webmcp_ok=0
  row "browser.webmcp" FAIL "document.modelContext is ${has_model_context:-unreadable}"
  diagnose "browser_unsupported — this Chrome exposes no document.modelContext (launched with --no-webmcp, or not launched by agent-browser)." 5
else
  row "browser.webmcp" PASS "document.modelContext present"
fi

# --- 3. Is the WebUI configured to register tools? ---------------------------
# The app's relative fetch resolves against <base href>, not the page URL
# (react/src/hooks/useWebUIConfig.ts). Only an explicit false stops here: login
# can merge the webserver's config, so the registered tools have the last word.
WEBMCP_DISABLED_HINT="webmcp_disabled — the deployment turned the tools off with enableWebMCP = false under [general] in /config.toml. Remove the key or set it to true."
config_state="$(page_js 'fetch(new URL("../../config.toml", document.baseURI), { cache: "no-store" })
  .then((r) => {
    if (!r.ok) return "unreadable";
    return r.text().then((t) => {
      const general = t.split(/^\s*\[/m).find((s) => s.startsWith("general]")) ?? "";
      const m = general.match(/^\s*enableWebMCP\s*=\s*([^\s#]+)/m);
      if (!m) return "unset";
      return m[1] === "true" || m[1] === "false" ? m[1] : "other";
    });
  })
  .catch(() => "unreadable")')"
case "${config_state:-unreadable}" in
  true) row "config.enableWebMCP" PASS "true" ;;
  unset) row "config.enableWebMCP" PASS "unset (on by default)" ;;
  false)
    webmcp_ok=0
    row "config.enableWebMCP" FAIL "false (/config.toml [general])"
    diagnose "$WEBMCP_DISABLED_HINT" 4
    ;;
  *) row "config.enableWebMCP" SKIP "${config_state:-unreadable} in /config.toml; decided by the tool checks" ;;
esac

if [ "$webmcp_ok" -eq 0 ]; then
  if [ -n "$AUTH" ]; then row "auth.login" SKIP "WebMCP is unavailable"; fi
  row "session.login" SKIP "WebMCP is unavailable"
  skip_tool_checks "WebMCP is unavailable"
  report
fi

# --- 4. Logged in? ------------------------------------------------------------
timeout_ms=$((TIMEOUT * 1000))
logged_in=0
if [ -n "$AUTH" ]; then
  # A logged-in page shows no login form, so `auth login` fails on it. The grace
  # period lets a kept session restore itself first.
  grace_ms=5000
  if [ "$timeout_ms" -lt "$grace_ms" ]; then grace_ms="$timeout_ms"; fi
  if wait_ready "$grace_ms"; then
    row "auth.login" SKIP "session already logged in"
    logged_in=1
  elif ab auth login "$AUTH" >/dev/null 2>&1; then
    row "auth.login" PASS "auth-vault profile '$AUTH'"
    # `auth login` lands on the profile's URL, which may not be this page.
    open_page
  else
    row "auth.login" FAIL "agent-browser auth login $AUTH failed"
    row "session.login" SKIP "login failed"
    diagnose "auth_failed — check the profile with 'agent-browser auth show $AUTH'; the WebUI login form also needs its API endpoint preset (config.toml apiEndpoint)." 3
    skip_tool_checks "needs login"
    report
  fi
fi

if [ "$logged_in" -eq 1 ] || wait_ready "$timeout_ms"; then
  row "session.login" PASS "backendaiclient ready"
else
  row "session.login" FAIL "not logged in after ${TIMEOUT}s"
  diagnose "not_logged_in — WebMCP works (browser and config are fine), but the WebUI registers its global tools only after login. Log in within session '$SESSION', or pass --auth <vault-name>." 3
  skip_tool_checks "needs login"
  report
fi

# --- 5. Are the global tools registered? --------------------------------------
missing=("${TOOLS[@]}")
deadline=$((SECONDS + TIMEOUT))
while :; do
  names="$(ab --json webmcp list 2>/dev/null | jget 'd.success ? d.data.tools.map((t) => t.name).join(" ") : ""')"
  still=()
  for tool in "${missing[@]}"; do
    case " $names " in *" $tool "*) ;; *) still+=("$tool") ;; esac
  done
  # The `+` form: an empty array expansion is unbound under set -u on bash < 4.4.
  missing=(${still[@]+"${still[@]}"})
  if [ "${#missing[@]}" -eq 0 ] || [ "$SECONDS" -ge "$deadline" ]; then break; fi
  sleep 1
done
in_page=""
if [ "${#missing[@]}" -gt 0 ]; then
  # Chrome's own view: tells "never registered" apart from "agent-browser cannot see it".
  in_page="$(page_js 'Promise.resolve(document.modelContext?.getTools?.() ?? [])
    .then((tools) => Array.from(tools, (t) => t.name).join(" "))
    .catch(() => "")')"
fi
for tool in "${TOOLS[@]}"; do
  case " ${missing[*]:-} " in
    *" $tool "*)
      case " $in_page " in
        *" $tool "*)
          row "tool.$tool" FAIL "registered in the page, but agent-browser does not list it"
          diagnose "browser_unsupported — the page registered its tools but agent-browser cannot see them. Relaunch the session without --no-webmcp / --cdp." 5
          ;;
        *) row "tool.$tool" FAIL "not registered after ${TIMEOUT}s" ;;
      esac
      ;;
    *) row "tool.$tool" PASS "listed" ;;
  esac
done
if [ "${#missing[@]}" -gt 0 ] && [ -z "$DIAGNOSIS" ]; then
  client_config="$(page_js 'globalThis.backendaiclient?._config?.enableWebMCP')"
  if [ "$client_config" = false ]; then
    row "config.client" FAIL "backendaiclient._config.enableWebMCP is false"
    diagnose "$WEBMCP_DISABLED_HINT" 4
  fi
fi

# --- 6. Invoke them ------------------------------------------------------------
invoke() {
  ab --json webmcp invoke "$1" --params "$2" 2>/dev/null
}

whoami_json="$(invoke bai_whoami '{}')"
if [ "$(printf '%s' "$whoami_json" | jget 'd.success && d.data.status === "completed" && !d.data.output.error')" = true ]; then
  row "invoke.bai_whoami" PASS "role=$(printf '%s' "$whoami_json" | jget 'd.data.output.role')"
else
  row "invoke.bai_whoami" FAIL "$(printf '%s' "$whoami_json" | jget 'd.success ? d.data.output : (d.code || d.error)' | head -c 160)"
fi

page_json="$(invoke bai_get_current_page '{}')"
page_path="$(printf '%s' "$page_json" | jget 'd.success && d.data.status === "completed" && !d.data.output.error && typeof d.data.output.path === "string" ? d.data.output.path : undefined')"
if [ -n "$page_path" ]; then
  row "invoke.bai_get_current_page" PASS "path=$page_path"
else
  row "invoke.bai_get_current_page" FAIL "$(printf '%s' "$page_json" | jget 'd.success ? d.data.output : (d.code || d.error)' | head -c 160)"
fi

nav_json="$(invoke bai_navigate '{"unexpected":true}')"
nav_code="$(printf '%s' "$nav_json" | jget 'd.success ? d.data.output && d.data.output.error && d.data.output.error.code : undefined')"
if [ "$nav_code" = invalid_input ]; then
  row "invoke.bai_navigate(invalid)" PASS "error.code=invalid_input"
else
  row "invoke.bai_navigate(invalid)" FAIL "expected invalid_input, got: $(printf '%s' "$nav_json" | jget 'd.success ? d.data.output : (d.code || d.error)' | head -c 160)"
fi

report
