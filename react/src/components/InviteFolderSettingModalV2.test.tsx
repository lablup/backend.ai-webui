/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { InviteFolderSettingModalV2TestQuery } from '../__generated__/InviteFolderSettingModalV2TestQuery.graphql';
import InviteFolderSettingModalV2 from './InviteFolderSettingModalV2';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * #10295: the share modal lists the folder's entity shares with each
 * accepted user's mount level, invites one recipient at a time, and sends an
 * e-mail invite with the folder's shared mount permission as `perm`.
 * `t` is identity-mapped, so the assertions read as i18n keys.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}));

vi.mock('../helper', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../helper')>();
  return {
    ...originalModule,
    useBaiSignedRequestWithPromise: () => mockRequest,
  };
});

vi.mock('../hooks/useAccessibleProjects', () => ({
  useAccessibleProjects: () => ({
    groups: [],
    accessibleProjects: [{ id: 'project-1' }],
  }),
}));

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [
      { email: 'owner@example.com', uuid: 'owner-uuid', full_name: 'Owner' },
    ],
  };
});

const VFOLDER_ID = '01a12f7c-4178-7cac-a103-8c55e896cfc4';
const VFOLDER_GLOBAL_ID = btoa(`VFolder:${VFOLDER_ID}`);
const USER2_ID = '009fb1a4-487c-4f6e-9b1b-228b94b1d040';
const ACCEPTED_SHARE_ID = '01a12f7d-182a-70cc-9a19-78f0fd6f01a4';
const PENDING_SHARE_ID = '01a12f7e-0644-75be-8e76-b2ab727ce7ac';

const SHARED_USERS = [
  { perm: 'ro', shared_to: { uuid: USER2_ID, email: 'user2@example.com' } },
];
const SENT_INVITATIONS = [
  {
    id: PENDING_SHARE_ID,
    invitee: 'nobody@example.com',
    perm: 'rw',
    state: 'pending',
    vfolder_id: VFOLDER_ID,
  },
];

vi.mock('../hooks/reactQueryAlias', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/reactQueryAlias')>();
  return {
    ...originalModule,
    useTanQuery: ({ queryKey }: { queryKey: Array<unknown> }) => ({
      data:
        queryKey[0] === 'baiClient.vfolder.list_sent_invitations'
          ? SENT_INVITATIONS
          : SHARED_USERS,
      isFetching: false,
    }),
  };
});

const RESOLVERS = {
  VFolder: () => ({
    id: VFOLDER_GLOBAL_ID,
    accessControl: { permission: 'READ_ONLY', ownershipType: 'USER' },
  }),
  EntityShareConnection: () => ({
    edges: [
      {
        node: {
          id: 'EntityShare:accepted',
          entityId: ACCEPTED_SHARE_ID,
          recipientEmail: 'user2@example.com',
          status: 'ACCEPTED',
        },
      },
      {
        node: {
          id: 'EntityShare:pending',
          entityId: PENDING_SHARE_ID,
          recipientEmail: 'nobody@example.com',
          status: 'PENDING',
        },
      },
      {
        node: {
          id: 'EntityShare:revoked',
          entityId: 'revoked-share',
          recipientEmail: 'old@example.com',
          status: 'REVOKED',
        },
      },
    ],
  }),
  VFolderMountPoliciesPayload: () => ({
    items: [{ id: 'policy-1', userId: USER2_ID, permission: 'READ_WRITE' }],
  }),
  UserV2Connection: () => ({ edges: [] }),
};

const Harness: React.FC<{ onRequestClose?: () => void }> = ({
  onRequestClose = () => {},
}) => {
  const data = useLazyLoadQuery<InviteFolderSettingModalV2TestQuery>(
    graphql`
      query InviteFolderSettingModalV2TestQuery($vfolderId: UUID!) {
        vfolderV2(vfolderId: $vfolderId) {
          ...InviteFolderSettingModalV2Fragment
        }
      }
    `,
    { vfolderId: VFOLDER_ID },
  );
  return (
    <InviteFolderSettingModalV2
      vfolderFrgmt={data.vfolderV2 ?? null}
      open
      onRequestClose={onRequestClose}
    />
  );
};

const h = { hidden: true } as const;

const operationNames = (environment: RelayMockEnvironment) =>
  environment.mock
    .getAllOperations()
    .map((operation) => operation.request.node.params.name);

// Resolves every pending query with the fixtures; mutations stay pending so
// a test can read their variables first.
const resolvePendingQueries = async (environment: RelayMockEnvironment) => {
  await act(async () => {
    for (const operation of environment.mock.getAllOperations()) {
      if (operation.request.node.params.operationKind === 'query') {
        environment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, RESOLVERS),
        );
      }
    }
  });
};

