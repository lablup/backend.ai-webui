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
import { createSetDock, whereItWas, type PinPlace } from './dock.js';
import { createDraftStore, MAX_SET_PINS } from './draft.js';
import { pinId } from './id.js';
import { createPicker, isEditable, isMac } from './picker.js';
import { createPinLayer, type DeepLinkPinTarget } from './pin.js';
import type {
  AnchorComponent,
  AnchorV3,
  PinCopyPayload,
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
  /** The waiting ids the dock's rows were last built from. */
  let drawn = '';
  /** True while `redraw()` is resolving pins, so the dock is built once. */
  let drawing = false;
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

  /** One card's copy: a link's pin has only the capped note it carries. */
  const onePinToast = (pin: { note?: string; anchor: AnchorV3 }): string =>
    pin.note === undefined && pin.anchor.nt === 1
      ? 'Copied 1 pin — the note is the shortened one the link carries'
      : 'Copied 1 pin';

  const ui = createOverlayUI({
    onBuildBlock: (text) => {
      const target = ui.getComposeTarget();
      if (!target || capture?.target !== target || capture.note !== text)
        return null;
      if (store.isFull())
        return {
          refused: `Your set is full at ${MAX_SET_PINS} pins — clear it or remove a pin`,
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
   * What the card's copy writes: THAT pin, one block behind its own link. The
   * set as a whole is the dock's — a card is where the reviewer points at one
   * thing, so it hands over one thing. Every drawn pin is a member of the
   * draft, because a link merges into it (D4). `null` while a link's pin is
   * still having its ⚛️ stack read off the element it landed on — a block
   * missing its frames is not the comment that was written.
   */
  const stackPending = (pin: SetPin): boolean =>
    pin.origin === 'link' && !pin.stack.length && !stacks.get(pin.id)?.ready;

  function buildComment(target: DeepLinkPinTarget): PinCopyPayload | null {
    const pin = draft.find((held) => held.id === target.id);
    if (!pin) return null;
    if (stackPending(pin)) return null;
    return {
      text: buildSetText([pin]),
      html: buildSetHtml([pin]),
      toast: onePinToast(pin),
    };
  }

  const pins = createPinLayer({
    root: ui.root,
    host: ui.host,
    copyText: ui.copyText,
    showToast: ui.showToast,
    buildComment,
    onLocated: (element, target) => {
      // A pin that finally landed — or lost its element — changes what its
      // row says, and the rows are all a waiting pin has (R7.3).
      if (!drawing) renderDockIfPlacesMoved();
      void readPinStack(target, element);
    },
    onHide: (target) => setHidden(target.id, true),
    // The ladder ended with these still unresolved. Only the set knows that
    // this is a closed modal rather than a missed page, so it does the talking.
    onGiveUp: (ids) => ui.showToast(waitingLine(ids)),
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
      // Its page matches but the element is not rendered: one more pass of
      // THAT pin's ladder — the rest of the set is not what was asked (R7.3).
      const element =
        pins.locatedElement(id) ?? (pins.locate(id), pins.locatedElement(id));
      if (!element) return ui.showToast(waitingLine([id]));
      element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      // The arrival beat is long spent — this is a deliberate "that one".
      pins.pulse(id);
    },
    onRemove: removeFromSet,
    onUnhide: (id) => setHidden(id, false),
    onToggleCards: toggleCards,
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

  /**
   * What differs about an off-page pin's page, for its dock row (D2). A stored
   * label leads with the route it was made on, and beats a raw path.
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
    // Every pin `show()` resolves calls back into `onLocated`; the dock is
    // rendered once here instead of once per pin.
    drawing = true;
    pins.setCardsHidden(store.cardsHidden());
    const { here } = partition();
    pins.show(here, { focusId, setSize: draft.length });
    // Adopting a pin gives it a fresh card, so hidden is re-applied here.
    for (const pin of draft) pins.setCardHidden(pin.id, pin.hidden === true);
    // What the layer no longer draws holds an element from a page we left.
    pruneStacks(here);
    drawing = false;
    renderDockIfPlacesMoved();
  }

  /** The dock row's 🗑 — the one control that ends a pin (R6.2). */
  function removeFromSet(id: string) {
    const index = draft.findIndex((pin) => pin.id === id);
    if (index < 0) return removePin(id);
    const size = draft.length;
    removePin(id);
    ui.showToast(`Removed pin ${index + 1} of ${size}`);
  }

  /** The store, the stacks and the layer, one pin shorter. */
  function removePin(id: string) {
    stacks.delete(id);
    if (!store.has(id)) return;
    store.remove(id);
    syncDraft();
    redraw();
  }

  /**
   * A card hidden, or its row's eye. Visibility only — `redraw()` would restart
   * the resolution ladder and re-toast its give-up line at every flip.
   */
  function setHidden(id: string, hidden: boolean) {
    if (!store.has(id)) return;
    store.hide(id, hidden);
    pins.setCardHidden(id, hidden);
    syncDraft();
  }

  /** The dock's cards switch and its chord, one path — visibility only. */
  function toggleCards() {
    store.hideCards(!store.cardsHidden());
    pins.setCardsHidden(store.cardsHidden());
    // Switching back ON cleared every per-pin hide (R5.5); the layer has to
    // hear about that or the cards it hid one at a time stay hidden.
    for (const pin of store.pins())
      pins.setCardHidden(pin.id, pin.hidden === true);
    syncDraft();
  }

  /**
   * Where every pin is (R7): another page, or this one with its element not in
   * the DOM right now — waiting, not gone, because the ladder ends and the
   * observer does not (R7.2). Anything else the layer has drawn.
   */
  function places(): Map<string, PinPlace> {
    const { away } = partition();
    const map = new Map<string, PinPlace>();
    for (const pin of draft) {
      const where = away.get(pin.id);
      if (where !== undefined)
        map.set(pin.id, {
          kind: 'elsewhere',
          where,
          // Absolute, so the browser's own "copy link address" yields a URL
          // someone else can open (R7.1).
          href: `${location.origin}${pinSetUrlAt(draft, pin.id)}`,
        });
      else if (!pins.locatedElement(pin.id))
        map.set(pin.id, { kind: 'waiting' });
    }
    return map;
  }

  /** One pin says what it was inside; a handful says to read the list. */
  function waitingLine(ids: string[]): string {
    if (ids.length === 1) {
      const pin = draft.find((held) => held.id === ids[0]);
      const where = pin ? whereItWas(pin) : 'that page';
      return `1 pin is waiting for its element (it was inside ${where})`;
    }
    return `${ids.length} pins are waiting for their elements — the list says where`;
  }

  /** The off-page pins this line was last said for (R7.4). */
  let saidAway = '';

  const awayKey = () => [...partition().away.keys()].sort().join(' ');

  /** R7.4: an off-page pin is opened from the list; a waiting one cannot be. */
  function elsewhereLine(): string {
    const count = partition().away.size;
    saidAway = awayKey();
    if (!count) return '';
    return count === 1
      ? '1 pin is on another page — open it from the list'
      : `${count} pins are on other pages — open them from the list`;
  }

  /**
   * Only a re-partition that MOVED something is news: the app writes its own
   * hashes and queries, and the same sentence twice reads as a second pin.
   */
  const sayElsewhere = () => {
    if (awayKey() === saidAway) return;
    const line = elsewhereLine();
    if (line) ui.showToast(line);
  };

  const placesKey = (map: ReadonlyMap<string, PinPlace>): string =>
    [...map].map(([id, place]) => `${id}:${place.kind}`).join(' ');

  function renderDock() {
    const map = places();
    drawn = placesKey(map);
    dock.render(draft, map, store.cardsHidden());
  }

  /** Rebuilding every row on every `locate()` is O(N²) rows for one redraw. */
  function renderDockIfPlacesMoved() {
    if (placesKey(places()) !== drawn) renderDock();
  }

  /** The store is the truth; the dock and the composer's button follow it. */
  function syncDraft() {
    draft = store.pins();
    renderDock();
    ui.setDraftSize(draft.length, store.isFull());
  }

  /** The whole set, from a click; nothing may be awaited before the write. */
  function copySet() {
    if (!draft.length) return;
    // The same gate the card's copy has: a block missing the ⚛️ frames of the
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
      // A stored set the tab was left with: nothing was added, but part of it
      // may still be on another page, and only the rows can reach that.
      else sayElsewhere();
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
    // The pin a link opens on is an explicit "show me this one": a card the
    // reviewer had tidied away comes back rather than leaving a bare marker.
    if (focusId && opened.some((pin) => pin.id === focusId)) {
      store.hide(focusId, false);
      syncDraft();
    }
    const said = [carriedNote ?? message, elsewhereLine()]
      .filter(Boolean)
      .join(' · ');
    if (said) ui.showToast(said);
    // The layer owns the retry ladder: one driver for every on-page member,
    // and one give-up sentence for them all.
    redraw(focusId);
  }

  /** The cards chord: no set, no switch — and never while a note is typed. */
  document.addEventListener('keydown', (evt) => {
    if (!evt.shiftKey || evt.altKey) return;
    if (!(isMac() ? evt.metaKey : evt.ctrlKey)) return;
    if (evt.code !== 'KeyH' && evt.key?.toLowerCase() !== 'h') return;
    if (!draft.length || ui.isTyping() || isEditable(document.activeElement))
      return;
    evt.preventDefault();
    toggleCards();
  });

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
    // A re-partition moves pins between views and rows; what is now off this
    // page is only reachable from the list.
    sayElsewhere();
  });

  syncDraft();
  if (draft.length) redraw();
  void applyFragment(BOOT_HASH);
}
