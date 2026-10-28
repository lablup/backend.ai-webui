import { readReviewEnv } from './DevReviewRouteLabel';
import { afterEach, describe, expect, it } from 'vitest';

type Globals = {
  backendaiclient?: unknown;
  packageVersion?: string;
};
const globals = globalThis as unknown as Globals;

afterEach(() => {
  delete globals.backendaiclient;
  delete globals.packageVersion;
});

describe('readReviewEnv', () => {
  it('says nothing before the app has a version or a client', () => {
    expect(readReviewEnv()).toBeUndefined();
  });

  it('names the build alone while nobody is logged in', () => {
    globals.packageVersion = '26.9.0';

    expect(readReviewEnv()).toEqual({ webui: '26.9.0' });
  });

  it('reads build, manager, endpoint and account off the live client', () => {
    globals.packageVersion = '26.9.0';
    globals.backendaiclient = {
      managerVersion: '25.14.2',
      _config: { endpoint: 'https://api.example.com' },
      email: 'reviewer@example.com',
      is_admin: true,
      is_superadmin: true,
    };

    expect(readReviewEnv()).toEqual({
      webui: '26.9.0',
      manager: '25.14.2',
      endpoint: 'https://api.example.com',
      account: 'reviewer@example.com (superadmin)',
    });
  });

  it('ranks the role superadmin › admin › user', () => {
    globals.backendaiclient = {
      email: 'a@example.com',
      is_admin: true,
      is_superadmin: false,
    };
    expect(readReviewEnv()?.account).toBe('a@example.com (admin)');

    globals.backendaiclient = { email: 'u@example.com' };
    expect(readReviewEnv()?.account).toBe('u@example.com (user)');
  });

  it('leaves out what the client has not answered yet', () => {
    globals.backendaiclient = { managerVersion: null, email: '' };

    expect(readReviewEnv()).toEqual({
      webui: undefined,
      manager: undefined,
      endpoint: undefined,
      account: undefined,
    });
  });
});
