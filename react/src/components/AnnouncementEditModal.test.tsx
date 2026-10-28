/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/resizeObserver.mock.js';
import AnnouncementEditModal from './AnnouncementEditModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  // BUI's locale module runs `i18n.use(initReactI18next).init()` on import.
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// The announcement lives in the domain app config now (FR-3877) and the content
// suspends on that Relay read. Stubbing the hooks puts the test past that phase:
// what it guards is the SECOND one, where the data is in hand and Monaco's lazy
// chunk is still loading.
vi.mock('../hooks/useAppConfig', () => ({
  useDomainAppConfig: () => ({ enabled: true, title: 'hello', body: 'world' }),
  useUpdateDomainAppConfig: () => async () => undefined,
}));

// Stand-in for the lazily-imported Monaco editor: `onMount` fires only when the
// test calls `mountEditor()`, reproducing that loading phase.
let mountEditor: () => void = () => {};
vi.mock('./BAICodeEditor', async () => {
  const React = await import('react');
  return {
    default: ({ onMount }: { onMount?: (e: unknown, m: unknown) => void }) => {
      mountEditor = () => onMount?.({}, {});
      return React.createElement('div', { 'data-testid': 'code-editor' });
    },
  };
});

const previewLabel = () => screen.getByText('summary.AnnouncementPreview');
// The two-pane row: label -> column -> row. It carries the visibility gate, and
// that gate must not delete BAIFlex's own `display: flex` (which would stack the
// editor and the preview instead of placing them side by side).
const bodyRow = () => previewLabel().parentElement!.parentElement!;
const publishButton = () =>
  screen.getByRole('button', { name: 'button.Publish' });

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AnnouncementEditModal open onRequestClose={vi.fn()} />
    </QueryClientProvider>,
  );
};

describe('AnnouncementEditModal (FR-3723)', () => {
  it('shows only the skeleton until the editor is ready', async () => {
    renderModal();

    // The body is mounted from the first render, so Monaco's chunk loads behind
    // the Skeleton instead of flashing an empty frame — but none of it may be
    // visible, and nothing may be published, until the editor reports ready.
    await screen.findByTestId('code-editor');
    expect(previewLabel()).not.toBeVisible();
    expect(publishButton()).toBeDisabled();

    act(() => mountEditor());
    expect(previewLabel()).toBeVisible();
    expect(publishButton()).not.toBeDisabled();
    // The revealed row must still be a flex container: BAIFlex merges as
    // `{ display: 'flex', ...style }`, so gating with `undefined` would drop it
    // and drop the preview below the editor, out of the modal body.
    expect(bodyRow()).toHaveStyle({ display: 'flex' });
  });
});
