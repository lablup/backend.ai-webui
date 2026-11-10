#!/usr/bin/env bash
# Fixture tests for pull-docs-images.sh against throwaway file:// remotes.
# Needs git-lfs on PATH; touches no git config outside its temp directory.
#
# Usage: bash .github/scripts/lfs/test-pull-docs-images.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PULL="${HERE}/pull-docs-images.sh"
command -v git-lfs >/dev/null || { echo "git-lfs is required for these tests" >&2; exit 2; }

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
export HOME="$T/home" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL="$T/home/.gitconfig"
mkdir -p "$HOME"
git config --global user.name test
git config --global user.email test@example.invalid
git config --global init.defaultBranch main
git config --global protocol.file.allow always
unset CI GITHUB_PATH GIT_LFS_SKIP_SMUDGE

D=packages/backend.ai-webui-docs/src
fails=0
check() { # <name> <condition...>
  local name="$1"; shift
  if "$@"; then echo "ok   - $name"; else echo "FAIL - $name"; fails=$((fails + 1)); fi
}
sha() { sha256sum "$1" | cut -d' ' -f1; }
is_pointer() { [ "$(head -n1 "$1")" = "version https://git-lfs.github.com/spec/v1" ]; }
quiet() { "$@" >/dev/null 2>&1; }

# origin: two LFS images and a non-LFS SVG; fork: git objects only, empty LFS store.
git init -q --bare "$T/origin.git"
git init -q "$T/seed" && cd "$T/seed" || exit 1
quiet git lfs install --local
mkdir -p "$D/en/images" "$D/en/chapter/images"
printf 'title: T\nlanguages: [en]\n' > "$D/book.config.yaml"
printf '<svg/>\n' > "$D/en/images/diagram.svg"
head -c 20000 /dev/urandom > "$D/en/images/a.png"
head -c 30000 /dev/urandom > "$D/en/chapter/images/nested.png"
printf '%s\n' "$D/**/*.png filter=lfs diff=lfs merge=lfs -text" > .gitattributes
printf '[lfs]\n\tfetchexclude = %s/**\n' "$D" > .lfsconfig   # as in the repository
git add -A && git commit -qm base
git remote add origin "file://$T/origin.git"
quiet git push origin main
A_SHA="$(sha "$D/en/images/a.png")"
N_SHA="$(sha "$D/en/chapter/images/nested.png")"
git clone -q --bare "file://$T/origin.git" "$T/fork.git"
git remote add fork "file://$T/fork.git"
head -c 25000 /dev/urandom > "$D/en/images/from-fork.png"
git add -A && git commit -qm "fork PR"
quiet git -c lfs.allowincompletepush=true push fork HEAD:refs/heads/feature
quiet env GIT_LFS_SKIP_PUSH=1 git push origin HEAD:refs/pull/1/head
F_SHA="$(sha "$D/en/images/from-fork.png")"

fresh() { # <dir> [ref]: clone origin without smudging, optionally check out a ref
  rm -rf "$1"
  GIT_LFS_SKIP_SMUDGE=1 git clone -q "file://$T/origin.git" "$1"
  if [ -n "${2:-}" ]; then
    git -C "$1" fetch -q origin "$2" && git -C "$1" checkout -q --detach FETCH_HEAD
  fi
}

# 1. Materializes every pointer, nested ones included; leaves non-LFS files alone.
fresh "$T/c1"
check "clone holds pointers" is_pointer "$T/c1/$D/en/images/a.png"
quiet bash "$PULL" "$T/c1"; rc=$?
check "pull exits 0" [ "$rc" -eq 0 ]
check "a.png materialized" [ "$(sha "$T/c1/$D/en/images/a.png")" = "$A_SHA" ]
check "nested.png materialized" [ "$(sha "$T/c1/$D/en/chapter/images/nested.png")" = "$N_SHA" ]
check "svg untouched" [ "$(cat "$T/c1/$D/en/images/diagram.svg")" = "<svg/>" ]
check "git status clean" [ -z "$(git -C "$T/c1" status --porcelain)" ]
check "no filter written to git config" [ -z "$(git -C "$T/c1" config --get-regexp '^filter\.lfs\.' || true)" ]
quiet bash "$PULL" "$T/c1"; rc=$?
check "second run is a no-op" [ "$rc" -eq 0 ]

