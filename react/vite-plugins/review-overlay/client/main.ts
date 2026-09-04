/**
 * Dev review overlay (FR-3811 write side, FR-3813 deep link, FR-3858 sets).
 *
 * Pick an element with react-grab (⌘⌃C, or the same chord bound by the overlay
 * itself when react-grab is missing), type a note, press ⌘⏎: a self-describing
 * `#bai=v3` block lands on the clipboard as both markdown and HTML, so it
 * pastes right into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. The pin stays in the DRAFT SET, so the next ⌘⏎ copies every pin so
 * far as one comment behind one link. Opening that link on this server is the
 * read side: the hash carries the whole anchor, so the element is pinned with
 * no lookup at all.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { captureAnchorSignals, withNote } from './anchor.js';
import {
  blockStamp,
  buildBlockHtml,
  buildBlockText,
  buildSetHtml,
  buildSetText,
  captureForBlock,
  landmarkLabel,
  resolveRouteLabel,
  type AnchorCapture,
} from './block.js';
import { decodeAnchor } from './codec.js';
import {
  createNavigationGuard,
  otherFragment,
  parseFragment,
  pathNeedsChange,
  pinUrl,
} from './deeplink.js';
import { createSetDock } from './dock.js';
import { createDraftStore, MAX_SET_PINS } from './draft.js';
import { pinId } from './id.js';
import { createPicker } from './picker.js';
import { createPinLayer, type DeepLinkPinTarget } from './pin.js';
import type {
  AnchorComponent,
  AnchorV3,
  CopyPayload,
  ReviewServerState,
  SetPin,
} from './types.js';
import { COPIED_ONE, createOverlayUI } from './ui.js';

/** The SPA's own `<Navigate replace>` redirects drop the fragment on login. */
const BOOT_HASH = location.hash;

if (!window.__baiReviewOverlay) {
  window.__baiReviewOverlay = true;
  boot();
}

