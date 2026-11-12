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
git add -A && git commit -qm "fork PR: add an image"
head -c 26000 /dev/urandom > "$D/en/images/from-fork.png"
git add -A && git commit -qm "fork PR: replace it"
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
quiet bash "$PULL" --fallback-remote "file://$T/fork.git" --fallback-report "$T/c3.report" "$T/c3"; rc=$?
check "fork fallback materializes, exit 0" [ "$rc" -eq 0 ]
check "fork fallback is reported" grep -q "fork.git" "$T/c3.report"
check "fork image materialized" [ "$(sha "$T/c3/$D/en/images/from-fork.png")" = "$F_SHA" ]
check "base image materialized" [ "$(sha "$T/c3/$D/en/images/a.png")" = "$A_SHA" ]

# 3b. Once origin holds the fork's objects (a maintainer pushed them), exit 0.
# The command build-docs-preview.sh prints for a maintainer, run in a fresh clone.
fresh "$T/maint"
quiet git -C "$T/maint" fetch origin refs/pull/1/head
quiet git -C "$T/maint" lfs fetch --exclude="" "file://$T/fork.git" FETCH_HEAD
quiet git -C "$T/maint" -c lfs.allowincompletepush=true lfs push origin FETCH_HEAD; rc=$?
check "maintainer copy command succeeds" [ "$rc" -eq 0 ]
fresh "$T/c3b" refs/pull/1/head
quiet bash "$PULL" --fallback-remote "file://$T/fork.git" --fallback-report "$T/c3b.report" "$T/c3b"; rc=$?
check "objects copied to origin: exit 0" [ "$rc" -eq 0 ]
check "objects copied to origin: no fallback reported" [ ! -s "$T/c3b.report" ]
check "fork image materialized from origin" [ "$(sha "$T/c3b/$D/en/images/from-fork.png")" = "$F_SHA" ]

# 3c. Merge base after head in one checkout (build-docs-preview.sh): the base's
# objects the head pull fetched are reused, not downloaded again.
fresh "$T/c3c" refs/pull/1/head
out="$(bash "$PULL" "$T/c3c" 2>&1)"; rc=$?
check "head pull: exit 0" [ "$rc" -eq 0 ]
check "head pull: reports 3 downloaded" grep -q "LFS objects: 3 needed, 0 already local, 3 downloaded" <<<"$out"
rm -rf "${T:?}/c3c/$D" && git -C "$T/c3c" checkout -q --no-overlay origin/main -- "$D"
out="$(bash "$PULL" --ref origin/main "$T/c3c" 2>&1)"; rc=$?
check "base pull: exit 0" [ "$rc" -eq 0 ]
check "base pull: reuses the head's objects" grep -q "LFS objects: 2 needed, 2 already local, 0 downloaded (0.0 MiB, 0 bytes)" <<<"$out"
check "base pull: a.png materialized" [ "$(sha "$T/c3c/$D/en/images/a.png")" = "$A_SHA" ]

# 6. A warm object store (a restored CI cache) downloads nothing; the fetch is
# skipped, so even an unreachable remote does not matter.
store_of() { echo "$1/.git/lfs/objects"; }
fresh "$T/c6"
mkdir -p "$(store_of "$T/c6")" && cp -R "$(store_of "$T/c1")/." "$(store_of "$T/c6")/"
out="$(bash "$PULL" --remote "file://$T/missing.git" "$T/c6" 2>&1)"; rc=$?
check "warm store: exit 0 without a reachable remote" [ "$rc" -eq 0 ]
check "warm store: reports 0 downloaded" grep -q "LFS objects: 2 needed, 2 already local, 0 downloaded (0.0 MiB, 0 bytes)" <<<"$out"
check "warm store: a.png materialized" [ "$(sha "$T/c6/$D/en/images/a.png")" = "$A_SHA" ]
fresh "$T/c6b"
out="$(bash "$PULL" "$T/c6b" 2>&1)"
check "cold store: reports the bytes downloaded" grep -q "LFS objects: 2 needed, 0 already local, 2 downloaded (0.0 MiB, 50000 bytes)" <<<"$out"

