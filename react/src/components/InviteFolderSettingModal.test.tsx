/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { InviteFolderSettingModalTestQuery } from '../__generated__/InviteFolderSettingModalTestQuery.graphql';
import InviteFolderSettingModal from './InviteFolderSettingModal';
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
import type { MockResolverContext } from 'relay-test-utils/lib/RelayMockPayloadGenerator';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * #10295: the share modal lists the folder's entity shares with each
 * accepted user's mount level, invites one recipient at a time, and offers an
 * e-mail invite as an entity share capped at the folder's shared mount
 * permission, with no mount policy of its own.
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
const USER3_ID = '4f13d193-f646-425a-a340-270c4d2b9860';
const ACCEPTED_SHARE_ID = '01a12f7d-182a-70cc-9a19-78f0fd6f01a4';
const PENDING_SHARE_ID = '01a12f7e-0644-75be-8e76-b2ab727ce7ac';
const PENDING_USER_SHARE_ID = '01a12f7f-3c1e-7a4b-9d02-5e6f7a8b9c0d';

const RESOLVERS = {
  VFolder: () => ({
    id: VFOLDER_GLOBAL_ID,
    accessControl: { permission: 'READ_ONLY', ownershipType: 'USER' },
  }),
  EntityShareConnection: () => ({
    edges: [
      {
        // An accepted share names its user and carries the address.
        node: {
          id: 'EntityShare:accepted',
          entityId: ACCEPTED_SHARE_ID,
          recipientEntityType: 'user',
          recipientEntityId: USER2_ID,
          recipientEmail: 'user2@example.com',
          permissions: ['READ'],
          status: 'ACCEPTED',
        },
      },
      {
        // An e-mail invite: no user until it is accepted.
        node: {
          id: 'EntityShare:pending',
          entityId: PENDING_SHARE_ID,
          recipientEntityType: null,
          recipientEntityId: null,
          recipientEmail: 'nobody@example.com',
          permissions: ['READ', 'UPDATE', 'SOFT_DELETE'],
          status: 'PENDING',
        },
      },
      {
        // A user-id invite: no address until it is accepted.
        node: {
          id: 'EntityShare:pending-user',
          entityId: PENDING_USER_SHARE_ID,
          recipientEntityType: 'user',
          recipientEntityId: USER3_ID,
          recipientEmail: null,
          permissions: ['READ'],
          status: 'PENDING',
        },
      },
      {
        node: {
          id: 'EntityShare:revoked',
          entityId: 'revoked-share',
          recipientEntityType: null,
          recipientEntityId: null,
          recipientEmail: 'old@example.com',
          permissions: ['READ'],
          status: 'REVOKED',
        },
      },
    ],
  }),
  VFolderMountPoliciesPayload: () => ({
    items: [{ id: 'policy-1', userId: USER2_ID, permission: 'READ_WRITE' }],
  }),
  // The recipients query asks for the unnamed users by id; the select's
  // search queries get an empty page.
  UserV2Connection: (context: MockResolverContext) => ({
    edges: (
      (context.args?.filter as { uuid?: { in?: Array<string> } } | undefined)
        ?.uuid?.in ?? []
    ).includes(USER3_ID)
      ? [
          {
            node: {
              id: btoa(`UserV2:${USER3_ID}`),
              entityId: USER3_ID,
              basicInfo: { email: 'user3@example.com' },
            },
          },
        ]
      : [],
  }),
};

const Harness: React.FC<{ onRequestClose?: () => void }> = ({
  onRequestClose = () => {},
}) => {
  const data = useLazyLoadQuery<InviteFolderSettingModalTestQuery>(
    graphql`
      query InviteFolderSettingModalTestQuery($vfolderId: UUID!) {
        vfolderV2(vfolderId: $vfolderId) {
          ...InviteFolderSettingModalFragment
        }
      }
    `,
    { vfolderId: VFOLDER_ID },
  );
  return (
    <InviteFolderSettingModal
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
  // The harness query first, then the modal body's own query, then the
  // recipients query it issues for the user-id share.
  await resolvePendingQueries(environment);
  await resolvePendingQueries(environment);
  await resolvePendingQueries(environment);
  await screen.findByText('user2@example.com');
  return environment;
};

describe('InviteFolderSettingModal (#10295)', () => {
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
    expect(screen.getAllByText('data.invitation.Pending')).toHaveLength(2);
    // The accepted row reads its level from the mount policy, not from the
    // share's cap (`[READ]`) or the folder default; the invite row above the
    // table still shows the default.
    expect(
      screen.getAllByText('data.ReadWrite').some((el) => el.closest('tr')),
    ).toBe(true);
    // A pending row shows the level its cap encodes.
    expect(
      screen.getByText('nobody@example.com').closest('tr'),
    ).toHaveTextContent('data.ReadWrite');
    // A share sent to a user id has no address of its own; it comes from
    // the recipients query.
    expect(
      screen.getByText('user3@example.com').closest('tr'),
    ).toHaveTextContent('data.ReadOnly');
  });

  it('offers an e-mail invite as an entity share capped at the folder shared mount permission', async () => {
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
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalCreateShareMutation',
      ),
    );
    const variables = await resolveMutation(
      environment,
      'InviteFolderSettingModalCreateShareMutation',
    );
    expect(variables.input).toEqual({
      targetEntityType: 'vfolder',
      targetEntityId: VFOLDER_ID,
      recipient: { email: 'nobody2@example.com' },
      permissions: ['READ'],
    });
    expect(operationNames(environment)).not.toContain(
      'InviteFolderSettingModalSetMountPolicyMutation',
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
        'InviteFolderSettingModalRevokeShareMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalRevokeShareMutation',
      ),
    ).toEqual({ id: ACCEPTED_SHARE_ID });
    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalUnsetMountPolicyMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalUnsetMountPolicyMutation',
      ),
    ).toEqual({ vfolderId: VFOLDER_ID, input: { userId: USER2_ID } });
  });

  it('cancels a pending invitation', async () => {
    const user = userEvent.setup();
    const environment = await renderModal();

    await user.click(
      screen.getAllByRole('button', {
        name: 'data.folders.CancelInvitation',
      })[0],
    );
    await user.click(
      await screen.findByRole('button', { name: 'button.Confirm' }),
    );

    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalCancelShareMutation',
      ),
    );
    expect(
      await resolveMutation(
        environment,
        'InviteFolderSettingModalCancelShareMutation',
      ),
    ).toEqual({ id: PENDING_SHARE_ID });
  });
});
