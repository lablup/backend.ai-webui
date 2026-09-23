/**
 * Guided mode's POPOVER (FR-3950): what one stop says — what changed, what to
 * check, where the code is — plus the two things the reader gives back, the
 * Viewed tick and a comment.
 *
 * Rebuilt only when the stop changes: the comment textarea is typed into while
 * the mark layer and the navigator re-render around it, and rewriting its
 * markup would take the caret with it.
 */
import { esc } from './escape-html.js';

/** Wide enough that a two-paragraph stop wraps into few enough lines to
    read without scrolling; still under half of a 1440px screen. */
const WIDTH = 720;
const PAD = 12;
const GAP = 14;
/** Chrome the panel keeps clear: the banner above it, the pill below it. */
const TOP_RESERVE = 60;
const BOTTOM_RESERVE = 70;
/** Under this the panel scrolls instead of shrinking out of readability. */
const MIN_HEIGHT = 200;
/** Stands in until the panel has been laid out and can be measured. */
const ASSUMED_HEIGHT = 300;

const STYLE = `
  .bai-popover {
    position: fixed; z-index: 2147483004; width: min(${WIDTH}px, 92vw);
    /* Never taller than the viewport: a long stop scrolls its body rather
       than pushing the foot — and the comment box — off the screen. */
    max-height: max(${MIN_HEIGHT}px, calc(100vh - ${TOP_RESERVE + BOTTOM_RESERVE}px));
    display: none; background: var(--bai-pop-bg); color: var(--bai-pop-fg);
    border: 1px solid var(--bai-pop-border); border-radius: 8px;
    box-shadow: 0 12px 32px var(--bai-review-shadow); font-size: 13px;
    line-height: 1.5; pointer-events: auto;
  }
  .bai-popover.shown { display: flex; flex-direction: column; }
  .bai-popover .head {
    display: flex; flex: none; align-items: center; gap: 8px; padding: 6px 10px;
    border-bottom: 1px solid var(--bai-pop-border); font-size: 12px;
  }
  .bai-popover .type {
    font-weight: 700; text-transform: uppercase; font-size: 11px;
    padding: 1px 7px; border-radius: 999px;
    /* White measures 2.75:1 on the docs amber at 11px bold; the dark ink
       already declared for the pin's accent clears AA on both fills. */
    color: var(--bai-review-on-accent);
    background: var(--bai-mod);
  }
  .bai-popover .type.added { background: var(--bai-add); }
  .bai-popover .kind { color: var(--bai-review-text-dim); }
  .bai-popover .spacer { flex: 1; }
  .bai-popover button {
    border: 1px solid var(--bai-pop-border); background: transparent;
    color: inherit; border-radius: 6px; padding: 2px 8px; cursor: pointer;
    font: inherit; font-size: 12px;
  }
  .bai-popover button:disabled {
    opacity: 1; cursor: default; color: var(--bai-review-text-dim);
    border-color: var(--bai-review-border);
  }
  .bai-popover label { display: flex; align-items: center; gap: 4px; }
  .bai-popover .lang { display: flex; gap: 2px; }
  .bai-popover .lang button { text-transform: uppercase; padding: 2px 6px; }
  .bai-popover .lang button[aria-pressed='true'] {
    font-weight: 700; background: var(--bai-row-hover);
    border-color: var(--bai-review-text-dim);
  }
  .bai-popover .body {
    padding: 10px 12px; display: grid; gap: 8px; align-content: start;
    overflow: auto; min-height: 0; overscroll-behavior: contain;
    /* An overlay scrollbar stays invisible until it is used, so a capped
       panel would hide the comment box with no cue at all. Reserving the
       gutter is what opts Chromium out of overlay scrollbars; the standard
       properties are the ones that reach an element inside a shadow root —
       the ::-webkit-scrollbar rules do not. */
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: var(--bai-pop-border) transparent;
  }
  .bai-popover .lbl {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .06em; color: var(--bai-review-text-dim);
  }
  .bai-popover p { margin: 0; }
  .bai-popover .diff {
    padding: 6px 8px; border-radius: 4px; background: var(--bai-row-hover);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .bai-popover .diff .del {
    background: rgba(239, 68, 68, .14); color: var(--bai-del-text);
    text-decoration: line-through; border-radius: 2px;
  }
  .bai-popover .diff .ins {
    background: rgba(34, 197, 94, .22); color: var(--bai-add-text);
    text-decoration: underline; border-radius: 2px;
  }
  .bai-popover .via {
    padding: 6px 10px; border-left: 3px solid var(--bai-mod);
    background: var(--bai-row-hover); border-radius: 0 4px 4px 0;
  }
  .bai-popover .via.away { border-left-color: var(--bai-review-text-dim); }
  .bai-popover .code a {
    display: block; text-decoration: none; color: var(--bai-focus-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .bai-popover textarea {
    width: 100%; min-height: 56px; font: inherit; font-size: 13px;
    border: 1px solid var(--bai-pop-border); border-radius: 6px;
    padding: 6px 8px; background: transparent; color: inherit;
    resize: vertical;
  }
  .bai-popover .foot {
    display: flex; flex: none; align-items: center; gap: 10px; padding: 6px 10px;
    border-top: 1px solid var(--bai-pop-border); font-size: 11px;
    color: var(--bai-review-text-dim);
  }
  .bai-popover .foot kbd {
    font: inherit; padding: 0 4px; border: 1px solid var(--bai-pop-border);
    border-radius: 3px;
  }
`;

