/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { PurgeUsersModalTestQuery } from '../__generated__/PurgeUsersModalTestQuery.graphql';
import PurgeUsersModal from './PurgeUsersModal';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
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

// Controllable per-test so both the 26.9.0+ (`successes`) and the
// deprecated (`purgedCount`) manager paths can be exercised.
const { getSupportsPerIdResults, setSupportsPerIdResults } = vi.hoisted(() => {
  let supportsPerIdResults = true;
  return {
    getSupportsPerIdResults: () => supportsPerIdResults,
    setSupportsPerIdResults: (value: boolean) => {
      supportsPerIdResults = value;
    },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: () => getSupportsPerIdResults(),
    }),
  };
});

const useUsers = () => {
  const data = useLazyLoadQuery<PurgeUsersModalTestQuery>(
    graphql`
      query PurgeUsersModalTestQuery {
        adminUsersV2(limit: 1) {
          edges {
            node {
              id
              ...PurgeUsersModalFragment
            }
          }
        }
      }
    `,
    {},
  );
  return (data.adminUsersV2?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is NonNullable<typeof node> => node != null);
};

const Harness: React.FC<{
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  afterClose?: () => void;
}> = ({ open, onOk, onCancel, afterClose }) => (
  <BAIUnmountAfterClose>
    <PurgeUsersModal
      usersFrgmt={useUsers()}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={afterClose}
    />
  </BAIUnmountAfterClose>
);

// Closes itself on OK / cancel, as AdminUserManagement does.
const SelfClosingHarness: React.FC<{
  afterClose: () => void;
  onOk?: () => void;
}> = ({ afterClose, onOk }) => {
  const [open, setOpen] = useState(true);
  return (
    <BAIUnmountAfterClose>
      <PurgeUsersModal
        usersFrgmt={useUsers()}
        open={open}
        onOk={() => {
          onOk?.();
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        afterClose={afterClose}
      />
    </BAIUnmountAfterClose>
  );
};

// `toLocalId` decodes the global id, so it has to be a real one.
const USER_GLOBAL_ID = btoa('UserV2:00000000-0000-0000-0000-000000000001');

const renderModal = (afterClose?: () => void) => {
  const environment = createMockEnvironment();
  const onOk = vi.fn();
  const onCancel = vi.fn();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      UserV2: () => ({
        id: USER_GLOBAL_ID,
        basicInfo: { email: 'purge-target@example.com' },
      }),
    }),
  );
  const ui = (open: boolean) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness
          open={open}
          onOk={onOk}
          onCancel={onCancel}
          afterClose={afterClose}
        />
      </Suspense>
    </RelayEnvironmentProvider>
  );
  const { rerender } = render(ui(true));
  return {
    environment,
    onOk,
    onCancel,
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

const confirmAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  const input = await screen.findByRole('textbox');
  await user.type(input, 'credential.PermanentlyDelete');
  const okButton = screen.getByRole('button', {
    name: 'credential.PermanentlyDelete',
  });
  await waitFor(() => expect(okButton).toBeEnabled());
  await user.click(okButton);
};

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

  it('keeps the confirm open under a partial-failure report and closes on dismissal', async () => {
    const user = userEvent.setup();
    const afterClose = vi.fn();
    const onOk = vi.fn();
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        UserV2: () => ({ id: btoa('UserV2:u1') }),
      }),
    );
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>
          <SelfClosingHarness afterClose={afterClose} onOk={onOk} />
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
    // One user purged, one refused: the report opens over the still-open confirm.
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
    expect(onOk).not.toHaveBeenCalled();
    expect(afterClose).not.toHaveBeenCalled();
    optionCheckboxes();

    // Escape dismisses the topmost dialog only: the report closes, `onOk`
    // closes the confirm, and the wrapper drops the whole component.
    await user.keyboard('{Escape}');
    expect(screen.queryByText('boom')).toBeNull();
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('checkbox', {
        name: 'credential.DeleteSharedVirtualFolders',
      }),
    ).toBeNull();
  });
});

// FR-4008: `successes` + `failed` are documented to answer for every
// requested user exactly once, so an empty `failed` list with a zero count is
// evidence of success, not failure — the modal must still close.
describe('PurgeUsersModal (FR-4008)', () => {
  it('calls onOk when the mutation reports no successes and no failures', async () => {
    setSupportsPerIdResults(true);
    const user = userEvent.setup();
    const { environment, onOk } = renderModal();

    await confirmAndSubmit(user);

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        BulkPurgeUsersV2Payload: () => ({
          successes: [],
          purgedCount: 0,
          failed: [],
        }),
      }),
    );

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
  });

  it('calls onOk on a deprecated manager reporting purgedCount 0 and no failures', async () => {
    setSupportsPerIdResults(false);
    const user = userEvent.setup();
    const { environment, onOk } = renderModal();

    await confirmAndSubmit(user);

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        BulkPurgeUsersV2Payload: () => ({
          purgedCount: 0,
          failed: [],
        }),
      }),
    );

    await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
  });
});