const resolveMutation = async (
  environment: RelayMockEnvironment,
  name: string,
) => {
  const operation = environment.mock
    .getAllOperations()
    .find((candidate) => candidate.request.node.params.name === name);
  expect(operation).toBeDefined();
  await act(async () => {
    environment.mock.resolve(
      operation!,
      MockPayloadGenerator.generate(operation!, RESOLVERS),
    );
  });
  return operation!.request.variables;
};

// The select suspends on each (debounced) search query, so keep resolving
// pending queries until the option row we want is on screen.
const findOptionResolvingQueries = (
  environment: RelayMockEnvironment,
  name: RegExp,
) =>
  waitFor(
    () => {
      for (const operation of environment.mock.getAllOperations()) {
        if (operation.request.node.params.operationKind === 'query') {
          environment.mock.resolve(
            operation,
            MockPayloadGenerator.generate(operation, RESOLVERS),
          );
        }
      }
      return screen.getByRole('option', { name, ...h });
    },
    { timeout: 3000 },
  );

const renderModal = async () => {
  const environment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  // The harness query first, then the modal body's own query.
  await resolvePendingQueries(environment);
  await resolvePendingQueries(environment);
  await screen.findByText('user2@example.com');
  return environment;
};

describe('InviteFolderSettingModalV2 (#10295)', () => {
  beforeAll(() => {
    // jsdom has no scrollIntoView; the select scrolls its highlighted row.
    Element.prototype.scrollIntoView = vi.fn();
    // jsdom reports 0px widths, which would fold every name-cell action into
    // the overflow menu; give the cells room so the buttons stay visible.
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800,
    });
  });

  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({ invited_ids: ['nobody2@example.com'] });
  });

  it('lists accepted and pending shares with the accepted user mount level', async () => {
    await renderModal();

    expect(screen.getByText('nobody@example.com')).toBeInTheDocument();
    expect(screen.queryByText('old@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('data.invitation.Accepted')).toBeInTheDocument();
    expect(screen.getByText('data.invitation.Pending')).toBeInTheDocument();
    // The accepted row reads its level from the mount policy, not from the
    // legacy perm (`ro`) or the folder default; the invite row above the
    // table still shows the default.
    expect(
      screen.getAllByText('data.ReadWrite').some((el) => el.closest('tr')),
    ).toBe(true);
    // A pending row shows the level the invitee is set to get, read from the
    // caller's sent invitations.
    expect(
      screen.getByText('nobody@example.com').closest('tr'),
    ).toHaveTextContent('data.ReadWrite');
  });

  it('sends an e-mail invite with the folder shared mount permission as perm', async () => {
    const user = userEvent.setup();
    const environment = await renderModal();

    await user.click(screen.getByText('data.folders.SearchUser'));
    await resolvePendingQueries(environment);
    // The mount-level Selector is a combobox too; the search box is the input.
    const searchBox = screen
      .getAllByRole('combobox', h)
      .find((el) => el.tagName === 'INPUT');
    expect(searchBox).toBeDefined();
    await user.type(searchBox!, 'nobody2@example.com');
    await user.click(
      await findOptionResolvingQueries(environment, /nobody2@example\.com/),
    );
    expect(
      await screen.findByText(
        'data.folders.EmailInviteUsesSharedMountPermission',
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'data.folders.Invite' }),
    );

    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: `/folders/${VFOLDER_ID}/invite`,
        body: { user_ids: ['nobody2@example.com'], perm: 'ro' },
      }),
    );
    expect(operationNames(environment)).not.toContain(
      'InviteFolderSettingModalV2SetMountPolicyMutation',
    );
  });

  it('revokes an accepted share and drops its mount policy', async () => {
    const user = userEvent.setup();
    const environment = await renderModal();

    await user.click(
      screen.getByRole('button', { name: 'data.folders.KickOut' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'button.Confirm' }),
    );

    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalV2RevokeShareMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalV2RevokeShareMutation',
      ),
    ).toEqual({ id: ACCEPTED_SHARE_ID });
    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalV2UnsetMountPolicyMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalV2UnsetMountPolicyMutation',
      ),
    ).toEqual({ vfolderId: VFOLDER_ID, input: { userId: USER2_ID } });
  });

  it('cancels a pending invitation', async () => {
    const user = userEvent.setup();
    const environment = await renderModal();

    await user.click(
      screen.getByRole('button', { name: 'data.folders.CancelInvitation' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'button.Confirm' }),
    );

    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalV2CancelShareMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalV2CancelShareMutation',
      ),
    ).toEqual({ id: PENDING_SHARE_ID });
  });
});
