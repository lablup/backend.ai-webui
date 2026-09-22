/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import PurgeUsersModal from './PurgeUsersModal';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * FR-3990: the two "also delete" options are per-purge choices, so reopening
 * the modal must not carry the previous user's answers over. `t` is
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

const Harness: React.FC<{ open: boolean }> = ({ open }) => {
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
  return (
    <PurgeUsersModal
      usersFrgmt={data.adminUsersV2.edges.map((edge: any) => edge.node)}
      open={open}
    />
  );
};

const renderModal = () => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation),
  );
  const { rerender } = render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness open />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  return {
    reopen: async () => {
      rerender(
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={null}>
            <Harness open={false} />
          </Suspense>
        </RelayEnvironmentProvider>,
      );
      rerender(
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback={null}>
            <Harness open />
          </Suspense>
        </RelayEnvironmentProvider>,
      );
    },
  };
};

const optionCheckboxes = () => [
  screen.getByRole('checkbox', {
    name: 'credential.DeleteSharedVirtualFolders',
  }),
  screen.getByRole('checkbox', { name: 'credential.DeleteDeploymentsAsWell' }),
];

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
