/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { InviteFolderSettingModalTestQuery } from '../__generated__/InviteFolderSettingModalTestQuery.graphql';
import { BAIAppProvider } from '../app-shim';
import InviteFolderSettingModal from './InviteFolderSettingModal';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
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
 * accepted user's mount level, invites one recipient at a time, and offers an
 * e-mail invite as an entity share capped at the folder's shared mount
 * permission, with no mount policy of its own.
 * #10329: the cap is the bits the share permission selector picks, and each
 * listed share shows its own cap in a selector that restates the share.
 * #10647: the folder's default mount permission sits in a Folder Info section
 * above the invite form and is edited in its own modal.
 * `t` is identity-mapped (for BUI's `useBAIi18n` too), so the assertions read
 * as i18n keys.
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

vi.mock('../hooks/useCurrentUserProjectRoles', () => ({
  useCurrentUserProjectRoles: () => ({
    isSuperAdmin: false,
    domainAdminDomains: [],
    projectAdminIds: [],
  }),
}));

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
    metadata: { name: 'team-datasets', usageMode: 'GENERAL' },
    accessControl: { permission: 'READ_ONLY', ownershipType: 'USER' },
    // The current user owns the folder, so the settings card offers Edit.
    ownership: { userId: 'owner-uuid', projectId: null },
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
          recipientEntity: {
            __typename: 'UserV2',
            id: btoa(`UserV2:${USER2_ID}`),
            entityId: USER2_ID,
            basicInfo: { email: 'user2@example.com' },
          },
          permissions: ['READ'],
          status: 'ACCEPTED',
        },
      },
      {
        // An e-mail invite to an address without an account: no user node.
        node: {
          id: 'EntityShare:pending',
          entityId: PENDING_SHARE_ID,
          recipientEntityType: null,
          recipientEntityId: null,
          recipientEmail: 'nobody@example.com',
          recipientEntity: null,
          permissions: ['READ', 'UPDATE', 'SOFT_DELETE'],
          status: 'PENDING',
        },
      },
      {
        // A user-id invite: no address until it is accepted; the recipient
        // node names the person.
        node: {
          id: 'EntityShare:pending-user',
          entityId: PENDING_USER_SHARE_ID,
          recipientEntityType: 'user',
          recipientEntityId: USER3_ID,
          recipientEmail: null,
          recipientEntity: {
            __typename: 'UserV2',
            id: btoa(`UserV2:${USER3_ID}`),
            entityId: USER3_ID,
            basicInfo: { email: 'user3@example.com' },
          },
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
          recipientEntity: null,
          permissions: ['READ'],
          status: 'REVOKED',
        },
      },
    ],
  }),
  VFolderMountPoliciesPayload: () => ({
    items: [{ id: 'policy-1', userId: USER2_ID, permission: 'READ_WRITE' }],
  }),
  // The select's search queries get an empty page, so a typed address is
  // offered as an e-mail invite.
  UserV2Connection: () => ({ edges: [] }),
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

const sharePermissionTrigger = () => {
  const root = screen.getByTestId('share-permission-selector');
  return root.tagName === 'BUTTON' ? root : within(root).getByRole('button');
};
// Every selector on the page keeps its menu in the DOM; the open one is the
// one the popover mock marked.
const presetItem = (name: string) => {
  const item = screen
    .getAllByRole('menuitem', { name, ...h })
    .find((el) => el.closest('[popover-open]'));
  expect(item).toBeDefined();
  return item!;
};

// The permission menu opens through the Popover API, which jsdom lacks. The
// mock is installed by the tests that open it and undone after each, as it
// also changes how the row-action confirm popovers answer `hidden` queries.
let restorePopoverMock: (() => void) | null = null;
const installPopoverMock = () => {
  const original = {
    showPopover: HTMLElement.prototype.showPopover,
    hidePopover: HTMLElement.prototype.hidePopover,
    matches: HTMLElement.prototype.matches,
  };
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', { value: 'open' });
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', { value: 'closed' });
    this.dispatchEvent(event);
  });
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    configurable: true,
    value: function (this: HTMLElement, selector: string): boolean {
      if (selector === ':popover-open') {
        return this.hasAttribute('popover-open');
      }
      return original.matches.call(this, selector);
    },
  });
  restorePopoverMock = () => {
    HTMLElement.prototype.showPopover = original.showPopover;
    HTMLElement.prototype.hidePopover = original.hidePopover;
    Object.defineProperty(HTMLElement.prototype, 'matches', {
      configurable: true,
      value: original.matches,
    });
    restorePopoverMock = null;
  };
};

