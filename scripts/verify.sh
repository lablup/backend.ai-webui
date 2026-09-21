#!/bin/bash
# Verification harness for Claude Code agents.
# Run from project root: bash scripts/verify.sh
# Agents should check for "=== ALL PASS ===" in the output.
#
# Stage 0 rebuilds the committed generated artifacts (Relay, search index)
# and waits — TypeScript reads __generated__ and the Vitest lane reads the
# search index. Every other check is a lane: lanes run in parallel, each
# writing its own log under $LOG_DIR, and are reported in a fixed order once
# all have finished — PASS prints one line plus the lane's `>>` scope notes,
# FAIL prints the tail of the lane's log. Wall time is stage 0 + the slowest
# lane instead of the sum.
#
# Lint (react, backend.ai-ui), Format and the Vitest lanes look only at what
# this branch changed relative to main; without a main to compare against
# they fall back to the whole tree.
#
#   VERIFY_BASE=<ref> compare against this ref instead of the merge-base with
#                     main (a stack parent, or HEAD for uncommitted work only)
#   VERIFY_SERIAL=1   run lanes one at a time (debugging, small machines)
#   VERIFY_TESTS=1    add the Vitest suites CI runs (react, backend.ai-ui,
#                     agent-cli, root), limited to tests that import a
#                     changed file
#   VERIFY_TAIL=60    lines of a failed lane's log to print
#   VERIFY_LOG_DIR    lane logs, default node_modules/.cache/verify

set -uo pipefail
cd "$(dirname "$0")/.."

LOG_DIR="${VERIFY_LOG_DIR:-node_modules/.cache/verify}"
TAIL="${VERIFY_TAIL:-60}"
case "$TAIL" in '' | *[!0-9]*) TAIL=60 ;; esac
if ! { rm -rf "$LOG_DIR" && mkdir -p "$LOG_DIR"; }; then
  echo "cannot create lane log dir $LOG_DIR"
  exit 1
fi

FAIL=0
LANE_KINDS=()
LANE_NAMES=()
LANE_SLUGS=()

# Scope note: shown even when the lane passes, so the output says what was
# actually checked (changed files vs full tree, fallbacks, skipped parts).
note() { echo ">> $*"; }

# Run a package-local binary directly: `pnpm exec` costs ~1.5s of start-up per
# call, and the packages pin different TypeScript majors, so the binary must be
# the package's own, not the root one.
bin() { # bin <package dir> <binary> [args...]
  local dir="$1" name="$2"
  shift 2
  if [ -x "$dir/node_modules/.bin/$name" ]; then
    (cd "$dir" && "./node_modules/.bin/$name" "$@")
  else
    (cd "$dir" && pnpm exec "$name" "$@")
  fi
}

# start_lane <gate|report> <name> <command...>
# `report` lanes print their output and never affect the exit code.
start_lane() {
  local kind="$1" name="$2"
  shift 2
  local slug
  slug=$(printf '%s' "$name" | tr -c 'A-Za-z0-9' '-')
  LANE_KINDS+=("$kind")
  LANE_NAMES+=("$name")
  LANE_SLUGS+=("$slug")
  (
    SECONDS=0
    "$@" > "$LOG_DIR/$slug.log" 2>&1
    echo "$? $SECONDS" > "$LOG_DIR/$slug.rc"
  ) &
  [ -n "${VERIFY_SERIAL:-}" ] && wait $!
  return 0
}

report_lane() { # report_lane <index>
  local kind="${LANE_KINDS[$1]}" name="${LANE_NAMES[$1]}" slug="${LANE_SLUGS[$1]}"
  local rc=1 secs=0
  if [ -s "$LOG_DIR/$slug.rc" ]; then
    read -r rc secs < "$LOG_DIR/$slug.rc" || { rc=1; secs=0; }
  fi
  echo "=== $name ==="
  if [ "$kind" = report ]; then
    cat "$LOG_DIR/$slug.log"
    echo "--- $name: REPORT (${secs}s) ---"
  elif [ "$rc" -eq 0 ] 2>/dev/null; then
    grep '^>> ' "$LOG_DIR/$slug.log" || true
    echo "--- $name: PASS (${secs}s) ---"
  else
    tail -n "$TAIL" "$LOG_DIR/$slug.log"
    echo "(full log: $LOG_DIR/$slug.log)"
    echo "--- $name: FAIL (${secs}s) ---"
    FAIL=1
  fi
  echo ""
}

