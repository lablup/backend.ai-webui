/**
 * The pin layer and the review panel (R3.6).
 *
 * Everything rendered here comes from a comment anyone can write on a public
 * PR, so every piece of it goes in through `textContent` — never `innerHTML`.
 * The panel is ONE flat list in the payload's number order: orphan and
 * other-page pins are badges in place, never their own section, because the
 * prototype's sections made items jump when an anchor resolved late.
 */
import { pinUrl } from './deeplink.js';
import { deriveState, onCurrentPage } from './pins-state.js';
import { findAnchorTarget, quickFindTarget } from './resolve.js';
import type {
  AnchorV3,
  PinState,
  ReviewPin,
  ReviewPinsPayload,
} from './types.js';

const REPOSITION_DEBOUNCE_MS = 300;
const FLASH_MS = 2400;
const HIGHLIGHT_MS = 2600;

const STATE_LABEL: Record<PinState, string> = {
  open: '',
  replied: '💬 replied — check & resolve',
  hint: '👍 reacted',
  resolved: '✅ resolved',
  outdated: '⌛ outdated',
  orphan: '⚠️ not found on this page',
};

export interface PinPanelOptions {
  root: ShadowRoot;
  host: Element;
  showToast: (message: string) => void;
  copyText: (text: string) => boolean | Promise<boolean>;
  onCountChange: (count: number) => void;
  onOpenChange: (open: boolean) => void;
  onStartPick: () => void;
  onRefresh: () => void;
}

interface PinEntry {
  pin: ReviewPin;
  anchor: AnchorV3 | null;
  located: Element | null;
  element: HTMLElement | null;
}

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const age = (iso: string | null): string => {
  if (!iso) return '';
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
};

const STYLE = `
  .pinlayer {
    position: fixed; inset: 0; z-index: 2147482999; pointer-events: none;
  }
  .pin {
    position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    background: var(--bai-review-accent); color: var(--bai-review-on-accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; cursor: pointer; pointer-events: auto;
    box-shadow: 0 1px 4px var(--bai-review-shadow);
  }
  .pin > span { transform: rotate(45deg); }
  .pin.replied { background: var(--color-icon-blue, #1677ff); }
  .pin.hint { background: var(--color-icon-yellow, #d4a017); }
  .pin.resolved { opacity: .35; filter: grayscale(.9); }
  .pin.outdated {
    background: var(--bai-review-text-dim); border: 2px dashed var(--bai-review-border);
  }
  .pin.orphan { display: none; }
  .pin.pulse { animation: baipulse 1s ease-in-out 4; }
  @keyframes baipulse {
    0%,100% { box-shadow: 0 1px 4px var(--bai-review-shadow); }
    50% { box-shadow: 0 0 0 8px var(--color-background-orange, rgba(242,121,2,.35)); }
  }
  .panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 92vw;
    z-index: 2147483000; background: var(--bai-review-surface);
    color: var(--bai-review-text); border-left: 1px solid var(--bai-review-border);
    box-shadow: -4px 0 16px var(--bai-review-shadow); display: none;
    flex-direction: column;
  }
  .panel.open { display: flex; }
  .panel header {
    padding: 10px 12px; border-bottom: 1px solid var(--bai-review-border);
    font-weight: 700; font-size: 15px; display: flex; align-items: center;
    gap: 6px; flex-wrap: wrap;
  }
  .panel header .spacer { flex: 1; }
  .srcline {
    padding: 6px 12px; border-bottom: 1px solid var(--bai-review-border);
    font-size: 12px; color: var(--bai-review-text-dim);
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .srcline .bad { color: var(--bai-review-error); }
  .items { flex: 1; overflow-y: auto; padding: 8px 12px; }
  .item {
    border-bottom: 1px solid var(--bai-review-border); padding: 10px 0;
    font-size: 14px;
  }
  .item.resolved { opacity: .55; }
  .item.hl {
    background: var(--color-background-orange, rgba(242,121,2,.12));
    margin: 0 -6px; padding: 8px 6px; border-radius: 6px;
  }
  .item .meta {
    color: var(--bai-review-text-dim); font-size: 12px; margin-bottom: 3px;
    display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
  }
  .item .meta .author { color: var(--bai-review-text); font-weight: 600; }
  .item .body { white-space: pre-wrap; word-break: break-word; }
  .item .lastreply {
    margin-top: 4px; padding: 4px 6px;
    border-left: 3px solid var(--color-icon-blue, #1677ff);
    color: var(--bai-review-text-dim); font-size: 13px;
    white-space: pre-wrap; word-break: break-word;
  }
  .item .actions { margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap; }
  .badge {
    font-size: 11px; border-radius: 9px; padding: 1px 7px;
    border: 1px solid var(--bai-review-border); text-decoration: none;
    color: var(--bai-review-text-dim);
  }
  .badge.resolved { color: var(--color-text-green, #237804); }
  .badge.replied { color: var(--color-text-blue, #0958d9); }
  .badge.hint, .badge.orphan { color: var(--color-text-yellow, #874d00); }
  .empty {
    color: var(--bai-review-text-dim); font-size: 13px; text-align: center;
    padding: 24px 8px;
  }
`;

