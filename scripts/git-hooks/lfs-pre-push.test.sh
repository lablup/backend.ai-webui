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
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_LFS_SKIP_PUSH GIT_LFS_SKIP_SMUDGE \
  GIT_CONFIG_COUNT GIT_CONFIG_PARAMETERS
mkdir -p "$HOME"

LFS_DIR="${GIT_LFS_DIR:-}"
if [ -z "$LFS_DIR" ] && command -v git-lfs >/dev/null 2>&1; then
  LFS_DIR="$(dirname "$(command -v git-lfs)")"
fi
# PATH without any git-lfs; git-lfs is added per case.
NOLFS="$TMP/nolfs-bin"
mkdir -p "$NOLFS"
for t in git sh bash sed sort head cut tr cat mktemp rm dirname env grep mkdir cp chmod awk paste wc ln; do
  ln -s "$(command -v "$t")" "$NOLFS/$t"
done
no_lfs() { export PATH="$NOLFS"; }
with_lfs() { export PATH="$LFS_DIR:$NOLFS"; }

pass=0 fail=0
ok() { echo "ok   - $1"; pass=$((pass + 1)); }
ko() { echo "FAIL - $1"; fail=$((fail + 1)); cat "$TMP/out"; }
expect_pass() { if push && remote_has_topic; then ok "$1"; else ko "$1"; fi; }
expect_refused() { # <name> <grep pattern>
  if ! push && ! remote_has_topic && grep -q "$2" "$TMP/out"; then ok "$1"; else ko "$1"; fi
}

IMG=docs/src/en/images/shot.png
raw_img() { head -c "${2:-5000}" /dev/urandom > "$1"; }
pointer() { printf 'version https://git-lfs.github.com/spec/v1\noid sha256:%064d\nsize %s\n' 0 "${2:-1}" > "$1"; }
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
  cd "$TMP/c"
  git remote add origin "file://$TMP/remote.git"
  mkdir -p docs/src/en/images .husky/_ scripts/git-hooks .github/scripts/lfs
  echo 'docs/src/**/*.png filter=lfs diff=lfs merge=lfs -text' > .gitattributes
  cp "$ROOT/.husky/pre-push" .husky/pre-push
  cp "$ROOT/scripts/git-hooks/lfs-pre-push.sh" scripts/git-hooks/
  cp "$ROOT/.github/scripts/lfs/lib.sh" .github/scripts/lfs/
  # Husky 9's stub runs `sh -e .husky/<hook> "$@"` with stdin passed through.
  printf '#!/bin/sh\nsh -e .husky/pre-push "$@"\n' > .husky/_/pre-push
  chmod +x .husky/_/pre-push
  git config core.hooksPath .husky/_
  # the base commit holds an image as an LFS pointer, as main does
  pointer "$IMG"
  echo readme > README
  git add -A
  git commit -qm base
  git push -q --no-verify origin HEAD:main 2>/dev/null
  git fetch -q origin
  git switch -qc topic
}
push() { git push ${FORCE:+--force} origin HEAD:topic > "$TMP/out" 2>&1; }
remote_has_topic() { git --git-dir="$TMP/remote.git" rev-parse -q --verify topic >/dev/null; }
# main moves on: another contributor's pointer change, pushed without hooks
main_changes_image() {
  git switch -q main
  pointer "$IMG" 2 && git commit -qam "main: new screenshot"
  git push -q --no-verify origin main
  git switch -q topic
}

# --- without git-lfs ---
setup
echo change >> README && git commit -qam "readme"
expect_pass "no git-lfs: push without LFS changes passes"

setup
raw_img "$IMG" && git commit -qam "new screenshot"
expect_refused "no git-lfs: a changed image (raw) is refused" "committed as raw bytes"

setup
raw_img docs/src/en/images/new.png && git add -A && git commit -qm "add screenshot"
expect_refused "no git-lfs: a new image (raw) is refused" "Install git-lfs"

setup
git rm -q "$IMG" && git commit -qm "drop screenshot"
expect_pass "no git-lfs: deleting an image passes"

setup
git mv "$IMG" docs/src/en/images/renamed.png && git commit -qm "rename"
expect_pass "no git-lfs: renaming an image passes"

