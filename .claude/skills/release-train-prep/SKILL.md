---
name: release-train-prep
description: >
  Post a Korean release risk digest to a Microsoft Teams thread, grouped by risk
  category. Runs scripts/release-risk-report.mjs over a ref range and renders the
  result as a short HTML message: the manager version matrix, untranslated keys,
  destructive flows touched, UI without e2e cover, and manual gaps. Use when
  someone gives a Teams thread URL and asks to summarize a release, an rc, or a
  branch there — "이번 릴리즈 리스크 팀즈에 올려줘", "이 스레드에 정리해서 알려줘",
  "post the release risk report to Teams", "/release-train-prep". With
  --train <version> it also opens the release train: creates the
  "Final Train to v<version>" Jira Story and posts the kickoff + digest into
  the thread — "트레인 이슈 만들어줘", "릴리즈 트레인 준비해줘", "release train 시작".
argument-hint: "--from <ref> [--to <ref>] [--train <version>] [--dry-run] [--auto] <Teams URL>"
---

# Release Train Prep → Teams

Prepare a release train: turn a ref range into a QA checklist, post it to the
train's Teams thread grouped by risk category, and (with `--train`) open the
`Final Train` Jira Story. The analysis is done entirely by
`scripts/release-risk-report.mjs`; this skill runs it once, renders Korean
HTML, and posts.

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

- `--from <ref>` — the base of the comparison. When absent, **offer the choices
  below rather than erroring or guessing** (see *Resolving `--from`*).
- `--to <ref>` — defaults to `HEAD`.
- `--dry-run` — write the HTML to `/tmp/release-train-prep-preview.html` and skip posting.
- `--auto` — skip the confirm-before-post prompt (for cron / unattended runs).
- `--train <version>` — also open the release train for `v<version>`: create the
  `Final Train to v<version>` Jira Story and post the kickoff into the thread.
  See *Train kickoff* below.
- A Teams thread URL (`teams.microsoft.com/l/message/...`) — **required unless `--dry-run`.**
  There is deliberately no default: posting a release summary to the wrong thread
  is not something to get wrong by omission. If the user did not give one, ask.
  The Teams CLI can only **reply** to an existing thread — it cannot open a new
  channel message — so the thread itself is created by a human first, which
  matches how the team actually runs a train.

## Resolving `--from`

Nothing is inferred silently: no release tag is an ancestor of `main` in this
repository (they live on the release branches, so `git describe` fails on main),
and defaulting to the newest tag would report a whole release to someone who ran
this on a feature branch. But an error is a dead end — **offer the choices**.

**Refresh first.** A stale `origin/main` moves the merge base and quietly changes
every file-based finding, so fetch before offering it:

```bash
git fetch origin main --quiet
LATEST_TAG=$(git tag --sort=-creatordate | head -1)
PREV_RC=$(git tag --sort=-creatordate | sed -n 2p)
# The previous *stable* release, not the previous rc — see the note below.
PREV_STABLE=$(git tag --sort=-creatordate | grep -Ev '\-(rc|alpha|beta)\.|\+' | head -1)
BRANCH=$(git branch --show-current)
```

Then ask with `AskUserQuestion`, putting the option that matches the current HEAD
first and marking it `(Recommended)`. On a feature branch that is the branch diff;
on a release branch or a detached tag it is the release comparison.

| Option | `--from` / `--to` | Answers |
| --- | --- | --- |
| 현재 브랜치가 추가한 것 | `origin/main` (just fetched) | what this PR puts into a release |
| 다음 릴리즈에 쌓인 것 | `$LATEST_TAG` → `HEAD` | what is queued but not yet cut |
| 이번 릴리즈 전체 | `$PREV_STABLE` → `$LATEST_TAG` | what the release as a whole contains |
| 직전 rc 이후 | `$PREV_RC` → `$LATEST_TAG` | what changed in the last rc turn |

Offer the last row only when `$LATEST_TAG` is a prerelease. The two release rows
are far apart in size and answer different questions — at the time of writing,
`$PREV_STABLE..$LATEST_TAG` was 175 commits and `$PREV_RC..$LATEST_TAG` was 18 —
so do not collapse them into one "previous tag" option.

`AskUserQuestion` always offers **Other**, which is how the user supplies a ref
this list does not cover (an older tag, another branch, a SHA) — take that string
verbatim as `--from`. Do not pre-validate it; the script fails loudly on a bad ref.

