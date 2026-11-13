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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const postSSHKeypair = vi.fn();
const fetchSSHKeypair = vi.fn();

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      postSSHKeypair,
      fetchSSHKeypair,
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

const onRequestClose = vi.fn();

const renderModal = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
        })
      }
    >
      <SSHKeypairManagementModal open onRequestClose={onRequestClose} />
    </QueryClientProvider>,
  );

describe('SSHKeypairManagementModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSSHKeypair.mockResolvedValue({ ssh_public_key: 'ssh-rsa EXISTING' });
  });

  it('shows the current public key in an editable field', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByLabelText('userSettings.PublicKey')).toHaveValue(
        'ssh-rsa EXISTING',
      ),
    );
    expect(
      screen.queryByLabelText('userSettings.PrivateKey'),
    ).not.toBeInTheDocument();
  });

  it('saves the edited public key and closes', async () => {
    postSSHKeypair.mockResolvedValue({});
    const user = userEvent.setup();
    renderModal();

    await waitFor(() =>
      expect(screen.getByLabelText('userSettings.PublicKey')).toHaveValue(
        'ssh-rsa EXISTING',
      ),
    );
    await user.clear(screen.getByLabelText('userSettings.PublicKey'));
    await user.type(
      screen.getByLabelText('userSettings.PublicKey'),
      'ssh-ed25519 NEW',
    );
    await user.click(screen.getByRole('button', { name: 'button.Save' }));

    await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
    expect(postSSHKeypair).toHaveBeenCalledWith({ pubkey: 'ssh-ed25519 NEW' });
    expect(messageSuccess).toHaveBeenCalledWith(
      'userSettings.SSHKeypairEnterManuallyFinished',
    );
  });

  it('keeps the modal open and shows the error when the save is rejected', async () => {
    postSSHKeypair.mockRejectedValue({
      statusCode: 400,
      title: '400 Bad Request',
      message: 'server responded failure: 400 Bad Request',
      description: 'The SSH keypair is invalid.',
    });
    const user = userEvent.setup();
    renderModal();

    await waitFor(() =>
      expect(screen.getByLabelText('userSettings.PublicKey')).toHaveValue(
        'ssh-rsa EXISTING',
      ),
    );
    await user.click(screen.getByRole('button', { name: 'button.Save' }));

    await waitFor(() => expect(messageError).toHaveBeenCalledTimes(1));
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
