# 0004 — Walkthrough stops in the v3 anchor

## Summary

- A **Stop** — one pin an implementing session leaves to say what changed and
  what to check — is an additive set of optional fields on the existing v3
  anchor (ADR 0002). There is no v4 envelope: it measures three times
  smaller, but it is a second grammar, so it stays deferred.
- A Stop resolves **strictly**: its landmark must match, and a `dlg` flag
  restricts a candidate to an open dialog. A measured false positive — a
  closed-modal stop that located onto a look-alike element outside it —
  ruled out the looser reviewer-pin resolution for stops.
- The codec owns one **volatile-query denylist** that drops parameters such
  as `formValues` from every anchor's query, reviewer pins included.
- A walkthrough is capped at **20 stops**, driven by GitHub's 65,536-
  character comment limit, not by the link itself.
- The PR comment carries exactly one `<!-- bai-walkthrough v1 pr= sha=
stops= server= -->` marker and no `<!-- bai-review -->` markers, so
  `pr-review-thread-resolver` never reads a stop as a finding.
- Guided mode ports the docs PR preview's grammar
  (`packages/backend.ai-docs-toolkit/templates/assets/pr-preview.{js,css}`)
  as design. Sharing its implementation with the Web UI overlay is out of
  scope.
- The trigger is a webui-owned skill (`.claude/skills/walkthrough/`), run by
  the implementing session itself — not a change to the shared `dw`/`fw`
  plugins, and not a notification. This narrows spec R3.1's "no ✅ What to
  check comment" decision (2026-09-01) into the shape spec R3.9 invited: a
  new ticket, not a revival of the dropped Teams reply.

## Context

The review overlay's pin set (ADR 0002) carries one reviewer's remarks. This
decision extends the same anchor to also carry a **Stop**: a pin the
_implementing_ session authors, not a reviewer, to say what it changed and
what the requester should check. An ordered set of Stops is a **Walkthrough**.
Both terms, plus **Mark** (the tinted element guided mode draws in place of a
pin glyph) and **Navigator** (the bottom-right pill that walks the stops),
are defined in `react/vite-plugins/review-overlay/CONTEXT.md`.

A Stop has to fit the anchor's existing budget, resolve reliably against a
DOM that renders behind tabs and dialogs, and reach the PR as a comment that
GitHub accepts and the review-thread resolver ignores. Spec Revision 3 (R3.1,
R3.9) had already ruled out an automatic "what to check" comment and an
end-of-run notification for the shared implementation workflow; this
decision revisits only the first ruling, for a differently triggered
mechanism, and leaves R3.9 in force.

## Diagram

```mermaid
flowchart LR
  session[Implementing session]
  skill[".claude/skills/walkthrough<br/>scripts/mint.mjs"]
  server[Booted dev server<br/>overlay's __review js modules]
  anchor["Stop fields in AnchorV3<br/>ch, ck, code, sha, pr, via, dlg"]
  comment["PR comment<br/>bai-walkthrough marker"]
  resolver[pr-review-thread-resolver]
  overlay[Review overlay guided mode]
  requester[Requester]

  session -- "stop manifest" --> skill
  skill -- "route, via, find" --> server
  server -- "mints & verifies in-page" --> anchor
  skill -- "set link + report" --> comment
  comment -. "no bai-review marker" .-x resolver
  anchor -- "opens" --> overlay
  overlay -- "marks, navigator, popover" --> requester
  skill -- "final message: Walkthrough link" --> requester
```

## Decision

### 1. Additive stop fields, no v4 envelope

