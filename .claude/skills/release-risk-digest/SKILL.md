---
name: release-risk-digest
description: >
  Post a Korean release risk digest to a Microsoft Teams thread, grouped by risk
  category. Runs scripts/release-risk-report.mjs over a ref range and renders the
  result as a short HTML message: the manager version matrix, untranslated keys,
  destructive flows touched, UI without e2e cover, and manual gaps. Use when
  someone gives a Teams thread URL and asks to summarize a release, an rc, or a
  branch there — "이번 릴리즈 리스크 팀즈에 올려줘", "이 스레드에 정리해서 알려줘",
  "post the release risk report to Teams", "/release-risk-digest".
argument-hint: "--from <ref> [--to <ref>] [--dry-run] [--auto] <Teams URL>"
---

# Release Risk Digest → Teams

Turn a ref range into a QA checklist and post it to a Teams thread, grouped by
risk category. The analysis is done entirely by `scripts/release-risk-report.mjs`;
this skill's job is to run it once, render Korean HTML, and post.

> **Skill reference**: Invoke the `teams-workflow` skill for Teams CLI usage.

## Token economics — read this first

- **Data gathering is ONE Bash call**: the script emits the whole report as JSON.
  Never loop `gh pr view` over the findings — everything needed is already there.
- **No repository exploration.** Do not open source files, run `git log`, or grep
  the tree to "understand" a finding. The digest reports what the tool found; the
  reader opens the PR if they want detail.
- **No TodoWrite / TaskCreate.** This is linear: run → render → post.

## Arguments

`$ARGUMENTS` may contain these in any order:

- `--from <ref>` — **required.** The previous release tag, or `origin/main` for a branch.
- `--to <ref>` — defaults to `HEAD`.
- `--dry-run` — write the HTML to `/tmp/release-risk-digest-preview.html` and skip posting.
- `--auto` — skip the confirm-before-post prompt (for cron / unattended runs).
- A Teams thread URL (`teams.microsoft.com/l/message/...`) — **required unless `--dry-run`.**
  There is deliberately no default: posting a release summary to the wrong thread
  is not something to get wrong by omission. If the user did not give one, ask.

## Process

### 1. Run the report — ONE Bash call

Must run from a `backend.ai-webui` checkout; the script shells out to `git` in the
current directory. `--from` is required, so a missing one is a usage error, not a guess.

```bash
node scripts/release-risk-report.mjs --from "$FROM" --to "$TO" --json > /tmp/release-risk.json
```

If the script exits non-zero, report the message and stop. Do not fall back to
reading git history by hand.

### 2. Read the JSON

Top-level fields:

| Field | Meaning |
| --- | --- |
| `from`, `to`, `base` | the range, and the merge base file comparisons ran from |
| `divergedFrom` | true when `to` forked before `from` moved on — mention the base when true |
| `commits[]` | `{sha, subject, pr, fr, type, scope}` |
| `featureMatrix[]` | `{flag, version, used}` — gates **added inside the range** |
| `undeclared[]` | flags used but never declared, i.e. permanently `false` |
| `risks.noE2E[]` | `{pr, fr, subject, ui[]}` — UI changed, no e2e changed |
| `risks.destructive[]` | `{pr, fr, subject, destructive[]}` — irreversible-flow files |
| `risks.noDocs[]` | `{pr, fr, subject}` — user-visible `feat:` with no manual change |
| `i18n[]` | `{file, addedCount, missing[], placeholder[]}` per locale file |

### 3. Render the HTML

Order sections by how much they block a release, not by risk number:

1. **R2 version matrix** — decides which managers QA needs
2. **R2b undeclared flags** — a feature silently off everywhere (omit when empty)
3. **R3 untranslated** — ships visibly broken text
4. **R4 destructive flows** — the typed-confirm gate must be re-verified
5. **R1 UI without e2e** — the manual-pass list
6. **R5 manual gaps**

**Keep it short.** A Teams message is read on a phone. Per section list at most
**5** items and append `외 N건` when there are more. For R3, do not list 40 locale
files — collapse to the shape (`대부분의 언어에서 placeholder N개 / 누락 M개`) and
name only the outliers.

**HTML safety**: escape `&`, `<`, `>`, `"`, `'` in every string taken from the JSON
(PR subjects, file paths, flag names) before inserting it. Emit only `<b>`, `<i>`,
`<br/>`, `<ul>`, `<li>`, `<a href="...">`, `<code>`, `<hr/>`. Escape `&` in URLs too.

