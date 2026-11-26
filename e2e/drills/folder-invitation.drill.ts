/**
 * The worked example for Drill: a scenario that needs a mutation and a second
 * account — share a folder with `E2E_USER2_*` and check the invitation is
 * listed and accepted. Everything it creates is named after this run and
 * removed in teardown, so the same drill can run again with no manual cleanup.
 *
 * This is the live-data case the mock-first rule allows: the invitation and its
 * acceptance are what the drill verifies, so the folder is real; nothing else
 * is created. A drill that only reads state answers it from `ctx.mockGraphQL`
 * instead (see README, "Data: mock first").
 */
import { purgeVFoldersByNameViaApi } from '../utils/admin-api';
import {
  acceptAllInvitationAndVerifySpecificFolder,
  createVFolderAndVerify,
  personalDataPath,
  shareVFolderAndVerify,
  userInfo,
  verifyVFolder,
} from '../utils/test-util';
import type { Drill } from './types';

const FOLDER_PREFIX = 'e2e-drill-folder-invitation';

/** Set by `setup`; the steps of this one drill read it. */
let folderName = '';
/** The owner's personal Data page, where the folder is a user folder. */
let ownerDataPath = '';

export const folderInvitationDrill: Drill = {
  id: 'folder-invitation',
  title: 'Share a folder with a second account and accept the invitation',
  group: 'vfolders',
  order: 10,
  prerequisites: [
    'A WebUI server is already running and reachable at E2E_WEBUI_ENDPOINT (no local cluster is booted).',
    'The E2E_USER_* account (folder owner) and the E2E_USER2_* account (invitee) both sign in as ordinary users.',
    'The manager supports entity shares: the Share dialog creates the share with createEntityShare and the invitee lists it under Invited Folders.',
    'Nothing else owns the e2e-drill-folder-invitation-* name on the server when the drill starts.',
  ],
  setup: async (ctx) => {
    // One unique folder per run: the repeatability requirement needs a name
    // that belongs to this run alone, and `e2e-` lets a sweep find leftovers.
    folderName = ctx.resources.name('vFolder', FOLDER_PREFIX);
    return `run folder: ${folderName}`;
  },
  steps: [
    {
      id: 'create-folder',
      title: 'Create the folder as the owner',
      changed:
        "The Create Folder dialog closes and a new row appears in the Active tab of the owner's personal-project Data page, named after this run.",
      verify:
        'The row is visible in Active, the owner is the signed-in account, and the name starts with e2e-drill-folder-invitation- so cleanup can find it.',
      expected: 'The new folder is listed in Active for the owner.',
      code: [
        {
          path: 'react/src/pages/VFolderNodeListPage/VFolderNodeListPage.tsx',
          line: 322,
        },
        { path: 'react/src/components/FolderCreateModal.tsx', line: 393 },
      ],
      run: async (ctx) => {
        ownerDataPath = await personalDataPath(ctx.page);
        await createVFolderAndVerify(
          ctx.page,
          folderName,
          'general',
          ownerDataPath,
        );
        return `Created "${folderName}" and found it in Active.`;
      },
    },
    {
      id: 'invite',
      title: 'Invite the second account from the Share dialog',
      changed:
        'In the Share dialog the invitee is picked from the user search and Invite creates the share; the share list shows it as pending.',
      verify:
        'The dialog accepted the invitee address without an error. The folder now has an open (pending) share for that account.',
      expected: `The invitation to ${userInfo.user2.email} is accepted by the backend.`,
      code: [
        {
          path: 'react/src/components/InviteFolderSettingModal.tsx',
          line: 766,
        },
        {
          path: 'react/src/components/InviteFolderSettingModal.tsx',
          line: 398,
          to: 413,
        },
        { path: 'react/src/components/VFolderNodesV2.tsx', line: 652 },
      ],
      run: async (ctx) => {
        await shareVFolderAndVerify(
          ctx.page,
          folderName,
          userInfo.user2.email,
          ownerDataPath,
        );
        return `createEntityShare for ${userInfo.user2.email} answered without errors.`;
      },
    },
    {
      id: 'accept-invitation',
      title: 'The invitee sees the invitation and accepts it',
      changed:
        'Signed in as the invitee, the Invited Folders dialog lists the folder; accepting it removes the row from the invitation list.',
      verify:
        'The invitation names the folder created in step 1, its From field names the owner, and accepting it answers 2xx.',
      expected: 'The invitation is listed for the invitee and is accepted.',
      code: [
        {
          path: 'react/src/components/FolderInvitationResponseModal.tsx',
          line: 117,
        },
      ],
      run: async (ctx) => {
        const invitee = await ctx.as('user2');
        await acceptAllInvitationAndVerifySpecificFolder(
          invitee,
          folderName,
          userInfo.user.email,
          await personalDataPath(invitee),
        );
        return `Accepted the invitation as ${userInfo.user2.email}.`;
      },
    },
    {
      id: 'invitee-sees-folder',
      title: "The shared folder is in the invitee's Active list",
      changed:
        'Reloading Data as the invitee shows the folder under Active, owned by the other account.',
      verify:
        'The row is present after a full reload — not left over from the invitation dialog — so the permission really reaches the invitee.',
      expected: "The folder is listed in the invitee's Active tab.",
      code: [
        {
          path: 'react/src/pages/VFolderNodeListPage/VFolderNodeListPage.tsx',
          line: 263,
        },
      ],
      run: async (ctx) => {
        const invitee = await ctx.as('user2');
        await verifyVFolder(
          invitee,
          folderName,
          'Active',
          await personalDataPath(invitee),
        );
        return `"${folderName}" is listed in the invitee's Active tab.`;
      },
    },
  ],
  teardown: async ({ resources }) => {
    const folders = [...resources.declared('vFolder')];
    await purgeVFoldersByNameViaApi(folders);
    return folders.length
      ? `purged ${folders.map((name) => `"${name}"`).join(', ')} — the share and invitation go with it`
      : 'no folder was created, nothing to remove';
  },
};