# Sets CHANGED_BASE (merge-base with main) and CHANGED_FILES (paths this branch
# touched relative to it, committed or not, plus untracked; deleted ones
# dropped). Returns 1 when there is no main to compare against.
changed_since_main() {
  CHANGED_BASE=$(git rev-parse --verify --quiet "${VERIFY_BASE:-}^{commit}" 2>/dev/null \
    || git merge-base HEAD origin/main 2>/dev/null \
    || git merge-base HEAD main 2>/dev/null || true)
  [ -n "$CHANGED_BASE" ] || return 1
  CHANGED_FILES=$({ git diff --name-only --diff-filter=ACMR "$CHANGED_BASE" --
                    git ls-files --others --exclude-standard; } \
    | sort -u \
    | while IFS= read -r f; do [ -f "$f" ] && echo "$f"; done)
  return 0
}

check_relay_drift() {
  # Relay generated artifacts are committed (see relay.dev production setup);
  # compiling and finding __generated__ dirty means a missing `pnpm relay` run.
  bin . relay-compiler || return 1
  bash scripts/check-generated-drift.sh Relay "pnpm relay" \
    react/src/__generated__ \
    packages/backend.ai-ui/src/__generated__
}

check_search_index_drift() {
  # The committed index is what ships — see docs/adr/0003-committed-search-index-artifact.md.
  pnpm --prefix ./react run search-index || return 1
  bash scripts/check-generated-drift.sh "Search index" "pnpm run search-index" \
    react/src/generated/searchIndex.json
}

# lint_changed <package dir> <path regex>: the package's `lint:files` on the
# changed files under it. Nothing to lint is a pass — an untouched file's
# result cannot differ from main's, which CI linted in full.
lint_changed() {
  local dir="$1" list
  list=$(printf '%s\n' "$CHANGED_FILES" \
    | grep -E "^$2.*\.(js|jsx|mjs|cjs|ts|tsx|json|snap)$" \
    | grep -vE '/__generated__/|\.graphql\.' \
    | sed "s#^$dir/##")
  if [ -z "$list" ]; then
    note "$dir: no changed files"
    return 0
  fi
  note "$dir: $(printf '%s\n' "$list" | wc -l | tr -d ' ') changed file(s)"
  printf '%s\n' "$list" | xargs pnpm --prefix "$dir" run lint:files
}

check_lint() {
  # react and backend.ai-ui: every rule is per-file, so linting only the files
  # this branch changed is as exact as `lint:ci`'s content cache — and the
  # cache does not exist in a fresh worktree. A lint-config or dependency
  # change invalidates every file, hence the full run. backend.ai-client and
  # backend.ai-agent-cli stay full: their type-aware no-floating-promises rule
  # can flag a caller whose own content is unchanged.
  if ! changed_since_main; then
    note "no merge-base with main — full lint"
    pnpm -r --stream lint:ci
    return
  fi
  if printf '%s\n' "$CHANGED_FILES" \
    | grep -qE '(^|/)(eslint\.config\.[cm]?js|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|i18n\.schema\.json)$|^packages/eslint-config-bai/'; then
    note "lint config or dependencies changed — full lint"
    pnpm -r --stream lint:ci
    return
  fi
  local rc=0
  lint_changed react 'react/(src|vite-plugins)/' || rc=1
  lint_changed packages/backend.ai-ui 'packages/backend\.ai-ui/src/' || rc=1
  pnpm -r --stream --filter backend.ai-client --filter backend.ai-agent-cli lint:ci || rc=1
  return $rc
}

