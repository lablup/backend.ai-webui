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

# The tip we cloned. Everything below is asserted against exactly this commit,
# and the push is leased to it, so a deploy or cleanup that lands while we work
# makes the push fail instead of being erased by it.
CLONED_TIP="$(git rev-parse HEAD)"

COMMITS="$(git rev-list --count HEAD)"
echo "${BRANCH} has ${COMMITS} commit(s) at ${CLONED_TIP}."
if [ "$COMMITS" -lt "$MIN_COMMITS" ]; then
  echo "Fewer than ${MIN_COMMITS} — leaving history alone."
  exit 0
fi

BEFORE="$(git count-objects -vH | awk '/size-pack/ {print $2 $3}')"

git checkout --orphan compacted
git add -A
git commit -m "Compact ${BRANCH} history ($(date -u +%Y-%m-%d), was ${COMMITS} commits)"

# The tree must be identical to the commit we cloned; a mismatch means the
# orphan commit lost content and must not be pushed.
if [ "$(git rev-parse compacted^{tree})" != "$(git rev-parse "${CLONED_TIP}^{tree}")" ]; then
  echo "::error::Compacted tree differs from ${CLONED_TIP} — refusing to force-push."
  exit 1
fi

# --force-with-lease pinned to the cloned tip, NOT a bare --force. The deploy and
# cleanup jobs run in different concurrency groups, so one of them can land a new
# preview between our clone and this push; a bare force would delete it, and the
# tree check above would not notice because it only ever saw the stale tip.
# Failing here is correct — the next weekly run compacts the newer history.
if ! git push --force-with-lease="${BRANCH}:${CLONED_TIP}" origin "compacted:${BRANCH}"; then
  echo "::warning::${BRANCH} moved since the clone (a deploy or cleanup landed) — skipping compaction this run."
  exit 0
fi
echo "Compacted ${COMMITS} commits into 1 (pack size before rewrite: ${BEFORE})."