export function createPinPanel(options: PinPanelOptions) {
  const { root, host } = options;

  const style = document.createElement('style');
  style.textContent = STYLE;
  const pinLayer = el('div', 'pinlayer');
  const panel = el('div', 'panel');
  const header = el('header');
  header.append(el('span', '', '📍 Review pins'), el('span', 'spacer'));
  const pickButton = el('button', 'btn primary', '📋 Copy block');
  const refreshButton = el('button', 'btn', '↻');
  refreshButton.title = 'Refresh now';
  const closeButton = el('button', 'btn', '✕');
  header.append(pickButton, refreshButton, closeButton);
  const srcLine = el('div', 'srcline');
  const items = el('div', 'items');
  panel.append(header, srcLine, items);
  root.append(style, pinLayer, panel);

  pickButton.addEventListener('click', () => options.onStartPick());
  refreshButton.addEventListener('click', () => options.onRefresh());
  closeButton.addEventListener('click', () => setOpen(false));

  const entries = new Map<string, PinEntry>();
  let highlightId: string | null = null;
  let highlightTimer = 0;

  // -------------------------------------------------------------- panel

  function setOpen(open: boolean) {
    panel.classList.toggle('open', open);
    options.onOpenChange(open);
  }

  const isOpen = () => panel.classList.contains('open');

  function placement(entry: PinEntry) {
    return {
      located: !!entry.located,
      onPage: onCurrentPage(entry.anchor, location),
    };
  }

  function badge(
    className: string,
    text: string,
    href?: string | null,
  ): HTMLElement {
    if (!href) return el('span', `badge ${className}`, text);
    const link = el('a', `badge ${className}`, text);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noreferrer';
    return link;
  }

  function buildItem(entry: PinEntry): HTMLElement {
    const { pin } = entry;
    const state = deriveState(pin, placement(entry));
    const item = el('div', `item ${pin.resolved ? 'resolved' : ''}`);
    item.dataset.pinId = pin.id;

    const meta = el('div', 'meta');
    meta.append(
      el(
        'span',
        'author',
        `#${pin.number || '·'} ${pin.author ?? '(unknown)'}`,
      ),
      el('span', '', age(pin.createdAt)),
    );
    for (const source of pin.sources) {
      const label = source.channel === 'github' ? '🐙' : '💬';
      meta.append(badge('src', `${label} #${source.pr}`, source.url));
    }
    if (!pin.quoted) meta.append(badge('hint', '¶ not in a quote block'));
    if (!onCurrentPage(entry.anchor, location)) {
      meta.append(badge('', 'other page'));
    } else if (!entry.located && !pin.resolved) {
      meta.append(badge('orphan', STATE_LABEL.orphan));
    }
    if (STATE_LABEL[state] && state !== 'orphan') {
      meta.append(badge(state, STATE_LABEL[state]));
    }
    if (pin.resolvedBy) meta.append(badge('resolved', `by ${pin.resolvedBy}`));
    item.append(meta, el('div', 'body', pin.text || '(no text)'));

    if (pin.latestReply) {
      const suffix = pin.replyCount > 1 ? `  (+${pin.replyCount - 1})` : '';
      item.append(
        el(
          'div',
          'lastreply',
          `↳ ${pin.latestReply.author ?? '?'}: ${pin.latestReply.body.slice(0, 160)}${suffix}`,
        ),
      );
    }

    const actions = el('div', 'actions');
    if (entry.anchor) {
      if (onCurrentPage(entry.anchor, location)) {
        const locate = el('button', 'btn', '📍 Locate');
        locate.addEventListener('click', () =>
          locatePin(pin.id, { full: true }),
        );
        actions.append(locate);
      } else {
        const open = el('button', 'btn', '↗ Open page');
        open.addEventListener('click', () => {
          location.assign(
            pinUrl(entry.anchor as AnchorV3, pin.id, pin.anchorB64),
          );
        });
        actions.append(open);
      }
    }
    const copy = el('button', 'btn', '🔗 Copy link');
    copy.addEventListener('click', () => {
      const path = entry.anchor
        ? pinUrl(entry.anchor, pin.id, pin.anchorB64)
        : `${location.pathname}${location.search}#bai=v3.${pin.id}`;
      void Promise.resolve(options.copyText(`${location.origin}${path}`)).then(
        (ok) =>
          options.showToast(ok ? 'Link copied 📋' : 'Could not copy the link'),
      );
    });
    actions.append(copy);
    item.append(actions);
    return item;
  }

  function renderPanel() {
    items.textContent = '';
    const sorted = [...entries.values()].sort(
      (a, b) => a.pin.number - b.pin.number,
    );
    if (!sorted.length) {
      items.append(
        el(
          'div',
          'empty',
          'No pins on the served PRs yet — pick an element and paste the block into a PR comment.',
        ),
      );
      return;
    }
    for (const entry of sorted) {
      const item = buildItem(entry);
      // The highlight is state, not a class someone set once: the panel is
      // rebuilt on every poll and every reposition.
      if (entry.pin.id === highlightId) item.classList.add('hl');
      items.append(item);
    }
  }

  function renderStatus(payload: ReviewPinsPayload | null, error?: string) {
    srcLine.textContent = '';
    if (error) {
      srcLine.append(el('span', 'bad', error));
      return;
    }
    if (!payload) return;
    const served = payload.served.map((entry) => `#${entry.pr}`).join(' ');
    srcLine.append(
      el('span', '', served ? `serves ${served}` : 'no PR served'),
    );
    for (const [channel, status] of Object.entries(payload.sources)) {
      if (!status) continue;
      const label = channel === 'github' ? 'GitHub' : channel;
      srcLine.append(
        status.ok
          ? el(
              'span',
              '',
              `${label} ✓ ${status.count ?? 0}${status.truncated ? ' (first page)' : ''}`,
            )
          : el('span', 'bad', `${label} ✗ ${status.error ?? 'error'}`),
      );
    }
    if (payload.error) srcLine.append(el('span', 'bad', payload.error));
  }

  // ----------------------------------------------------------- pin layer

  function positionPin(entry: PinEntry) {
    if (!entry.element) return;
    entry.located = quickFindTarget(entry.anchor, { ignore: host });
    if (!entry.located) {
      entry.element.classList.add('orphan');
      return;
    }
    const rect = entry.located.getBoundingClientRect();
    entry.element.classList.remove('orphan');
    entry.element.style.left = `${rect.left + 6}px`;
    entry.element.style.top = `${rect.top + 6}px`;
  }

  function refreshPinLayer() {
    for (const entry of entries.values()) {
      const show = onCurrentPage(entry.anchor, location);
      if (!show) {
        entry.element?.remove();
        entry.element = null;
        entry.located = null;
        continue;
      }
      if (!entry.element) {
        const node = el('div', 'pin');
        node.append(el('span'));
        node.title = 'Show this pin’s comment';
        node.addEventListener('click', () => revealItem(entry.pin.id));
        pinLayer.append(node);
        entry.element = node;
      }
      const state = deriveState(entry.pin, placement(entry));
      entry.element.className = `pin ${state}`;
      (entry.element.firstElementChild as HTMLElement).textContent = String(
        entry.pin.number || '·',
      );
      positionPin(entry);
      if (entry.pin.id === highlightId) entry.element.classList.add('pulse');
    }
    const onPage = [...entries.values()].filter(
      (entry) => onCurrentPage(entry.anchor, location) && !entry.pin.resolved,
    ).length;
    options.onCountChange(onPage);
  }

  let repositionTimer = 0;
  function scheduleReposition() {
    clearTimeout(repositionTimer);
    repositionTimer = window.setTimeout(() => {
      refreshPinLayer();
      renderPanel();
    }, REPOSITION_DEBOUNCE_MS);
  }

  const observer = new MutationObserver((records) => {
    if (!entries.size) return;
    if (records.every((record) => host.contains(record.target as Node))) return;
    scheduleReposition();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', scheduleReposition);
  // Pins are positioned in viewport coordinates, so a scroll moves all of them.
  window.addEventListener(
    'scroll',
    () => {
      for (const entry of entries.values()) positionPin(entry);
    },
    { capture: true, passive: true },
  );

  // -------------------------------------------------------------- public

  function flash(target: Element) {
    const node = target as HTMLElement;
    const previous = node.style.outline;
    const offset = node.style.outlineOffset;
    node.style.outline = '3px solid var(--color-icon-orange, #e9690b)';
    node.style.outlineOffset = '2px';
    setTimeout(() => {
      node.style.outline = previous;
      node.style.outlineOffset = offset;
    }, FLASH_MS);
  }

  function revealItem(id: string) {
    if (!isOpen()) setOpen(true);
    highlightId = id;
    clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(() => {
      highlightId = null;
      items.querySelector('.item.hl')?.classList.remove('hl');
    }, HIGHLIGHT_MS);
    renderPanel();
    const item = items.querySelector(`.item[data-pin-id="${id}"]`);
    item?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }

  /** `full` runs the expensive text scan; the poll loop never does. */
  function locatePin(
    id: string,
    { full = false, quiet = false } = {},
  ): Element | null {
    const entry = entries.get(id);
    if (!entry?.anchor) return null;
    const target = full
      ? findAnchorTarget(entry.anchor, { ignore: host })
      : quickFindTarget(entry.anchor, { ignore: host });
    if (!target) {
      // A retry ladder calls this every 500 ms while the SPA renders — it
      // must not narrate each miss.
      if (!quiet)
        options.showToast('That element is not on this page any more');
      return null;
    }
    entry.located = target;
    target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    flash(target);
    refreshPinLayer();
    return target;
  }

  return {
    panel,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen()),
    has: (id: string) => entries.has(id),
    get: (id: string) => entries.get(id) ?? null,
    revealItem,
    locatePin,
    refresh: () => {
      refreshPinLayer();
      renderPanel();
    },

    /**
     * A full-form deep link draws its pin from the fragment alone, before any
     * channel has been read — the payload only enriches it later.
     */
    ensureProvisional(id: string, anchor: AnchorV3, anchorB64: string | null) {
      if (entries.has(id)) return;
      entries.set(id, {
        pin: {
          id,
          number: 0,
          anchorB64,
          anchor,
          text: '(looking for this pin in the PR…)',
          author: null,
          createdAt: null,
          sources: [],
          sourcePr: null,
          quoted: true,
          resolved: false,
          resolvedBy: null,
          outdated: false,
          hint: false,
          replies: [],
          latestReply: null,
          replyCount: 0,
        },
        anchor,
        located: null,
        element: null,
      });
      refreshPinLayer();
      renderPanel();
    },

    applyPayload(payload: ReviewPinsPayload) {
      const seen = new Set<string>();
      for (const pin of payload.pins) {
        const existing = entries.get(pin.id);
        entries.set(pin.id, {
          pin,
          anchor: pin.anchor ?? existing?.anchor ?? null,
          located: existing?.located ?? null,
          element: existing?.element ?? null,
        });
        seen.add(pin.id);
      }
      for (const [id, entry] of entries) {
        // A provisional deep-link pin survives until its id shows up (or does
        // not) in a channel; everything else follows the payload.
        if (seen.has(id) || entry.pin.number === 0) continue;
        entry.element?.remove();
        entries.delete(id);
      }
      renderStatus(payload);
      refreshPinLayer();
      renderPanel();
    },

    setError(message: string) {
      renderStatus(null, message);
    },
  };
}

export type PinPanel = ReturnType<typeof createPinPanel>;
