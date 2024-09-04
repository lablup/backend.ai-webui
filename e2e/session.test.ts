import { createSession, deleteSession, loginAsUser } from './test-util';
import { test, expect } from '@playwright/test';

test.describe('Sessions ', () => {
  const sessionName = 'e2e-test-session';
  test('User can create session in NEO', async ({ page }) => {
    await loginAsUser(page);
    await createSession(page, sessionName);
    await deleteSession(page, sessionName);
  });
});
