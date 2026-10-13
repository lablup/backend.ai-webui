/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainScope } from './useCurrentDomainScope';
import { renderHook, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

const DOMAIN_ID = '6a4b0b8e-1f0f-4c49-9d63-3b0c6d0f3e11';
let supportsScopedSearch = true;

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    isManagerVersionCompatibleWith: () => supportsScopedSearch,
  }),
  useCurrentDomainValue: () => 'default',
}));

const renderScope = () => {
  const environment = createMockEnvironment();
  const resolver = vi.fn(() => ({
    data: {
      myUserV2: {
        id: btoa('UserV2:me'),
        organization: { domainId: DOMAIN_ID },
      },
    },
  }));
  environment.mock.queueOperationResolver(resolver);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  return {
    ...renderHook(() => useCurrentDomainScope(), { wrapper }),
    resolver,
  };
};

describe('useCurrentDomainScope (#10301)', () => {
  afterEach(() => {
    supportsScopedSearch = true;
  });

  it('builds a domain scope from myUserV2 on a scoped-search manager', async () => {
    const { result } = renderScope();
    await waitFor(() => expect(result.current?.domainId).toBe(DOMAIN_ID));
    expect(result.current).toEqual({
      domainName: 'default',
      domainId: DOMAIN_ID,
      domainScope: { domain: [{ value: DOMAIN_ID }] },
      supportsScopedSearch: true,
    });
  });

  it('sends no request and answers no scope below 26.9.0a4', async () => {
    supportsScopedSearch = false;
    const { result, resolver } = renderScope();
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(resolver).not.toHaveBeenCalled();
    expect(result.current).toEqual({
      domainName: 'default',
      domainId: null,
      domainScope: null,
      supportsScopedSearch: false,
    });
  });
});
