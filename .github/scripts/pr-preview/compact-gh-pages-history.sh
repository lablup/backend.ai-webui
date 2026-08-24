#!/usr/bin/env bash
# Squash gh-pages down to a single orphan commit.
#
# Every preview deploy and every cleanup adds a commit whose tree carries ~18 MB
# of Storybook output per live PR. The history of those trees is worthless — only
# the current tree is ever served — but it is what makes the branch grow without
# bound in a repository that is already ~800 MB. Rewriting to one orphan commit
# lets git drop every unreferenced blob on the next gc.
#
# Force-pushing a branch is normally off-limits here. gh-pages is the exception:
# it holds no reviewed history, nobody branches from it, and the tree is
# reproducible from CI. The rewrite keeps the tree byte-identical — it only
# discards ancestry.
set -euo pipefail

BRANCH="${BRANCH:-gh-pages}"
WORK="${WORK:-${RUNNER_TEMP:-/tmp}/gh-pages-compact}"
# Below this, the rewrite costs more (a full force-push of the tree) than the
# history it reclaims.
MIN_COMMITS="${MIN_COMMITS:-10}"
# REPO_URL is overridable so the logic can be exercised against a local bare
# repository; CI leaves it unset and gets the token URL.
if [ -z "${REPO_URL:-}" ]; then
  REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
  TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
  REPO_URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"
fi

rm -rf "$WORK"
git clone --branch "$BRANCH" "$REPO_URL" "$WORK" \
  || { echo "No ${BRANCH} branch yet — nothing to compact."; exit 0; }

cd "$WORK"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

COMMITS="$(git rev-list --count HEAD)"
echo "${BRANCH} has ${COMMITS} commit(s)."
if [ "$COMMITS" -lt "$MIN_COMMITS" ]; then
  echo "Fewer than ${MIN_COMMITS} — leaving history alone."
  exit 0
fi

BEFORE="$(git count-objects -vH | awk '/size-pack/ {print $2 $3}')"

git checkout --orphan compacted
git add -A
git commit -m "Compact ${BRANCH} history ($(date -u +%Y-%m-%d), was ${COMMITS} commits)"

# The tree must be identical to what we cloned; a mismatch means the orphan
# commit lost content and must not be pushed.
if [ "$(git rev-parse compacted^{tree})" != "$(git rev-parse "origin/${BRANCH}^{tree}")" ]; then
  echo "::error::Compacted tree differs from ${BRANCH} — refusing to force-push."
  exit 1
fi

git push --force origin "compacted:${BRANCH}"
echo "Compacted ${COMMITS} commits into 1 (pack size before rewrite: ${BEFORE})."