check_format() {
  # Root legacy sources: whole tree (small). React / BUI / e2e / i18n: only the
  # files this branch touched — the same set lint-staged formats at commit
  # time, so a `--no-verify` commit cannot slip past. A full-tree check needs
  # the pre-existing drift fixed first.
  local rc=0
  pnpm run format || rc=1
  if ! changed_since_main; then
    note "no merge-base with main — changed-file format check skipped"
    return $rc
  fi
  # No full-tree fallback on a config change (unlike Lint): it would fail on
  # the pre-existing drift, so the note is the signal to check the tree by hand.
  if printf '%s\n' "$CHANGED_FILES" \
    | grep -qE '(^|/)(\.prettierrc[^/]*|\.prettierignore|package\.json)$'; then
    note "prettier config or dependencies changed — still only changed files checked; run prettier --check on the tree yourself"
  fi
  local files
  files=$(printf '%s\n' "$CHANGED_FILES" \
    | grep -E '^(react/(src|vite-plugins)|packages/backend\.ai-ui/src|e2e)/.*\.(js|jsx|mjs|cjs|ts|tsx|json|css|scss|md)$|^resources/i18n/[^/]+\.json$' \
    | grep -vE '/__generated__/|^react/src/astryx-theme/built/')
  if [ -z "$files" ]; then
    note "no changed files under react/, packages/backend.ai-ui/, e2e/, resources/i18n/"
    return $rc
  fi
  note "$(printf '%s\n' "$files" | wc -l | tr -d ' ') changed file(s) checked with prettier"
  printf '%s\n' "$files" | xargs node_modules/.bin/prettier --check || rc=1
  return $rc
}

# vitest_lane <package dir>: only the tests that import a file this branch
# changed (`--changed <merge-base>`); the whole suite without main.
vitest_lane() {
  local dir="$1" args="--passWithNoTests"
  if changed_since_main; then
    note "tests related to files changed since ${CHANGED_BASE:0:10}"
    args="$args --changed $CHANGED_BASE"
  else
    note "no merge-base with main — whole suite"
  fi
  # shellcheck disable=SC2086
  bin "$dir" vitest run $args
}

