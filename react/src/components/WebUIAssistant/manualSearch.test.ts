/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  createManualIndex,
  splitManualMarkdown,
  manualSectionURL,
  searchManual,
  tokenize,
  type AssistantManual,
} from './manualSearch';

const manual: AssistantManual = {
  lang: 'en',
  sections: [
    {
      page: 'vfolder',
      pageTitle: 'Storage',
      heading: 'Create a storage folder',
      anchor: 'create-storage-folder',
      text: 'Click the Create Folder button and enter a folder name.',
    },
    {
      page: 'session_page',
      pageTitle: 'Sessions',
      heading: 'Mount folders to a session',
      anchor: 'mount-folders',
      text: 'In the Data step of the session launcher, select the folders to mount.',
    },
    {
      page: 'deployment',
      pageTitle: 'Deployments',
      heading: 'Access tokens',
      text: 'Generate a token to call a deployment that is not open to the public.',
    },
    {
      page: 'vfolder',
      pageTitle: '스토리지',
      heading: '폴더 공유하기',
      text: '다른 사용자에게 폴더를 공유하려면 공유 버튼을 누르세요.',
    },
  ],
};

describe('tokenize', () => {
  it('drops stop words and one-letter words from latin text', () => {
    expect(tokenize('How do I mount a folder?')).toEqual(['mount', 'folder']);
  });

  it('splits CJK runs into bigrams', () => {
    expect(tokenize('폴더 공유')).toEqual(['폴더', '공유']);
    expect(tokenize('공유하기')).toEqual(['공유', '유하', '하기']);
  });

  it('splits a run where the script changes', () => {
    expect(tokenize('GPU를 할당')).toEqual(['gpu', '를', '할당']);
  });

  it('keeps Thai vowel and tone marks inside the word', () => {
    expect(tokenize('เซสชัน')).not.toContain('น');
  });
});

describe('searchManual', () => {
  const index = createManualIndex(manual);

  it('ranks the section whose heading matches the question first', () => {
    const hits = searchManual(index, 'How do I mount a folder in my session?');
    expect(hits[0].section.anchor).toBe('mount-folders');
  });

  it('finds Korean sections through bigrams', () => {
    const hits = searchManual(index, '폴더를 공유하고 싶어요');
    expect(hits[0].section.heading).toBe('폴더 공유하기');
  });

  it('returns nothing when no term matches', () => {
    expect(searchManual(index, 'kubernetes')).toEqual([]);
  });

  it('caps the number of hits', () => {
    expect(searchManual(index, 'folder session token', 2)).toHaveLength(2);
  });
});

describe('manualSectionURL', () => {
  it('links the page and the anchor when there is one', () => {
    const base = 'https://webui.docs.backend.ai/next/en/';
    expect(manualSectionURL(base, manual.sections[1])).toBe(
      `${base}session_page.html#mount-folders`,
    );
    expect(manualSectionURL(base, manual.sections[2])).toBe(
      `${base}deployment.html`,
    );
  });
});

describe('splitManualMarkdown', () => {
  it('splits at h1–h3, takes the anchor line before a heading, drops images and front matter', () => {
    const { pageTitle, sections } = splitManualMarkdown(
      [
        '---',
        'navTitle: Sessions',
        '---',
        '',
        '<a id="session-page"></a>',
        '',
        '# Session Page',
        '',
        'Intro text.',
        '',
        '![](../images/a.png)',
        '<a id="session-list"></a>',
        '## Session list',
        '',
        ':::note[Heads up]',
        'Lists **every** session.',
        ':::',
        '```bash',
        '# not a heading',
        '```',
      ].join('\n'),
    );
    expect(pageTitle).toBe('Sessions');
    expect(sections.map((s) => [s.heading, s.anchor])).toEqual([
      ['Session Page', 'session-page'],
      ['Session list', 'session-list'],
    ]);
    expect(sections[0].text).toBe('Intro text.');
    expect(sections[1].text).toContain('note: Heads up');
    expect(sections[1].text).toContain('# not a heading');
  });

  it('leaves no tag behind when tags are nested', () => {
    const { sections } = splitManualMarkdown(
      [
        '## Title <scr<b>ipt>x',
        '',
        'Body <scr<i>ipt>alert(1)</scr</i>ipt> text.',
      ].join('\n'),
    );
    expect(sections[0].heading).not.toMatch(/<script/i);
    expect(sections[0].text).not.toMatch(/<\/?script/i);
  });
});
