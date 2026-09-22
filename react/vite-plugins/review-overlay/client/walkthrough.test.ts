/**
 * The walkthrough set, the reviewer's progress over it, and the blocks their
 * comments come back as (FR-3950). The export is asserted through the CLI's
 * own parser, which is what a Claude session reads the paste with.
 */
import { parsePins } from '../cli.js';
import {
  isStop,
  stopLanguages,
  stopTextIn,
  STOP_FIELD_NAMES,
} from './stop-guard.js';
import type { AnchorV3 } from './types.js';
import {
  buildCommentCopy,
  codeHref,
  codeText,
  commentPin,
  createWalkthroughLanguage,
  createWalkthroughProgress,
  createWalkthroughStore,
  pageCount,
  pageSummaryText,
  parseWalkthrough,
  prepareComment,
  repoUrl,
  sha256Hex,
  stopPage,
  viaSentence,
  WALKTHROUGH_KEY,
  walkthroughSha,
  type WalkthroughStop,
} from './walkthrough.js';
import { beforeEach, describe, expect, it } from 'vitest';

const SHA = 'a'.repeat(40);

const stop = (
  id: string,
  over: Partial<AnchorV3> = {},
  label = 'Data › folder-list › button "Upload"',
): WalkthroughStop => ({
  id,
  anchor: {
    v: 3,
    s: `[data-testid="${id}"]`,
    p: '/data',
    tag: 'button',
    ck: 'The button says Upload',
    ch: 'Renamed the action',
    sha: SHA,
    pr: 9690,
    ...over,
  },
  anchorB64: `PAYLOAD${id}`,
  label,
  appHash: '',
});

/** A store backed by a plain object, so nothing leaks between tests. */
function memoryStorage(): Storage {
  const held = new Map<string, string>();
  return {
    get length() {
      return held.size;
    },
    clear: () => held.clear(),
    getItem: (key: string) => held.get(key) ?? null,
    key: (index: number) => [...held.keys()][index] ?? null,
    removeItem: (key: string) => void held.delete(key),
    setItem: (key: string, value: string) => void held.set(key, String(value)),
  } as Storage;
}

describe('the walkthrough set', () => {
  it('round-trips through its own storage key', () => {
    const storage = memoryStorage();
    const store = createWalkthroughStore(storage);
    store.save([stop('c_aaaaaaa'), stop('c_bbbbbbb')]);

    expect(storage.getItem(WALKTHROUGH_KEY)).toBeTruthy();
    expect(
      createWalkthroughStore(storage)
        .stops()
        .map((s) => s.id),
    ).toEqual(['c_aaaaaaa', 'c_bbbbbbb']);

    store.clear();
    expect(createWalkthroughStore(storage).stops()).toEqual([]);
  });

  it('remembers how much of the link could not be read', () => {
    const storage = memoryStorage();
    createWalkthroughStore(storage).save([stop('c_aaaaaaa')], 2);

    // A reload keeps telling the truth about a truncated paste.
    const reopened = createWalkthroughStore(storage);
    expect(reopened.stops()).toHaveLength(1);
    expect(reopened.unreadable()).toBe(2);

    createWalkthroughStore(storage).save([stop('c_aaaaaaa')]);
    expect(createWalkthroughStore(storage).unreadable()).toBe(0);
  });

  it('keeps only the members that are still stops', () => {
    const notAStop = stop('c_ccccccc');
    delete notAStop.anchor.ck;
    const raw = JSON.stringify({
      v: 1,
      stops: [stop('c_aaaaaaa'), notAStop, { id: 'nope' }],
    });

    expect(parseWalkthrough(raw).stops.map((s) => s.id)).toEqual(['c_aaaaaaa']);
    expect(parseWalkthrough('not json').stops).toEqual([]);
  });

  it('counts pages by path AND query', () => {
    const stops = [
      stop('c_aaaaaaa'),
      stop('c_bbbbbbb'),
      stop('c_ccccccc', { p: '/session/start' }),
      stop('c_ddddddd', { p: '/data', q: 'tab=models' }),
    ];

    expect(pageCount(stops)).toBe(3);
    expect(walkthroughSha(stops)).toBe(SHA);
    expect(stopPage(stops[0])).toBe('Data');
  });
});

