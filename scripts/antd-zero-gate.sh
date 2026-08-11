#!/usr/bin/env bash
#
# antd-zero-gate.sh — final gate for the antd → Astryx migration.
#
# Asserts "zero antd-family reachability today" across three surfaces:
#   (a) the PRODUCTION dependency graph (pnpm-resolved, all workspaces)
#   (b) string-signature traces in the built `build/web/` output
#   (c) the application source import graph (P15 resolver — a file is only
#       antd-free when its entire transitive import graph is)
#
# Scope — the following package families must have ZERO reachability:
#   - antd
#   - antd-style
#   - @ant-design/*        (all subpackages)
#   - rc-*                 (legacy dash-namespace, transitive from antd < 6)
#   - @rc-component/*      (antd 6's namespace for the same components)
#
# This is a GATE, not a ratchet: it only asserts the current state.
#
# STATUS: GREEN as of the to-astryx final switch — `antd` is not a dependency
# of any workspace, no source file imports it, and the production bundle
# carries none of its signatures. Treat a failure as a REGRESSION, not as
# expected migration residue.
#
# Usage:
#   bash scripts/antd-zero-gate.sh
#
# Exit code: 0 if clean, 1 if any violation found (with a listing).
#
# HISTORICAL CAVEATS, both resolved — recorded so a future reader does not go
# looking for a dependency that is gone:
#   - `@lobehub/fluent-emoji` / `@lobehub/icons` used to pull `@lobehub/ui`,
#     which hard-depends on antd / antd-style / @ant-design/cssinjs and five
#     rc-* packages, keeping part (a) red regardless of first-party code.
#     Ticket 30 removed both; `react/src/components/brandIcons/generated/*` is
#     the replacement.
#   - `@ant-design/x` (the Chat composer surface) declared a `peerDependencies
#     { antd }` that `autoInstallPeers: true` resolved into the production
#     graph, with the same effect. Removed in qa2-d.
#
# One antd-family package is still installed and is EXPECTED to be:
# `@ant-design/colors`, a devDependency of `packages/backend.ai-ui`, used by
# `src/theme-shim/themeShim.test.ts` as the reference implementation its
# vendored port is asserted bit-identical to. Part (a) walks production
# dependencies only, so it is correctly invisible here.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAIL=0

# ---------------------------------------------------------------------------
# Part (a): production dependency graph check
# ---------------------------------------------------------------------------
# We deliberately do NOT grep `pnpm-lock.yaml` text for this check. The
# lockfile's `packages:` section lists every resolved package regardless of
# whether it is reachable from a `dependencies` field or only from a
# `devDependencies` field (build tooling, storybook addons, eslint plugins,
# test-only libs, etc.) — grepping it would produce false positives for
# scope packages that are dev-only and never ship. Same principle as this
# repo's "don't grep a generated/derived artifact, use the tool that
# understands it" rules, applied to pnpm-lock.yaml.
#
# Instead we ask pnpm itself for the *actually-resolved production graph*
# via `pnpm -r list --prod --depth Infinity --json`, which:
#   - covers every workspace project (react/, packages/*, root) in one call
#   - walks only `dependencies` (and peer deps resolved into them), never
#     `devDependencies`
#   - reflects the real installed tree, including peer-dependency
#     auto-installs (`autoInstallPeers: true` in pnpm-workspace.yaml),
#     which is exactly the mechanism that makes the @lobehub/* caveat above
#     show up as a real production edge and not a devDep artifact.

echo "=== [a] production dependency graph scan (pnpm -r list --prod --depth Infinity --json) ==="

PROD_JSON="$(pnpm -r list --prod --depth Infinity --json 2>/dev/null || echo '[]')"

SCAN_JS="$(mktemp /tmp/antd-zero-gate-scan.XXXXXX.mjs)"
trap 'rm -f "$SCAN_JS"' EXIT

cat > "$SCAN_JS" <<'NODEEOF'
// Reads pnpm's `list --prod --depth Infinity --json` output from stdin and
// reports every reachable package matching the antd-family scope, with one
// example path per package (workspace project -> ... -> offending package).
const SCOPE_EXACT = new Set(['antd', 'antd-style']);
function isScope(name) {
  if (SCOPE_EXACT.has(name)) return true;
  if (name.startsWith('@ant-design/')) return true;
  if (name.startsWith('rc-')) return true;
  if (name.startsWith('@rc-component/')) return true;
  return false;
}

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  const projects = JSON.parse(input || '[]');
  const hits = new Map(); // name -> { count, samplePath }

  function walk(deps, path) {
    if (!deps) return;
    for (const [name, info] of Object.entries(deps)) {
      const nextPath = [...path, name];
      if (isScope(name)) {
        const entry = hits.get(name) || { count: 0, samplePath: nextPath.join(' -> ') };
        entry.count += 1;
        hits.set(name, entry);
      }
      walk(info.dependencies, nextPath);
    }
  }

  for (const project of projects) {
    walk(project.dependencies, [project.name || '(root)']);
  }

  const names = [...hits.keys()].sort();
  if (names.length === 0) {
    console.log('  clean: no scope package reachable in the production graph.');
    process.exit(0);
  }
  console.log(`  VIOLATIONS: ${names.length} scope package(s) reachable in production graph:`);
  for (const name of names) {
    const { count, samplePath } = hits.get(name);
    console.log(`    - ${name}  (${count} path(s), e.g. ${samplePath})`);
  }
  process.exit(1);
});
NODEEOF

