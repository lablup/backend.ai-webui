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

let announcementPromise: Promise<{ enabled: boolean; message: string }>;
let resolveAnnouncement: (value: { enabled: boolean; message: string }) => void;

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      service: { get_announcement: () => announcementPromise },
    }),
  };
});

// Stand-in for the lazily-imported Monaco editor: `onMount` fires only when the
// test calls `mountEditor()`, reproducing the second loading phase.
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

const previewLabel = () => screen.getByText('summary.AnnouncementPreview');
const publishButton = () =>
  screen.getByRole('button', { name: 'button.Publish' });

describe('AnnouncementEditModal (FR-3723)', () => {
  beforeEach(() => {
    announcementPromise = new Promise((res) => {
      resolveAnnouncement = res;
    });
  });

  it('shows only the skeleton until both the announcement and the editor are ready', async () => {
    renderModal();

    // Phase 1 — the announcement request is still in flight. The body is
    // already mounted, so Monaco's chunk loads in parallel with the query, but
    // none of it may be visible yet.
    expect(previewLabel()).not.toBeVisible();
    expect(publishButton()).toBeDisabled();

    // Phase 2 — data resolved, but Monaco has not mounted yet: the body stays
    // hidden behind the Skeleton.
    await act(async () => {
      resolveAnnouncement({ enabled: true, message: 'hello' });
      await announcementPromise;
    });
    await screen.findByTestId('code-editor');
    expect(previewLabel()).not.toBeVisible();
    expect(publishButton()).toBeDisabled();

    // Phase 3 — the editor reported ready.
    act(() => mountEditor());
    expect(previewLabel()).toBeVisible();
    expect(publishButton()).not.toBeDisabled();
  });
});
