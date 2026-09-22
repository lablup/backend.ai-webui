/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import PurgeUsersModal from './PurgeUsersModal';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { Suspense, useState } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * FR-3990: the two "also delete" options are per-purge choices, so reopening
 * the modal must not carry the previous user's answers over. The reset is
 * `BAIUnmountAfterClose` dropping the modal after close (FR-4061), so every
 * harness renders through it, as AdminUserManagement does. `t` is
 * identity-mapped, so the assertions read as i18n keys.
 */

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({ supports: () => true }),
  };
});

const useUsers = () => {
  const data = useLazyLoadQuery<any>(
    graphql`
      query PurgeUsersModalTestQuery {
        adminUsersV2(limit: 1) {
          edges {
            node {
              ...PurgeUsersModalFragment
            }
          }
        }
      }
    `,
    {},
  );
  return data.adminUsersV2.edges.map((edge: any) => edge.node);
};

const Harness: React.FC<{ open: boolean; afterClose?: () => void }> = ({
  open,
  afterClose,
}) => (
  <BAIUnmountAfterClose>
    <PurgeUsersModal
      usersFrgmt={useUsers()}
      open={open}
      afterClose={afterClose}
    />
  </BAIUnmountAfterClose>
);

// Closes itself on OK / cancel, as AdminUserManagement does.
const SelfClosingHarness: React.FC<{ afterClose: () => void }> = ({
  afterClose,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <BAIUnmountAfterClose>
      <PurgeUsersModal
        usersFrgmt={useUsers()}
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        afterClose={afterClose}
      />
    </BAIUnmountAfterClose>
  );
};

const renderModal = (afterClose?: () => void) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation),
  );
  const ui = (open: boolean) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness open={open} afterClose={afterClose} />
      </Suspense>
    </RelayEnvironmentProvider>
  );
  const { rerender } = render(ui(true));
  return {
    close: () => rerender(ui(false)),
    reopen: async () => {
      rerender(ui(false));
      rerender(ui(true));
    },
  };
};

const optionCheckboxes = () => [
  screen.getByRole('checkbox', {
    name: 'credential.DeleteSharedVirtualFolders',
  }),
  screen.getByRole('checkbox', { name: 'credential.DeleteDeploymentsAsWell' }),
];

describe('PurgeUsersModal (FR-3990 / FR-4061)', () => {
  it('starts both purge options unchecked again on every open', async () => {
    const user = userEvent.setup();
    const { reopen } = renderModal();

    for (const checkbox of optionCheckboxes()) {
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    }

    await reopen();

    for (const checkbox of optionCheckboxes()) {
      expect(checkbox).not.toBeChecked();
    }
  });

  // `BAIUnmountAfterClose` injects `afterClose` and unmounts on it; a modal
  // that swallowed the prop stayed mounted, which is how the leak above began.
  it('forwards afterClose to the confirm modal', () => {
    const afterClose = vi.fn();
    const { close } = renderModal(afterClose);
    optionCheckboxes();
    expect(afterClose).not.toHaveBeenCalled();
    close();
    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it('holds afterClose until a partial-failure report is dismissed', async () => {
    const user = userEvent.setup();
    const afterClose = vi.fn();
    const environment = createMockEnvironment();
    // `toLocalId` decodes the global id, so it has to be a real one.
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        UserV2: () => ({ id: btoa('UserV2:u1') }),
      }),
    );
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>
          <SelfClosingHarness afterClose={afterClose} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );

    await user.type(
      screen.getByRole('textbox'),
      'credential.PermanentlyDelete',
    );
    await user.click(
      screen.getByRole('button', { name: 'credential.PermanentlyDelete' }),
    );
    // One user purged, one refused: the confirm closes and the report opens.
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          BulkPurgeUsersV2Payload: () => ({
            successes: ['u1'],
            purgedCount: 1,
            failed: [{ userId: 'u2', message: 'boom' }],
          }),
        }),
      );
    });

    expect(await screen.findByText('boom')).toBeInTheDocument();
    expect(afterClose).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('boom')).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
  });
});
