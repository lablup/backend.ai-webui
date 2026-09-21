/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { PurgeUsersModalTestQuery } from '../__generated__/PurgeUsersModalTestQuery.graphql';
import PurgeUsersModal from './PurgeUsersModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

// `t` is identity-mapped, so the assertions read as i18n keys.
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

const Harness: React.FC<{
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}> = ({ open, onOk, onCancel }) => {
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
  const usersFrgmt = (data.adminUsersV2?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is NonNullable<typeof node> => node != null);

  return (
    <PurgeUsersModal
      open={open}
      usersFrgmt={usersFrgmt}
      onOk={onOk}
      onCancel={onCancel}
    />
  );
};

const USER_GLOBAL_ID = btoa('UserV2:00000000-0000-0000-0000-000000000001');

const renderModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
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
  const tree = (open: boolean) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness open={open} onOk={onOk} onCancel={onCancel} />
      </Suspense>
    </RelayEnvironmentProvider>
  );
  const { rerender } = render(tree(true));
  return {
    environment,
    onOk,
    onCancel,
    reopen: async () => {
      rerender(tree(false));
      rerender(tree(true));
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

// FR-3990: the two "also delete" options are per-purge choices, so reopening
// the modal must not carry the previous user's answers over.
describe('PurgeUsersModal (FR-3990)', () => {
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
