/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import SSHKeypairManagementModal from './SSHKeypairManagementModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * FR-3054 follow-up: the manual-form modal now closes from the mutation's
 * `onSuccess`, so a non-idempotent close callback would toggle it back open
 * when the user cancels while the request is still in flight.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const postSSHKeypair = vi.fn();
const fetchSSHKeypair = vi.fn().mockResolvedValue({ ssh_public_key: '' });
const refreshSSHKeypair = vi.fn().mockResolvedValue({});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      postSSHKeypair,
      fetchSSHKeypair,
      refreshSSHKeypair,
    }),
  };
});

const messageError = vi.fn();
const messageSuccess = vi.fn();

vi.mock('../app-shim', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../app-shim')>();
  return {
    ...originalModule,
    App: {
      useApp: () => ({
        message: { error: messageError, success: messageSuccess },
        modal: {},
      }),
    },
  };
});

describe('SSHKeypairManagementModal (FR-3054)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the manual form modal closed when the user cancels while the request is in flight', async () => {
    let resolvePost: (value: unknown) => void = () => {};
    postSSHKeypair.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );

    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
        }
      >
        <SSHKeypairManagementModal open onRequestClose={vi.fn()} />
      </QueryClientProvider>,
    );

    await user.click(
      await screen.findByRole('button', { name: 'button.EnterManually' }),
    );
    await screen.findByLabelText('userSettings.PublicKey');

    await user.type(
      screen.getByLabelText('userSettings.PublicKey'),
      'ssh-rsa AAAA',
    );
    await user.type(screen.getByLabelText('userSettings.PrivateKey'), 'key');
    await user.click(screen.getByRole('button', { name: 'button.Save' }));
    await waitFor(() => expect(postSSHKeypair).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() =>
      expect(
        screen.queryByLabelText('userSettings.PublicKey'),
      ).not.toBeInTheDocument(),
    );

    resolvePost({});

    // The late onSuccess must not bring the dismissed modal back.
    await waitFor(() => expect(messageSuccess).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByLabelText('userSettings.PublicKey'),
    ).not.toBeInTheDocument();
  });
});
