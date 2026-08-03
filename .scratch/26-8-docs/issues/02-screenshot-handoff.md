# Define the screenshot hand-off artifact and the reviewer-conflict rule

Part of [Map: 26.8 user manual refresh](../map.md)

Type: task
Status: resolved

## Question

Two small conventions that both PR creation and the downstream capture effort
depend on. Originally a `grilling` ticket; converted to an AFK `task` under map
standing decision 8, so the answer must record the call *and its reasoning*.

**(a) How are screenshot needs recorded so the later batch capture is one pass?**

The existing convention is an HTML comment the `docs-screenshot-capturer` agent
greps for:

```
<!-- TODO: Capture screenshot of <file>.png — <what to show> -->
<!-- TODO: Re-capture <file>.png — <why> -->
```

That convention works per-file but does not aggregate: the manual already carries
**96 such markers** scattered across 4 languages × ~28 chapters. A capture session
driven only by grep has to reconstruct, for every marker, which page it belongs
to, what UI state produces it, and which PR branch to commit it back to — and the
PRs are separate branches, so a single working tree never sees all the markers at
once. The question is what *additional* artifact, if any, makes the capture
session a single ordered pass.

**(b) Who reviews a page whose only driving author is the person running this
effort?**

`yomybaby` / "Jong Eun Lee" drove ~28 of the 105 commits and is also the human
directing this map. Pages driven solely by them would list them as the only
reviewer — self-review, which GitHub will not even accept as an approval.

## Answer

Decided AFK 2026-08-03 under map standing decision 8.

### (a) Marker convention unchanged; add one manifest on the map branch

**Do not fork the marker convention.** Keep exactly what
`docs-screenshot-capturer` already greps for:

```
<!-- TODO: Capture screenshot of <file>.png — <what to show> -->
<!-- TODO: Re-capture <file>.png — <why> -->
```

I considered adding a shot ID (`TODO(shot:26.8-admin-01)`) to join markers to a
manifest. Rejected: the PNG filename is already unique and already present in the
marker, so it is a perfectly good join key. A second identifier would be a new
convention to maintain, would diverge from the 96 markers already in the manual,
and buys nothing.

Markers go in every language file that renders the image, matching existing
practice — the manual already carries per-locale re-capture markers where the
shot must show that locale's UI language.

**The aggregation problem is real and the marker alone does not solve it.** At
capture time the per-page PRs are unmerged branches, so no single working tree
sees all the markers at once; a grep-driven capture session would have to
rediscover, per branch, which UI state produces each shot. And a manifest
committed into every PR would be the same path in N branches — a guaranteed
conflict.

Resolution: **one manifest, on the map branch, not in the docs PRs.**
`.scratch/26-8-docs/screenshot-manifest.md`, one row per needed shot:

| column | purpose |
|---|---|
| `png` | filename — the join key back to the marker |
| `page` | manual chapter |
| `branch` | which PR branch the shot must be committed to |
| `route` | URL / navigation path that reaches the screen |
| `state` | preconditions — role, data, modal open, tab selected |
| `locales` | which language dirs need a distinct capture |
| `kind` | `new` or `recapture` |
| `fr` | driving FR, for context when the shot is ambiguous |

The capture effort then reads one file, groups rows by `branch`, and does a single
ordered pass: checkout → capture that branch's shots → commit → push. That is the
"one pass" property the ticket asked for, and it costs one file on a branch that
has no other contention.

Scope: 26.8-driven shots only. The 96 pre-existing markers stay out of the
manifest (already ruled out of scope on the map), but the manifest header notes
their existence so the capture effort can opt into clearing them while it has the
server.

### (b) Reviewers are driving authors minus the PR author, with a context fallback

Reviewer set for a page = deduped driving authors **minus the PR author**.

The PR author here is `yomybaby` — the `gh` CLI in this environment is
authenticated as that account. That is also the identity behind ~28 of the 105
commits, so self-review is not an edge case on this map; it will bite several
pages. GitHub will not accept a self-approval, so leaving it unfiltered would
produce PRs that cannot be approved at all.

When subtracting the PR author empties the set, fall back in this order:

1. **Whoever reviewed the original driving PR(s).** They already carry context on
   the feature the docs describe — strictly better than picking by volume.
2. If that yields nobody, the highest-volume 26.8 contributor who is not the PR
   author (`ironAiken2` 27 commits, then `agatha197` 20, then `nowgnuesLee` 15).

Deterministic, and it never produces an unapprovable PR. Where the fallback fires,
the PR body should say so in one line, so the reviewer understands why they were
picked for a page they did not drive.

Status: resolved
