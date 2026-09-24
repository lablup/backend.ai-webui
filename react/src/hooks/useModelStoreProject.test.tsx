/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useModelStoreProject } from './useModelStoreProject';
import { renderHook, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import type { GraphQLResponse, OperationDescriptor } from 'relay-runtime';
import { createMockEnvironment } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    user_uuid: 'dfa9da54-4b28-432f-be29-c0d680c7a412',
  }),
  useCurrentDomainValue: () => 'default',
}));

const MODEL_STORE_UUID = '8e32dd28-d319-4e3b-8851-ea37837699a5';
const modelStoreNode = {
  id: btoa(`ProjectV2:${MODEL_STORE_UUID}`),
  basicInfo: { name: 'model-store' },
};

const renderWithPayload = async (payload: GraphQLResponse) => {
  const environment = createMockEnvironment();
  let operation: OperationDescriptor | undefined;
  environment.mock.queueOperationResolver((resolved) => {
    operation = resolved;
    return payload;
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  const rendered = renderHook(() => useModelStoreProject(), { wrapper });
  await waitFor(() => expect(rendered.result.current).not.toBeNull());
  return { ...rendered, operation };
};

describe('useModelStoreProject (FR-4058)', () => {
  beforeEach(() => {
    // Relay warns about the field a version gate pruned from the response.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the caller id and domain name as variables', async () => {
    const { operation } = await renderWithPayload({
      data: { scopedProjectsV2: { edges: [] }, domainV2: null },
    });
    expect(operation?.request.variables).toEqual({
      userId: 'dfa9da54-4b28-432f-be29-c0d680c7a412',
      domainName: 'default',
    });
  });

  it('reads the user-scoped project when the domain read is refused', async () => {
    // An ordinary user on a 26.9 manager: `domainV2.projects` errors, the
    // user scope answers.
    const { result } = await renderWithPayload({
      data: {
        scopedProjectsV2: { edges: [{ node: modelStoreNode }] },
        domainV2: { projects: null },
      },
      errors: [
        {
          message:
            'Insufficient permission to perform this operation. (User lacks permission <Permission.READ: 1> on project at scopes [DomainID(...)])',
          path: ['domainV2', 'projects'],
        },
      ],
    });
    expect(result.current).toEqual({
      id: MODEL_STORE_UUID,
      name: 'model-store',
    });
  });

  it('falls back to the domain projects when the user scope is absent', async () => {
    // A manager before 26.9: `@since` pruned `scopedProjectsV2` from the
    // request, so the response carries only the legacy field.
    const { result } = await renderWithPayload({
      data: {
        domainV2: { projects: { edges: [{ node: modelStoreNode }] } },
      },
    });
    expect(result.current).toEqual({
      id: MODEL_STORE_UUID,
      name: 'model-store',
    });
  });

  it('returns nulls when the domain has no model store project', async () => {
    const { result } = await renderWithPayload({
      data: {
        scopedProjectsV2: { edges: [] },
        domainV2: { projects: { edges: [] } },
      },
    });
    expect(result.current).toEqual({ id: null, name: null });
  });
});