setup
echo a >> README && git commit -qam "topic work" && push
main_changes_image
git merge -q --no-edit main
echo b >> README && git commit -qam "more"
expect_pass "no git-lfs: pushing after merging main's image change passes"

setup
echo a >> README && git commit -qam "topic work" && push
main_changes_image
git rebase -q main
FORCE=1
expect_pass "no git-lfs: pushing after rebasing onto main's image change passes"
unset FORCE

setup
git switch -qc side && echo s >> README && git commit -qam side && git switch -q topic
echo t > other && git add other && git commit -qm topic
git merge -q --no-commit side >/dev/null 2>&1
raw_img docs/src/en/images/in-merge.png && git add -A && git commit -qm "merge with an image"
expect_refused "no git-lfs: a raw image added in a merge commit is refused" "in-merge.png"

setup
ln -s shot.png docs/src/en/images/link.png && git add -A && git commit -qm "symlink"
expect_pass "no git-lfs: a symlink under an LFS path passes"

# --- with git-lfs ---
if [ -z "$LFS_DIR" ]; then
  echo "skip - git-lfs not found; set GIT_LFS_DIR to run the git-lfs cases"
else
  setup
  with_lfs
  git lfs install --skip-repo >/dev/null
  raw_img "$IMG" && raw_img docs/src/en/images/new.png 3000
  git add -A && git commit -qm "screenshots"
  oid="$(git cat-file blob "HEAD:$IMG" | sed -n 's/^oid sha256://p')"
  if [ -n "$oid" ] && push && remote_has_topic && [ -f "$TMP/remote.git/lfs/objects/${oid:0:2}/${oid:2:2}/${oid}" ]; then
    ok "git-lfs: changed image committed as pointer and its object uploaded"
  else ko "git-lfs: changed image committed as pointer and its object uploaded"; fi

  # The commits are already on another remote: the target still gets the objects.
  setup
  with_lfs
  git lfs install --skip-repo >/dev/null
  git init -q --bare "$TMP/fork.git" && git remote add fork "file://$TMP/fork.git"
  raw_img "$IMG" && git commit -qam "screenshot"
  git push -q --no-verify fork HEAD:topic > "$TMP/out" 2>&1   # creates refs/remotes/fork/topic
  oid="$(git cat-file blob "HEAD:$IMG" | sed -n 's/^oid sha256://p')"
  if push && remote_has_topic && [ -f "$TMP/remote.git/lfs/objects/${oid:0:2}/${oid:2:2}/${oid}" ]; then
    ok "git-lfs: pushed to another remote first, the target still gets the object"
  else ko "git-lfs: pushed to another remote first, the target still gets the object"; fi
  rm -rf "$TMP/fork.git"

  setup
  with_lfs   # on PATH, filters never configured
  raw_img "$IMG" && git commit -qam "raw screenshot"
  expect_refused "git-lfs without filters: raw image is refused" "committed as raw bytes"
  git lfs install --skip-repo >/dev/null
  git add --renormalize -- "$IMG" && git commit -qm "as pointer"
  expect_refused "git-lfs: a fix-up commit on top still refuses (raw bytes in history)" "rewrite the commits"
  git reset -q --soft HEAD~2 && git add --renormalize -- "$IMG" && git commit -qm "screenshot"
  expect_pass "git-lfs: after rewriting the commit the push passes"

  setup
  with_lfs
  git lfs install --skip-repo >/dev/null
  # a git-lfs that records calls, in front of the real one
  mkdir -p "$TMP/spy"
  printf '#!/bin/sh\necho "$@" >> "%s/spy/calls"\nexec "%s/git-lfs" "$@"\n' "$TMP" "$LFS_DIR" > "$TMP/spy/git-lfs"
  chmod +x "$TMP/spy/git-lfs"
  export PATH="$TMP/spy:$PATH"
  echo change >> README && git commit -qam "readme"
  if push && remote_has_topic && ! grep -q pre-push "$TMP/spy/calls" 2>/dev/null; then
    ok "git-lfs: push without LFS changes passes without calling git lfs pre-push"
  else ko "git-lfs: push without LFS changes passes without calling git lfs pre-push"; fi
fi

echo "${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
