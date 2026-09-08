#!/usr/bin/env bash
# Build the docs site twice — the PR's tree and its merge base — with the PR's
# own toolkit, then stamp the head build with what changed between them.
#
# Usage:
#   build-docs-preview.sh --base-ref origin/main --languages en,ko --out <dir> \
#     [--label "PR preview"] [--skip-diff]
#
# Produces <out>/head (the stamped `dist/web` tree to publish) and <out>/base.
# `packages/backend.ai-webui-docs/src` is swapped out for the base build and
# restored on every exit path, including a failure or a cancelled run.
set -euo pipefail

BASE_REF=""
LANGUAGES=""
OUT=""
LABEL="PR preview"
SKIP_DIFF=0

while [ $# -gt 0 ]; do
  case "$1" in
    --base-ref) BASE_REF="${2:?--base-ref needs a value}"; shift 2 ;;
    --languages) LANGUAGES="${2:?--languages needs a value}"; shift 2 ;;
    --out) OUT="${2:?--out needs a value}"; shift 2 ;;
    --label) LABEL="${2:?--label needs a value}"; shift 2 ;;
    --skip-diff) SKIP_DIFF=1; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -n "$BASE_REF" ] || { echo "usage: --base-ref <ref> --languages <en,ko> --out <dir>" >&2; exit 2; }
[ -n "$LANGUAGES" ] || { echo "usage: --base-ref <ref> --languages <en,ko> --out <dir>" >&2; exit 2; }
[ -n "$OUT" ] || { echo "usage: --base-ref <ref> --languages <en,ko> --out <dir>" >&2; exit 2; }

LANG_LIST="$(echo "$LANGUAGES" | tr ',' ' ')"
for lang in $LANG_LIST; do
  case "$lang" in
    [a-z][a-z] | [a-z][a-z]-[a-z0-9]*) ;;
    *) echo "Not a language code: ${lang}" >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
DOCS="packages/backend.ai-webui-docs"
SRC="${DOCS}/src"
WEB="${DOCS}/dist/web"

mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"

# The base build replaces `src/` wholesale, so uncommitted work there would be
# destroyed. CI checkouts are always clean; a local run has to be too.
if [ -n "$(git status --porcelain -- "$SRC")" ]; then
  echo "::error::${SRC} has uncommitted changes — refusing to swap it out." >&2
  exit 1
fi

SRC_SWAPPED=0
restore_src() {
  [ "$SRC_SWAPPED" -eq 1 ] || return 0
  SRC_SWAPPED=0
  rm -rf "$SRC"
  git -C "$REPO_ROOT" checkout HEAD -- "$SRC"
  echo "Restored ${SRC} to HEAD."
}
trap restore_src EXIT

BASE_SHA="$(git merge-base "$BASE_REF" HEAD 2>/dev/null || echo "$BASE_REF")"
echo "Head: $(git rev-parse --short HEAD) · Base: $(git rev-parse --short "$BASE_SHA") · Languages: ${LANGUAGES}"

docs_toolkit() { pnpm --filter backend.ai-webui-docs exec docs-toolkit "$@"; }

src_langs() {
  find "$SRC" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | tr '\n' ' '
}

# Which of the requested languages exist in the tree as it stands right now — a
# language the PR adds is absent from the base tree.
present_langs() {
  local found=() lang
  for lang in $LANG_LIST; do
    if [ -d "${SRC}/${lang}" ]; then
      found+=("$lang")
    else
      echo "Language '${lang}' does not exist in this tree — skipping." >&2
    fi
  done
  printf '%s ' ${found[@]+"${found[@]}"}
}

# `dist/web` accumulates across invocations, so per-language builds land side by
# side; `--lang all` is one pass when every language is wanted anyway. Called as
# a plain command so `set -e` still aborts on a build failure.
run_build() {
  local lang
  # `--no-strict` matches amplify.yml's production path: a preview must never be
  # redder than the deploy it previews.
  if [ "$1" = "$(src_langs)" ]; then
    docs_toolkit build:web --lang all --no-strict
  else
    for lang in $1; do
      docs_toolkit build:web --lang "$lang" --no-strict
    done
  fi
}

echo "::group::Build the toolkit"
# `dist/cli.js` does not exist on a fresh install, so pnpm skipped the
# `docs-toolkit` bin link; `pnpm rebuild` is what re-creates it (as amplify.yml).
pnpm --filter backend.ai-docs-toolkit run build
pnpm rebuild
echo "::endgroup::"

rm -rf "${OUT}/head" "${OUT}/base"

echo "::group::Build the docs site from the PR head"
HEAD_LANGS="$(present_langs)"
[ -n "${HEAD_LANGS// /}" ] || { echo "::error::None of '${LANGUAGES}' exists under ${SRC}." >&2; exit 1; }
rm -rf "$WEB"
run_build "$HEAD_LANGS"
mv "$WEB" "${OUT}/head"
echo "::endgroup::"

echo "::group::Build the docs site from the merge base"
rm -rf "$SRC"
SRC_SWAPPED=1
git checkout "$BASE_SHA" -- "$SRC"
BASE_LANGS="$(present_langs)"
rm -rf "$WEB"
if [ -n "${BASE_LANGS// /}" ]; then
  run_build "$BASE_LANGS"
  mv "$WEB" "${OUT}/base"
else
  echo "::warning::No requested language exists at the merge base — every page counts as new."
  mkdir -p "${OUT}/base"
fi
restore_src
echo "::endgroup::"

if [ "$SKIP_DIFF" -eq 1 ]; then
  echo "Skipping diff:web (--skip-diff)."
  exit 0
fi

echo "::group::Mark the head build with what changed"
docs_toolkit diff:web \
  --base "${OUT}/base" \
  --head "${OUT}/head" \
  --lang "$LANGUAGES" \
  --label "$LABEL"
echo "::endgroup::"
