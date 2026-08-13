#!/bin/bash
# Verification harness for Claude Code agents.
# Run from project root: bash scripts/verify.sh
# Agents should check for "=== ALL PASS ===" in the output.

set -euo pipefail

FAIL=0

run_check() {
  local name="$1"
  shift
  echo "=== $name ==="
  if "$@" 2>&1 | tail -20; then
    echo "--- $name: PASS ---"
  else
    echo "--- $name: FAIL ---"
    FAIL=1
  fi
  echo ""
}

check_warmup_paths() {
  # Verify every path in `server.warmup.clientFiles` (react/vite.config.ts)
  # actually exists. Missing entries don't crash the dev server, but they emit
  # noisy `Pre-transform error` warnings and silently shrink warmup coverage.
  local config=react/vite.config.ts
  local missing=0
  # Pull quoted string literals inside the warmup block. The block is short and
  # bounded by `warmup: {` / the next `},` so this awk window is robust enough.
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    # Paths starting with `./` are relative to vite `root` (= react/).
    # Paths starting with `../` are relative to react/ too (e.g. ../packages/...).
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

check_relay_drift() {
  # Relay generated artifacts are committed (see relay.dev production setup).
  # Any change under __generated__ after compiling means sources or schema
  # were updated without a matching `pnpm relay` run.
  #
  # Use `git status --porcelain` instead of `git diff --exit-code` so that
  # *new* generated files (e.g. when a developer adds a fragment) are caught
  # as drift too — `git diff` only sees tracked files.
  pnpm run relay || return 1
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

check_terminology_drift() {
  # Deterministic terminology checker (read-only). Scans i18n VALUES *and* the
  # user manual's prose (FR-3373) against
  # packages/backend.ai-webui-docs/terminology.json `avoid[]` (CHECK 1). See
  # scripts/check-terminology-i18n.mjs.
  #
  # CHECK 2 (near-duplicate divergence, ON by default since FR-3376) and CHECK 3
  # (unknown capitalized noun, ON since FR-3373) are both turned OFF here. Not
  # because they are noisy — both sit at 0 findings — but because run_check
  # pipes every step through `tail -20`, and their always-present sections cost
  # ~9 of those lines. With them on, a single real CHECK 1 finding scrolls off
  # the top and the harness reports a failure without showing what failed. Both
  # are advisory and never affect the exit code, so they belong in
  # `pnpm run lint:terminology` (where they do run) rather than in the pass/fail
  # harness. Only CHECK 1 gates here, and CHECK 1 is what can actually block.
  #
  # BLOCKING (FR-3049, team sign-off required): runs in --strict and is invoked
  # INSIDE run_check, so a blocking CHECK 1 finding sets FAIL and prevents
  # `=== ALL PASS ===`. Context-FREE avoid rows are error-severity in every
  # language (checker `runCheck1`); only context-qualified rows stay WARN and
  # never block. Non-English rows were warn-only until FR-3374 raised them on
  # the strength of the self-test's live false-positive budget. CHECK 2/3 never
  # affect the exit code. To unblock a legitimate false positive without
  # reverting: add the value/key to scripts/terminology-i18n.allowlist.json
  # (ignoreValues/ignoreKeys) or append `[[i18n-term-ok]]` inline. To fully
  # disable: change --strict back to --warn and move this out of run_check.
  #
  # NOTE: verify.sh is NOT run in CI (it is the local/agent harness), so this
  # step blocks local + agent runs, not PR merges. Merges are gated by two
  # workflows running this same checker on a path filter: docs-checks.yml for
  # the manual (FR-3373) and terminology-content.yml for the i18n stores and
  # the termbase (FR-3375). Both are ABSOLUTE rather than diff-aware — see
  # terminology-content.yml's header for why that is sound once the baseline is
  # clean, and for the condition that would justify revisiting it.
  node scripts/check-terminology-i18n.mjs --strict --no-check2 --no-check3
}

check_stylex_injection() {
  # Guard the StyleX compiler's `cssInjectionTarget` (react/vite.config.ts).
  # The @stylexjs/unplugin appends ALL compiled `xstyle`/stylex.create CSS to
  # one existing CSS asset. Without a pinned target it picks "whichever .css
  # rollup emitted first" — in a code-split app that can be a lazy route's
  # stylesheet, silently putting every authored style behind that route
  # boundary. Nothing warns when the predicate stops matching (e.g. an
  # assetFileNames tweak or a Vite major), so this check asserts it directly.
  #
  # 1. Config gate (always): vite.config.ts must still declare
  #    cssInjectionTarget, and must keep StyleX output LAYERED. Unlayered
  #    output re-emits Astryx's own atomics (StyleX hashes class names from the
  #    declaration) outside every layer, at `:not(#\#)` ID-level specificity,
  #    which silently promotes those library defaults above project CSS
  #    (FR-3534).
  # 2. Build gate (only when the build exists): the sentinel rule authored in
  #    react/src/pages/AstryxStylexProbePage.tsx must land in the ENTRY
  #    stylesheet and in no other emitted CSS asset. Keep the value in sync
  #    with the `sentinel` style there.
  #
  # The entry stylesheet is resolved from the built index.html, NOT by globbing
  # `index-*.css`: rollup names a chunk's CSS after its source module, so a
  # lazy chunk entered through an `index.ts` also emits `assets/index-*.css`.
  # Globbing matched both, and an injection into the WRONG one passed the gate.
  local STYLEX_SENTINEL='z-index: ?2147480001'
  local config=react/vite.config.ts

  if ! grep -q 'cssInjectionTarget' "$config"; then
    echo "cssInjectionTarget is missing from $config."
    echo "Without it the StyleX plugin appends authored CSS to an arbitrary"
    echo "code-split stylesheet. Restore the predicate pinning it to"
    echo "assets/index-*.css."
    return 1
  fi

  if ! grep -qE '^\s*useCSSLayers:\s*true' "$config"; then
    echo "useCSSLayers is not true in $config."
    echo "Unlayered StyleX output escapes the cascade layers and promotes"
    echo "Astryx's own atomics above project CSS (FR-3534). Keep it true."
    return 1
  fi

  local build=react/build
  local assets="$build/assets"
  if [ ! -d "$assets" ] || [ ! -f "$build/index.html" ]; then
    echo "(no production build present — config gate only; run" \
      "\`pnpm run build:react-only\` for the full sentinel check)"
    return 0
  fi

  local entry_name entry
  entry_name=$(grep -oE 'href="[^"]*assets/index-[^"]*\.css"' "$build/index.html" \
    | head -1 | sed -E 's#.*assets/(index-[^"]*\.css)".*#\1#')
  if [ -z "$entry_name" ]; then
    echo "Could not find the entry stylesheet link in $build/index.html."
    echo "The HTML build no longer emits <link ... assets/index-*.css>; this"
    echo "check can no longer identify the entry sheet."
    return 1
  fi
  entry="$assets/$entry_name"

  if ! grep -qE "$STYLEX_SENTINEL" "$entry" 2>/dev/null; then
    echo "StyleX sentinel not found in the entry stylesheet ($entry)."
    echo "cssInjectionTarget no longer matches the entry CSS asset — authored"
    echo "xstyle/StyleX output is landing somewhere else (or nowhere)."
    local found
    found=$(grep -lE "$STYLEX_SENTINEL" "$assets"/*.css 2>/dev/null || true)
    [ -n "$found" ] && echo "Found instead in: $found"
    return 1
  fi

  local other_hits
  other_hits=$(grep -lE "$STYLEX_SENTINEL" "$assets"/*.css 2>/dev/null \
    | grep -vF "$entry" || true)
  if [ -n "$other_hits" ]; then
    echo "StyleX sentinel leaked into non-entry stylesheets: $other_hits"
    return 1
  fi

  if ! grep -q '@layer priority' "$entry"; then
    echo "The entry stylesheet has no '@layer priority' block."
    echo "Compiled StyleX is being emitted unlayered despite the config gate;"
    echo "it will outrank project CSS at ID-level specificity (FR-3534)."
    return 1
  fi

  echo "sentinel found in the entry sheet ($entry), layered"
  return 0
}

check_layer_order_statement() {
  # The cascade-layer order statement must be declared where its parse position
  # cannot move (FR-3534). Layer precedence is fixed by first appearance and no
  # later `@layer` statement can reorder names already seen, so the
  # AUTHORITATIVE copy is the inline <style> at the top of the project-root
  # index.html — ahead of every stylesheet link, in dev and build alike. The
  # copies in the CSS modules are defensive duplicates and must not diverge:
  # two identical statements are idempotent, two different ones hand the order
  # to whichever loads first.
  local html=index.html
  local copies=(
    react/src/index.css
    packages/backend.ai-ui/src/styles/backend.ai-ui.css
  )

  local html_stmt
  html_stmt=$(grep -ohE '@layer [a-z0-9, -]+;' "$html" 2>/dev/null | head -1)
  if [ -z "$html_stmt" ]; then
    echo "No '@layer ...;' order statement in $html."
    echo "It must be an inline <style> in <head>, before every stylesheet link,"
    echo "so dev and build resolve the identical cascade (FR-3534)."
    return 1
  fi

  # It has to come before the first stylesheet link, or it is not first.
  local stmt_line link_line
  stmt_line=$(grep -nE '@layer [a-z0-9, -]+;' "$html" | head -1 | cut -d: -f1)
  link_line=$(grep -nE '<link[^>]+rel="stylesheet"' "$html" | head -1 | cut -d: -f1)
  if [ -n "$link_line" ] && [ "$stmt_line" -gt "$link_line" ]; then
    echo "The @layer order statement (line $stmt_line) comes AFTER the first"
    echo "stylesheet link (line $link_line) in $html. Move it above them."
    return 1
  fi

  local copy stmt
  for copy in "${copies[@]}"; do
    stmt=$(grep -ohE '@layer [a-z0-9, -]+;' "$copy" 2>/dev/null | head -1)
    if [ -z "$stmt" ]; then
      echo "No '@layer ...;' order statement in $copy."
      return 1
    fi
    if [ "$stmt" != "$html_stmt" ]; then
      echo "Layer order statement diverges between $html and $copy:"
      echo "  $html: $html_stmt"
      echo "  $copy: $stmt"
      echo "Divergent statements hand the order to whichever loads first."
      return 1
    fi
  done

  echo "authoritative in $html (line $stmt_line), ${#copies[@]} copies in sync"
  return 0
}

check_astryx_theme_built() {
  # Prebuilt brand theme staleness gate (to-astryx ticket 02). The default
  # Backend.AI theme ships as `astryx theme build` artifacts committed under
  # react/src/astryx-theme/built/; `-c` recompiles the theme source in memory
  # and exits non-zero when the committed CSS/JS no longer match it (e.g. a
  # seed or recipe change in backendAiTheme.ts without a rebuild). The
  # rebuild + wrapper-update procedure is documented in
  # react/src/astryx-theme/built/index.ts; the wrapper↔artifact linkage
  # itself is covered by react/src/astryx-theme/backendAiTheme.test.ts.
  pnpm --prefix ./react exec astryx theme build -c \
    src/astryx-theme/built/backendai-default.ts \
    -o src/astryx-theme/built/backendai-default-built.css
}

run_check "Relay" check_relay_drift
run_check "Lint" pnpm -r --stream lint
run_check "Format" pnpm run format
run_check "TypeScript" pnpm --prefix ./react exec tsc --noEmit
run_check "Vite warmup paths" check_warmup_paths
run_check "StyleX cssInjectionTarget" check_stylex_injection
run_check "CSS layer order statement" check_layer_order_statement
run_check "Astryx theme build" check_astryx_theme_built
run_check "Terminology" check_terminology_drift

# Non-English avoid-row precision self-test (FR-3051). This gates the avoid-row
# DATA (are the non-English rows precise?), a separate axis from CHECK 1 above
# (which gates i18n CONTENT and now BLOCKS on bare-English drift). It is
# report-only HERE so that the DATA gate lives in exactly one place — the CI
# workflow terminology-selftest.yml, triggered ONLY by the termbase / checker /
# fixtures paths (never by docs prose or i18n content) — rather than also
# hard-failing this local/agent harness on the live-store budget probe.
echo "=== Terminology self-test (report-only here; hard gate in CI) ==="
node scripts/check-terminology-i18n.selftest.mjs || true
echo ""

if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
