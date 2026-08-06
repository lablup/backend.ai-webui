#!/usr/bin/env bash
# PILOT helper: dump Astryx CLI docs for a list of components (block templates trimmed).
cd "$(dirname "$0")/../react" || exit 1
for c in "$@"; do
  echo "########## $c"
  npx -y @astryxdesign/cli component "$c" 2>&1 \
    | grep -v "npm warn\|Next step:" \
    | sed -n '1,/^Related block templates/p' \
    | grep -v "^Related block templates"
done