# 7. A corrupted object in the store (same size, one byte changed) is detected
# and downloaded again, never smudged into the checkout.
# Changes byte 100 of a file to a different value (writing a fixed byte would
# be a no-op whenever the random content already has it there).
cat > "$T/flip" <<'FLIP'
#!/bin/sh
chmod u+w "$1"
if [ "$(dd if="$1" bs=1 skip=100 count=1 2>/dev/null)" = X ]; then c=Y; else c=X; fi
printf %s "$c" | dd of="$1" bs=1 seek=100 conv=notrunc 2>/dev/null
FLIP
chmod +x "$T/flip"
a_oid() { git -C "$1" cat-file blob "HEAD:$D/en/images/a.png" | sed -n 's/^oid sha256://p'; }
corrupt_a() { # <checkout>: copy c1's store in, then flip one byte of a.png's object
  local s o; s="$(store_of "$1")"; o="$(a_oid "$1")"
  mkdir -p "$s" && cp -R "$(store_of "$T/c1")/." "$s/"
  "$T/flip" "$s/${o:0:2}/${o:2:2}/$o"
}
fresh "$T/c7" && corrupt_a "$T/c7"
out="$(bash "$PULL" "$T/c7" 2>&1)"; rc=$?
check "corrupted object: exit 0 after re-downloading it" [ "$rc" -eq 0 ]
check "corrupted object: reported" grep -q "1 corrupted local object(s) replaced" <<<"$out"
check "corrupted object: 1 local, 1 downloaded" grep -q "2 needed, 1 already local, 1 downloaded" <<<"$out"
check "corrupted object: a.png has the right content" [ "$(sha "$T/c7/$D/en/images/a.png")" = "$A_SHA" ]
fresh "$T/c7b" && corrupt_a "$T/c7b"
quiet bash "$PULL" --remote "file://$T/missing.git" "$T/c7b"; rc=$?
check "corrupted object, no remote: fails" [ "$rc" -ne 0 ]
check "corrupted object, no remote: a.png left a pointer" is_pointer "$T/c7b/$D/en/images/a.png"

# 7c. An object corrupted after the store check (the stub flips a byte when the
# LFS checkout starts) is caught by the post-checkout hash, and the file goes
# back to a pointer so that a re-run pulls it again.
fresh "$T/c7c"
mkdir -p "$(store_of "$T/c7c")" && cp -R "$(store_of "$T/c1")/." "$(store_of "$T/c7c")/"
O7="$(a_oid "$T/c7c")"; OBJ7="$(store_of "$T/c7c")/${O7:0:2}/${O7:2:2}/$O7"
mkdir -p "$T/stub7"
# shellcheck disable=SC2016 # the stub's own "$1" / "$@"
printf '#!/bin/sh\ncase "$1" in filter-process) "%s" "%s" ;; esac\nexec "%s" "$@"\n' \
  "$T/flip" "$OBJ7" "$(command -v git-lfs)" > "$T/stub7/git-lfs"
chmod +x "$T/stub7/git-lfs"
out="$(PATH="$T/stub7:$PATH" bash "$PULL" "$T/c7c" 2>&1)"; rc=$?
check "late corruption: fails" [ "$rc" -ne 0 ]
check "late corruption: names the file" grep -q "do not match the oid" <<<"$out"
check "late corruption: a.png is a pointer again" is_pointer "$T/c7c/$D/en/images/a.png"
check "late corruption: bad object deleted" [ ! -e "$OBJ7" ]
quiet bash "$PULL" "$T/c7c"; rc=$?
check "late corruption: re-run succeeds" [ "$rc" -eq 0 ]
check "late corruption: re-run materializes a.png" [ "$(sha "$T/c7c/$D/en/images/a.png")" = "$A_SHA" ]

# 8. LFS_USED_OIDS_FILE records what a pull needed; prune-lfs-store.sh keeps only that.
fresh "$T/c8"
mkdir -p "$(store_of "$T/c8")" && cp -R "$(store_of "$T/c3c")/." "$(store_of "$T/c8")/"
check "store starts with 3 objects" [ "$(find "$(store_of "$T/c8")" -type f | wc -l)" -eq 3 ]
LFS_USED_OIDS_FILE="$T/c8.used" quiet bash "$PULL" "$T/c8"; rc=$?
check "used oids: pull exits 0" [ "$rc" -eq 0 ]
check "used oids: 2 recorded" [ "$(sort -u "$T/c8.used" | wc -l)" -eq 2 ]
out="$(cd "$T/c8" && bash "${HERE}/prune-lfs-store.sh" "$T/c8.used")"
check "prune: reports 1 removed" grep -q "kept 2 object(s), removed 1" <<<"$out"
check "prune: store holds 2 objects" [ "$(find "$(store_of "$T/c8")" -type f | wc -l)" -eq 2 ]

# 9. Helpers: a path with no staged pointer gets an empty oid without shifting
# the others; an unreadable file is reported, not an abort.
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"
printf '%s\n' "$D/en/images/a.png" "$D/en/images/none.png" "$D/en/chapter/images/nested.png" > "$T/l9"
idx="$(lfs_index_pointers "$T/c8" "$T/l9")"
check "index: missing path has an empty oid" grep -q $'^\t\t'"$D/en/images/none.png\$" <<<"$idx"
check "index: next path keeps its own oid" [ "$(awk -F '\t' -v p="$D/en/chapter/images/nested.png" '$3 == p { print $1 }' <<<"$idx")" = "$N_SHA" ]
printf '%s\t%s\n' "$A_SHA" "$D/en/images/a.png" "$A_SHA" "$D/en/images/gone.png" > "$T/m9"
out="$(lfs_hash_mismatches "$T/c8" "$T/m9")"; rc=$?
check "hash check: exit 0 with an unreadable file" [ "$rc" -eq 0 ]
check "hash check: reports only the unreadable file" [ "$out" = "$D/en/images/gone.png" ]

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

