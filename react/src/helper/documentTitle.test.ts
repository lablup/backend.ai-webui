/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { applyRouteDocumentTitle, formatDocumentTitle } from './documentTitle';

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
});