describe('progress', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = memoryStorage();
  });

  it('keeps viewed and comments under the walkthrough’s sha', () => {
    const progress = createWalkthroughProgress(SHA, storage);
    progress.setViewed('c_aaaaaaa', true);
    progress.setComment('c_bbbbbbb', 'the label is wrong');
    // A tick is one gesture and lands at once; typing is debounced, so the
    // page going away is what flushes it.
    expect(createWalkthroughProgress(SHA, storage).isViewed('c_aaaaaaa')).toBe(
      true,
    );
    expect(createWalkthroughProgress(SHA, storage).comment('c_bbbbbbb')).toBe(
      '',
    );
    progress.flush();

    // A reload: a fresh reader over the same storage.
    const reopened = createWalkthroughProgress(SHA, storage);
    expect(reopened.isViewed('c_aaaaaaa')).toBe(true);
    expect(reopened.comment('c_bbbbbbb')).toBe('the label is wrong');
    expect(reopened.viewedCount(['c_aaaaaaa', 'c_bbbbbbb'])).toBe(1);
    expect(reopened.commented(['c_aaaaaaa', 'c_bbbbbbb'])).toEqual([
      'c_bbbbbbb',
    ]);

    // A walkthrough minted for another head starts clean.
    expect(
      createWalkthroughProgress('b'.repeat(40), storage).isViewed('c_aaaaaaa'),
    ).toBe(false);
  });

  it('clears a comment that was emptied, and survives storage refusing', () => {
    const progress = createWalkthroughProgress(SHA, storage);
    progress.setComment('c_aaaaaaa', 'something');
    progress.setComment('c_aaaaaaa', '');
    progress.flush();
    expect(createWalkthroughProgress(SHA, storage).comment('c_aaaaaaa')).toBe(
      '',
    );

    const refusing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    const offline = createWalkthroughProgress(SHA, refusing);
    offline.setViewed('c_aaaaaaa', true);
    expect(offline.isViewed('c_aaaaaaa')).toBe(true);
  });
});

