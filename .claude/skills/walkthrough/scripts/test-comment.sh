#!/usr/bin/env bash
# Unit tests for comment.sh: body rendering and the upsert against a fake `gh`.
# Run:  bash .claude/skills/walkthrough/scripts/test-comment.sh
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$HERE/../../../.." && pwd)
# shellcheck source=./comment.sh
source "$HERE/comment.sh"
set +e

PASS=0 FAIL=0
check() {
  if [ "$2" = "$3" ]; then
    PASS=$((PASS + 1)); printf 'ok   %s\n' "$1"
  else
    FAIL=$((FAIL + 1)); printf 'FAIL %s\n  expected: %q\n  actual:   %q\n' "$1" "$2" "$3"
  fi
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

SHA=c61efbf21a4d9e0b7f3c2d8e5a6b1c0d9e8f7a6b
# Two REAL stop anchors, encoded with the overlay's own codec and keyed with
# its own pinId — a fake payload would decode to null, `isStop` would be false,
# and the exclusion assertion below would pass for the wrong reason.
LINK='http://fr-9605.box.example/project/default/data#bai=v3.c_kntruwm.TYzBSgJRFIZf5fKvRwvEwAM9hivHxdURkyIHvUoQLUSFcBKEknExLgZGUBEXNkGCvlDnzDvEhcCW38f__c_ogwoOuiBUPG10zjS6puXduvB1s5GzykUVDnwQrizCgdFNEGo9Y9qPFp8MCGX_oa09iy0PdMnhoH4PAm83HC-VRCMli4RX37I9KxkOOFhLOFPu34ELxYdRNjnJMlX8mUq4k_lJZfMNB68cJHn7dweChGOOI36P_u3lmFqRhQlPPziOlCz2P4e1xG8y-br0fgdUurkuvvwC&bai=v3.c_tfjjpa5.bczNasJAFAXgVxnOemIVUeiFPoJPYLoYMmMaGokkUymIIK7EbAIaBHHpQiULoT8rn8gZ30GHFty4u-dwvjvCENTkyEDoSqGFp1WmI_nio5fEUqVekCqhlddPpIh9vIJjAMKT24JDixAEGQ3d_alB6CRSxZmLkQQ9-gKO4B2Ej0yEivVve7sqmP8vfZyPE2a-vu2qsuWJXcq9yWcm39acewPBHHYmr5z5E8xOK7veM9cvNk7b3-X5ODFFYec_dzxIQc_teotDxiGoMb4C'
cat >"$TMP/report.json" <<JSON
{"setLink":"$LINK","sha":"$SHA","pr":9605,"app":"fr-9605-pr9605-decide-overwrite",
 "url":"http://fr-9605.box.example",
 "stops":[
  {"id":"c_abcdefg","label":"Data › page-data › button \"Upload\"","ok":true,
   "ch":"업로드 버튼이 카드 헤더로 옮겨졌습니다.","ck":"목록 위 오른쪽 상단에 \"Upload\" 버튼이 보여야 합니다.",
   "old":"행마다 ⬆ 아이콘","new":"헤더의 \"Upload\" 버튼","type":"modified","kind":"button",
   "code":[{"path":"react/src/pages/VFolderListPage.tsx","line":120}]},
  {"id":"c_hijklmn","label":"Data › folder-create-modal › radio","ok":true,
   "ch":"모달에 Models 사용 모드가 추가됐습니다.","ck":"usage mode에 \"Models\"가 보여야 합니다.",
   "type":"added","kind":"radio",
   "code":[{"path":"react/src/components/FolderCreateModal.tsx","line":88,"to":104}]}],
 "couldNotPin":[{"label":"Session start › skip button","ck":"1단계 하단에 버튼이 보여야 합니다.","reason":"did not resolve within 30s"}]}
JSON
REPORT=$(jq -c . "$TMP/report.json")
BODY=$(comment_body "$REPORT" lablup/backend.ai-webui)
printf '%s\n' "$BODY" >"$TMP/body.md"

# ── marker ────────────────────────────────────────────────────────────────────
check 'exactly one walkthrough marker, first line' 1 "$(grep -c '<!-- bai-walkthrough' <<<"$BODY")"
check 'the marker carries pr/sha/stops/server' \
  "<!-- bai-walkthrough v1 pr=9605 sha=$SHA stops=2 server=fr-9605-pr9605-decide-overwrite -->" \
  "$(head -1 <<<"$BODY")"
check 'marker_key matches the marker it has to find' 'found' \
  "$(grep -qF "$(marker_key 9605)" <<<"$BODY" && echo found || echo missed)"
check 'another PR key does not match this comment' 'missed' \
  "$(grep -qF "$(marker_key 9606)" <<<"$BODY" && echo found || echo missed)"

# ── header ────────────────────────────────────────────────────────────────────
check 'header: stop count, short sha, one set link' \
  "📍 **Walkthrough · 2 stops · c61efbf** — [Open the walkthrough]($LINK)" \
  "$(sed -n 2p <<<"$BODY")"
check 'the served app is named' 'Served by `fr-9605-pr9605-decide-overwrite`.' "$(sed -n 3p <<<"$BODY")"
check 'the set link appears exactly once' 1 "$(grep -cF "$LINK" <<<"$BODY")"

# ── stop items ────────────────────────────────────────────────────────────────
check 'item 1 head: label, type and kind' '1. **Data › page-data › button "Upload"** — modified button' \
  "$(grep -m1 '^1\. ' <<<"$BODY" | sed 's/  $//')"
check 'old → new renders on one line' '   `행마다 ⬆ 아이콘` → `헤더의 "Upload" 버튼`' \
  "$(grep -m1 '→' <<<"$BODY" | grep '`' | sed 's/  $//')"
check 'a stop with no old/new renders no arrow line' 1 "$(grep -c '` → `' <<<"$BODY")"
check 'every stop carries a check line' 2 "$(grep -c '^   check: ' <<<"$BODY")"
check 'continuation lines keep the GFM hard break' 2 \
  "$(grep -c '^   check: .*  $' <<<"$BODY")"
check 'a single-line code ref links R<line>' 'ok' \
  "$(grep -qF "#$(diff_anchor react/src/pages/VFolderListPage.tsx)R120)" <<<"$BODY" && echo ok || echo missing)"
check 'a ranged code ref links R<line>-R<to>' 'ok' \
  "$(grep -qF "#$(diff_anchor react/src/components/FolderCreateModal.tsx)R88-R104)" <<<"$BODY" && echo ok || echo missing)"
check 'the diff anchor is sha256 of the path' \
  "diff-$(printf 'react/src/pages/VFolderListPage.tsx' | sha256sum | cut -d' ' -f1)" \
  "$(diff_anchor react/src/pages/VFolderListPage.tsx)"

# ── could not pin ─────────────────────────────────────────────────────────────
check 'a stop that did not resolve keeps its check' \
  '- Session start › skip button — check: 1단계 하단에 버튼이 보여야 합니다.' \
  "$(grep -m1 '^- Session start' <<<"$BODY")"

# ── what the review-pin resolver must not see ─────────────────────────────────
check 'no bai-review marker' 0 "$(grep -c 'bai-review' <<<"$BODY")"
check 'no 📍 quote block' 0 "$(grep -c '^>' <<<"$BODY")"
check 'no per-stop dev link' 0 "$(grep -c '^   \[Open' <<<"$BODY")"
# The header link IS a `#bai=v3` set link — it has to be, or it opens nothing.
# `parse` leaves a stop out of its findings (FR-3949): the review skill must
# never set out to "fix" a stop a session left to be checked. The pair of counts
# is self-proving — a payload that did not decode to a stop would be counted by
# the default run too.
if command -v pnpm >/dev/null 2>&1; then
  # `parse` exits 5 when it finds no pin, which is exactly the passing case.
  PINS=$(cd "$REPO_ROOT" && pnpm run --silent review-pins parse --json "$TMP/body.md" 2>/dev/null || true)
  check 'review-pins reports no finding for a walkthrough comment' 0 \
    "$(jq '.pins | length' <<<"$PINS")"
  STOPS=$(cd "$REPO_ROOT" && pnpm run --silent review-pins parse --json --include-stops "$TMP/body.md" 2>/dev/null || true)
  check '--include-stops sees both stops, so the payload really is a stop' 2 \
    "$(jq '.pins | length' <<<"$STOPS")"
  check 'every pin it then sees carries a check sentence' 2 \
    "$(jq '[.pins[] | select(.anchor.ck != null)] | length' <<<"$STOPS")"
else
  printf 'skip review-pins (no pnpm)\n'
fi

# ── a partly-resolved run counts and numbers only what resolved ────────────────
jq '{setLink, sha, pr, app, url,
     stops: [range(0;6) as $i | {id: "c_aaaaaa\($i)", label: "stop \($i)",
             ok: ($i != 2 and $i != 4), ch: "moved", ck: "check \($i)"}],
     couldNotPin: [{label: "stop 2", ck: "check 2", reason: "did not resolve within 30s"},
                   {label: "stop 4", ck: "check 4", reason: "resolved onto \u0027other\u0027"}]}' \
  "$TMP/report.json" >"$TMP/partial.json"