function boot() {
  let serverState: ReviewServerState | null = null;
  /**
   * The pick's fiber walk, done once. The note is not part of it: it changes
   * while the reviewer types, and only the anchor has to be re-encoded.
   */
  let pick: {
    target: Element;
    anchor: AnchorV3;
    stack: string[];
    component?: AnchorComponent;
  } | null = null;
  /**
   * The encoded anchor for `note`, done the moment the reviewer picks and
   * again whenever they pause typing — NOT when they press ⌘⏎.
   * `execCommand('copy')` is the only clipboard on the plain-http gateway
   * origin and it needs the user activation still to be live, so nothing may
   * be awaited between the gesture and the write.
   */
  let capture: { target: Element; note: string; value: AnchorCapture } | null =
    null;
  /** Typing faster than `encodeAnchor` resolves; only the last one counts. */
  let encodeSeq = 0;
  let pickActive = false;

  // ------------------------------------------------- the draft set (FR-3858)

  const store = createDraftStore();
  let draft: SetPin[] = store.pins();
  /** The pin a link opened; FR-3859 merges it into the draft instead. */
  let linkTarget: DeepLinkPinTarget | null = null;

  /**
   * Drawn chrome sits over the app, so the next pick would land on it. The
   * markers are click-through already; the cards and the dock fold away.
   */
  function syncCollapse() {
    const busy = pickActive || ui.getComposeTarget() !== null;
    pins.setCollapsed(busy);
    dock.setCollapsed(busy);
  }

  /** The set's success line, whatever wrote it. */
  const copiedToast = (count: number) =>
    count > 1
      ? `Copied all ${count} pins — replaces your last paste`
      : COPIED_ONE;

  const ui = createOverlayUI({
    onBuildBlock: (text) => {
      const target = ui.getComposeTarget();
      if (!target || capture?.target !== target || capture.note !== text)
        return null;
      if (store.isFull())
        return {
          refused: `Your set is full at ${MAX_SET_PINS} pins — clear it or dismiss one`,
        };
      const pin = pickedPin(capture.value, text);
      if (store.has(pin.id)) return { refused: 'Already pinned' };
      const set = [...draft, pin];
      return {
        text: buildSetText(set),
        html: buildSetHtml(set),
        toast: copiedToast(set.length),
        // The pin joins the set only once THIS write has landed: a copy that
        // failed, or a composer closed while it was in flight, adds nothing.
        commit: () => {
          store.add(pin);
          syncDraft();
          redraw();
        },
      };
    },
    onNoteChanged: (text) => void encodeFor(text),
    onComposeClosed: () => {
      capture = null;
      pick = null;
      picker.stop();
      syncCollapse();
    },
    onEscape: () => picker.stop(),
  });

  const picker = createPicker({
    onPick: (element, x, y, region) => {
      capture = null;
      pick = null;
      ui.openCompose(element, x, y, region);
      syncCollapse();
      // One capture per pick: the label, the anchor payload and the rect all
      // come from this single walk, measured while the page still looks the
      // way the reviewer saw it.
      const anchor = captureAnchorSignals(element, undefined, region);
      ui.setComposeLabel(landmarkLabel(currentRouteLabel(), anchor));
      void prepare(element, anchor);
    },
    onModeChange: (active) => {
      pickActive = active;
      ui.setPickActive(active);
      syncCollapse();
    },
    onHover: (rect, borderRadius) => ui.setHoverRect(rect, borderRadius),
    isOwnEvent: (evt) => ui.isOwnEvent(evt),
    showHint: (message) => ui.showToast(message),
    sourceRoot: () => serverState?.root,
  });

  /**
   * `/__review/state` carries the repository root every source path is
   * relativized against, so the fetch is a gate, not a race: a pick that
   * outruns it would otherwise copy the driver's absolute worktree path.
   * A failed fetch leaves the root unknown, and `source-path.ts` then drops
   * the location rather than leaking it.
   */
  const stateReady = fetch('/__review/state')
    .then((response) => response.json())
    .then((state: ReviewServerState) => {
      serverState = state;
    })
    .catch(() => {
      // The PR number stays 0; the block is still usable.
      return undefined;
    });

  async function prepare(element: Element, anchor: AnchorV3) {
    await stateReady;
    if (ui.getComposeTarget() !== element) return;
    const [stack, component] = await Promise.all([
      picker.getStack(element),
      picker.getComponent(element),
    ]);
    if (ui.getComposeTarget() !== element) return;
    pick = { target: element, anchor, stack, component };
    // Whatever they have typed while the fiber walk ran, not the empty note
    // this pick started with.
    await encodeFor(ui.currentNote());
    if (stack.length) {
      ui.appendComposeLabel(
        `\n⚛️ ${stack.map((line) => line.trim()).join('\n')}`,
      );
    }
  }

  /**
   * Re-encode the anchor around the note. Async by nature (`CompressionStream`),
   * so the copy gesture only ever reads what this has already finished — the
   * copy button stays disabled for any text this has not caught up with.
   */
  async function encodeFor(note: string) {
    const state = pick;
    if (!state) return;
    const seq = ++encodeSeq;
    const prepared = await captureForBlock(
      withNote(state.anchor, note),
      state.stack,
      state.component,
    );
    if (seq !== encodeSeq || pick !== state) return;
    if (ui.getComposeTarget() !== state.target) return;
    capture = { target: state.target, note, value: prepared };
    ui.setComposeReady(true, note);
  }

  /** The app publishes this in dev; without it the pathname is the label. */
  const currentRouteLabel = () =>
    resolveRouteLabel(location.pathname, window.__BAI_REVIEW__?.routeLabel);

  /**
   * The pin the composer would add, stamped now: `at` fixes the identity, and
   * the label and the app fragment are what the reviewer sees at this moment.
   * Every part of it is synchronous — the anchor was encoded at pick time.
   */
  function pickedPin(value: AnchorCapture, note: string): SetPin {
    const at = blockStamp();
    const pr = serverState?.pr ?? 0;
    return {
      id: pinId(pr, value.anchorB64, at),
      origin: 'pick',
      anchor: value.anchor,
      anchorB64: value.anchorB64,
      label: landmarkLabel(currentRouteLabel(), value.anchor),
      appHash: otherFragment(location.hash),
      stack: value.stack,
      note,
      at,
      pr,
    };
  }

  // ------------------------------------------------- deep link (FR-3813)

  /** A pin that locates before react-grab registers, retried into a stack. */
  const STACK_TRIES = 8;
  const STACK_RETRY_MS = 500;
  /**
   * The ⚛️ stack a copied comment quotes, per pin. The anchor does not carry
   * it — it is re-read from the element that pin landed on, the same way the
   * composer read it when the comment was written. A pin the reviewer picked
   * on this tab already has its stack stored, so only a link's pins pay this.
   */
  interface PinStack {
    element: Element;
    stack: string[];
    /** False until `pr` and the stack are both this element's. */
    ready: boolean;
  }
  const stacks = new Map<string, PinStack>();

  /** A pin nothing draws any more must not keep its element alive. */
  function pruneStacks() {
    for (const id of stacks.keys())
      if (!store.has(id) && linkTarget?.id !== id) stacks.delete(id);
  }

  async function readPinStack(
    target: DeepLinkPinTarget | null,
    element: Element | null,
  ) {
    if (!target) return;
    const id = target.id;
    if (draft.some((pin) => pin.id === id && pin.origin === 'pick')) return;
    if (!element) {
      stacks.delete(id);
      return;
    }
    const held = stacks.get(id);
    if (held?.element === element && held.ready) return;
    // The entry IS the cancellation token: a later locate replaces it, and
    // every await below drops out when the map no longer holds this one.
    const entry: PinStack = { element, stack: [], ready: false };
    stacks.set(id, entry);
    // `pr` is part of the block, so the copy waits for the same gate the
    // composer waits for rather than writing `pr=0`.
    await stateReady;
    for (let left = STACK_TRIES; ; left--) {
      const stack = await picker.getStack(element);
      if (stacks.get(id) !== entry) return;
      entry.stack = stack;
      entry.ready = true;
      // An empty stack is the answer once react-grab is there; before that it
      // only means the app has not finished booting.
      if (stack.length || left <= 0 || picker.hasReactGrab()) return;
      await new Promise((resolve) => setTimeout(resolve, STACK_RETRY_MS));
      if (stacks.get(id) !== entry) return;
    }
  }

  /**
   * What the card's ⧉ writes. A pin the draft set holds copies the WHOLE set —
   * one comment, one link, whichever card was pressed. A pin that only a link
   * put on screen is re-rendered here instead: the note, the label and the
   * link come off the fragment, `pr` and `at` describe this copy, and the id
   * is what carries the identity. `null` while this element's own reads are
   * still in flight — a block missing its stack, or claiming `pr=0`, is not
   * the comment that was written.
   */
  function buildComment(target: DeepLinkPinTarget): CopyPayload | null {
    if (draft.some((pin) => pin.id === target.id))
      return {
        text: buildSetText(draft),
        html: buildSetHtml(draft),
        // The card would otherwise describe one pin, and claim a truncated
        // note the set's blocks do not have.
        toast: copiedToast(draft.length),
      };
    const read = stacks.get(target.id);
    if (!read?.ready) return null;
    const input = {
      label: target.label,
      id: target.id,
      stack: read.stack,
      text: target.anchor.n ?? '',
      // The app's own fragment rides alongside the pin (`#tab=logs&bai=v3.…`),
      // and dropping it would reopen the page on a different tab.
      url: `${location.origin}${pinUrl(target.anchor, target.id, target.anchorB64, location.hash)}`,
      pr: serverState?.pr ?? 0,
      at: blockStamp(),
    };
    return { text: buildBlockText(input), html: buildBlockHtml(input) };
  }

  const pins = createPinLayer({
    root: ui.root,
    host: ui.host,
    copyText: ui.copyText,
    showToast: ui.showToast,
    buildComment,
    onLocated: (element, target) => void readPinStack(target, element),
    onDismiss: (target) => {
      stacks.delete(target.id);
      if (linkTarget?.id === target.id) linkTarget = null;
      if (!store.has(target.id)) return;
      store.remove(target.id);
      syncDraft();
    },
  });
  const dock = createSetDock({
    root: ui.root,
    onCopyAll: copySet,
    onClear: () => {
      store.clear();
      syncDraft();
      redraw();
    },
    onLocate: (id) => {
      const element = pins.locatedElement(id);
      // The one control that reaches every pin has to answer for the ones the
      // layer never found; FR-3859 turns that into the "go" button.
      if (!element) return ui.showToast('That pin is not on this page');
      element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    },
  });
  // After the layer and the dock: registering the plugin can activate
  // react-grab straight away, and `syncCollapse` reaches both.
  picker.watchForReactGrab();
  const guard = createNavigationGuard();

  const targetOf = (pin: SetPin): DeepLinkPinTarget => ({
    id: pin.id,
    anchor: pin.anchor,
    anchorB64: pin.anchorB64,
    label: pin.label,
  });

  function drawnTargets(): DeepLinkPinTarget[] {
    const targets = draft.map(targetOf);
    const link = linkTarget;
    if (link && !draft.some((pin) => pin.id === link.id)) targets.push(link);
    return targets;
  }

  /**
   * `focusId: null` by default: restoring a set, or growing one, must not
   * scroll the page out from under the reviewer. Only a link names a pin.
   */
  function redraw(focusId: string | null = null) {
    // Only the draft is the set; a link's pin is drawn beside it, uncounted,
    // so the glyphs never claim a membership the copy does not have.
    pins.show(drawnTargets(), { focusId, setSize: draft.length });
  }

  /** The store is the truth; the dock and the composer's button follow it. */
  function syncDraft() {
    draft = store.pins();
    pruneStacks();
    dock.render(draft);
    ui.setDraftSize(draft.length, store.isFull());
  }

  /** The whole set, from a click; nothing may be awaited before the write. */
  function copySet() {
    if (!draft.length) return;
    const count = draft.length;
    const copied = ui.copyText(buildSetText(draft), buildSetHtml(draft));
    const done = (ok: boolean) =>
      ui.showToast(
        ok ? copiedToast(count) : 'Could not reach the clipboard — try again',
      );
    if (typeof copied === 'boolean') done(copied);
    else void copied.then(done);
  }

  /** The route the pin was made on, not the one the reader happens to be on. */
  const anchorRouteLabel = (anchor: AnchorV3) =>
    anchor.p === location.pathname
      ? currentRouteLabel()
      : resolveRouteLabel(anchor.p);

  async function applyFragment(hash: string) {
    const fragment = parseFragment(hash);
    if (!fragment) return;
    if (fragment.kind === 'legacy') {
      ui.showToast('That is an old #bai-review link — pick the element again');
      return;
    }
    const anchor = await decodeAnchor(fragment.anchorB64);
    // The link is a stranger's: `decodeAnchor` checks `v`, `s` and `p`, the
    // rest of the payload reaches `querySelector` and the DOM unchecked.
    if (!anchor || !isAnchorV3(anchor)) {
      ui.showToast('Could not read the anchor in that link');
      return;
    }
    if (pathNeedsChange(anchor, location)) {
      // The fragment this call was handed, not the live one: the SPA can
      // rewrite the hash while `decodeAnchor` is still in flight.
      const target = pinUrl(anchor, fragment.id, fragment.anchorB64, hash);
      if (guard.shouldNavigate(fragment.id, target)) {
        // Path and query first (R3.3): a full reload, because React Router
        // owns the history and re-running our boot is cheap.
        location.assign(target);
        return;
      }
      // The app moved us off that page — pin what is here rather than fight it.
    } else {
      guard.landed();
    }
    // The layer owns the retry ladder: one driver for however many pins the
    // draft set and the link add up to, and one give-up sentence for them all.
    linkTarget = {
      id: fragment.id,
      anchor,
      anchorB64: fragment.anchorB64,
      label: landmarkLabel(anchorRouteLabel(anchor), anchor),
    };
    redraw(fragment.id);
  }

  window.addEventListener('hashchange', () => {
    guard.reset();
    void applyFragment(location.hash);
  });

  syncDraft();
  if (draft.length) redraw();
  void applyFragment(BOOT_HASH);
}