export type PopoverPlace =
  | { kind: 'located'; rect: { left: number; top: number; bottom: number } }
  /** Not rendered yet: `via` says how the reader makes it appear. */
  | { kind: 'waiting'; via: string }
  /** On another page, named so `›` is not a surprise. */
  | { kind: 'away'; page: string };

export interface PopoverModel {
  id: string;
  index: number;
  total: number;
  page: string;
  label: string;
  type: 'added' | 'modified';
  kind: string;
  changed: string;
  check: string;
  old: string;
  next: string;
  code: Array<{ text: string; href: string }>;
  comment: string;
  viewed: boolean;
  place: PopoverPlace;
  /** The language the text above is in, and every language on offer (FR-4057). */
  lang: string;
  /** Empty unless the stop was minted with a translation — no toggle then. */
  langs: string[];
}

export interface PopoverOptions {
  /**
   * The host's answer to "may the overlay claim keys on this page" (ADR 0008).
   * `false` unbinds the bare keys this panel names; Escape is bound either way.
   */
  pageChords: boolean;
}

export interface PopoverCallbacks {
  onToggleViewed: (viewed: boolean) => void;
  /** Switch the stop's wording AND the app under it to this language. */
  onLanguage: (lang: string) => void;
  onComment: (text: string) => void;
  onCopyRef: () => void;
  onClose: () => void;
}

/**
 * The panel's own words. A stop the session wrote in Korean reads oddly under
 * English headings, so the chrome follows the toggle; a language the map does
 * not name falls back to English.
 */
const LABELS: Record<string, Record<string, string>> = {
  en: {
    changed: 'What changed',
    check: 'What to check',
    code: 'Code',
    comment: 'Comment',
    viewed: 'Viewed',
    ref: 'Copy ref',
    appears: '— the mark appears when it does.',
    waiting: 'Not on screen yet — the mark appears when it is.',
    away: 'On {page} — › takes you there.',
  },
  ko: {
    changed: '무엇이 바뀌었나',
    check: '무엇을 확인하나',
    code: '코드',
    comment: '의견',
    viewed: '확인함',
    ref: '링크 복사',
    appears: '— 그러면 표시가 나타납니다.',
    waiting: '아직 화면에 없습니다 — 나타나면 표시됩니다.',
    away: '{page} 페이지에 있습니다 — › 로 이동합니다.',
  },
};

