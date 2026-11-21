/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  linkManualReferences,
  buildAssistantSystemPrompt,
  parseManualTarget,
} from './webUIAssistantPrompt';

const base = 'https://webui.docs.backend.ai/next/en/';

describe('buildAssistantSystemPrompt', () => {
  it('appends the current page and numbered excerpts with their URLs', () => {
    const prompt = buildAssistantSystemPrompt({
      basePrompt: 'You are the assistant.',
      page: {
        path: '/project/default/session',
        manualURL: `${base}session_page.html`,
      },
      excerpts: [
        {
          page: 'session_page',
          pageTitle: 'Sessions',
          heading: 'Session list',
          anchor: 'session-list',
          text: 'The list shows every session.',
        },
      ],
      manualBaseURL: base,
    });
    expect(prompt).toContain('You are the assistant.');
    expect(prompt).toContain('WebUI path: /project/default/session');
    expect(prompt).toContain('### [1] Sessions › Session list');
    expect(prompt).toContain(`URL: ${base}session_page.html#session-list`);
    expect(prompt).toContain('The list shows every session.');
  });

  it('says so when nothing matched', () => {
    const prompt = buildAssistantSystemPrompt({
      basePrompt: 'p',
      excerpts: [],
      manualBaseURL: base,
    });
    expect(prompt).toContain('No manual section matched this question.');
    expect(prompt).not.toContain('Current page');
  });

  it('does not call an unloaded manual a miss', () => {
    const prompt = buildAssistantSystemPrompt({
      basePrompt: 'p',
      excerpts: null,
      manualBaseURL: base,
    });
    expect(prompt).toContain('The manual is not available right now.');
    expect(prompt).not.toContain('No manual section matched');
  });

  it('truncates long excerpts', () => {
    const prompt = buildAssistantSystemPrompt({
      basePrompt: 'p',
      excerpts: [
        { page: 'a', pageTitle: 'A', heading: 'H', text: 'x'.repeat(5000) },
      ],
      manualBaseURL: base,
    });
    expect(prompt).toContain(`${'x'.repeat(1800)}…`);
    expect(prompt).not.toContain('x'.repeat(1801));
  });
});

describe('parseManualTarget', () => {
  it('reads the page and anchor from a manual URL', () => {
    expect(parseManualTarget(`${base}vfolder.html#create-folder`)).toEqual({
      page: 'vfolder',
      anchor: 'create-folder',
    });
    expect(parseManualTarget(`${base}vfolder.html`)).toEqual({
      page: 'vfolder',
      anchor: undefined,
    });
    expect(parseManualTarget(base)).toBeNull();
  });
});

describe('linkManualReferences', () => {
  const references = [
    { title: 'Sessions › Start', url: 'https://docs/ko/session.html#start' },
    { title: 'Folders › Share', url: 'https://docs/ko/vfolder.html' },
  ];

  it('links [n] lines a small model writes without a URL', () => {
    expect(
      linkManualReferences(
        'Steps.\n\nReferences:\n\n- [1] 연산 세션 › 자원 할당\n[2]',
        references,
      ),
    ).toBe(
      'Steps.\n\nReferences:\n\n- [연산 세션 › 자원 할당](https://docs/ko/session.html#start)\n[Folders › Share](https://docs/ko/vfolder.html)',
    );
  });

  it('leaves real links, unknown numbers and inline mentions alone', () => {
    const text =
      '- [1] [Start](https://docs/ko/session.html)\n- [7] Nowhere\nSee [1](x) and step [2] above.';
    expect(linkManualReferences(text, references)).toBe(text);
    expect(linkManualReferences('[1] A', [])).toBe('[1] A');
  });
});
