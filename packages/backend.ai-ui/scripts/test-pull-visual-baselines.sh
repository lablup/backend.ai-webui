#!/usr/bin/env bash
# Fixture tests for pull-visual-baselines.sh against throwaway file:// remotes.
# Needs git-lfs on PATH; touches no git config outside its temp directory.
#
# Usage: bash packages/backend.ai-ui/scripts/test-pull-visual-baselines.sh
set -uo pipefail

SRC="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
command -v git-lfs >/dev/null || { echo "git-lfs is required for these tests" >&2; exit 2; }

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
export HOME="$T/home" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL="$T/home/.gitconfig"
mkdir -p "$HOME"
git config --global user.name test
git config --global user.email test@example.invalid
git config --global init.defaultBranch main
git config --global protocol.file.allow always
unset CI GITHUB_PATH GIT_LFS_SKIP_SMUDGE LFS_USED_OIDS_FILE

S=packages/backend.ai-ui/scripts
D=packages/backend.ai-ui/test/visual/__screenshots__
fails=0
check() { # <name> <condition...>
  local name="$1"; shift
  if "$@"; then echo "ok   - $name"; else echo "FAIL - $name"; fails=$((fails + 1)); fi
}
sha() { { sha256sum "$1" 2>/dev/null || shasum -a 256 "$1"; } | cut -d' ' -f1; }
is_pointer() { [ "$(head -n1 "$1")" = "version https://git-lfs.github.com/spec/v1" ]; }
quiet() { "$@" >/dev/null 2>&1; }
pull() { local c="$1"; shift; bash "$c/$S/pull-visual-baselines.sh" "$@" 2>&1; }
store_of() { git -C "$1" lfs env | sed -n 's/^LocalMediaDir=//p'; }

git init -q --bare "$T/origin.git"
git init -q "$T/seed" && cd "$T/seed" || exit 1
quiet git lfs install --local
mkdir -p "$S" .github/scripts/lfs "$D/BAICard" "$D/BAIAlert"
cp "$SRC/$S/pull-visual-baselines.sh" "$S/"
cp "$SRC/.github/scripts/lfs/lib.sh" "$SRC/.github/scripts/lfs/install-git-lfs.sh" .github/scripts/lfs/
head -c 20000 /dev/urandom > "$D/BAICard/Basic.png"
head -c 21000 /dev/urandom > "$D/BAIAlert/Basic.png"
printf '%s\n' "$D/**/*.png filter=lfs diff=lfs merge=lfs -text" > .gitattributes
printf '[lfs]\n\tfetchexclude = %s/**\n' "$D" > .lfsconfig
git add -A && git commit -qm base
git remote add origin "file://$T/origin.git"
quiet git push origin main
CARD_SHA="$(sha "$D/BAICard/Basic.png")" ALERT_SHA="$(sha "$D/BAIAlert/Basic.png")"

# A branch whose new baseline exists only in the fork's LFS store.
git clone -q --bare "file://$T/origin.git" "$T/fork.git"
git remote add fork "file://$T/fork.git"
git checkout -qb feature
head -c 22000 /dev/urandom > "$D/BAICard/New.png"
git add -A && git commit -qm "fork: add a baseline"
quiet git -c lfs.allowincompletepush=true push fork feature
quiet env GIT_LFS_SKIP_PUSH=1 git push origin feature
NEW_SHA="$(sha "$D/BAICard/New.png")"

fresh() { # <dir> [branch]
  rm -rf "$1"
  GIT_LFS_SKIP_SMUDGE=1 git clone -q "file://$T/origin.git" "$1"
  [ -z "${2:-}" ] || GIT_LFS_SKIP_SMUDGE=1 git -C "$1" checkout -q "$2"
}

# 1. No pointer left: exits 0 at once and prints nothing.
fresh "$T/c1"
quiet pull "$T/c1"
out="$(PATH="/usr/bin:/bin" pull "$T/c1")"; rc=$?
check "no pointers: exit 0" [ "$rc" -eq 0 ]
check "no pointers: silent" [ -z "$out" ]

