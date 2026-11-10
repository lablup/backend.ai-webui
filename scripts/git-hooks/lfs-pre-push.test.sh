#!/usr/bin/env bash
# Checks .husky/pre-push + lfs-pre-push.sh against a throwaway file:// remote.
# Never touches this checkout or your git config (isolated HOME, no system config).
#
# Usage: bash scripts/git-hooks/lfs-pre-push.test.sh
#   GIT_LFS_DIR=<dir holding git-lfs>  use that git-lfs; otherwise the one on PATH.
#   Without any git-lfs, only the "git-lfs missing" cases run.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export HOME="$TMP/home" GIT_CONFIG_NOSYSTEM=1 XDG_CONFIG_HOME="$TMP/home/.config"
export GIT_CONFIG_GLOBAL="$HOME/.gitconfig"
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
mkdir -p "$HOME"

LFS_DIR="${GIT_LFS_DIR:-}"
if [ -z "$LFS_DIR" ] && command -v git-lfs >/dev/null 2>&1; then
  LFS_DIR="$(dirname "$(command -v git-lfs)")"
fi
# PATH without any git-lfs; git-lfs is added per case.
NOLFS="$TMP/nolfs-bin"
mkdir -p "$NOLFS"
for t in git sh bash sed sort head cut tr cat mktemp rm dirname env grep mkdir cp chmod; do
  ln -s "$(command -v "$t")" "$NOLFS/$t"
done
no_lfs() { export PATH="$NOLFS"; }
with_lfs() { export PATH="$LFS_DIR:$NOLFS"; }

pass=0 fail=0
ok() { echo "ok   - $1"; pass=$((pass + 1)); }
ko() { echo "FAIL - $1"; fail=$((fail + 1)); }

IMG=docs/src/en/images/shot.png
setup() { # fresh remote + clone with the hook wired the way Husky wires it
  cd "$TMP"
  rm -rf "$TMP/remote.git" "$TMP/c" "$HOME/.gitconfig"
  no_lfs
  git config --global user.name test
  git config --global user.email test@example.invalid
  git config --global init.defaultBranch main
  git config --global protocol.file.allow always
  git init -q --bare "$TMP/remote.git"
  git init -q "$TMP/c"
  git -C "$TMP/c" remote add origin "file://$TMP/remote.git"
  cd "$TMP/c"
  mkdir -p docs/src/en/images .husky/_ scripts/git-hooks
  echo 'docs/src/**/*.png filter=lfs diff=lfs merge=lfs -text' > .gitattributes
  cp "$ROOT/.husky/pre-push" .husky/pre-push
  cp "$ROOT/scripts/git-hooks/lfs-pre-push.sh" scripts/git-hooks/
  # Husky 9's stub runs `sh -e .husky/<hook> "$@"` with stdin passed through.
  printf '#!/bin/sh\nsh -e .husky/pre-push "$@"\n' > .husky/_/pre-push
  chmod +x .husky/_/pre-push
  git config core.hooksPath .husky/_
  # the base commit holds an image as an LFS pointer, as main does
  printf 'version https://git-lfs.github.com/spec/v1\noid sha256:%064d\nsize 1\n' 0 > "$IMG"
  echo readme > README
  git add -A
  git commit -qm base
  git push -q --no-verify origin HEAD:main 2>/dev/null
  git fetch -q origin
  git switch -qc topic
}
push() { git push origin HEAD:topic > "$TMP/out" 2>&1; }
remote_has_topic() { git --git-dir="$TMP/remote.git" rev-parse -q --verify topic >/dev/null; }

# 1. no git-lfs, push without LFS-tracked changes → allowed
setup
echo change >> README && git commit -qam "readme"
if push && remote_has_topic; then ok "no git-lfs: push without LFS changes passes"; else ko "no git-lfs: push without LFS changes passes"; cat "$TMP/out"; fi

# 2. no git-lfs, changed image → refused with instructions, nothing pushed
setup
head -c 5000 /dev/urandom > "$IMG" && git commit -qam "new screenshot"
if ! push && ! remote_has_topic && grep -q "git-lfs is not installed" "$TMP/out" && grep -q "$IMG" "$TMP/out"; then
  ok "no git-lfs: push with a changed image is refused"
else ko "no git-lfs: push with a changed image is refused"; cat "$TMP/out"; fi

# 3. no git-lfs, image deleted → allowed (nothing to upload)
setup
git rm -q "$IMG" && git commit -qm "drop screenshot"
if push && remote_has_topic; then ok "no git-lfs: deleting an image passes"; else ko "no git-lfs: deleting an image passes"; cat "$TMP/out"; fi

if [ -z "$LFS_DIR" ]; then
  echo "skip - git-lfs not found; set GIT_LFS_DIR to run the git-lfs cases"
else
  # 4. git-lfs + filters, changed and new image → pushed, objects uploaded
  setup
  with_lfs
  git lfs install --skip-repo >/dev/null
  head -c 5000 /dev/urandom > "$IMG"
  head -c 3000 /dev/urandom > docs/src/en/images/new.png
  git add -A && git commit -qm "screenshots"
  oid="$(git cat-file blob "HEAD:$IMG" | sed -n 's/^oid sha256://p')"
  obj="$TMP/remote.git/lfs/objects/${oid:0:2}/${oid:2:2}/${oid}"
  if [ -n "$oid" ] && push && remote_has_topic && [ -f "$obj" ]; then
    ok "git-lfs: changed image committed as pointer and its object uploaded"
  else ko "git-lfs: changed image committed as pointer and its object uploaded"; cat "$TMP/out"; fi

  # 5. git-lfs on PATH but filters never configured → raw bytes refused
  setup
  with_lfs
  head -c 5000 /dev/urandom > "$IMG" && git commit -qam "raw screenshot"
  if ! push && ! remote_has_topic && grep -q "committed as raw bytes" "$TMP/out"; then
    ok "git-lfs without filters: raw image is refused"
  else ko "git-lfs without filters: raw image is refused"; cat "$TMP/out"; fi
  # ...and the suggested fix makes it pushable
  git lfs install --skip-repo >/dev/null
  git add --renormalize -- "$IMG" && git commit -qm "as pointer"
  if push && remote_has_topic; then ok "git-lfs: after renormalize the push passes"; else ko "git-lfs: after renormalize the push passes"; cat "$TMP/out"; fi

  # 6. git-lfs, push without LFS changes → allowed
  setup
  with_lfs
  git lfs install --skip-repo >/dev/null
  echo change >> README && git commit -qam "readme"
  if push && remote_has_topic; then ok "git-lfs: push without LFS changes passes"; else ko "git-lfs: push without LFS changes passes"; cat "$TMP/out"; fi
fi

echo "${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
