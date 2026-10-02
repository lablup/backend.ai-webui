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

const renderWithPayload = async (
  payload: GraphQLResponse,
  scope?: 'user' | 'admin',
) => {
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
  const rendered = renderHook(() => useModelStoreProject(scope), {
    wrapper,
  });
  await waitFor(() => expect(rendered.result.current).not.toBeNull());
  return { ...rendered, operation };
};

describe('useModelStoreProject (FR-4058)', () => {
  beforeEach(() => {
    // Relay logs the field error that `@catch` turns into `{ ok: false }`.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the caller id and domain name as variables', async () => {
    const { operation } = await renderWithPayload({
      data: { scopedProjectsV2: { edges: [] } },
    });
    expect(operation?.request.variables).toEqual({
      userId: 'dfa9da54-4b28-432f-be29-c0d680c7a412',
      domainName: 'default',
      isAdminScope: false,
    });
  });

  it('reads the model store project from the user scope', async () => {
    const { result } = await renderWithPayload({
      data: {
        scopedProjectsV2: { edges: [{ node: modelStoreNode }] },
      },
    });
    expect(result.current).toEqual({
      id: MODEL_STORE_UUID,
      name: 'model-store',
    });
  });

  it('returns nulls when the user scope is refused', async () => {
    // `@catch(to: RESULT)` turns a field error into `{ ok: false }` so the
    // page keeps rendering.
    const { result } = await renderWithPayload({
      data: { scopedProjectsV2: null },
      errors: [
        {
          message: 'Insufficient permission to perform this operation.',
          path: ['scopedProjectsV2'],
        },
      ],
    });
    expect(result.current).toEqual({ id: null, name: null });
  });

  it('returns nulls when the user belongs to no model store project', async () => {
    const { result } = await renderWithPayload({
      data: {
        scopedProjectsV2: { edges: [] },
      },
    });
    expect(result.current).toEqual({ id: null, name: null });
  });

  it('reads the model store project from the current domain in admin scope', async () => {
    const { result, operation } = await renderWithPayload(
      { data: { domainProjectsV2: { edges: [{ node: modelStoreNode }] } } },
      'admin',
    );
    expect(operation?.request.variables).toMatchObject({
      domainName: 'default',
      isAdminScope: true,
    });
    expect(result.current).toEqual({
      id: MODEL_STORE_UUID,
      name: 'model-store',
    });
  });
});