check_warmup_paths() {
  # Every `server.warmup.clientFiles` entry (react/vite.config.ts) must exist:
  # a missing one only logs a `Pre-transform error` and silently shrinks
  # warmup coverage. Paths are relative to vite `root` (= react/).
  local config=react/vite.config.ts
  local missing=0
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    local resolved
    if [[ "$path" == ./* ]] || [[ "$path" == ../* ]]; then
      resolved="react/${path#./}"
      resolved="${resolved/react\/..\//}"
    else
      resolved="react/$path"
    fi
    if [ ! -f "$resolved" ]; then
      echo "  missing: $path (resolved: $resolved)"
      missing=1
    fi
  done < <(awk '/warmup: \{/,/^[[:space:]]*\},/' "$config" \
    | grep -oE "'[^']+'" \
    | tr -d "'" \
    | grep -v '^clientFiles$')
  return $missing
}

check_terminology_drift() {
  # CHECK 1 (avoid-row drift in i18n values + manual prose) blocks in --strict
  # (FR-3049/FR-3373/FR-3374). CHECK 2/3 are advisory, sit at 0 findings and
  # never affect the exit code, so they stay in `pnpm run lint:terminology`.
  # False positive: scripts/terminology-i18n.allowlist.json or an inline
  # `[[i18n-term-ok]]`. CI runs the same checker on a path filter
  # (docs-checks.yml, terminology-content.yml).
  node scripts/check-terminology-i18n.mjs --strict --no-check2 --no-check3
}

check_stylex_injection() {
  # @stylexjs/unplugin appends ALL compiled CSS to one existing CSS asset;
  # without `cssInjectionTarget` (react/vite.config.ts) it picks whichever
  # stylesheet rollup emitted first — possibly a lazy route's. Nothing warns
  # when the predicate stops matching, so: (1) the config must declare it;
  # (2) when a production build is present, the sentinel rule authored in
  # react/src/pages/AstryxStylexProbePage.tsx must land in the entry
  # stylesheet only. Keep STYLEX_SENTINEL in sync with that `sentinel` style.
  local STYLEX_SENTINEL='z-index: ?2147480001'
  local config=react/vite.config.ts

  if ! grep -q 'cssInjectionTarget' "$config"; then
    echo "cssInjectionTarget is missing from $config."
    echo "Without it the StyleX plugin appends authored CSS to an arbitrary"
    echo "code-split stylesheet. Restore the predicate pinning it to"
    echo "assets/index-*.css."
    return 1
  fi

  local assets=react/build/assets
  if [ ! -d "$assets" ]; then
    note "no production build present — config gate only; run" \
      "\`pnpm run build:react-only\` for the full sentinel check"
    return 0
  fi

  local entry_hits other_hits
  entry_hits=$(grep -lE "$STYLEX_SENTINEL" "$assets"/index-*.css 2>/dev/null || true)
  other_hits=$(grep -lE "$STYLEX_SENTINEL" "$assets"/*.css 2>/dev/null \
    | grep -v '/index-' || true)

  if [ -z "$entry_hits" ]; then
    echo "StyleX sentinel not found in the entry stylesheet ($assets/index-*.css)."
    echo "cssInjectionTarget no longer matches the entry CSS asset — authored"
    echo "xstyle/StyleX output is landing somewhere else (or nowhere)."
    [ -n "$other_hits" ] && echo "Found instead in: $other_hits"
    return 1
  fi
  if [ -n "$other_hits" ]; then
    echo "StyleX sentinel leaked into non-entry stylesheets: $other_hits"
    return 1
  fi
  echo "sentinel found in: $entry_hits"
  return 0
}

check_astryx_theme_built() {
  # The committed `astryx theme build` artifacts under
  # react/src/astryx-theme/built/ must match the theme source; `-c` recompiles
  # in memory and exits non-zero on drift. Rebuild procedure: built/index.ts.
  # The theme source imports `backend.ai-ui`, which resolves to its dist, so a
  # fresh worktree needs that package built once.
  if [ ! -f packages/backend.ai-ui/dist/backend.ai-ui.js ]; then
    note "backend.ai-ui dist missing — built it first (once per checkout)"
    pnpm --filter backend.ai-ui run build > /dev/null || return 1
  fi
  bin react astryx theme build -c \
    src/astryx-theme/built/backendai-default.ts \
    -o src/astryx-theme/built/backendai-default-built.css
}

check_astryx_integration() {
  # Astryx CLI discovery skips a `{Name}.doc.ts` that fails the schema with only
  # a stderr warning, silently dropping that BAI* component from the catalog.
  # This re-validates every contribution (errors fail, warnings pass).
  bin react astryx validate-integration backend.ai-ui
}

check_agent_mappings() {
  # `mappings/<Type>.yaml` references types, fields, enum values, terminology
  # concepts and manual headings that other changes can orphan; `doctor
  # --mappings` re-resolves all of them. The build is the CLI's own tsup run.
  pnpm --filter backend.ai-agent-cli run build > /dev/null || return 1
  node packages/backend.ai-agent-cli/dist/cli.js doctor --mappings
}

check_help_anchors() {
  # The header's "?" button opens a manual page#anchor from the hand-curated
  # react/src/helper/helpAnchors.json; a renamed heading turns it into a no-op
  # scroll with nothing failing. Resolves every target against the English
  # manual sources (FR-3773).
  node scripts/check-help-anchors.mjs
}

check_layer_order() {
  # The @layer order statement decides whether the brand theme outranks
  # Astryx's defaults, and both drift and misplacement are invisible at
  # runtime. Same reason as the ladder gate below: index.html-only PRs run no
  # vitest job, so the check lives here too.
  node scripts/migration-gates/layer-order-gate.mjs
}

check_token_gate_report() {
  # Undeclared `var(--name)` produces no compiler, lint or runtime error. The
  # gate has pre-existing findings, so it is report-only here and the bar is
  # "no new findings" (CLAUDE.md § Verification Harness). Counts plus the
  # undeclared usages; the fix hints and the dynamic section stay in the gate.
  node scripts/migration-gates/astryx-token-gate.mjs --strict 2>&1 \
    | awk '/^--- dynamic/ { exit } /^declared custom properties/ || /^  [^ ].*var\(--/'
  return 0
}

# Stage 0: the generated artifacts other lanes read.
start_lane gate "Relay" check_relay_drift
start_lane gate "Search index" check_search_index_drift
wait
report_lane 0
report_lane 1

# The coverage gate fails when a package defines `lint` without `lint:ci`,
# because the full-lint fallback (`pnpm -r lint:ci`) silently skips it.
start_lane gate "Lint script coverage" node scripts/lint-ci-coverage-gate.mjs
start_lane gate "Lint" check_lint
start_lane gate "Format" check_format
start_lane gate "TypeScript" bin react tsc --noEmit --incremental
# The react lane reaches backend.ai-{ui,client} through tsconfig `paths`,
# but nothing pulls in the agent CLI, so it gets its own lane.
start_lane gate "TypeScript (agent-cli)" bin packages/backend.ai-agent-cli tsc --noEmit
# The review overlay client is vendored by the Chrome extension (ADR 0008) and
# built with narrower flags than react's. Deliberately the ROOT TypeScript
# (5.5.4): react's 6.x folded the iterable DOM declarations into the base `DOM`
# lib, so the no-`DOM.Iterable` half of the gate cannot fail there.
start_lane gate "TypeScript (review overlay host seam)" \
  bin . tsc --noEmit -p react/vite-plugins/review-overlay/tsconfig.host.json
start_lane gate "Vite warmup paths" check_warmup_paths
start_lane gate "StyleX cssInjectionTarget" check_stylex_injection
start_lane gate "Astryx theme build" check_astryx_theme_built
start_lane gate "Astryx integration (backend.ai-ui)" check_astryx_integration
start_lane gate "Cascade-layer order" check_layer_order
# vitest.yml's path filter never fires for an index.html-only PR, so the
# ladder mirrors are checked here, always.
start_lane gate "z-index ladder mirrors" node scripts/migration-gates/z-index-ladder-gate.mjs
start_lane gate "Agent mappings" check_agent_mappings
start_lane gate "Help anchors (user manual)" check_help_anchors
start_lane gate "Terminology" check_terminology_drift
# Gates the non-English avoid-row DATA, a separate axis from CHECK 1 above; the
# hard gate is terminology-selftest.yml (FR-3051).
start_lane report "Terminology self-test (report-only here; hard gate in CI)" \
  node scripts/check-terminology-i18n.selftest.mjs
start_lane report "Astryx token gate (report-only; bar is no NEW findings)" \
  check_token_gate_report

if [ -n "${VERIFY_TESTS:-}" ]; then
  start_lane gate "Vitest (react)" vitest_lane react
  start_lane gate "Vitest (backend.ai-ui)" vitest_lane packages/backend.ai-ui
  start_lane gate "Vitest (agent-cli)" vitest_lane packages/backend.ai-agent-cli
  start_lane gate "Vitest (root)" vitest_lane .
fi

echo "... $((${#LANE_NAMES[@]} - 2)) lanes running$([ -n "${VERIFY_SERIAL:-}" ] && echo ' serially' || echo ' in parallel'); logs in $LOG_DIR/"
echo ""
wait

i=2
while [ "$i" -lt "${#LANE_NAMES[@]}" ]; do
  report_lane "$i"
  i=$((i + 1))
done

echo "total: ${SECONDS}s"
if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