if echo "$PROD_JSON" | node "$SCAN_JS"; then
  echo "--- [a] PASS ---"
else
  echo "--- [a] FAIL ---"
  FAIL=1
fi
echo ""

# ---------------------------------------------------------------------------
# Part (b): build/web output scan
# ---------------------------------------------------------------------------
# Signatures below are chosen for LOW false-positive risk. Each is documented
# with why it's safe to treat a match as antd-family evidence.
#
#   1. `.ant-` CSS class selector prefix (dot + literal "ant-") — antd's own
#      class naming convention (`.ant-btn`, `.ant-modal`, ...). The 5-char
#      sequence ".ant-" essentially never occurs by coincidence in other CSS
#      (no common English word/other framework produces "ant-" prefixed
#      classes at a `.` boundary). HIGH confidence.
#   2. `\.anticon` or `anticon-<letter>` — the class antd's icon component
#      renders (`<span class="anticon anticon-xxx">`), matched either as a CSS
#      selector or as the glyph-suffixed form. Also used verbatim by
#      @ant-design/icons independent of antd. HIGH confidence.
#
#      WHY THE PATTERN IS ANCHORED and not the bare word `anticon`:
#      `build/web/assets/main-*.js` bundles the Chat token counter's BPE
#      vocabularies (`cl100k_base` / `o200k`), and `" anticon"` — quote, SPACE,
#      anticon, quote — happens to be one of their ~200k merge tokens. That is
#      not fixable from our side: it is third-party vocabulary data, it sits in
#      a run of unrelated multilingual tokens (`," Können"," činjen",
#      " anticon","'ọ"`, verified by hand), and it made this signature fire on
#      a clean build. A permanently red check cannot distinguish us from a real
#      reintroduction, which is the only thing it exists to catch.
#      So the pattern is NARROWED, not disabled — both anchors are things antd
#      always emits and the BPE token never is:
#        - `.anticon`     — the reset in @ant-design/icons' own stylesheet
#        - `anticon-<x>`  — every rendered glyph (`anticon-close`, …), and the
#                           minified `"anticon-"+type` concatenation in the
#                           icon component itself
#      A real reintroduction produces BOTH. The BPE token produces NEITHER
#      (no preceding dot, no following hyphen). Measured on the final-switch
#      build: bare `anticon` → 1 hit (the BPE token); anchored → 0 hits.
#      Do NOT widen this back to the bare word, and do NOT delete it.
#
#      NOTE (to-astryx final-B): until that ticket our OWN icon shim
#      (`packages/backend.ai-ui/src/icons/iconShim.tsx`) also rendered
#      `class="anticon"`, with BUI shipping the matching reset — a second way
#      this signature fired on first-party output. The shim and every
#      first-party rule/selector now use `bai-icon` / `bai-icon-spin`.
#      Also note that CSS comments — unlike JS ones — survive minification into
#      `build/web/assets/*.css`, and so do JS header comments carrying
#      `@license` (terser preserves those). First-party comments quoting antd
#      class names or antd-family package specifiers land in the bundle
#      verbatim and trip checks 1/2/5. They are phrased without the literal
#      tokens (no leading dot on a class, no `@scope/` on a package). Keep new
#      comments that way — see the SPELLING NOTE in
#      `packages/backend.ai-ui/src/form-engine/engine.ts`.
#   3. `data-ant-cssinjs-cache-path` — DOM attribute @ant-design/cssinjs
#      writes to manage its style cache. Fully qualified, unique string.
#      HIGH confidence.
#   4. `css-dev-only-do-not-override` — class prefix antd-style/cssinjs
#      injects for its dev-mode "don't hand-edit this" style tag marker.
#      Baked into runtime code (not just comments), so it survives
#      minification WHEN PRESENT. Fully qualified, unique string, HIGH
#      confidence as a positive signal — but @ant-design/cssinjs only emits
#      it when `process.env.NODE_ENV !== 'production'`, so a clean
#      production build is expected to show 0 matches for this one even
#      while still shipping antd (confirmed empirically: a real
#      `pnpm run build:react-only` output failed signatures 1/2/3 but NOT
#      this one). Keep it for catching accidental dev-mode / unminified
#      leftovers; do not treat its absence as evidence of a clean build.
#   5. `rc-component/` and `rc-util` as literal substrings — these show up
#      as source-path fragments in unminified bundles or license-comment
#      banners Rollup/Terser sometimes preserve. MEDIUM confidence only:
#      minified production output commonly strips comments and rewrites
#      import specifiers away entirely, so ABSENCE of this signature is
#      not proof of absence — but PRESENCE is still a strong positive
#      signal, so we keep it as a secondary check.
#
# Deliberately NOT used: bare `ant-` (too broad — false-positives on
# "important-", "instant-", "brilliant-", etc.), `antd/es/` or `antd/lib/`
# module paths (absent even in antd's own unminified UMD dist in this repo's
# node_modules, so unreliable as a build-output signal), `theme` / `Form`
# (far too generic, matches unrelated code constantly).