PR links are `https://github.com/lablup/backend.ai-webui/pull/{pr}`.

Template:

```html
<b>🚀 릴리즈 리스크 — {from} → {to}</b><br/>
커밋 {commits.length}건{, 비교 기준 merge-base <code>{base[0:8]}</code> when divergedFrom}<br/><br/>

<b>⚙️ 매니저 버전 매트릭스</b> — 신규 게이트 {n}개<br/>
<ul>
  <li><code>{flag}</code> — {version} 이상 필요{, 미사용 when !used}</li>
</ul>
<i>각 항목을 버전을 충족하는 매니저와 충족하지 않는 매니저 양쪽에서 확인해야 합니다.
낮은 버전에서는 숨겨져야 하고, 깨지면 안 됩니다.</i><br/><br/>

<b>🌐 미번역</b> — 신규 영어 키 {addedCount}개<br/>
{shape line, then outliers}<br/><br/>

<b>⚠️ 파괴적 플로우</b> — {n}건<br/>
<ul>
  <li><a href="{prUrl}">#{pr}</a> {subject} — <code>{basename of destructive[0]}</code></li>
</ul>
<i>이름을 정확히 입력해야 삭제 버튼이 활성화되는지 재확인이 필요합니다.</i><br/><br/>

<b>🧪 e2e 미커버 UI 변경</b> — {n}건<br/>
<ul><li><a href="{prUrl}">#{pr}</a> {subject}</li></ul>
{외 N건}<br/><br/>

<b>📖 매뉴얼 미반영</b> — {n}건<br/>
<ul><li><a href="{prUrl}">#{pr}</a> {subject}</li></ul>
<hr/>
<i>🤖 scripts/release-risk-report.mjs · 결함 목록이 아니라 QA 확인 항목입니다</i>
```

Drop any section whose count is 0 rather than printing an empty heading. If every
section is empty, post a single line saying the range has no risk signals.

The closing italic line matters: these are **actions to check**, not confirmed
defects. Do not phrase a finding as a bug.

### 4. Confirm

Unless `--auto`, show the rendered HTML and ask for approval before posting.
Posting to Teams is outward-facing and cannot be unsent cleanly.

### 5. Post

```bash
TEAMS_READER=$(find ~/.claude/plugins -name teams_reader.py 2>/dev/null | head -1)
[ -z "$TEAMS_READER" ] && { echo "FAIL: teams_reader.py not found. Install the fw plugin."; exit 1; }
TEAMS_PYTHON="${TEAMS_PYTHON:-python3}"
export TEAMS_TENANT_ID="${TEAMS_TENANT_ID:-13c6a44d-9b52-4b9e-aa34-0513ee7131f2}"
export TEAMS_CLIENT_ID="${TEAMS_CLIENT_ID:-7a2e1945-3a1c-407f-9780-c573119d1c1b}"

BODY=$(mktemp); LOG=$(mktemp)
cat > "$BODY" <<'HTMLEOF'
<HTML HERE>
HTMLEOF
if "$TEAMS_PYTHON" "$TEAMS_READER" --no-ai-label --reply "$(cat "$BODY")" "$TEAMS_URL" >"$LOG" 2>&1; then
  rm -f "$BODY" "$LOG"; echo "OK"
else
  cat "$LOG"; rm -f "$BODY" "$LOG"; exit 1
fi
```

Pass `--no-ai-label`: the template already carries its own footer.

For `--dry-run`, write the same HTML to `/tmp/release-risk-digest-preview.html`
and print the path instead.

## Examples

```bash
# An rc, posted to the release thread
/release-risk-digest --from v26.8.1 --to v26.9.0-rc.3 <teams-url>

# What is queued for the next release
/release-risk-digest --from v26.8.1 <teams-url>

# One PR's checklist, previewed locally first
/release-risk-digest --from origin/main --to FR-3820 --dry-run
```

## Related

- `scripts/release-risk-report.mjs` — the analysis; `--help` for its own flags
- `teams-workflow` (fw) — the Teams CLI, mentions, and images
- `merged-pr-digest` (fw) — the same post-to-Teams shape for merged PRs
- `.claude/rules/destructive-confirmation.md` — what R4 asks the reader to re-verify
