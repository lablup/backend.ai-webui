/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useUnblockUserLogin } from './useUnblockUserLogin';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const messageSuccess = vi.fn();
const messageWarning = vi.fn();
const messageError = vi.fn();

vi.mock('../app-shim', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../app-shim')>();
  return {
    ...originalModule,
    App: {
      useApp: () => ({
        message: {
          success: messageSuccess,
          warning: messageWarning,
          error: messageError,
        },
        modal: {},
      }),
    },
  };
});

let environment: RelayMockEnvironment;

const renderUnblock = () =>
  renderHook(() => useUnblockUserLogin(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <RelayEnvironmentProvider environment={environment}>
        {children}
      </RelayEnvironmentProvider>
    ),
  });

const resolveWith = (data: Record<string, unknown>) => {
  const operation = environment.mock.getMostRecentOperation();
  act(() => {
    environment.mock.resolve(operation, { data });
  });
  return operation.request.variables;
};

beforeEach(() => {
  environment = createMockEnvironment();
  vi.clearAllMocks();
});

describe('useUnblockUserLogin', () => {
  it('clears the block under both the email and a distinct username', async () => {
    const { result } = renderUnblock();
    let done!: Promise<void>;
    act(() => {
      done = result.current({ email: 'a@example.com', username: 'alice' });
    });
    const variables = resolveWith({
      byEmail: { success: true },
      byUsername: { success: true },
    });
    await done;

    expect(variables).toEqual({
      email: 'a@example.com',
      username: 'alice',
      includeUsername: true,
    });
    expect(messageSuccess).toHaveBeenCalledWith('credential.LoginUnblocked');
  });

  it('skips the username alias when it is missing or equals the email', async () => {
    const { result } = renderUnblock();
    let done!: Promise<void>;
    act(() => {
      done = result.current({ email: 'a@example.com', username: null });
    });
    const variables = resolveWith({ byEmail: { success: true } });
    await done;

    expect(variables.includeUsername).toBe(false);
    expect(messageSuccess).toHaveBeenCalledTimes(1);
  });

  it('reports success:false as not unblocked', async () => {
    const { result } = renderUnblock();
    let done!: Promise<void>;
    act(() => {
      done = result.current({ email: 'a@example.com', username: 'alice' });
    });
    resolveWith({
      byEmail: { success: true },
      byUsername: { success: false },
    });
    await done;

    expect(messageWarning).toHaveBeenCalledWith('credential.LoginNotUnblocked');
    expect(messageSuccess).not.toHaveBeenCalled();
  });
});
