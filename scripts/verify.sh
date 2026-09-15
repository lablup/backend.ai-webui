#!/bin/bash
# Verification harness for Claude Code agents.
# Run from project root: bash scripts/verify.sh
# Agents should check for "=== ALL PASS ===" in the output.
#
# Relay runs first and alone (TypeScript and the drift check read
# __generated__). Every other check is a lane: lanes run in parallel, each
# writing its own log under $LOG_DIR, and are reported in a fixed order once
# all have finished — PASS is one line, FAIL prints the tail of that lane's
# log. Wall time is Relay + the slowest lane (Lint), instead of the sum.
#
#   VERIFY_SERIAL=1   run lanes one at a time (debugging, small machines)
#   VERIFY_TESTS=1    add the Vitest suites CI runs (react, backend.ai-ui,
#                     agent-cli, root); roughly +45s
#   VERIFY_TAIL=60    lines of a failed lane's log to print
#   VERIFY_LOG_DIR    lane logs, default node_modules/.cache/verify

set -uo pipefail
cd "$(dirname "$0")/.."

LOG_DIR="${VERIFY_LOG_DIR:-node_modules/.cache/verify}"
TAIL="${VERIFY_TAIL:-60}"
rm -rf "$LOG_DIR" && mkdir -p "$LOG_DIR"

FAIL=0
LANE_KINDS=()
LANE_NAMES=()
LANE_SLUGS=()

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
  read -r rc secs < "$LOG_DIR/$slug.rc" 2>/dev/null || true
  echo "=== $name ==="
  if [ "$kind" = report ]; then
    cat "$LOG_DIR/$slug.log"
    echo "--- $name: REPORT (${secs}s) ---"
  elif [ "$rc" -eq 0 ]; then
    echo "--- $name: PASS (${secs}s) ---"
  else
    tail -n "$TAIL" "$LOG_DIR/$slug.log"
    echo "(full log: $LOG_DIR/$slug.log)"
    echo "--- $name: FAIL (${secs}s) ---"
    FAIL=1
  fi
  echo ""
}

check_relay_drift() {
  # Generated artifacts are committed. `git status` rather than `git diff` so a
  # brand-new artifact (an added fragment) counts as drift too.
  bin . relay-compiler || return 1
  local dirty
  dirty=$(git status --porcelain -- \
    'react/src/__generated__' \
    'packages/backend.ai-ui/src/__generated__')
  if [ -n "$dirty" ]; then
    echo "$dirty"
    echo "Relay generated artifacts are out of sync."
    echo "Run \`pnpm relay\` and commit the changes under __generated__."
    return 1
  fi
  return 0
}

check_format() {
  # Root legacy sources: whole tree (small). React / BUI / e2e / i18n: only the
  # files this branch touched relative to main plus untracked ones — the same
  # set lint-staged formats at commit time, so a `--no-verify` commit cannot
  # slip past. A full-tree check needs the pre-existing drift fixed first.
  local rc=0
  pnpm run format || rc=1
  local base
  base=$(git merge-base HEAD origin/main 2>/dev/null \
    || git merge-base HEAD main 2>/dev/null || true)
  if [ -z "$base" ]; then
    echo "(no merge-base with main — changed-file format check skipped)"
    return $rc
  fi
  local files
  files=$({ git diff --name-only --diff-filter=ACMR "$base" --
            git ls-files --others --exclude-standard; } \
    | grep -E '^(react/(src|vite-plugins)|packages/backend\.ai-ui/src|e2e)/.*\.(js|jsx|ts|tsx|json|css|scss|md)$|^resources/i18n/[^/]+\.json$' \
    | grep -vE '/__generated__/|^react/src/astryx-theme/built/' \
    | sort -u \
    | while IFS= read -r f; do [ -f "$f" ] && echo "$f"; done)
  if [ -z "$files" ]; then
    echo "no changed files under react/, packages/backend.ai-ui/, e2e/, resources/i18n/"
    return $rc
  fi
  echo "$files" | xargs node_modules/.bin/prettier --check || rc=1
  return $rc
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
    echo "(no production build present — config gate only; run" \
      "\`pnpm run build:react-only\` for the full sentinel check)"
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
    echo "backend.ai-ui dist missing — building it first (once per checkout)"
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

check_token_gate_report() {
  # Undeclared `var(--name)` produces no compiler, lint or runtime error. The
  # gate has pre-existing findings, so it is report-only here and the bar is
  # "no new findings" (CLAUDE.md § Verification Harness). Counts plus the
  # undeclared usages; the fix hints and the dynamic section stay in the gate.
  node scripts/migration-gates/astryx-token-gate.mjs --strict 2>&1 \
    | awk '/^--- dynamic/ { exit } /^declared custom properties/ || /^  [^ ].*var\(--/'
  return 0
}

start_lane gate "Relay" check_relay_drift
wait
report_lane 0

# lint:ci = the cached eslint variant CI runs (content-hash cache; changed
# files are always re-linted). backend.ai-client and backend.ai-agent-cli keep
# it uncached: their type-aware no-floating-promises rule can flag a caller
# whose own content is unchanged. The coverage gate fails when a package
# defines `lint` without `lint:ci`, because `pnpm -r` silently skips it.
start_lane gate "Lint script coverage" node scripts/lint-ci-coverage-gate.mjs
start_lane gate "Lint" pnpm -r --stream lint:ci
start_lane gate "Format" check_format
start_lane gate "TypeScript" bin react tsc --noEmit --incremental
# The react lane reaches backend.ai-{ui,client} through tsconfig `paths`,
# but nothing pulls in the agent CLI, so it gets its own lane.
start_lane gate "TypeScript (agent-cli)" bin packages/backend.ai-agent-cli tsc --noEmit
start_lane gate "Vite warmup paths" check_warmup_paths
start_lane gate "StyleX cssInjectionTarget" check_stylex_injection
start_lane gate "Astryx theme build" check_astryx_theme_built
start_lane gate "Astryx integration (backend.ai-ui)" check_astryx_integration
# vitest.yml's path filter never fires for an index.html-only PR, so the
# ladder mirrors are checked here, always.
start_lane gate "z-index ladder mirrors" node scripts/migration-gates/z-index-ladder-gate.mjs
start_lane gate "Agent mappings" check_agent_mappings
start_lane gate "Terminology" check_terminology_drift
# Gates the non-English avoid-row DATA, a separate axis from CHECK 1 above; the
# hard gate is terminology-selftest.yml (FR-3051).
start_lane report "Terminology self-test (report-only here; hard gate in CI)" \
  node scripts/check-terminology-i18n.selftest.mjs
start_lane report "Astryx token gate (report-only; bar is no NEW findings)" \
  check_token_gate_report

if [ -n "${VERIFY_TESTS:-}" ]; then
  start_lane gate "Vitest (react)" bin react vitest run
  start_lane gate "Vitest (backend.ai-ui)" bin packages/backend.ai-ui vitest run
  start_lane gate "Vitest (agent-cli)" pnpm --filter backend.ai-agent-cli run test
  start_lane gate "Vitest (root)" bin . vitest run
fi

echo "... ${#LANE_NAMES[@]} lanes running$([ -n "${VERIFY_SERIAL:-}" ] && echo ' serially' || echo ' in parallel'); logs in $LOG_DIR/"
echo ""
wait

i=1
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
