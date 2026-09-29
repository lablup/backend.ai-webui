/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import SSHKeypairManualFormModal from './SSHKeypairManualFormModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * FR-3054: a rejected keypair (400 from POST /auth/ssh-keypair) used to close
 * the modal silently, because `mutate()` had no `onError` and the close ran
 * outside the callbacks.
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

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      postSSHKeypair,
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
const onRequestRefresh = vi.fn();

const renderModal = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })}
    >
      <SSHKeypairManualFormModal
        open
        onRequestClose={onRequestClose}
        onRequestRefresh={onRequestRefresh}
      />
    </QueryClientProvider>,
  );

const fillAndSave = async () => {
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText('userSettings.PublicKey'),
    'ssh-rsa AAAA',
  );
  await user.type(
    screen.getByLabelText('userSettings.PrivateKey'),
    'not-a-key',
  );
  await user.click(screen.getByRole('button', { name: 'button.Save' }));
};

describe('SSHKeypairManualFormModal (FR-3054)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('surfaces the manager error and keeps the modal open when the keypair is rejected', async () => {
    postSSHKeypair.mockRejectedValue({
      statusCode: 400,
      title: '400 Bad Request - The SSH private key is invalid.',
      message:
        'server responded failure: 400 Bad Request - The SSH private key is invalid.',
      description: 'The SSH private key is invalid.',
    });

    renderModal();
    await fillAndSave();

    await waitFor(() => expect(messageError).toHaveBeenCalledTimes(1));
    expect(messageError.mock.calls[0][0]).toContain(
      'The SSH private key is invalid.',
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(onRequestRefresh).not.toHaveBeenCalled();
  });

  it('closes and refreshes only after the keypair is accepted', async () => {
    postSSHKeypair.mockResolvedValue({});

    renderModal();
    expect(onRequestClose).not.toHaveBeenCalled();
    await fillAndSave();

    await waitFor(() => expect(onRequestClose).toHaveBeenCalledTimes(1));
    expect(onRequestRefresh).toHaveBeenCalledTimes(1);
    expect(messageSuccess).toHaveBeenCalledWith(
      'userSettings.SSHKeypairEnterManuallyFinished',
    );
    expect(messageError).not.toHaveBeenCalled();
  });
});