const operationNames = (environment: RelayMockEnvironment) =>
  environment.mock
    .getAllOperations()
    .map((operation) => operation.request.node.params.name);

// The open (pending or accepted) shares the pre-invite check finds for the
// picked recipient; a test that wants the override notice fills it.
let existingShareEdges: Array<{ node: { id: string } }> = [];
const resolversFor = (operation: any) =>
  operation.request.node.params.name ===
  'InviteFolderSettingModalExistingShareQuery'
    ? { EntityShareConnection: () => ({ edges: existingShareEdges }) }
    : RESOLVERS;

// Resolves every pending query with the fixtures; mutations stay pending so
// a test can read their variables first.
const resolvePendingQueries = async (environment: RelayMockEnvironment) => {
  await act(async () => {
    for (const operation of environment.mock.getAllOperations()) {
      if (operation.request.node.params.operationKind === 'query') {
        environment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, resolversFor(operation)),
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
            MockPayloadGenerator.generate(operation, resolversFor(operation)),
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
      {/* Hosts the app-shim `modal.confirm` the override notice opens. */}
      <BAIAppProvider>
        <Suspense fallback={null}>
          <Harness />
        </Suspense>
      </BAIAppProvider>
    </RelayEnvironmentProvider>,
  );
  // The harness query first, then the modal body's own query.
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

  afterEach(() => {
    restorePopoverMock?.();
  });

  it('lists accepted and pending shares with the accepted user mount level', async () => {
    await renderModal();

    expect(screen.getByText('nobody@example.com')).toBeInTheDocument();
    expect(screen.queryByText('old@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('data.invitation.Accepted')).toBeInTheDocument();
    expect(screen.getAllByText('data.invitation.Pending')).toHaveLength(2);
    // The settings card shows the folder and its default mount permission.
    expect(screen.getByText('team-datasets')).toBeInTheDocument();
    expect(screen.getByTestId('default-mount-permission')).toHaveTextContent(
      'data.ReadOnly',
    );
    // The accepted row reads its level from the mount policy, not from the
    // share's cap (`[READ]`) or the folder default.
    expect(
      screen.getAllByText('data.ReadWrite').some((el) => el.closest('tr')),
    ).toBe(true);
    // An e-mail invite has no policy row, so it shows the folder's shared
    // mount permission (READ_ONLY), whatever cap the share carries.
    expect(
      screen.getByText('nobody@example.com').closest('tr'),
    ).toHaveTextContent('data.ReadOnly');
    // A share sent to a user id has no address of its own; the recipient
    // node names the person. Without a policy row it also shows the default.
    expect(
      screen.getByText('user3@example.com').closest('tr'),
    ).toHaveTextContent('data.ReadOnly');
    // Each row shows the cap stored on its share, in the selector's words.
    expect(
      screen.getByText('user2@example.com').closest('tr'),
    ).toHaveTextContent('comp:BAIEntitySharePermissionSelector.ReadOnly');
    expect(
      screen.getByText('nobody@example.com').closest('tr'),
    ).toHaveTextContent('comp:BAIEntitySharePermissionSelector.ReadAndWrite');
  });

  it('starts the share permission from the folder mount level and sends the picked bits', async () => {
    installPopoverMock();
    const user = userEvent.setup();
    const environment = await renderModal();

    // READ_ONLY folder default → the Read only preset.
    expect(sharePermissionTrigger()).toHaveTextContent(
      'comp:BAIEntitySharePermissionSelector.ReadOnly',
    );
    await user.click(sharePermissionTrigger());
    await user.click(
      presetItem('comp:BAIEntitySharePermissionSelector.FullAccess'),
    );
    expect(sharePermissionTrigger()).toHaveTextContent(
      'comp:BAIEntitySharePermissionSelector.FullAccess',
    );

    await user.click(screen.getByText('data.folders.SearchUser'));
    await resolvePendingQueries(environment);
    const searchBox = screen
      .getAllByRole('combobox', h)
      .find((el) => el.tagName === 'INPUT');
    await user.type(searchBox!, 'nobody2@example.com');
    await user.click(
      await findOptionResolvingQueries(environment, /nobody2@example\.com/),
    );
    await user.click(
      screen.getByRole('button', { name: 'data.folders.Invite' }),
    );
    // The pre-invite check for an open share answers first.
    await resolvePendingQueries(environment);

    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'InviteFolderSettingModalCreateShareMutation',
      ),
    );
    const variables = await resolveMutation(
      environment,
      'InviteFolderSettingModalCreateShareMutation',
    );
    expect(variables.input.permissions).toEqual([
      'CREATE',
      'READ',
      'UPDATE',
      'SOFT_DELETE',
      'HARD_DELETE',
    ]);
  });

  it('tells the inviter before an invite restates a share the recipient already holds', async () => {
    installPopoverMock();
    existingShareEdges = [{ node: { id: 'EntityShare:accepted' } }];
    try {
      const user = userEvent.setup();
      const environment = await renderModal();

      await user.click(screen.getByText('data.folders.SearchUser'));
      await resolvePendingQueries(environment);
      const searchBox = screen
        .getAllByRole('combobox', h)
        .find((el) => el.tagName === 'INPUT');
      await user.type(searchBox!, 'user3@example.com');
      await user.click(
        await findOptionResolvingQueries(environment, /user3@example\.com/),
      );
      await user.click(
        screen.getByRole('button', { name: 'data.folders.Invite' }),
      );
      await resolvePendingQueries(environment);

      // The check found an open share: the notice shows and nothing is sent
      // until the inviter agrees.
      expect(
        await screen.findByText('data.folders.ShareAlreadyExists'),
      ).toBeInTheDocument();
      expect(operationNames(environment)).not.toContain(
        'InviteFolderSettingModalCreateShareMutation',
      );
      await user.click(
        screen.getByRole('button', { name: 'button.Overwrite' }),
      );

      await waitFor(() =>
        expect(operationNames(environment)).toContain(
          'InviteFolderSettingModalCreateShareMutation',
        ),
      );
    } finally {
      existingShareEdges = [];
    }
  });

  it('restates an accepted share with the picked cap, naming the recipient as the share does', async () => {
    installPopoverMock();
    const user = userEvent.setup();
    const environment = await renderModal();

    const cells = screen.getAllByTestId('share-permission-cap');
    expect(cells).toHaveLength(3);
    const acceptedCell = cells.find((cell) =>
      cell.closest('tr')?.textContent?.includes('user2@example.com'),
    );
    expect(acceptedCell).toHaveTextContent(
      'comp:BAIEntitySharePermissionSelector.ReadOnly',
    );
    await user.click(acceptedCell!);
    await user.click(
      presetItem('comp:BAIEntitySharePermissionSelector.ReadAndWrite'),
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
      recipient: { userId: USER2_ID },
      permissions: ['READ', 'UPDATE', 'SOFT_DELETE'],
    });
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
    // The pre-invite check for an open share answers first.
    await resolvePendingQueries(environment);

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

  it('edits the folder default mount permission from the Folder Info section (#10647)', async () => {
    installPopoverMock();
    const user = userEvent.setup();
    const environment = await renderModal();

    await user.click(screen.getByTestId('edit-default-mount-permission'));
    const editTitle = await screen.findByText(
      'data.folders.EditDefaultMountPermission',
    );
    const editModal = editTitle.closest('[role="dialog"]') as HTMLElement;
    expect(editModal).not.toBeNull();
    // Unchanged value: Save stays disabled until another level is picked.
    const saveButton = within(editModal).getByRole('button', {
      name: 'button.Save',
    });
    expect(saveButton).toBeDisabled();
    await user.click(
      within(editModal).getByRole('combobox', {
        name: 'data.folders.DefaultMountPermission',
      }),
    );
    await user.click(
      within(editModal).getByRole('option', { name: 'data.ReadWrite', ...h }),
    );
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    // The legacy update-options endpoint still owns the folder permission.
    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: `/folders/${VFOLDER_ID}/update-options`,
        body: { permission: 'rw' },
      }),
    );
    // Then the folder record is re-read, and the card follows the store.
    await waitFor(() =>
      expect(operationNames(environment)).toContain(
        'FolderDefaultMountPermissionModalRefreshQuery',
      ),
    );
    const refresh = environment.mock
      .getAllOperations()
      .find(
        (operation) =>
          operation.request.node.params.name ===
          'FolderDefaultMountPermissionModalRefreshQuery',
      )!;
    await act(async () => {
      environment.mock.resolve(
        refresh,
        MockPayloadGenerator.generate(refresh, {
          ...RESOLVERS,
          VFolder: () => ({
            id: VFOLDER_GLOBAL_ID,
            accessControl: { permission: 'READ_WRITE', ownershipType: 'USER' },
          }),
        }),
      );
    });
    await waitFor(() =>
      expect(screen.getByTestId('default-mount-permission')).toHaveTextContent(
        'data.ReadWrite',
      ),
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