Say which ref you resolved to in the reply, so a wrong pick is visible before the
message reaches Teams.

## Process

### 1. Run the report — ONE Bash call

Must run from a `backend.ai-webui` checkout; the script shells out to `git` in the
current directory. By this point `$FROM` is whatever *Resolving `--from`* settled on —
the script itself takes no default and exits 2 without one.

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

For `--dry-run`, write the same HTML to `/tmp/release-train-prep-preview.html`
and print the path instead.

## Train kickoff (`--train <version>`)

The team's release ritual: a human opens a `🚂 Final train to vX.Y.Z` thread,
someone creates the `Final Train to vX.Y.Z` Jira Story, and every bug found
during release testing is linked onto it — `is blocked by` for blockers,
`relates to` for the rest. The stable tag is cut when no blocker is left open.
This mode automates the middle step and seeds the thread with the digest.

Runs **in addition to** the normal digest flow, sharing its range resolution
and its confirm gate. Steps, in order:

1. **Duplicate scan first.** An existing train for the same version is reused,
   never doubled:

   ```bash
   $FW_JIRA search "project = FR AND summary ~ \"Final Train\" AND summary ~ \"$VERSION\"" --limit 5
   ```

   On a hit, skip creation, use the existing key, and say so in the reply.

2. **Create the Story** (see the `jira-workflow` skill; `$FW_JIRA` as documented
   there). Type **Story**, exact summary format `Final Train to v$VERSION` —
   the team greps for this shape (FR-3663, FR-3392, FR-3238 all follow it):

   ```bash
   $FW_JIRA create --type Story --assignee me \
     --title "Final Train to v$VERSION" \
     --desc "Release train for v$VERSION. Bugs found during release testing are
   linked here: **is blocked by** for release blockers, **relates to** for
   non-blocking findings. The stable tag is cut when no blocking issue is open.

   Kickoff thread: $TEAMS_URL
   Risk digest at kickoff: see the thread reply posted alongside this issue."
   ```

3. **Attach the thread as a web link** so the issue points back at the
   conversation: `$FW_JIRA weblink $KEY --url "$TEAMS_URL" --title "Kickoff thread"`.

4. **Wait for the GitHub clone.** The webhook mirrors the issue within ~a
   minute; poll `gh issue list --search "$KEY"` a few times. If it has not
   appeared after ~2 minutes, continue — mention the pending clone in the
   reply instead of blocking on it.

5. **Post the kickoff reply** into the thread: the digest as usual, prefixed
   with the train header:

   ```html
   <b>🚂 Final Train to v{VERSION}</b> — <a href="https://lablup.atlassian.net/browse/{KEY}">{KEY}</a><br/>
   릴리즈 테스트에서 발견되는 버그는 이 이슈에 연결해주세요 —
   블로커는 <b>is blocked by</b>, 그 외는 <b>relates to</b>.<br/><br/>
   {the normal digest body}
   ```

What this mode deliberately does **not** do:

- **Link bugs to the train.** Whether a finding blocks the release is a human
  call, made per bug as it is filed (the `astryx-bug-report` /
  `jira-github-bridge` flow already covers the mechanics).
- **Decide go / no-go.** The open-blocker list is one Jira view away
  (`links` on the train issue); it needs no digest.
- **Cut any tag or release.** The train issue is bookkeeping; releasing is
  `create-release`'s job, triggered by a human.

## Examples

```bash
# Open the train for 26.10.0: Jira Story + kickoff digest into the thread
/release-train-prep --train 26.10.0 --from v26.9.0 <teams-url>

# An rc, posted to the release thread
/release-train-prep --from v26.8.1 --to v26.9.0-rc.3 <teams-url>

# What is queued for the next release
/release-train-prep --from v26.8.1 <teams-url>

# One PR's checklist, previewed locally first
/release-train-prep --from origin/main --to FR-3820 --dry-run
```

## Related

- `scripts/release-risk-report.mjs` — the analysis; `--help` for its own flags
- `teams-workflow` (fw) — the Teams CLI, mentions, and images
- `jira-workflow` (fw) — `$FW_JIRA` setup, `create`, `weblink`, `search`
- `jira-github-bridge` (fw) — the webhook clone and `Resolves #N (KEY)` conventions
- `merged-pr-digest` (fw) — the same post-to-Teams shape for merged PRs
- `create-release` — cutting the tag itself; out of this skill's scope
- `.claude/rules/destructive-confirmation.md` — what R4 asks the reader to re-verify
