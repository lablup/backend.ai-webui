/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyRouteDocumentTitle,
  formatDocumentTitle,
  updateDocumentTitle,
} from './documentTitle';

describe('formatDocumentTitle', () => {
  it('puts the page label before the base title', () => {
    expect(formatDocumentTitle('Sessions', 'Backend.AI')).toBe(
      'Sessions · Backend.AI',
    );
  });

  it('falls back to the base title without a label', () => {
    expect(formatDocumentTitle(undefined, 'Backend.AI')).toBe('Backend.AI');
    expect(formatDocumentTitle('', 'Backend.AI')).toBe('Backend.AI');
  });
});

describe('applyRouteDocumentTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    updateDocumentTitle({
      pageLabel: undefined,
      actAsName: undefined,
      attentionCount: 0,
    });
    document.title = originalTitle;
  });

  it('sets the page title in production', () => {
    vi.stubEnv('DEV', false);
    applyRouteDocumentTitle('Data');
    expect(document.title).toBe('Data · Backend.AI');
  });

  it('keeps the dev-server prefix and never doubles it across pages', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-4073');

    applyRouteDocumentTitle('Sessions');
    expect(document.title).toBe('[fr-4073] Sessions · Backend.AI');

    applyRouteDocumentTitle('Data');
    expect(document.title).toBe('[fr-4073] Data · Backend.AI');

    applyRouteDocumentTitle(undefined);
    expect(document.title).toBe('[fr-4073] Backend.AI');
  });

  it('keeps the act-as prefix across routes', () => {
    vi.stubEnv('DEV', false);
    updateDocumentTitle({ actAsName: 'Alice' });
    expect(document.title).toBe('[Alice] Backend.AI');

    applyRouteDocumentTitle('Sessions');
    expect(document.title).toBe('[Alice] Sessions · Backend.AI');

    applyRouteDocumentTitle('Data');
    expect(document.title).toBe('[Alice] Data · Backend.AI');
  });

  it('keeps the attention badge across a route change', () => {
    vi.stubEnv('DEV', false);
    applyRouteDocumentTitle('Sessions');
    updateDocumentTitle({ attentionCount: 2 });
    expect(document.title).toBe('(2) Sessions · Backend.AI');

    applyRouteDocumentTitle('Data');
    expect(document.title).toBe('(2) Data · Backend.AI');

    updateDocumentTitle({ attentionCount: 0 });
    expect(document.title).toBe('Data · Backend.AI');
  });

  it('composes every part the same way in any write order', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-4073');
    const expected = '(3) [Alice] [fr-4073] Data · Backend.AI';

    updateDocumentTitle({ attentionCount: 3 });
    applyRouteDocumentTitle('Data');
    updateDocumentTitle({ actAsName: 'Alice' });
    expect(document.title).toBe(expected);

    updateDocumentTitle({
      pageLabel: undefined,
      actAsName: undefined,
      attentionCount: 0,
    });
    updateDocumentTitle({ actAsName: 'Alice' });
    applyRouteDocumentTitle('Data');
    updateDocumentTitle({ attentionCount: 3 });
    expect(document.title).toBe(expected);
  });
});
