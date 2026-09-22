---
name: walkthrough
description: >
  Mint a walkthrough for the PR this session just implemented: a set of
  numbered stops a reviewer opens in the live dev server, each one marking an
  element on screen with what changed and what to check. Run it as the LAST
  step of the implementation workflow, after the `dev-server` skill has
  advertised the PR's server — and on demand for any PR by number, booting
  a dev server for its branch when none is live. Trigger on "walkthrough
  만들어줘", "make a walkthrough", "PR #N에 walkthrough 달아줘", "add a
  walkthrough to PR #N", `/walkthrough <pr>`, "워크스루 다시 만들어줘",
  "re-mint the walkthrough", "after the dev server is advertised for a PR I
  implemented", or a request to show a reviewer what changed on screen. It
  never posts to Teams, never edits the dev-server comment itself (booting a
  server for a PR goes through `dev-server`, which does), and never marks a
  PR ready.
---

# Walkthrough

A walkthrough is the reviewer's guided tour of a PR: one `#bai=v3` set link
that opens the dev server on the first stop and walks the rest. Each stop is a
pin the **implementing session** authored, carrying the FR-3949 stop fields —
`ch` (what changed), `ck` (what to check), `old`/`new`, `type`, `kind`, `code`
and the `via` clicks that reveal it.

You write the stop manifest; `scripts/mint.mjs` does the mechanical half (log
in, replay, mint, verify, link) and `scripts/comment.sh` posts it.

## 1. When to run

- **The last step of the implementation workflow**, after `dev-server` has
  advertised the PR's server (the boot record exists and the PR carries the
  dev-server comment). The walkthrough is about the diff, so it runs on the
  branch you implemented, for that branch's PR only — lower layers of a stack
  got theirs on their own turn.
- **On demand, by PR number** — `/walkthrough 9751`, "PR #9751에 walkthrough
  달아줘" — for a PR this session did not implement, from any checkout. The
  steps are §1a; `mint.mjs --pr <n>` does the resolution.
- **Re-runs**: an implementation re-run that changes the UI re-mints and edits
  the comment in place. A doc-only or test-only re-run does not — the stops
  still point at the same elements, and a re-mint would only churn the ids.

### 1a. On demand for a PR by number

The branch path assumes the session is on the PR's branch with the diff in
its head. Given only a number, get both first:

1. **Is there a server?** `mint.mjs --pr <n> --dry-run` needs no manifest
   and answers in one line (§6): the live server that serves the PR, or
   exit 3. It refuses a PR that is not open, so that check is not yours.
2. **No server** — boot one for `headRefName` with the `dev-server` skill,
   from a checkout at the PR head: reuse a worktree already on that branch
   only when this session made it or it is clean; otherwise
   `git worktree add .claude/worktrees/<KEY> origin/<headRefName>` (where
   `EnterWorktree` and `fw:cleanup-worktrees` keep them) and `pnpm install`
   there. Say before booting that `advertise.sh` will comment the server's
   URL on a PR this session did not implement. When the backend is
   unreachable, that is a preflight failure here as everywhere: one line,
   no walkthrough. Re-run the dry run once the record exists.
3. **A server on the layer above** — for a stack, the top layer's server
   serves every lower PR and its head contains theirs; `mint.mjs` accepts
   that (it says so on stderr) and the stops are verified against that
   build. Only a server whose commit does not contain the PR head is refused.
4. **The diff.** `gh pr diff <n>` is what the manifest is written from —
   §3–§5 apply unchanged. Read the PR body's own summary first; it names
   what the author thinks is visible.
5. **Mint and post** with `--pr <n>` (§6) and `comment.sh … --pr <n>` (§7).
   The report's `pr` and `sha` come from GitHub, not from the current branch.

## 2. Preflight

Stop and say why, in one line, if any of these does not hold. A preflight
failure produces **no comment and no walkthrough**, not a partial one.

| Check                              | How                                                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The box has joined the dev gateway | `~/.config/fw/dev-gw.json` exists                                                                                                                                                                        |
| A live server for the PR           | the boot record `mint.mjs` resolves (§6): this branch's, or with `--pr` the one that serves the PR                                                                                                       |
| The server is routable             | the record's `url` answers a 2xx with `X-Portless: 1`                                                                                                                                                    |
| The server has guided mode         | `/__review/guided.js` answers 200; an older overlay (a branch that predates FR-3950) draws a stop as a bare pin without its notes, so `mint.mjs` exits 3 and says to rebase onto a main that includes it |
| The app shell survives login       | `mint.mjs` checks it and exits 3                                                                                                                                                                         |

The set link goes in a public PR comment, so an unroutable server is a
preflight failure, not a reason to fall back to the record's `localUrl` — the
same refusal `advertise.sh` makes.

The last check is the one that actually bites, and it is about the **backend**,
not the server. Resolve the endpoint the way the `dev-server` skill does
(its §2c: the PR description's named test server, then the shell/`.env` value,
then `config.toml`) and pass it as `--endpoint`; then verify the app shell
survives login — `mint.mjs` does, and exits 3 with one line when it does not.
A shell that dies leaves nothing to mint against. The symptom to recognize is
a backend whose schema the build is ahead of: the shell renders
`An error has occurred` and the console carries
`Cannot query field "scopes" on type "Role"`.

