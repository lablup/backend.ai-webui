#!/bin/sh
# Runs the visual tests in the Playwright container CI uses (linux/amd64 on
# every host); only its screenshots are valid baselines.
#
#   scripts/visual-test.sh                         compare against the baselines
#   scripts/visual-test.sh src/components/BAICard  limit to a path
#   scripts/visual-test.sh -u                      rewrite the baselines
#
# Put -u last: Vitest reads the word after it as the update mode.
set -eu

pkg=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
repo=$(CDPATH= cd -- "$pkg/../.." && pwd)
version=$(node -p "require('$pkg/package.json').devDependencies.playwright")
pnpm_spec=$(node -p "require('$repo/package.json').packageManager")

# Per-checkout volumes keep the host's node_modules out of the container.
id=$(printf %s "$repo" | cksum | cut -d " " -f 1)
vol="bui-visual-$id"

bash "$pkg/scripts/pull-visual-baselines.sh"

exec docker run --rm --init --platform linux/amd64 \
  -v "$repo:/work" \
  -v "$vol-root-modules:/work/node_modules" \
  -v "$vol-bui-modules:/work/packages/backend.ai-ui/node_modules" \
  -v "$vol-eslint-config-modules:/work/packages/eslint-config-bai/node_modules" \
  -v bui-visual-pnpm-store:/pnpm-store \
  -v bui-visual-npm-cache:/root/.npm \
  -w /work/packages/backend.ai-ui \
  -e CI=true \
  -e HUSKY=0 \
  -e BUI_VISUAL_CONTAINER=1 \
  -e HOST_OWNER="$(id -u):$(id -g)" \
  "mcr.microsoft.com/playwright:v$version-noble" \
  sh -c '
    pnpm="npx --yes $0"
    cp /work/pnpm-lock.yaml /tmp/pnpm-lock.yaml
    status=0
    $pnpm install --frozen-lockfile --prefer-offline --filter "backend.ai-ui..." \
      --store-dir /pnpm-store --reporter=append-only &&
      $pnpm run test:visual "$@" || status=$?
    cmp -s /tmp/pnpm-lock.yaml /work/pnpm-lock.yaml || cp /tmp/pnpm-lock.yaml /work/pnpm-lock.yaml
    chown -R "$HOST_OWNER" test/visual/__screenshots__ .vitest-attachments 2>/dev/null
    exit $status
  ' "$pnpm_spec" "$@"