A Stop adds optional keys to `AnchorV3`
(`react/vite-plugins/review-overlay/client/types.ts`): `ch` (what changed,
≤280 chars), `ck` (what to check, ≤280 chars, phrased as an expected
outcome), `old` / `new` (≤40 chars each, for the popover's diff line),
`type` (`'added' | 'modified'`), `kind` (a short element kind), `code`
(1–3 entries of `{path, line, to?}`), `sha` (the full 40-hex head the stop
was made for), `pr` (always present, so a static build with no boot record
can still build a code link), and `via` (a replayable click-step list,
rendered by the overlay as a sentence and never auto-clicked). `decodeAnchor`
drops an ill-typed optional field rather than rejecting the anchor;
`isStop(anchor)` is `ck` being a string. Today's `decodeAnchor` and the
`review-pins` CLI already accept and preserve these keys unchanged, so this
is ADR 0002's "no version bump" case.

| variant                                         | worst case, chars                                  |
| ----------------------------------------------- | -------------------------------------------------- |
| today's reviewer note, 280 chars Korean         | 760                                                |
| `ch`+`ck` 280 Korean, 3 code refs, `sha`, `pr`  | 1,263                                              |
| `ch`+`ck` 280 English, 3 code refs, `sha`, `pr` | 792                                                |
| v4 envelope, same content                       | not applicable — 3× smaller as a set, not per-stop |

A v4 envelope measures three times smaller at 30 stops (12.3K vs. 36.1K
characters) but is a second grammar with a permanent legacy path for v3
links. It stays deferred until a cap higher than 20 stops is actually
needed.

### 2. Strict resolution and the volatile-query denylist

`resolve.ts` accepts a text-scan candidate for a Stop only when the
candidate's landmark `data-testid` matches the stop's; a stop carrying
`dlg: 1` accepts a candidate only while it sits inside an open
`[role=dialog]`. This followed a measured false positive: a stop for a modal
"located" onto the Data page's Active button while the modal was closed,
because the text fallback matched a look-alike with no landmark check, and
opening the modal never moved the mark onto the real element. An unresolved
stop stays "waiting" rather than pinning the wrong element.

The overlay's anchor capture (`anchor-guard.ts`) also gains a shared,
codec-owned denylist of volatile query parameters — `formValues` first —
dropped from every anchor's `q`, reviewer pins included. The session
launcher's `formValues` JSON had produced a 1,047-character anchor on its
own.

While a walkthrough stop is current and unresolved, `pin.ts` re-arms
resolution on DOM mutation outside the overlay host, not only on the
landing ladder and route changes as today — a dialog that opens without
changing the URL never re-triggered resolution otherwise.

### 3. The 20-stop cap and the comment-length budget

GitHub's 65,536-character comment body is the binding limit, not the anchor
or the URL. At 20 Korean stops, a comment whose blocks carry no per-stop
link and a header carrying only the set link once runs to roughly 38K
characters; the same shape with a per-stop link on every block runs to
roughly 62K, close enough to the limit to fail on a heavier stop. A
walkthrough is therefore capped at 20 stops, separate from the reviewer
pin set's 30-pin cap (ADR 0002).

A stop's code link needs no commit SHA to resolve: it is rendered as
`https://github.com/lablup/backend.ai-webui/pull/<pr>/files#diff-<sha256(path)>R<line>[-R<to>]`,
which the PR's Files tab answers regardless of the current head. Line drift
after a rebase is accepted; the stop's own `sha` field is what lets the
overlay warn when the server serves a different commit than the one the
stop was made for.

### 4. The `bai-walkthrough` marker, kept apart from `bai-review`

One PR comment per PR carries exactly one marker,
`<!-- bai-walkthrough v1 pr=<pr> sha=<sha> stops=<n> server=<app> -->`,
found and edited in place on a re-mint. The comment carries **no**
`<!-- bai-review -->` markers and no `> 📍` quote blocks, so
`pr-review-thread-resolver` (ADR 0002, R3.8) never reads a stop as a
reviewer finding — no change to the shared `claude-mp` resolver is needed.
A reviewer comment made inside the walkthrough's guided-mode popover still
exports as an ordinary `bai-review` block (with a `re: stop k · <id>` line),
so the resolver keeps reading those as it always has.

### 5. Guided mode as the docs PR preview's grammar, ported as design

The overlay's guided mode — tinted Marks with a dashed outline and an
ordinal badge, the bottom-right Navigator pill, the per-stop popover, the
`n`/`p`/`v`/`m`/`c` keys, and the page banner that also carries the
stale-server warning — follows the visual and interaction grammar of the
docs PR preview (`packages/backend.ai-docs-toolkit/templates/assets/
pr-preview.{js,css}`). The port is a design reference, not shared code: the
docs preview is a global-CSS IIFE bound to the docs DOM, and the Web UI
overlay is Shadow-DOM modules bound to `#bai=v3`. Converging the two
implementations into one module is a later effort, out of this decision's
scope.

### 6. Trigger: a webui-owned skill, not dw/fw plugins

A Walkthrough is minted by `.claude/skills/walkthrough/`, a skill owned by
this repository, invoked by the implementing session as the last step of
its own workflow — after the PR's dev server is booted and advertised — and
also invocable on demand for any PR with a live server. `dev-server`'s own
skill is unchanged; minting is a caller, not a new side effect of booting.
No shared `dw`/`fw` plugin changes, and no notification: the final chat
message gains one `Walkthrough:` line, and nothing is posted to Teams.

This is a narrow revisit of spec R3.1's "no ✅ What to check comment"
decision (2026-09-01, driver Jongeun Lee, FR-3814 Not Planned) — the comment
spec R3.1 rejected was to be posted automatically by the shared `dw:impl`
orchestrator for every implementation run. A Walkthrough is triggered by a
repository-owned skill instead, and is scoped to on-screen, reviewable
change, not a status update. Spec R3.9's "not planned" ruling on an
end-of-run notification stays in force: minting a Walkthrough posts no
Teams message. The reversal is flagged to the previous driver on
[FR-3947](https://lablup.atlassian.net/browse/FR-3947) rather than landing
silently.

## Rejected alternatives

- **A v4 envelope for every stop.** Shorter comments (3× at 30 stops), but a
  second grammar and a permanent legacy path for v3 links. Rejected until
  the 20-stop cap itself needs to rise.
- **Loose (reviewer-style) resolution for stops.** Matches today's reviewer
  pins, but a measured false positive — locating a closed-modal stop onto a
  look-alike element — showed a wrong pin is worse than a stop that stays
  "waiting". Rejected in favor of the strict landmark-and-dialog check.
- **An encoder CLI fallback for minting.** Would let a stop be authored
  without a live dev server. Rejected: every stop is minted and verified
  headless, against the running server, or it is not minted at all — a
  CLI-built anchor is never verified to exist.
- **Per-stop dev links inside the PR comment.** Matches ADR 0002's per-block
  link convention for reviewer pins, but a 20-stop Korean walkthrough with a
  link on every block runs to roughly 62K characters, close to GitHub's
  limit. Rejected: the comment carries the set link once; the Navigator
  walks the rest.
- **Merging the docs PR preview and the Web UI review overlay into one
  guided-mode implementation.** Would remove the duplication guided mode's
  port creates, but the two run on different DOM and styling substrates.
  Rejected for this decision; a shared implementation is a later effort.
- **Reviving spec R3.9's end-of-run Teams notification for the walkthrough
  trigger.** The same shape the notification would have taken — one message
  when an implementation run finishes — is available again now that the
  trigger is repository-owned rather than the shared orchestrator. Rejected:
  R3.9 stays dropped, and a Walkthrough's only delivery is the PR comment
  and the final chat message.

## Consequences

- `react/vite-plugins/review-overlay/client/types.ts`, `resolve.ts`,
  `anchor-guard.ts` and `pin.ts` gain the Stop-specific fields, resolution
  rule and denylist; the reviewer-pin path is unaffected except for the
  shared denylist.
- `.claude/skills/walkthrough/` becomes a new caller of the overlay's
  in-page anchor-minting modules and of `dev-server`'s boot record; neither
  of those changes for this decision.
- A walkthrough longer than 20 stops has to be trimmed or grouped by the
  authoring skill; there is no larger-set escape hatch until a v4 envelope
  is built.
- `pr-review-thread-resolver` needs no change to stay safe from walkthrough
  comments, because the marker boundary is the enforcement point rather than
  a resolver-side skip list.
- Guided mode's visual language now has to be kept in step with the docs PR
  preview by hand, since nothing shares code between them.

## Sources

- FR-3941 (wayfinder map) and its resolved decisions FR-3942 (payload and
  budget), FR-3943 (headless minting and strict resolution), FR-3944
  (guided mode), FR-3945 (the walkthrough skill), FR-3946 (the PR comment).
  Decided 2026-09-15.
- FR-3947 — flags the R3.1 revisit to the previous driver.
- Related: ADR 0002 (the v3 anchor and pin-set grammar this decision
  extends); spec `pr-devserver-review.md` Revision 3 (R3.1, R3.8, R3.9) and
  Revision 4, `lablup/frontend-board`.

## Glossary

- **Stop** — one pin in a Walkthrough, carrying what changed, what to check,
  and its code references. Full definition:
  `react/vite-plugins/review-overlay/CONTEXT.md`.
- **Walkthrough** — the ordered set of Stops an implementing session leaves
  on the dev server. Full definition: `react/vite-plugins/review-overlay/
CONTEXT.md`.
- **Mark** — the tinted changed element guided mode draws in place of a pin
  glyph. Full definition: `react/vite-plugins/review-overlay/CONTEXT.md`.
- **Navigator** — the bottom-right pill that walks the stops. Full
  definition: `react/vite-plugins/review-overlay/CONTEXT.md`.
