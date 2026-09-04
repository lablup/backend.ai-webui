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
 * this page as cards, the rest as rows in the dock.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { captureAnchorSignals, withNote } from './anchor.js';
import {
  blockStamp,
  buildSetHtml,
  buildSetText,
  captureForBlock,
  landmarkLabel,
  resolveRouteLabel,
  type AnchorCapture,
} from './block.js';
import { decodeAnchor } from './codec.js';
import {
  createFocusStore,
  createNavigationGuard,
  createNoteStore,
  dedupeById,
  focusPinId,
  hasLegacyFragment,
  otherFragment,
  parseFragments,
  pathNeedsChange,
  pinSetUrlAt,
  stripPinParts,
  watchRoute,
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
  const focus = createFocusStore();
  const carried = createNoteStore();

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
  function pruneStacks(drawn: DeepLinkPinTarget[]) {
    const live = new Set(drawn.map((target) => target.id));
    for (const id of stacks.keys())
      if (!store.has(id) || !live.has(id)) stacks.delete(id);
  }

  /**
   * A link's pin joins the set with no stack — the wire does not carry one —
   * so the first element it lands on gives it one, and that is what its block
   * quotes from then on.
   */
  function freezeStack(id: string, stack: string[]) {
    const pins = store.pins();
    const pin = pins.find((held) => held.id === id);
    if (!pin || pin.origin !== 'link') return;
    if (
      pin.stack.length === stack.length &&
      pin.stack.every((line, index) => line === stack[index])
    )
      return;
    store.save({
      v: 1,
      pins: pins.map((held) => (held.id === id ? { ...held, stack } : held)),
    });
    syncDraft();
  }

  async function readPinStack(
    target: DeepLinkPinTarget | null,
    element: Element | null,
  ) {
    if (!target) return;
    const id = target.id;
    // A pin the reviewer picked here already has its stack, and a link's is
    // frozen once it has one; only an empty one is still worth re-reading.
    const member = draft.find((pin) => pin.id === id);
    if (member && (member.origin === 'pick' || member.stack.length)) return;
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
      freezeStack(id, stack);
      // An empty stack is the answer once react-grab is there; before that it
      // only means the app has not finished booting.
      if (stack.length || left <= 0 || picker.hasReactGrab()) return;
      await new Promise((resolve) => setTimeout(resolve, STACK_RETRY_MS));
      if (stacks.get(id) !== entry) return;
    }
  }

  /**
   * What the card's ⧉ writes: the WHOLE set — one comment, one link, whichever
   * card was pressed. Every pin on screen is a member of it, because a link
   * merges into the draft (D4). `null` while a link's pin is still having its
   * ⚛️ stack read off the element it landed on — a block missing its frames is
   * not the comment that was written.
   */
  const stackPending = (pin: SetPin): boolean =>
    pin.origin === 'link' && !pin.stack.length && !stacks.get(pin.id)?.ready;

  function buildComment(target: DeepLinkPinTarget): CopyPayload | null {
    const pin = draft.find((held) => held.id === target.id);
    if (!pin) return null;
    if (stackPending(pin)) return null;
    return {
      text: buildSetText(draft),
      html: buildSetHtml(draft),
      // The card would otherwise describe one pin, and claim a truncated
      // note the set's blocks do not have.
      toast: copiedToast(draft.length),
    };
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
      if (!store.has(target.id)) return;
      store.remove(target.id);
      syncDraft();
      redraw();
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
      // On this page but never resolved — the ladder gave up, or the app has
      // not rendered it. An off-page pin gets the "go" button instead.
      if (!element) return ui.showToast('That pin is not on this page');
      element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    },
    onGo: (id) => {
      // Built from the DRAFT SET, never from `location.hash`: the hash was
      // scrubbed the moment the link merged (D4), and the tab this pin belongs
      // on is the one it stored, not the one the reviewer stands on.
      focus.set(id);
      location.assign(pinSetUrlAt(draft, id));
    },
  });
  // After the layer and the dock: registering the plugin can activate
  // react-grab straight away, and `syncCollapse` reaches both.
  picker.watchForReactGrab();
  const guard = createNavigationGuard();

  const targetOf = (pin: SetPin, index: number): DeepLinkPinTarget => ({
    id: pin.id,
    anchor: pin.anchor,
    anchorB64: pin.anchorB64,
    label: pin.label,
    index,
  });

  /** What differs about an off-page pin's page, for its dock row (D2). */
  /**
   * A stored label leads with the route it was made on; only THIS page's route
   * can be resolved from here, so that beats a raw path — when it is not one.
   */
  const awayNote = (pin: SetPin): string => {
    if (pin.anchor.p === location.pathname)
      return pin.anchor.q ? `?${pin.anchor.q}` : 'no query';
    const route = pin.label.split(' › ')[0]?.trim() ?? '';
    return route && !route.startsWith('/')
      ? route
      : resolveRouteLabel(pin.anchor.p);
  };

  /**
   * A set may span pages. Only its members on THIS page get a view — an
   * off-page pin runs no resolution ladder, so an identical testid on another
   * page cannot draw it; the dock row is all it has.
   */
  function partition() {
    const here: DeepLinkPinTarget[] = [];
    const away = new Map<string, string>();
    draft.forEach((pin, index) => {
      if (pathNeedsChange(pin.anchor, location))
        away.set(pin.id, awayNote(pin));
      else here.push(targetOf(pin, index));
    });
    return { here, away };
  }

  /**
   * `focusId: null` by default: restoring a set, or growing one, must not
   * scroll the page out from under the reviewer. Only a link names a pin.
   */
  function redraw(focusId: string | null = null) {
    const { here } = partition();
    pins.show(here, { focusId, setSize: draft.length });
    // What the layer no longer draws holds an element from a page we left.
    pruneStacks(here);
  }

  /** The store is the truth; the dock and the composer's button follow it. */
  function syncDraft() {
    draft = store.pins();
    dock.render(draft, partition().away);
    ui.setDraftSize(draft.length, store.isFull());
  }

  /** The whole set, from a click; nothing may be awaited before the write. */
  function copySet() {
    if (!draft.length) return;
    // The same gate the card's ⧉ has: a block missing the ⚛️ frames of the
    // element its pin just landed on is not the comment that was written.
    if (draft.some((pin) => stackPending(pin) && pins.locatedElement(pin.id))) {
      ui.showToast('Still reading a pin — try again');
      return;
    }
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

  /**
   * A pin a link brought. It carries no `at`/`pr` — the wire has none — so its
   * block emits no marker comment: a fabricated stamp would produce one whose
   * hash does not verify (D5). The app's own fragment travels with it, or the
   * set would reopen on a different tab.
   */
  const linkPin = (
    part: { id: string; anchorB64: string },
    anchor: AnchorV3,
    appHash: string,
  ): SetPin => ({
    id: part.id,
    origin: 'link',
    anchor,
    anchorB64: part.anchorB64,
    label: landmarkLabel(anchorRouteLabel(anchor), anchor),
    appHash,
    stack: [],
  });

  /** One sentence for the whole link, however many parts it turned out to have. */
  function mergeToast(
    parts: number,
    added: number,
    present: number,
    unread: number,
    refused: number,
  ): string {
    const said: string[] = [];
    if (added)
      said.push(`Added ${added} ${added === 1 ? 'pin' : 'pins'} from the link`);
    else if (present)
      said.push(
        present === 1
          ? 'That pin is already in your set'
          : `All ${present} pins are already in your set`,
      );
    if (unread)
      said.push(
        parts === 1
          ? 'Could not read the anchor in that link'
          : `${unread} of ${parts} pins could not be read`,
      );
    if (refused)
      said.push(`${refused} did not fit — your set is full at ${MAX_SET_PINS}`);
    return said.join(' · ');
  }

  /** A reload must not re-apply the link and resurrect a dismissed pin (D4). */
  function scrubPinParts() {
    const rest = stripPinParts(location.hash);
    const url = `${location.pathname}${location.search}${rest ? `#${rest}` : ''}`;
    try {
      history.replaceState(history.state, '', url);
    } catch {
      // A browser that refuses the rewrite still shows the set; only a reload
      // would re-apply the link.
    }
  }

  async function applyFragment(hash: string) {
    // One-shot handovers from the document that navigated here, read before
    // the first `await` so a hash the SPA rewrites cannot lose them.
    const handover = focus.take();
    const carriedNote = carried.take();
    const parts = parseFragments(hash);
    if (!parts.length) {
      if (hasLegacyFragment(hash))
        ui.showToast(
          'That is an old #bai-review link — pick the element again',
        );
      return;
    }
    const appHash = stripPinParts(hash);
    const decoded = await Promise.all(
      parts.map((part) => decodeAnchor(part.anchorB64)),
    );
    // The link is a stranger's: `decodeAnchor` checks `v`, `s` and `p`, the
    // rest of the payload reaches `querySelector` and the DOM unchecked. A
    // part that fails costs only itself.
    const opened = parts.flatMap((part, index) => {
      const anchor = decoded[index];
      return anchor && isAnchorV3(anchor)
        ? [linkPin(part, anchor, appHash)]
        : [];
    });
    const { added, present } = store.merge(opened);
    syncDraft();
    const message = mergeToast(
      parts.length,
      added,
      // Our own "go" re-opens the set it just persisted; reporting those back
      // as duplicates would answer an action the reviewer never took.
      handover ? 0 : present,
      parts.length - opened.length,
      dedupeById(opened).length - added - present,
    );

    const set = store.pins();
    const focusId = focusPinId(set, location, handover);
    // Path and query are applied only when NO member is here (D2): arriving on
    // pin 3's page must not bounce the reviewer back to pin 1's.
    if (focusId && !set.some((pin) => !pathNeedsChange(pin.anchor, location))) {
      // The focus pin's own fragment, not the live hash: the SPA can rewrite
      // that while `decodeAnchor` is in flight, and it belongs to this page.
      const target = pinSetUrlAt(set, focusId);
      if (guard.shouldNavigate(focusId, target)) {
        focus.set(focusId);
        // The counts belong to this open; the page it lands on sees only its
        // own pins coming back.
        if (message) carried.set(message);
        // A full reload, because React Router owns the history and re-running
        // our boot is cheap.
        location.assign(target);
        return;
      }
      // The app moved us off that page — pin what is here rather than fight it.
    } else {
      guard.landed();
    }
    scrubPinParts();
    const said = carriedNote ?? message;
    if (said) ui.showToast(said);
    // The layer owns the retry ladder: one driver for every on-page member,
    // and one give-up sentence for them all.
    redraw(focusId);
  }

  window.addEventListener('hashchange', () => {
    guard.reset();
    // A hash that changed only the app's own part carries no part to hydrate,
    // and the partition reads path and query only — so nothing else moves.
    void applyFragment(location.hash);
  });

  /** An SPA navigation re-partitions the set: new views here, rows for the rest. */
  let routeKey = location.pathname + location.search;
  watchRoute(() => {
    const key = location.pathname + location.search;
    if (key === routeKey) return;
    routeKey = key;
    syncDraft();
    redraw();
  });

  syncDraft();
  if (draft.length) redraw();
  void applyFragment(BOOT_HASH);
}