echo "=== [b] build/web output scan ==="

BUILD_DIR="build/web"

scan_build_dir() {
  local dir="$1"
  local violations=0

  # High-confidence signatures (checked with word/context anchoring where possible)
  local -a HIGH_CONF_PATTERNS=(
    '\.ant-[a-zA-Z]'
    '\.anticon|anticon-[a-zA-Z]'
    'data-ant-cssinjs-cache-path'
    'css-dev-only-do-not-override'
  )
  # Medium-confidence signatures (informational; still fail the gate, but
  # logged separately so a human can judge if it's a stray comment/license
  # banner vs. real shipped code)
  local -a MED_CONF_PATTERNS=(
    'rc-component/'
    'rc-util'
  )

  for pat in "${HIGH_CONF_PATTERNS[@]}"; do
    local matches
    matches=$(grep -rlE "$pat" "$dir" --include="*.js" --include="*.css" --include="*.mjs" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      echo "  VIOLATION (high-confidence signature '$pat') found in:"
      echo "$matches" | sed 's/^/    /'
      violations=1
    fi
  done

  for pat in "${MED_CONF_PATTERNS[@]}"; do
    local matches
    matches=$(grep -rlF "$pat" "$dir" --include="*.js" --include="*.css" --include="*.mjs" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      echo "  VIOLATION (medium-confidence signature '$pat') found in:"
      echo "$matches" | sed 's/^/    /'
      violations=1
    fi
  done

  return $violations
}

# Build-completeness assertion (ticket 35).
#
# `-d "$BUILD_DIR"` is not enough to trust a clean scan. `pnpm run build`
# creates build/web and copies index.html/resources/manifest into it BEFORE it
# compiles the app; if a later step fails (ticket 35 hit exactly this — a
# missing `config.toml` aborted `copyconfig`), the directory exists and holds a
# handful of static files, and this scan happily reports PASS over them. That
# is the worst possible failure mode for a compliance gate: a green light that
# means "nothing was scanned", indistinguishable from "nothing was found".
#
# The app bundle lands in build/web/assets/ as hashed .js/.css. Requiring a
# plausible number of them turns the silent false-pass into a loud failure.
MIN_ASSET_FILES=50

count_build_assets() {
  find "$1" \( -name '*.js' -o -name '*.css' -o -name '*.mjs' \) -type f 2>/dev/null | wc -l
}

if [ -d "$BUILD_DIR" ]; then
  ASSET_COUNT="$(count_build_assets "$BUILD_DIR")"
  if [ "$ASSET_COUNT" -lt "$MIN_ASSET_FILES" ]; then
    echo "  VIOLATION: $BUILD_DIR holds only $ASSET_COUNT js/css file(s)," \
      "expected >= $MIN_ASSET_FILES."
    echo "  The production build did not complete — scanning it proves nothing."
    echo "  Re-run \`pnpm run build\` and check its exit code before trusting"
    echo "  this step. (A missing root \`config.toml\` is a common cause: copy"
    echo "  it from config.toml.sample.)"
    echo "--- [b] FAIL (incomplete build, not scanned) ---"
    FAIL=1
  elif scan_build_dir "$BUILD_DIR"; then
    echo "--- [b] PASS (scanned $BUILD_DIR, $ASSET_COUNT js/css file(s)) ---"
  else
    echo "--- [b] FAIL (scanned $BUILD_DIR, $ASSET_COUNT js/css file(s)) ---"
    FAIL=1
  fi
else
  echo "  SKIPPED: $BUILD_DIR does not exist. Run \`pnpm run build\` first."
  echo "  (In CI this step should run AFTER the production build step, and"
  echo "   this branch should be treated as a hard failure, not a skip —"
  echo "   change 'exit 0' below to 'FAIL=1' once wired into CI.)"
fi
echo ""

# ---------------------------------------------------------------------------
# Part (c): source import-graph scan (P15)
# ---------------------------------------------------------------------------
# Parts (a)/(b) check the dependency graph and the bundle; this part checks
# the SOURCE reachability: a per-file grep for antd imports understates the
# residue by one hop (a file with no direct antd import still renders antd
# when anything in its import graph does, typically via `backend.ai-ui`).
# The resolver walks import/export/require specifiers, resolves relative
# paths and the workspace aliases, and propagates taint transitively.

echo "=== [c] source import-graph scan (P15 resolver) ==="

if node scripts/migration-gates/antd-import-graph.mjs --strict; then
  echo "--- [c] PASS ---"
else
  echo "--- [c] FAIL ---"
  FAIL=1
fi
echo ""

# ---------------------------------------------------------------------------
if [ "$FAIL" -ne 0 ]; then
  echo "=== antd-zero-gate: FAIL ==="
  exit 1
else
  echo "=== antd-zero-gate: PASS ==="
  exit 0
fi