const words = (lang: string): Record<string, string> => ({
  ...LABELS.en,
  ...(LABELS[lang] ?? {}),
});

const whereLine = (model: PopoverModel): string => {
  const say = words(model.lang);
  if (model.place.kind === 'waiting')
    return model.place.via
      ? `<div class="via">${esc(model.place.via)} ${esc(say.appears)}</div>`
      : `<div class="via">${esc(say.waiting)}</div>`;
  if (model.place.kind === 'away')
    return `<div class="via away">${say.away.split('{page}').map(esc).join(esc(model.place.page))}</div>`;
  return '';
};

/** The keys guided mode binds only where the host lets it (ADR 0008). */
const BARE_KEYS =
  '<kbd>n</kbd>/<kbd>p</kbd> · <kbd>v</kbd> viewed · <kbd>m</kbd> comment · ' +
  '<kbd>c</kbd> ref · ';

export function createPopover(
  root: ShadowRoot,
  on: PopoverCallbacks,
  options: PopoverOptions,
) {
  /** Never a key the host turned off: a hint nothing answers is a lie. */
  const hint = (key: string) => (options.pageChords ? ` (${key})` : '');
  const style = document.createElement('style');
  style.textContent = STYLE;
  const pop = document.createElement('div');
  pop.className = 'bai-popover';
  root.append(style, pop);

  /**
   * The stop AND the language the markup belongs to; a re-render of the same
   * pair only patches. The caret in the comment box survives that, and a
   * language switch rewrites every sentence, so it has to rebuild.
   */
  let shown: string | null = null;
  const shownKey = (model: PopoverModel): string =>
    `${model.id}\u0000${model.lang}`;

  pop.addEventListener('click', (evt) => {
    const target = evt.target instanceof Element ? evt.target : null;
    const act = target?.closest<HTMLElement>('[data-pact]')?.dataset.pact;
    if (act === 'close') on.onClose();
    if (act === 'ref') on.onCopyRef();
    if (act === 'lang') {
      const lang = target?.closest<HTMLElement>('[data-lang]')?.dataset.lang;
      if (lang) on.onLanguage(lang);
    }
  });
  pop.addEventListener('change', (evt) => {
    const target = evt.target;
    if (target instanceof HTMLInputElement && target.dataset.pact === 'viewed')
      on.onToggleViewed(target.checked);
  });
  pop.addEventListener('input', (evt) => {
    const target = evt.target;
    if (target instanceof HTMLTextAreaElement) on.onComment(target.value);
  });

  const textarea = () =>
    pop.querySelector<HTMLTextAreaElement>('[data-pact="comment"]');

  function build(model: PopoverModel) {
    const say = words(model.lang);
    const langs = model.langs.length > 1 ? model.langs : [];
    pop.innerHTML = `
      <div class="head">
        <span class="type ${model.type}">${model.type}</span>
        <span class="kind">${esc(model.kind)}</span>
        <span class="spacer"></span>
        ${
          langs.length
            ? `<span class="lang" role="group" aria-label="Language">${langs
                .map(
                  (lang) =>
                    `<button data-pact="lang" data-lang="${esc(lang)}" aria-pressed="${lang === model.lang}">${esc(lang)}</button>`,
                )
                .join('')}</span>`
            : ''
        }
        <button data-pact="ref" title="${esc(say.ref)}${hint('c')}">${esc(say.ref)}</button>
        <label><input type="checkbox" data-pact="viewed"> ${esc(say.viewed)}</label>
        <button data-pact="close" title="Close (Esc)" aria-label="Close">✕</button>
      </div>
      <div class="body">
        <div class="where"></div>
        <div><div class="lbl">${esc(say.changed)}</div><p>${esc(model.changed)}</p>${
          model.next
            ? `<div class="diff">${model.old ? `<span class="del">${esc(model.old)}</span> → ` : ''}<span class="ins">${esc(model.next)}</span></div>`
            : ''
        }</div>
        <div><div class="lbl">${esc(say.check)}</div><p>${esc(model.check)}</p></div>
        ${
          model.code.length
            ? `<div class="code"><div class="lbl">${esc(say.code)}</div>${model.code
                .map(
                  (ref) =>
                    `<a href="${esc(ref.href)}" target="_blank" rel="noopener">${esc(ref.text)} ↗</a>`,
                )
                .join('')}</div>`
            : ''
        }
        <div><div class="lbl">${esc(say.comment)}${hint('m')}</div><textarea data-pact="comment" aria-label="Comment on this change" placeholder="Something off? Write it here — Copy N comments gathers every one with its ref."></textarea></div>
      </div>
      <div class="foot">
        <span>#${model.index + 1} · ${esc(model.page)} · ${esc(model.id)}</span>
        <span class="spacer"></span>
        <span>${options.pageChords ? BARE_KEYS : ''}<kbd>Esc</kbd></span>
      </div>`;
    const area = textarea();
    if (area) area.value = model.comment;
  }

  /** Under the mark when it fits, above it when it does not, centred when away. */
  function place(where: PopoverPlace) {
    /*
     * The CSS cap is what the panel can actually be; measuring it and clamping
     * against the same number is what keeps both ends on screen. A viewport
     * too short for even the cap keeps the head visible and loses the foot —
     * the panel scrolls, so nothing in it is unreachable.
     */
    const cap = Math.max(
      MIN_HEIGHT,
      window.innerHeight - TOP_RESERVE - BOTTOM_RESERVE,
    );
    const height = Math.min(pop.offsetHeight || ASSUMED_HEIGHT, cap);
    const lowest = Math.max(PAD, window.innerHeight - BOTTOM_RESERVE - height);
    const highest = Math.min(TOP_RESERVE, lowest);
    const clamp = (top: number) => Math.min(Math.max(top, highest), lowest);

    if (where.kind !== 'located') {
      Object.assign(pop.style, {
        left: '50%',
        top: `${clamp(Math.round((window.innerHeight - height) / 2))}px`,
        transform: 'translateX(-50%)',
      });
      return;
    }
    const rect = where.rect;
    const width = Math.min(WIDTH, window.innerWidth * 0.92);
    const left = Math.min(
      Math.max(PAD, rect.left),
      Math.max(PAD, window.innerWidth - width - PAD),
    );
    const below = rect.bottom + GAP;
    const above = rect.top - height - GAP;
    Object.assign(pop.style, {
      transform: '',
      left: `${left}px`,
      top: `${clamp(below <= lowest ? below : above)}px`,
    });
  }

  return {
    render(model: PopoverModel | null) {
      if (!model) {
        pop.classList.remove('shown');
        shown = null;
        return;
      }
      if (shown !== shownKey(model)) {
        build(model);
        shown = shownKey(model);
      }
      const where = pop.querySelector('.where');
      if (where) where.innerHTML = whereLine(model);
      const tick = pop.querySelector<HTMLInputElement>('[data-pact="viewed"]');
      if (tick) tick.checked = model.viewed;
      pop.classList.add('shown');
      place(model.place);
    },
    /**
     * A scroll or a resize moved the mark. The model is unchanged — only the
     * box it hangs from — so nothing is rebuilt.
     */
    reposition(where: PopoverPlace) {
      if (!pop.classList.contains('shown')) return;
      place(where);
    },
    focusComment() {
      const area = textarea();
      area?.focus();
      area?.setSelectionRange(area.value.length, area.value.length);
    },
    isTyping: () => !!textarea() && root.activeElement === textarea(),
    contains: (node: Node) => pop.contains(node),
    destroy() {
      pop.remove();
      style.remove();
    },
  };
}

export type WalkthroughPopover = ReturnType<typeof createPopover>;
