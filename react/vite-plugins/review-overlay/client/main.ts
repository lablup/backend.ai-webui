/**
 * Dev review overlay (FR-3811 write side, FR-3813 deep link, FR-3858 sets).
 *
 * Pick an element with react-grab (⌘⌃C, or the same chord bound by the overlay
 * itself when react-grab is missing), type a note, press ⌘⏎: a self-describing
 * `#bai=v3` block lands on the clipboard as both markdown and HTML, so it
 * pastes right into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. The pin stays in the DRAFT SET, so the next ⌘⏎ copies every pin so
 * far as one comment behind one link. Opening that link on this server is the
 * read side (FR-3859): the hash carries every pin's whole anchor, so they are
 * MERGED into the draft set and pinned with no lookup at all — the ones on
 * this page as cards, the rest as rows in the dock. A link whose parts are all
 * STOPS is the implementing session's walkthrough instead, and opens in GUIDED
 * MODE (FR-3950) — a separate read-only set that never touches the draft.
 *
 * This file is the ENTRY the dev server serves as `/__review/overlay.js` and
 * the static build bundles: it boots with the default host and nothing else.
 * Another host imports `bootOverlay` from `boot.ts` instead (ADR 0008).
 */
import { bootOverlay } from './boot.js';

/** The SPA's own `<Navigate replace>` redirects drop the fragment on login. */
const BOOT_HASH = location.hash;

bootOverlay({ bootHash: BOOT_HASH });
