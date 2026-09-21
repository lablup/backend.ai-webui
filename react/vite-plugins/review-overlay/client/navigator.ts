/**
 * Guided mode's NAVIGATOR (FR-3950): the pill fixed bottom-right that says how
 * big the walkthrough is and where in it the reader stands, plus the ☰ panel
 * that lists every stop grouped by page.
 *
 * Above the set dock, which shares the corner: a walkthrough is what the
 * reader is doing right now, and the dock is theirs to open when they are not.
 */
import { esc } from './escape-html.js';

const STYLE = `
  .bai-nav {
    position: fixed; right: 16px; bottom: 16px; z-index: 2147483003;
    display: none; align-items: center; gap: 6px; font-size: 13px;
    background: var(--bai-pop-bg); color: var(--bai-pop-fg);
    border: 1px solid var(--bai-pop-border); border-radius: 999px;
    padding: 6px 8px 6px 14px; box-shadow: 0 6px 20px var(--bai-review-shadow);
    pointer-events: auto;
  }
  .bai-nav.shown { display: flex; }
  /* The set dock owns the bottom-right corner while it is up. */
  .bai-nav.dodge, .bai-panel.dodge { right: auto; left: 16px; }
  .bai-nav .sep { width: 1px; height: 18px; background: var(--bai-pop-border); }
  .bai-nav .n { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .bai-nav .n b { font-weight: 700; }
  .bai-nav .waiting { color: var(--bai-mod-text); font-weight: 600; }
  .bai-nav button {
    border: 1px solid var(--bai-pop-border); background: transparent;
    color: inherit; border-radius: 999px; padding: 3px 9px; cursor: pointer;
    font: inherit; font-size: 13px;
  }
  .bai-nav button.copy {
    border-color: var(--bai-focus-text); color: var(--bai-focus-text);
    font-weight: 600;
  }
  .bai-nav button.copy:not(:disabled):hover {
    background: var(--bai-focus); color: #fff; border-color: var(--bai-focus);
  }
  .bai-nav button.on { background: var(--bai-row-hover); }
  /*
   * A disabled control is quiet, not faded. A half-opacity blue on the pill
   * was all but invisible; full opacity and the app's own secondary ink give
   * it the contrast every other label in here has.
   */
  .bai-nav button:disabled, .bai-panel button:disabled {
    opacity: 1; cursor: default; font-weight: 400; background: transparent;
    color: var(--bai-review-text-dim);
    border-color: var(--bai-review-border);
  }
  .bai-panel {
    position: fixed; right: 16px; bottom: 62px; z-index: 2147483003;
    width: 380px; max-width: calc(100vw - 32px); max-height: 60vh;
    overflow: auto; display: none; background: var(--bai-pop-bg);
    color: var(--bai-pop-fg); border: 1px solid var(--bai-pop-border);
    border-radius: 10px; box-shadow: 0 12px 32px var(--bai-review-shadow);
    font-size: 13px; pointer-events: auto;
  }
  .bai-panel.shown { display: block; }
  .bai-panel .ph {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px;
    font-weight: 700; font-size: 12px;
    border-bottom: 1px solid var(--bai-pop-border);
  }
  .bai-panel .ph .spacer { flex: 1; }
  .bai-panel button {
    border: 1px solid var(--bai-pop-border); background: transparent;
    color: inherit; border-radius: 6px; padding: 2px 8px; cursor: pointer;
    font: inherit; font-size: 11px;
  }
  .bai-panel .cut {
    padding: 6px 12px; font-size: 11px; color: var(--bai-mod-text);
    border-bottom: 1px solid var(--bai-pop-border);
  }
  .bai-panel .pg {
    padding: 6px 12px 2px; font-size: 11px; text-transform: uppercase;
    letter-spacing: .06em; color: var(--bai-review-text-dim);
  }
  .bai-panel .it {
    display: grid; grid-template-columns: 30px 1fr auto; gap: 8px;
    align-items: center; padding: 6px 12px; cursor: pointer; width: 100%;
    border: 0; background: transparent; color: inherit; font: inherit;
    text-align: left; border-radius: 0;
  }
  .bai-panel .it:hover, .bai-panel .it.cur { background: var(--bai-row-hover); }
  .bai-panel .it .k {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    color: var(--bai-mod-text);
  }
  .bai-panel .it .k.added { color: var(--bai-add-text); }
  .bai-panel .it .t {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .bai-panel .it .s {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    color: var(--bai-review-text-dim);
  }
  .bai-panel .it .s.c { color: var(--bai-focus-text); }
`;

export interface NavigatorItem {
  index: number;
  type: 'added' | 'modified';
  /** The stop's label without its page segment. */
  text: string;
  /** `✓ viewed` / `✎ comment`, or empty. */
  state: string;
  commented: boolean;
  current: boolean;
}

export interface NavigatorGroup {
  page: string;
  items: NavigatorItem[];
}