## 3. Write the stop manifest

A JSON file — `{"stops": [...]}` or a bare array — one object per stop:

```json
{
  "stops": [
    {
      "route": "/data",
      "find": { "text": "Create Folder" },
      "type": "modified",
      "kind": "button",
      "ch": "업로드 버튼이 행마다 놓여 있던 자리에서 카드 헤더로 옮겨졌습니다.",
      "ck": "목록 위 오른쪽 상단에 \"Create Folder\" 버튼이 보여야 합니다.",
      "old": "행마다 ⬆ 아이콘",
      "new": "헤더의 \"Create Folder\" 버튼",
      "code": [{ "path": "react/src/pages/VFolderListPage.tsx", "line": 120 }]
    },
    {
      "route": "/data",
      "via": [{ "click": { "text": "Create Folder" } }],
      "find": { "testid": "model-usage-mode" },
      "type": "added",
      "kind": "radio",
      "ch": "폴더 생성 모달에 Models 사용 모드 라디오가 추가됐습니다.",
      "ck": "모달 안 usage mode에 \"Models\" 선택지가 보여야 합니다.",
      "code": [
        {
          "path": "react/src/components/FolderCreateModal.tsx",
          "line": 88,
          "to": 104
        }
      ],
      "lng": "ko",
      "i18n": {
        "en": {
          "ch": "The folder create modal gained a Models usage-mode radio.",
          "ck": "The modal's usage mode shows a \"Models\" choice."
        }
      }
    }
  ]
}
```

- `route` — origin-relative, **below** the project scope (`/data`, not
  `/project/<name>/data`). `mint.mjs` prepends the base the app lands on.
  A page outside the project scope — the admin pages under `/admin/…` —
  says `"scope": "app"` and is opened as written.
- `via` — the clicks that reveal the element, replayed in order; `{"click":
{"text": "…"}}` matches exact visible text, `{"click": {"tid": "…"}}` a
  testid. At most 8.
- `find` — `{"testid": "…"}` (preferred), `{"text": "…"}` on a control, or
  `{"selector": "…"}` (a CSS selector, optionally with `"text"` to pick the
  node whose text matches — an SVG label, a table cell).
- `label` — optional; without it the comment's head is
  `Page › testid › tag "text"`, derived from the anchor.
- `lng` / `i18n` — the language `ch`/`ck`/`old`/`new` are written in, and the
  same stop in other languages (§5). Both or neither. An `i18n` entry needs
  `ch` and `ck`; `old`, `new` and `via` fall back to the base language when it
  omits them. At most 4 translations, and never one keyed by `lng` itself.
- Capture inside a `[role=dialog]` sets `dlg: 1` on its own — do not write it.

`scripts/manifest.mjs` validates the file before a browser starts and reports
every problem at once; the caps mirror the overlay's `stop-guard.ts`.

## 4. Choose the stops

- **One stop per change a person can recognize on screen** — a control that
  appeared, moved or was relabeled, a new column, new state text, a changed
  validation message.
- **N identical call sites → one stop** on the most representative one; name
  the rest in that stop's `ch` ("…, 목록 3곳 모두에").
- **No code-only stops.** A hook, a test, an i18n key, a generated file has no
  element. Those go to the PR description's **"Not shown in the walkthrough"**
  list (`comment.sh describe --not-shown`), never into the manifest.
- **At most 20.** Beyond that, group.
- **Order = the requester's flow**: the page where the feature starts, then
  interaction order within it, then the page where the result shows.
  Same-page stops stay contiguous, and a dialog stop follows the stop that
  opens it.

## 5. Wording

- `ch` — what changed and how, **past tense**, one or two sentences, naming
  the previous state when there was one. ≤ 280 chars.
- `ck` — **one** outcome the reader can verify by looking or with one click
  ("…가 보여야 합니다"). ≤ 280 chars.
- **`ck` states the condition that produces the new behaviour**, as value →
  what shows: `마운트 권한이 "none"인 폴더는 "마운트 불가", "ro"는 "Read only"로
보여야 합니다`. When the connected backend cannot produce that value yet (the
  feature is not deployed there), keep the condition and add one clause saying
  what this server cannot show — and list it under "Not shown in the
  walkthrough" (§7). "Should look the same as before" is not a check: it
  describes the unchanged branch and hides the one the PR added.
- `old` / `new` — literals, ≤ 40 chars each. Omit both when nothing was
  replaced.
- **Language** — the requester's chat language, and UI labels quoted
  **verbatim** in the language the UI shows them in.
- **Write every stop twice, `ko` and `en`** (FR-4057): the base fields in the
  requester's language with `"lng"` naming it, and the other under
  `"i18n"`. The popover's KO/EN toggle switches the stop text and the app's
  own language together, so the quoted UI labels must be the ones THAT
  language shows — the English stop quotes the English label, the Korean stop
  the Korean one. Look both up in `resources/i18n/{en,ko}.json` rather than
  translating a label yourself. A translation is not a second judgement: both
  say the same thing about the same element.