# 5. Cancelled during the checkout (after the pointer files were deleted): the
# pointers come back and the temp dir is removed. The stub git-lfs signals the
# pull's own process group (setsid) when the LFS checkout starts.
fresh "$T/c5"
REAL_LFS="$(command -v git-lfs)"
mkdir -p "$T/stub5" "$T/tmp5"
# shellcheck disable=SC2016 # the stub's own "$1" / "$@"
printf '#!/bin/sh\ncase "$1" in filter-process|smudge) kill -TERM 0; sleep 5; exit 1 ;; esac\nexec "%s" "$@"\n' \
  "$REAL_LFS" > "$T/stub5/git-lfs"
chmod +x "$T/stub5/git-lfs"
out="$(TMPDIR="$T/tmp5" PATH="$T/stub5:$PATH" setsid --wait bash "$PULL" "$T/c5" 2>&1)"; rc=$?
check "cancelled: non-zero exit" [ "$rc" -ne 0 ]
check "cancelled: a.png is a pointer again" is_pointer "$T/c5/$D/en/images/a.png"
check "cancelled: nested.png is a pointer again" is_pointer "$T/c5/$D/en/chapter/images/nested.png"
check "cancelled: git status clean" [ -z "$(git -C "$T/c5" status --porcelain)" ]
check "cancelled: says the pointers were restored" grep -q "pointer files were restored" <<<"$out"
check "cancelled: temp dir removed" [ -z "$(ls -A "$T/tmp5")" ]

# 10. --root pulls another directory (the backend.ai-ui visual baselines) the same
# way: the docs source is left as pointers, a fork-only object needs the fallback.
R=pkg/shots
cd "$T/seed" || exit 1
mkdir -p "$R/a"
head -c 21000 /dev/urandom > "$R/a/one.png"
printf '%s\n' "$R/**/*.png filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
git add -A && git commit -qm "root: add a baseline"
quiet git push origin HEAD:refs/heads/root-base
head -c 22000 /dev/urandom > "$R/a/two.png"
git add -A && git commit -qm "root: fork adds a baseline"
quiet git -c lfs.allowincompletepush=true push fork HEAD:refs/heads/root-feature
quiet env GIT_LFS_SKIP_PUSH=1 git push origin HEAD:refs/pull/2/head
ONE_SHA="$(sha "$R/a/one.png")" TWO_SHA="$(sha "$R/a/two.png")"
fresh "$T/c10" refs/pull/2/head
quiet bash "$PULL" --root "$R" "$T/c10"; rc=$?
check "root: origin alone cannot complete a fork PR" [ "$rc" -ne 0 ]
check "root: nothing changed when the fetch is incomplete" is_pointer "$T/c10/$R/a/one.png"
quiet bash "$PULL" --root "$R" --fallback-remote "file://$T/fork.git" --fallback-report "$T/c10.report" "$T/c10"; rc=$?
check "root: fork fallback materializes, exit 0" [ "$rc" -eq 0 ]
check "root: fork fallback is reported" grep -q "fork.git" "$T/c10.report"
check "root: images materialized" [ "$(sha "$T/c10/$R/a/one.png") $(sha "$T/c10/$R/a/two.png")" = "$ONE_SHA $TWO_SHA" ]
check "root: docs source left as pointers" is_pointer "$T/c10/$D/en/images/a.png"
check "root: git status clean" [ -z "$(git -C "$T/c10" status --porcelain)" ]
fresh "$T/c10b" refs/pull/2/head
O10="$(git -C "$T/c10b" cat-file blob "HEAD:$R/a/one.png" | sed -n 's/^oid sha256://p')"
S10="$(store_of "$T/c10b")/${O10:0:2}/${O10:2:2}"
mkdir -p "$S10" && cp "$(store_of "$T/c10")/${O10:0:2}/${O10:2:2}/$O10" "$S10/" && "$T/flip" "$S10/$O10"
out="$(bash "$PULL" --root "$R" --fallback-remote "file://$T/fork.git" "$T/c10b" 2>&1)"; rc=$?
check "root: corrupted object replaced, exit 0" [ "$rc" -eq 0 ]
check "root: corrupted object reported" grep -q "1 corrupted local object(s) replaced" <<<"$out"
check "root: one.png has the right content" [ "$(sha "$T/c10b/$R/a/one.png")" = "$ONE_SHA" ]
out="$(bash "$PULL" --root missing/dir "$T/c10b" 2>&1)"; rc=$?
check "root: a missing root fails" [ "$rc" -ne 0 ]
check "root: a missing root is named" grep -q "missing/dir is not a directory" <<<"$out"

echo
if [ "$fails" -eq 0 ]; then echo "all tests passed"; else echo "$fails test(s) failed"; exit 1; fi
