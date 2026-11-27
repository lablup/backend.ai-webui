// Shared by the user picker specs split from
// e2e/project-admin/session/user-select-scope-by-role.spec.ts (FR-4119).
import { test, expect, type Locator, type Page } from '@playwright/test';

export type UserSelectOperation = {
  name: string;
  variables: Record<string, any>;
  response: Record<string, any> | null;
};

/** Records every `BAIScopedUserSelect*` GraphQL operation the page sends. */
export function recordUserSelectOperations(
  page: Page,
): Array<UserSelectOperation> {
  const operations: Array<UserSelectOperation> = [];
  page.on('response', async (response) => {
    const req = response.request();
    if (req.method() !== 'POST' || !req.url().includes('/admin/gql')) return;
    let body: { query?: string; variables?: Record<string, any> } | null;
    try {
      body = req.postDataJSON();
    } catch {
      return;
    }
    const name = body?.query?.match(/query\s+(BAIScopedUserSelect\w+)/)?.[1];
    if (!name) return;
    operations.push({
      name,
      variables: body?.variables ?? {},
      response: await response.json().catch(() => null),
    });
  });
  return operations;
}

/** The global id of a Strawberry node is base64 `Type:<uuid>`. */
export const toRawUUID = (globalId: string) =>
  Buffer.from(globalId, 'base64').toString().split(':')[1];

export async function skipUnlessManager269(page: Page) {
  await page.waitForFunction(
    () => (globalThis as any).backendaiclient?.ready === true,
  );
  // ADR 0012: scopedUsersV2 and UserV2.organization.domainId need 26.9.0a4.
  const supported = await page.evaluate(() =>
    (globalThis as any).backendaiclient.isManagerVersionCompatibleWith(
      '26.9.0a4',
    ),
  );
  test.skip(
    !supported,
    'scopedUsersV2 needs a Backend.AI manager >= 26.9.0a4 (@requires-manager-v26.9)',
  );
}

export const optionOf = (listbox: Locator, email: string) =>
  listbox.getByRole('option', { name: new RegExp(`^${email}`) });

/**
 * Opens the picker labelled `label`, checks the list loaded (exactly
 * `listedEmails` when given), narrows it by typing part of `email`, and
 * picks that user.
 */
export async function searchAndPickUser(
  page: Page,
  trigger: Locator,
  label: string,
  email: string,
  listedEmails?: Array<string>,
) {
  await trigger.click();
  const popup = page.getByRole('dialog', { name: label, exact: true });
  const listbox = popup.getByRole('listbox');
  await expect(listbox.getByRole('option').first()).toBeVisible({
    timeout: 30000,
  });
  if (listedEmails) {
    await expect(listbox.getByRole('option')).toHaveCount(listedEmails.length);
    for (const listed of listedEmails) {
      await expect(optionOf(listbox, listed)).toBeVisible();
    }
  }
  await popup
    .getByRole('combobox', { name: 'Search options' })
    .fill(email.split('@')[0]);
  await expect(listbox.getByRole('option')).toHaveCount(1, { timeout: 15000 });
  await optionOf(listbox, email).click();
}