- **Write for the person looking at the screen, not for the code.** Name
  what they see — the red line, the dotted line, the button's label, the
  panel's title — and what it does now versus before. No function or
  variable names, no file names, no "series", "scale", "convert", "÷10",
  no internal terms; the `code` links carry that. A reader who has never
  opened the source must be able to check the stop from `ck` alone. Say
  "the dotted average line now sits at the real average; before it was ten
  times too high", not "the reference line now goes through
  `convertMetricUnit` like the plotted series".

## 6. Run it

```bash
node .claude/skills/walkthrough/scripts/mint.mjs \
  --manifest /tmp/walkthrough.json \
  --endpoint http://10.82.0.130:8090 \
  --report /tmp/walkthrough-report.json
```

Which server, in one place: without `--pr`, the app is the name
`dev-server` claims for the current branch (`--app` overrides), the PR is
that record's `served[]` entry, `--sha` defaults to `git rev-parse HEAD`.
With `--pr <n>` the PR is looked up in `--repo` (default
`lablup/backend.ai-webui`, never the cwd's remote) and must be open; the app
is the live boot record that serves it — never stopped, pid alive, the same
repo — preferring the record on the PR's own branch over a stack layer above
it, then the newest boot; `--app` narrows that to one record; `--sha`
defaults to the PR head. Either way the server must serve the sha (its
`/__review/state.head`, else the record's worktree) or a commit that
contains it; a server behind the sha exits 3.

`--env-file` overrides where the admin account is read from (the server's own
checkout, then this one) — never print or commit it. `--dry-run` resolves
everything and launches no browser — without `--manifest`, for the one
question §1a starts with.

A translated stop is minted **without** the element's text (`txt`): every
resolution tier ANDs it, so a stop that carried it would come unpinned the
moment the reader switched language. It resolves by selector, testid landmark
and rect instead — which is why `find` should name a `testid` (§3).

The script logs in, replays each stop, mints the anchor with the overlay's own
in-page modules, builds the set link, then opens it in a **fresh page** and
checks each stop marks its element within 30 s **over the landmark it was
captured on** — the element is stamped `data-bai-change` (guided mode) or a
`.markbox` is drawn for it (the reviewer overlay). A mark that lands on another
testid, or on none, is a failure and goes to `couldNotPin[]` with its `ck`. Exit **0** with a link, **2** on a
bad manifest, **3** on preflight.

The report's `stops[]` carries each stop's wording read back off the _stripped_
anchor, so the comment says exactly what the link carries; a `dropped` list
appears when the guard refused a field, which validation means should never
happen. A stop whose anchor exceeds 2048 chars is refused rather than minted —
`parseFragments` would drop that part of the link silently.

## 7. Post it

```bash
bash .claude/skills/walkthrough/scripts/comment.sh upsert \
  --pr <n> --report /tmp/walkthrough-report.json
bash .claude/skills/walkthrough/scripts/comment.sh describe \
  --pr <n> --report /tmp/walkthrough-report.json --not-shown /tmp/not-shown.txt
```

`upsert` writes **one comment per PR**, found by
`<!-- bai-walkthrough v1 pr=<n> … -->` and edited in place on a re-mint. It
numbers and counts only the stops that **resolved**; the rest appear under
"Could not pin" alone. It carries the set link once — no
per-stop dev links, no `<!-- bai-review -->` marker, no `> 📍` quote block. A
stop is not a review finding, and `review-pins parse` leaves one out of its
findings unless asked with `--include-stops` (FR-3949).

`describe` upserts a `## Walkthrough` section in the PR description holding
`- [Walkthrough](<comment url>)` and the "Not shown in the walkthrough" list. It
rewrites that section and nothing else.

## 8. Report to the user

After today's two dev-server URL lines, add:

```
[Walkthrough](<set link>) · 6 stops
```

and, when some stop did not pin:

```
[Walkthrough](<set link>) · 6 stops (2 could not be pinned)
- Session start › resource slider — check: 2단계에 GPU 슬라이더가 보여야 합니다.
- Data › 정렬 표시 — check: Name 헤더에 정렬 화살표가 보여야 합니다.
```

Each unpinned stop keeps its `ck`, so the reviewer can still check it by hand.
A preflight failure replaces the whole line with the one-line reason.

## 9. Out of scope

- **Never posts to Teams**, and never to Jira.
- **Never touches the dev-server comment** or its boot record — that comment
  stays URL-only and separate (`dev-server` §5 owns it).
- **Never marks a PR ready.** Draft → ready is the `fw:pr-ready-gate` skill's.
- **Never edits the PR description outside its `## Walkthrough` section**, and
  never opens, closes, labels or reviews a PR.

## 10. Tests

```bash
node --test .claude/skills/walkthrough/scripts/manifest.test.mjs
node --test .claude/skills/walkthrough/scripts/resolve.test.mjs
bash .claude/skills/walkthrough/scripts/test-comment.sh
```