describe('the stop’s own prose and links', () => {
  it('reads a via list back as a sentence', () => {
    expect(
      viaSentence([
        { click: { text: 'Upload' } },
        { click: { tid: 'confirm-button' } },
      ]),
    ).toBe('Click “Upload”, then Click “confirm-button”');
    expect(viaSentence(undefined)).toBe('');
  });

  it('points a code ref at GitHub’s sha256-keyed file anchor', () => {
    const ref = { path: 'react/src/App.tsx', line: 12, to: 20 };
    expect(codeText(ref)).toBe('react/src/App.tsx:12-20');
    expect(
      codeHref('https://github.com/lablup/backend.ai-webui', 9690, ref),
    ).toBe(
      `https://github.com/lablup/backend.ai-webui/pull/9690/files#diff-${sha256Hex(
        'react/src/App.tsx',
      )}R12-R20`,
    );
    // The known digest of the empty string, so the hex helper itself is pinned.
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('builds a repository URL from either shape the server answers with', () => {
    expect(
      repoUrl({ pr: 1, repo: 'lablup/x', branch: null, source: 'gh' }),
    ).toBe('https://github.com/lablup/x');
    expect(
      repoUrl({
        pr: 1,
        repo: 'https://github.com/lablup/y/',
        branch: null,
        source: 'gh',
      }),
    ).toBe('https://github.com/lablup/y');
    expect(repoUrl(null)).toBe('https://github.com/lablup/backend.ai-webui');
  });

  it('writes the panel’s checklist with the viewed state', () => {
    const stops = [stop('c_aaaaaaa'), stop('c_bbbbbbb')];
    const progress = createWalkthroughProgress(SHA, memoryStorage());
    progress.setViewed('c_bbbbbbb', true);

    expect(pageSummaryText(stops, progress).split('\n')).toEqual([
      '- [ ] 1. Data › folder-list › button "Upload" — The button says Upload',
      '- [x] 2. Data › folder-list › button "Upload" — The button says Upload',
    ]);
  });
});

describe('the comment export', () => {
  it('parses back as one ORDINARY reviewer pin per comment', async () => {
    const { encodeAnchor } = await import('./codec.js');
    const first = stop('c_aaaaaaa');
    const second = stop('c_bbbbbbb', { p: '/session/start' });
    // Real payloads: the parser decodes every anchor it is handed.
    first.anchorB64 = await encodeAnchor(first.anchor);
    second.anchorB64 = await encodeAnchor(second.anchor);
    const at = '2026-09-15T09:00:00Z';
    const pins = [
      commentPin(
        first,
        0,
        await prepareComment(first, 'the label is wrong'),
        9690,
        at,
      ),
      commentPin(
        second,
        1,
        await prepareComment(second, 'this one is fine, but slow'),
        9690,
        at,
      ),
    ];

    const copy = buildCommentCopy(pins);
    const parsed = await parsePins(copy.text);

    expect(parsed).toHaveLength(2);
    expect(parsed.every((pin) => pin.idVerified)).toBe(true);
    expect(parsed[0].note).toContain('the label is wrong');
    expect(parsed[0].note).toContain(`re: stop 1 · ${first.id}`);
    expect(parsed[1].note).toContain(`re: stop 2 · ${second.id}`);
    // Each block points at the same element the stop did, on its own page.
    expect(parsed.map((pin) => pin.anchor?.p)).toEqual([
      '/data',
      '/session/start',
    ]);
    expect(copy.toast).toBe('Copied 2 comments — paste them into the PR');

    // …and NOT as stops: `review-pins parse` leaves stops out of its findings
    // by default, so a reviewer's remark must not look like one.
    for (const pin of parsed) {
      expect(isStop(pin.anchor)).toBe(false);
      for (const field of STOP_FIELD_NAMES) {
        expect(pin.anchor).not.toHaveProperty(field);
      }
    }
    // The element signals survive — this is the same element, not a new pin.
    expect(parsed[0].anchor?.s).toBe(first.anchor.s);
    expect(parsed[0].anchor?.tag).toBe('button');
    // The capped comment rides in the anchor, as it does for any note.
    expect(parsed[0].anchor?.n).toBe('the label is wrong');
  });

  it('strips every stop field and keeps every element signal', async () => {
    const source = stop('c_aaaaaaa', {
      q: 'tab=models',
      txt: 'Upload',
      tid: 'folder-list',
      rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
      c: { name: 'UploadButton' },
    });

    const ready = await prepareComment(source, '  needs a tooltip  ');

    expect(isStop(ready.anchor)).toBe(false);
    expect(ready.note).toBe('needs a tooltip');
    expect(ready.anchor).toEqual({
      v: 3,
      s: source.anchor.s,
      p: '/data',
      q: 'tab=models',
      tag: 'button',
      txt: 'Upload',
      tid: 'folder-list',
      rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
      c: { name: 'UploadButton' },
      n: 'needs a tooltip',
    });
  });
});

/**
 * A stop reads in two languages (FR-4057): the one the session wrote it in and
 * whatever it was translated into. The reader's pick outlives the full reload
 * that walking to the next stop makes, which is why it is stored.
 */
describe('a stop in two languages', () => {
  const bilingual = stop('c_bbbbbbb', {
    lng: 'ko',
    ch: '업로드 버튼이 카드 헤더로 옮겨졌습니다.',
    ck: '목록 위에 버튼이 보여야 합니다.',
    old: '행마다 업로드 아이콘',
    new: '헤더의 버튼',
    i18n: {
      en: {
        ch: 'The upload button moved into the card header.',
        ck: 'The button shows above the list.',
      },
    },
  }).anchor;

  it('offers the language it was written in first', () => {
    expect(stopLanguages(bilingual)).toEqual(['ko', 'en']);
  });

  it('offers nothing to switch between without a translation', () => {
    expect(stopLanguages(stop('c_ccccccc').anchor)).toEqual([]);
    expect(stopLanguages({ ...bilingual, lng: undefined })).toEqual([]);
  });

  it('reads the translation, falling back per field to the base', () => {
    const en = stopTextIn(bilingual, 'en');
    expect(en.ch).toBe('The upload button moved into the card header.');
    // The translation named no literals, so the reader still sees the pair.
    expect(en.old).toBe('행마다 업로드 아이콘');
    expect(stopTextIn(bilingual, 'ko').ch).toBe(bilingual.ch);
    expect(stopTextIn(bilingual, 'ja').ch).toBe(bilingual.ch);
    expect(stopTextIn(bilingual, null).ck).toBe(bilingual.ck);
  });

  it('says the via sentence in the language on screen', () => {
    const via = [{ click: { text: 'Create Folder' } }];
    expect(viaSentence(via, 'ko')).toBe('“Create Folder” 클릭');
    expect(viaSentence(via, 'en')).toBe('Click “Create Folder”');
    expect(viaSentence(via, 'ja')).toBe('Click “Create Folder”');
  });

  it('remembers the reader’s pick per walkthrough, and only once made', () => {
    const storage = memoryStorage();
    const language = createWalkthroughLanguage(SHA, storage);
    expect(language.get()).toBeNull();
    language.set('en');
    expect(createWalkthroughLanguage(SHA, storage).get()).toBe('en');
    // A different walkthrough is a different question.
    expect(createWalkthroughLanguage('b'.repeat(40), storage).get()).toBeNull();
  });

  it('keeps the language fields off the pin a reviewer copies', () => {
    expect(STOP_FIELD_NAMES).toContain('lng');
    expect(STOP_FIELD_NAMES).toContain('i18n');
  });
});