# 2. An untracked pointer fails the run after the tracked images are restored.
fresh "$T/c2"
cp "$T/c2/$D/en/images/a.png" "$T/c2/$D/en/images/stray.png"
quiet bash "$PULL" "$T/c2"; rc=$?
check "untracked pointer fails the run" [ "$rc" -ne 0 ]
check "tracked image still materialized" [ "$(sha "$T/c2/$D/en/images/a.png")" = "$A_SHA" ]
check "untracked file left alone" is_pointer "$T/c2/$D/en/images/stray.png"

# 3. Fork PR: the new object exists only in the fork's LFS store.
fresh "$T/c3" refs/pull/1/head
quiet bash "$PULL" "$T/c3"; rc=$?
check "origin alone cannot complete a fork PR" [ "$rc" -ne 0 ]
check "nothing changed when the fetch is incomplete" is_pointer "$T/c3/$D/en/images/a.png"
quiet bash "$PULL" --fallback-remote "file://$T/missing.git" "$T/c3"; rc=$?
check "every source incomplete: exit 1" [ "$rc" -eq 1 ]
check "every source incomplete: nothing changed" is_pointer "$T/c3/$D/en/images/a.png"
quiet bash "$PULL" --fallback-remote "file://$T/fork.git" "$T/c3"; rc=$?
check "fork fallback materializes, exit 3" [ "$rc" -eq 3 ]
check "fork image materialized" [ "$(sha "$T/c3/$D/en/images/from-fork.png")" = "$F_SHA" ]
check "base image materialized" [ "$(sha "$T/c3/$D/en/images/a.png")" = "$A_SHA" ]

# 3b. Once origin holds the fork's objects (a maintainer pushed them), exit 0.
# The command build-docs-preview.sh prints for a maintainer, run in a fresh clone.
fresh "$T/maint"
quiet git -C "$T/maint" fetch origin refs/pull/1/head
quiet git -C "$T/maint" lfs fetch --exclude="" "file://$T/fork.git" FETCH_HEAD
quiet git -C "$T/maint" lfs push origin FETCH_HEAD; rc=$?
check "maintainer copy command succeeds" [ "$rc" -eq 0 ]
fresh "$T/c3b" refs/pull/1/head
quiet bash "$PULL" --fallback-remote "file://$T/fork.git" "$T/c3b"; rc=$?
check "objects copied to origin: exit 0" [ "$rc" -eq 0 ]
check "fork image materialized from origin" [ "$(sha "$T/c3b/$D/en/images/from-fork.png")" = "$F_SHA" ]

# 4. A tree without pointer files needs no git-lfs.
rm -rf "$T/raw" && git init -q "$T/raw" && mkdir -p "$T/raw/$D/en/images"
printf 'title: T\nlanguages: [en]\n' > "$T/raw/$D/book.config.yaml"
head -c 100 /dev/urandom > "$T/raw/$D/en/images/r.png"
git -C "$T/raw" add -A && git -C "$T/raw" commit -qm raw
# A git-lfs that fails and records every call, ahead of any real one on PATH.
mkdir -p "$T/stub"
printf '#!/bin/sh\necho called >> "%s"\nexit 1\n' "$T/stub/calls" > "$T/stub/git-lfs"
chmod +x "$T/stub/git-lfs"
out="$(PATH="$T/stub:$PATH" bash "$PULL" "$T/raw" 2>&1)"; rc=$?
check "no pointers: exit 0" [ "$rc" -eq 0 ]
check "no pointers: git-lfs never called" [ ! -e "$T/stub/calls" ]
check "no pointers: says nothing to do" grep -q "nothing to do" <<<"$out"

echo
if [ "$fails" -eq 0 ]; then echo "all tests passed"; else echo "$fails test(s) failed"; exit 1; fi