export interface NavigatorModel {
  /** The set dock is up, so the pill steps out of the bottom-right corner. */
  dodge: boolean;
  /** Empty, or the sentence saying the link arrived cut off. */
  truncated: string;
  pages: number;
  total: number;
  /** Zero-based position of the current stop. */
  index: number;
  viewed: number;
  comments: number;
  waiting: boolean;
  panelOpen: boolean;
  pr: number | null;
  groups: NavigatorGroup[];
}

export interface NavigatorOptions {
  /**
   * The host's answer to "may the overlay claim keys on this page" (ADR 0008).
   * `false` unbinds guided mode's bare keys, so the pill names none of them.
   */
  pageChords: boolean;
}

export interface NavigatorCallbacks {
  onNext: () => void;
  onPrev: () => void;
  onTogglePanel: () => void;
  onCopyComments: () => void;
  onCopySummary: () => void;
  onGo: (index: number) => void;
  onExit: () => void;
}

export function createNavigator(
  root: ShadowRoot,
  on: NavigatorCallbacks,
  options: NavigatorOptions,
) {
  /** Never a key the host turned off: a hint nothing answers is a lie. */
  const hint = (key: string) => (options.pageChords ? ` (${key})` : '');
  const style = document.createElement('style');
  style.textContent = STYLE;
  const pill = document.createElement('div');
  pill.className = 'bai-nav';
  pill.setAttribute('role', 'toolbar');
  pill.setAttribute('aria-label', 'Walkthrough navigator');
  const panel = document.createElement('div');
  panel.className = 'bai-panel';
  root.append(style, pill, panel);

  const ACTS: Record<string, () => void> = {
    next: on.onNext,
    prev: on.onPrev,
    panel: on.onTogglePanel,
    copyall: on.onCopyComments,
    summary: on.onCopySummary,
    exit: on.onExit,
  };

  for (const node of [pill, panel]) {
    node.addEventListener('click', (evt) => {
      const target = evt.target instanceof Element ? evt.target : null;
      const button = target?.closest<HTMLElement>('[data-act], [data-go]');
      if (!button) return;
      const go = button.dataset.go;
      if (go !== undefined) return on.onGo(Number(go));
      ACTS[button.dataset.act ?? '']?.();
    });
  }

  function renderPill(model: NavigatorModel) {
    const comments = model.comments;
    pill.classList.toggle('dodge', model.dodge);
    panel.classList.toggle('dodge', model.dodge);
    const copyLabel = comments
      ? `✎ Copy ${comments} comment${comments === 1 ? '' : 's'}`
      : '✎ Copy comments';
    pill.classList.add('shown');
    pill.innerHTML = `
      <span class="n">${model.pages} page${model.pages === 1 ? '' : 's'} · <b>${model.total}</b> change${model.total === 1 ? '' : 's'}</span>
      <span class="sep"></span>
      <span class="n"><b>${model.index + 1}</b> / ${model.total} · ${model.viewed} viewed${model.waiting ? ' · <span class="waiting">waiting</span>' : ''}</span>
      <span class="sep"></span>
      <button class="copy" data-act="copyall"${comments ? '' : ' disabled title="No comments yet"'}>${copyLabel}</button>
      <button data-act="prev" title="Previous stop${hint('p')}" aria-label="Previous stop">‹</button>
      <button data-act="next" title="Next stop${hint('n')}" aria-label="Next stop">›</button>
      <button data-act="panel" class="${model.panelOpen ? 'on' : ''}" title="All stops" aria-label="All stops">☰</button>
    `;
  }

  function renderPanel(model: NavigatorModel) {
    panel.classList.toggle('shown', model.panelOpen);
    if (!model.panelOpen) return;
    const head =
      `<div class="ph">Changes${model.pr ? ` in PR #${model.pr}` : ''}<span class="spacer"></span><button data-act="summary">Copy page summary</button><button data-act="exit">Exit</button></div>` +
      (model.truncated ? `<div class="cut">${esc(model.truncated)}</div>` : '');
    panel.innerHTML =
      head +
      model.groups
        .map(
          (group) =>
            `<div class="pg">${esc(group.page)} · ${group.items.length}</div>` +
            group.items
              .map(
                (item) =>
                  `<button type="button" class="it${item.current ? ' cur' : ''}" data-go="${item.index}">` +
                  `<span class="k ${item.type}">${item.type === 'added' ? 'add' : 'mod'}</span>` +
                  `<span class="t">${item.index + 1}. ${esc(item.text)}</span>` +
                  `<span class="s${item.commented ? ' c' : ''}">${esc(item.state)}</span></button>`,
              )
              .join(''),
        )
        .join('');
  }

  return {
    render(model: NavigatorModel) {
      renderPill(model);
      renderPanel(model);
    },
    destroy() {
      pill.remove();
      panel.remove();
      style.remove();
    },
    /** A click outside the navigator closes its panel. */
    contains: (node: Node) => pill.contains(node) || panel.contains(node),
  };
}

export type WalkthroughNavigator = ReturnType<typeof createNavigator>;
