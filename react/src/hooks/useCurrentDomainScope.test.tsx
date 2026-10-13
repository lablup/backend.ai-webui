/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainScope } from './useCurrentDomainScope';
import { renderHook, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DOMAIN_ID = '6a4b0b8e-1f0f-4c49-9d63-3b0c6d0f3e11';

vi.mock('.', () => ({
  useCurrentDomainValue: () => 'default',
}));

const renderScope = (domainId: string | null) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver(() => ({
    data: {
      myUserV2: { id: btoa('UserV2:me'), organization: { domainId } },
    },
  }));
  const onError = vi.fn();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <ErrorBoundary fallback={null} onError={onError}>
        <Suspense fallback={null}>{children}</Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
  return {
    ...renderHook(() => useCurrentDomainScope(), { wrapper }),
    onError,
  };
};

describe('useCurrentDomainScope (#10301)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds the domain scope from myUserV2', async () => {
    const { result } = renderScope(DOMAIN_ID);
    await waitFor(() => expect(result.current?.domainId).toBe(DOMAIN_ID));
    expect(result.current).toEqual({
      domainName: 'default',
      domainId: DOMAIN_ID,
      domainScope: { domain: [{ value: DOMAIN_ID }] },
    });
  });

  it('throws when the manager answers no domain id', async () => {
    const { onError } = renderScope(null);
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});