# 2. Pulls from origin; the checkout stays clean and no filter is configured.
fresh "$T/c2"
check "clone holds pointers" is_pointer "$T/c2/$D/BAICard/Basic.png"
quiet pull "$T/c2"; rc=$?
check "origin: exit 0" [ "$rc" -eq 0 ]
check "origin: images pulled" [ "$(sha "$T/c2/$D/BAICard/Basic.png") $(sha "$T/c2/$D/BAIAlert/Basic.png")" = "$CARD_SHA $ALERT_SHA" ]
check "origin: git status clean" [ -z "$(git -C "$T/c2" status --porcelain)" ]
check "origin: no filter in git config" [ -z "$(git -C "$T/c2" config --get-regexp '^filter\.lfs\.' || true)" ]

# 3. The branch's upstream remote is tried before origin.
fresh "$T/c3"
git -C "$T/c3" remote add fork "file://$T/fork.git"
quiet git -C "$T/c3" fetch fork
GIT_LFS_SKIP_SMUDGE=1 git -C "$T/c3" checkout -q -b feature --track fork/feature
out="$(pull "$T/c3")"; rc=$?
check "upstream: exit 0" [ "$rc" -eq 0 ]
check "upstream: fetched from fork first" grep -q "from fork$" <<<"$(grep fetching <<<"$out" | head -n1)"
check "upstream: fork-only baseline pulled" [ "$(sha "$T/c3/$D/BAICard/New.png")" = "$NEW_SHA" ]
check "upstream: git status clean" [ -z "$(git -C "$T/c3" status --porcelain)" ]

# 4. Origin lacks an object: nothing changes; a fallback fills it and is reported.
fresh "$T/c4" feature
out="$(pull "$T/c4")"; rc=$?
check "origin incomplete: exit 1" [ "$rc" -eq 1 ]
check "origin incomplete: names the baseline" grep -q "BAICard/New.png" <<<"$out"
check "origin incomplete: nothing changed" is_pointer "$T/c4/$D/BAICard/Basic.png"
quiet pull "$T/c4" --fallback-remote "file://$T/fork.git" --fallback-report "$T/c4.report"; rc=$?
check "fallback: exit 0" [ "$rc" -eq 0 ]
check "fallback: baseline pulled" [ "$(sha "$T/c4/$D/BAICard/New.png")" = "$NEW_SHA" ]
check "fallback: reports only its object" [ "$(cat "$T/c4.report")" = "$D/BAICard/New.png	file://$T/fork.git" ]
check "fallback: git status clean" [ -z "$(git -C "$T/c4" status --porcelain)" ]

# 5. A corrupted object in local storage (a stale CI cache) is fetched again.
fresh "$T/c5"
OID="$(git -C "$T/c5" cat-file blob "HEAD:$D/BAICard/Basic.png" | sed -n 's/^oid sha256://p')"
OBJ="$(store_of "$T/c5")/${OID:0:2}/${OID:2:2}/$OID"
mkdir -p "$(dirname "$OBJ")" && head -c 20000 /dev/urandom > "$OBJ"
out="$(pull "$T/c5")"; rc=$?
check "corrupted object: exit 0" [ "$rc" -eq 0 ]
check "corrupted object: reported" grep -q "1 corrupted local object(s) discarded" <<<"$out"
check "corrupted object: right content" [ "$(sha "$T/c5/$D/BAICard/Basic.png")" = "$CARD_SHA" ]

# 6. A corrupted object no remote replaces fails the run, naming the file.
fresh "$T/c6"
OBJ="$(store_of "$T/c6")/${OID:0:2}/${OID:2:2}/$OID"
mkdir -p "$(dirname "$OBJ")" && head -c 20000 /dev/urandom > "$OBJ"
out="$(pull "$T/c6" --remote "file://$T/missing.git")"; rc=$?
check "corrupted, no remote: exit 1" [ "$rc" -eq 1 ]
check "corrupted, no remote: names the baseline" grep -q "BAICard/Basic.png" <<<"$out"
check "corrupted, no remote: still pointers" is_pointer "$T/c6/$D/BAICard/Basic.png"

# 7. An explicitly given directory that does not exist is an error.
out="$(pull "$T/c2" missing/dir)"; rc=$?
check "missing dir: exit 1" [ "$rc" -eq 1 ]
check "missing dir: named" grep -q "missing/dir is not a directory" <<<"$out"

echo
if [ "$fails" -eq 0 ]; then echo "all tests passed"; else echo "$fails test(s) failed"; exit 1; fi