PARTIAL=$(comment_body "$(jq -c . "$TMP/partial.json")" o/r)
check 'the header counts only the stops that resolved' 'ok' \
  "$(grep -q '📍 \*\*Walkthrough · 4 stops · ' <<<"$PARTIAL" && echo ok || echo wrong)"
check 'the marker counts only the stops that resolved' 'ok' \
  "$(grep -q 'stops=4 ' <<<"$PARTIAL" && echo ok || echo wrong)"
check 'four numbered items, ending at 4' 4 "$(grep -c '^[0-9]\. \*\*' <<<"$PARTIAL")"
check 'an unresolved stop is not numbered' 0 "$(grep -c '^[0-9]\. \*\*stop 2\*\*' <<<"$PARTIAL")"
check 'both unresolved stops are listed under Could not pin' 2 \
  "$(sed -n '/^Could not pin/,$p' <<<"$PARTIAL" | grep -c '^- stop ')"
check 'their checks survive' 'ok' \
  "$(grep -q '^- stop 4 — check: check 4$' <<<"$PARTIAL" && echo ok || echo missing)"

# ── upsert against a fake gh ──────────────────────────────────────────────────
mkdir -p "$TMP/bin"
cat >"$TMP/bin/gh" <<'GH'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"$BAI_GH_LOG"
case "$*" in
  *"-X PATCH"*) printf '55\thttps://github.com/o/r/pull/9605#issuecomment-55\n' ;;
  *"-X POST"*)  printf '55\thttps://github.com/o/r/pull/9605#issuecomment-55\n' ;;
  *comments*)   cat "$BAI_GH_EXISTING" ;;
  *) printf '\n' ;;
