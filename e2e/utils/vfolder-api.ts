import { webServerEndpoint } from './test-util';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * VFolder REST helpers (`/func/folders`) for test scaffolding: preparing
 * folders, shares and trash state the UI flow under test starts from, and
 * cleaning them up without driving the Data page.
 */

/** Logs in via `/server/login`; the caller owns and must `dispose()` it. */
export async function createUserApiContext(
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL: webServerEndpoint });
  const res = await api.post('/server/login', {
    data: { username: email, password },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok() || !body?.authenticated) {
    await api.dispose();
    throw new Error(
      `API login for ${email} failed (status=${res.status()}, authenticated=${String(
        body?.authenticated ?? false,
      )})`,
    );
  }
  return api;
}

/** Creates a user-owned folder on the default host and returns its id. */
export async function createVFolderViaApi(
  api: APIRequestContext,
  name: string,
): Promise<string> {
  const res = await api.post('/func/folders', { data: { name } });
  if (!res.ok()) {
    throw new Error(
      `POST /folders "${name}" returned ${res.status()}: ${(await res.text()).slice(0, 300)}`,
    );
  }
  return (await res.json()).id;
}

export async function moveVFolderToTrashViaApi(
  api: APIRequestContext,
  vfolderId: string,
): Promise<void> {
  const res = await api.delete('/func/folders', {
    data: { vfolder_id: vfolderId },
  });
  if (!res.ok()) {
    throw new Error(
      `DELETE /folders ${vfolderId} returned ${res.status()}: ${(await res.text()).slice(0, 300)}`,
    );
  }
}

/**
 * Invites `email` to the folder (as its owner) and accepts the invitation as
 * the invitee.
 */
export async function shareVFolderViaApi(
  ownerApi: APIRequestContext,
  inviteeApi: APIRequestContext,
  folderName: string,
  email: string,
  perm: 'ro' | 'rw' = 'ro',
): Promise<void> {
  const invite = await ownerApi.post(
    `/func/folders/${encodeURIComponent(folderName)}/invite`,
    {
      data: { perm, emails: [email] },
    },
  );
  if (!invite.ok()) {
    throw new Error(
      `POST /folders/${folderName}/invite returned ${invite.status()}: ${(await invite.text()).slice(0, 300)}`,
    );
  }
  const list = await inviteeApi.get('/func/folders/invitations/list');
  if (!list.ok()) {
    throw new Error(
      `GET /folders/invitations/list returned ${list.status()}: ${(await list.text()).slice(0, 300)}`,
    );
  }
  const invitation = ((await list.json()).invitations ?? []).find(
    (i: { vfolder_name: string }) => i.vfolder_name === folderName,
  );
  if (!invitation) {
    throw new Error(`No invitation for "${folderName}" reached ${email}`);
  }
  const accept = await inviteeApi.post('/func/folders/invitations/accept', {
    data: { inv_id: invitation.id },
  });
  if (!accept.ok()) {
    throw new Error(
      `POST /folders/invitations/accept returned ${accept.status()}: ${(await accept.text()).slice(0, 300)}`,
    );
  }
}

/**
 * Best-effort cleanup: moves the folder to trash (a no-op failure when it is
 * already there) and deletes it from the trash bin. Never throws.
 */
export async function purgeVFolderViaApi(
  api: APIRequestContext,
  vfolderId: string,
): Promise<void> {
  await api
    .delete('/func/folders', { data: { vfolder_id: vfolderId } })
    .catch(() => null);
  const res = await api
    .post('/func/folders/delete-from-trash-bin', {
      data: { vfolder_id: vfolderId },
    })
    .catch(() => null);
  // A 4xx means the folder is already gone or being purged.
  if (res && res.status() >= 500) {
    console.warn(
      `[purgeVFolderViaApi] ${vfolderId}: ${res.status()} ${(await res.text()).slice(0, 200)}`,
    );
  }
}
