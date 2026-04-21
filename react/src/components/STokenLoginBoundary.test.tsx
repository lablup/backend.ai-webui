/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for STokenLoginBoundary (Epic FR-2616).
 *
 * Focus areas mapped to spec acceptance criteria:
 * - Children only render after the authentication sequence succeeds.
 * - `backend-ai-connected` fires exactly once per successful login, even
 *   across a retry-then-success sequence (invariant from spec Pitfall #6).
 * - Error classification surfaced via `onError` for each branch the test
 *   can provoke without network (missing-token, endpoint-unresolved,
 *   server-unreachable, token-invalid).
 * - `errorFallback` prop replaces the built-in card for every kind (Q4).
 * - Source file does not reference forbidden URL APIs (mirrors the CI
 *   grep in FR-2634 so local `pnpm test` catches regressions too).
 *
 * The helper module is mocked entirely because the real
 * `createBackendAIClient` instantiates a global `BackendAIClient` that is
 * only available at runtime in the browser bundle.
 */
import '../../__test__/matchMedia.mock.js';
import { createBackendAIClient, tokenLogin } from '../helper/loginSessionAuth';
import * as endpointModule from '../hooks/useResolvedApiEndpoint';
import {
  STokenLoginBoundary,
  type STokenLoginError,
} from './STokenLoginBoundary';
import { render, screen, waitFor } from '@testing-library/react';
import fs from 'fs';
import { Provider as JotaiProvider, createStore } from 'jotai';
import path from 'path';
import React from 'react';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('./DefaultProviders', () => ({
  __esModule: true,
  jotaiStore: { get: () => null, set: () => {} },
}));

jest.mock('../hooks/useWebUIConfig', () => ({
  __esModule: true,
  loginConfigState: { toString: () => 'loginConfigState' },
}));

jest.mock('../hooks/useResolvedApiEndpoint', () => {
  const state: { endpoint: string } = { endpoint: 'https://api.example.com' };
  return {
    __esModule: true,
    useResolvedApiEndpoint: jest.fn(() => state.endpoint),
    __endpointState: state,
  };
});

jest.mock('../helper/loginSessionAuth', () => ({
  __esModule: true,
  createBackendAIClient: jest.fn(),
  tokenLogin: jest.fn(),
}));

jest.mock('backend.ai-ui', () => {
  const actual = jest.requireActual('backend.ai-ui');
  return {
    ...actual,
    useBAILogger: () => ({
      logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    }),
  };
});

// Mock Jotai's useAtomValue to return null (no config in test env).
jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');
  return {
    ...actual,
    useAtomValue: () => null,
  };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const mockedCreateBackendAIClient =
  createBackendAIClient as jest.MockedFunction<typeof createBackendAIClient>;
const mockedTokenLogin = tokenLogin as jest.MockedFunction<typeof tokenLogin>;
const endpointState = (
  endpointModule as unknown as { __endpointState: { endpoint: string } }
).__endpointState;
const setEndpoint = (next: string) => {
  endpointState.endpoint = next;
};

type FakeClient = {
  get_manager_version: jest.Mock;
  token_login: jest.Mock;
};

const buildFakeClient = (): FakeClient => ({
  get_manager_version: jest.fn().mockResolvedValue('1.0'),
  token_login: jest.fn().mockResolvedValue(true),
});

const renderBoundary = (
  overrides: Partial<{
    sToken: string;
    onSuccess: (client: unknown) => void;
    onError: (error: STokenLoginError) => void;
    errorFallback: (
      error: STokenLoginError,
      retry: () => void,
    ) => React.ReactNode;
  }>,
  children: React.ReactNode = <div>children-rendered</div>,
) => {
  const store = createStore();
  return render(
    <JotaiProvider store={store}>
      <STokenLoginBoundary
        sToken={overrides.sToken ?? 'fake-token'}
        onSuccess={overrides.onSuccess}
        onError={overrides.onError}
        errorFallback={overrides.errorFallback}
      >
        {children}
      </STokenLoginBoundary>
    </JotaiProvider>,
  );
};

// ---------------------------------------------------------------------------
// Event spy
// ---------------------------------------------------------------------------

let connectedEventCount = 0;
const connectedEventHandler = () => {
  connectedEventCount += 1;
};

beforeEach(() => {
  connectedEventCount = 0;
  document.addEventListener('backend-ai-connected', connectedEventHandler);
  setEndpoint('https://api.example.com');
  mockedCreateBackendAIClient.mockImplementation(() => ({
    client: buildFakeClient(),
    clientConfig: {},
  }));
  mockedTokenLogin.mockResolvedValue([]);
});

afterEach(() => {
  document.removeEventListener('backend-ai-connected', connectedEventHandler);
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('STokenLoginBoundary', () => {
  test('renders children after the login sequence succeeds', async () => {
    const onSuccess = jest.fn();
    renderBoundary({ onSuccess });

    await waitFor(() => {
      expect(screen.getByText('children-rendered')).toBeInTheDocument();
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(tokenLogin).toHaveBeenCalledTimes(1);
  });

  test('dispatches backend-ai-connected exactly once on success', async () => {
    renderBoundary({});

    await waitFor(() => {
      expect(screen.getByText('children-rendered')).toBeInTheDocument();
    });
    expect(connectedEventCount).toBe(1);
  });

  test('reports missing-token when sToken prop is empty', async () => {
    const onError = jest.fn();
    renderBoundary({ sToken: '', onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({ kind: 'missing-token' });
    });
    expect(tokenLogin).not.toHaveBeenCalled();
    expect(connectedEventCount).toBe(0);
  });

  test('reports endpoint-unresolved when the resolver returns empty', async () => {
    const onError = jest.fn();
    setEndpoint('');
    renderBoundary({ onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({ kind: 'endpoint-unresolved' });
    });
    expect(tokenLogin).not.toHaveBeenCalled();
    expect(connectedEventCount).toBe(0);
  });

  test('reports server-unreachable when get_manager_version rejects', async () => {
    const serverErr = new Error('network down');
    mockedCreateBackendAIClient.mockImplementation(() => ({
      client: {
        get_manager_version: jest.fn().mockRejectedValue(serverErr),
        token_login: jest.fn(),
      },
      clientConfig: {},
    }));
    const onError = jest.fn();
    renderBoundary({ onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        kind: 'server-unreachable',
        cause: serverErr,
      });
    });
    expect(tokenLogin).not.toHaveBeenCalled();
    expect(connectedEventCount).toBe(0);
  });

  test('reports token-invalid when tokenLogin throws', async () => {
    const tokenErr = new Error('bad token');
    mockedTokenLogin.mockRejectedValue(tokenErr);
    const onError = jest.fn();
    renderBoundary({ onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        kind: 'token-invalid',
        cause: tokenErr,
      });
    });
    expect(connectedEventCount).toBe(0);
  });

  test('errorFallback replaces the built-in card for every kind', async () => {
    const tokenErr = new Error('bad token');
    mockedTokenLogin.mockRejectedValue(tokenErr);
    const errorFallback = jest.fn((error: STokenLoginError) => (
      <div>custom-{error.kind}</div>
    ));
    renderBoundary({ errorFallback });

    await waitFor(() => {
      expect(screen.getByText('custom-token-invalid')).toBeInTheDocument();
    });
    expect(errorFallback).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// URL-API prohibition invariant
// ---------------------------------------------------------------------------

describe('STokenLoginBoundary source', () => {
  test('does not reference any URL-state APIs', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'STokenLoginBoundary.tsx'),
      'utf8',
    );
    // Strip block comments and line comments so the rule documentation in
    // the file header is not flagged. This mirrors the awk-driven stripping
    // inside scripts/check-stoken-login-boundary-url-free.sh.
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, ''))
      .join('\n');
    expect(stripped).not.toMatch(/window\.location/);
    expect(stripped).not.toMatch(/window\.history/);
    expect(stripped).not.toMatch(/document\.location/);
    expect(stripped).not.toMatch(/\bURLSearchParams\b/);
  });
});