esac
GH
chmod +x "$TMP/bin/gh"
PATH="$TMP/bin:$PATH"
export BAI_GH_LOG="$TMP/gh.log" BAI_GH_EXISTING="$TMP/existing"

: >"$BAI_GH_LOG"; : >"$BAI_GH_EXISTING"
cmd_upsert --pr 9605 --report "$TMP/report.json" --repo o/r >/dev/null 2>&1
check 'no comment yet: one POST' 1 "$(grep -c -- '-X POST' "$BAI_GH_LOG")"
check 'no comment yet: no PATCH' 0 "$(grep -c -- '-X PATCH' "$BAI_GH_LOG")"

: >"$BAI_GH_LOG"; printf '55\n' >"$BAI_GH_EXISTING"
cmd_upsert --pr 9605 --report "$TMP/report.json" --repo o/r >/dev/null 2>&1
check 're-mint edits the same comment in place' 1 "$(grep -c -- '-X PATCH repos/o/r/issues/comments/55' "$BAI_GH_LOG")"
check 're-mint creates no second comment' 0 "$(grep -c -- '-X POST' "$BAI_GH_LOG")"

# ── the PR description's section ──────────────────────────────────────────────
SECTION=$(walkthrough_section 'https://github.com/o/r/pull/9605#issuecomment-55' /dev/null)
ORIGINAL=$'Resolves #1 (FR-1)\n\n## Summary\n\nwhy\n\n## Verification\n\nall pass'
check 'a body without the section gets one appended, as a short link' \
  '- [Walkthrough](https://github.com/o/r/pull/9605#issuecomment-55)' \
  "$(describe_body "$ORIGINAL" "$SECTION" | tail -1)"
check 'appending touches nothing above it' "$ORIGINAL" \
  "$(describe_body "$ORIGINAL" "$SECTION" | head -9)"
WITH=$(describe_body "$ORIGINAL" "$SECTION")
NEXT=$(walkthrough_section 'https://github.com/o/r/pull/9605#issuecomment-99' /dev/null)
check 're-running replaces the section rather than stacking one' 1 \
  "$(describe_body "$WITH" "$NEXT" | grep -c '^## Walkthrough$')"
check 'the replaced section carries the new URL' 1 \
  "$(describe_body "$WITH" "$NEXT" | grep -c 'issuecomment-99')"
MIDDLE=$'## Walkthrough\n\nold url\n\n## Verification\n\nkept'
check 'a section in the middle keeps what follows it' 1 \
  "$(describe_body "$MIDDLE" "$NEXT" | grep -c '^kept$')"
printf '%s\n' 'react/src/hooks/useThing.ts — new hook' >"$TMP/notshown"
check 'the not-shown list becomes bullets' '- react/src/hooks/useThing.ts — new hook' \
  "$(walkthrough_section 'u' "$TMP/notshown" | tail -1)"

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
