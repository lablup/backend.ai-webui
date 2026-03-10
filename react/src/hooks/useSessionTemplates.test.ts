/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for useSessionTemplates hook.
 *
 * These tests cover:
 * - List result normalization: array vs object response shapes
 * - CRUD mutations: create/update/delete call the expected endpoints
 * - refresh() triggers a single re-fetch via updateFetchKey only
 */
import { baiSignedRequestWithPromise } from '../helper';
import { useSessionTemplates } from './useSessionTemplates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('.', () => ({
  useSuspendedBackendaiClient: jest.fn(),
}));

jest.mock('../helper', () => ({
  baiSignedRequestWithPromise: jest.fn(),
}));

jest.mock('backend.ai-ui', () => ({
  useUpdatableState: jest.fn(() => ['key-1', jest.fn()]),
}));

const { useSuspendedBackendaiClient } = jest.requireMock('.');
const mockedBaiRequest = baiSignedRequestWithPromise as jest.MockedFunction<
  typeof baiSignedRequestWithPromise
>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_TEMPLATE = {
  id: 'tpl-1',
  name: 'my-template',
  type: 'task' as const,
  is_active: true,
  domain_name: 'default',
  user: 'user-uuid',
  user_email: 'test@example.com',
  group: null,
  group_name: null,
  is_owner: true,
  created_at: '2026-01-01T00:00:00Z',
  template: {
    api_version: '20160915.0',
    kind: 'BackendAI/SessionTemplate',
    metadata: { name: 'my-template', tag: null },
    spec: {
      session_type: 'interactive' as const,
      kernel: { image: 'python:3.10-ubuntu20.04' },
    },
  },
};

// ---------------------------------------------------------------------------
// Wrapper: QueryClientProvider
// ---------------------------------------------------------------------------

function makeWrapper(): React.ComponentType<{ children: React.ReactNode }> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  return Wrapper;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests: list normalization – array response
// ---------------------------------------------------------------------------

describe('useSessionTemplates – list normalization', () => {
  it('wraps an array response in { items }', async () => {
    const listFn = jest.fn().mockResolvedValue([MOCK_TEMPLATE]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessionTemplates).toHaveLength(1);
    expect(result.current.sessionTemplates[0].id).toBe('tpl-1');
  });

  it('uses items field when response is { items: [...] }', async () => {
    const listFn = jest.fn().mockResolvedValue({ items: [MOCK_TEMPLATE] });
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessionTemplates).toHaveLength(1);
  });

  it('falls back to templates field when items is absent', async () => {
    const listFn = jest.fn().mockResolvedValue({ templates: [MOCK_TEMPLATE] });
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessionTemplates).toHaveLength(1);
  });

  it('returns an empty array when response is an empty object', async () => {
    const listFn = jest.fn().mockResolvedValue({});
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessionTemplates).toEqual([]);
  });

  it('passes listAll and groupId to the SDK list call', async () => {
    const listFn = jest.fn().mockResolvedValue([]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const { result } = renderHook(
      () => useSessionTemplates(true, 'group-uuid'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(listFn).toHaveBeenCalledWith(true, 'group-uuid');
  });
});

// ---------------------------------------------------------------------------
// Tests: createTemplate mutation
// ---------------------------------------------------------------------------

describe('useSessionTemplates – createTemplate mutation', () => {
  it('POSTs to /template/session with the correct body shape', async () => {
    const listFn = jest.fn().mockResolvedValue([]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });
    mockedBaiRequest.mockResolvedValue(MOCK_TEMPLATE as any);

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createTemplate({
        template: MOCK_TEMPLATE.template,
        group_name: 'my-group',
      });
    });

    expect(mockedBaiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/template/session',
      }),
    );

    const callArgs = mockedBaiRequest.mock.calls[0][0] as any;
    const parsedPayload = JSON.parse(callArgs.body.payload);
    expect(parsedPayload).toHaveLength(1);
    expect(parsedPayload[0].name).toBe('my-template');
    expect(parsedPayload[0].template).toEqual(MOCK_TEMPLATE.template);
    expect(callArgs.body.group_name).toBe('my-group');
  });
});

// ---------------------------------------------------------------------------
// Tests: updateTemplate mutation
// ---------------------------------------------------------------------------

describe('useSessionTemplates – updateTemplate mutation', () => {
  it('PUTs to /template/session/:id with the correct body', async () => {
    const listFn = jest.fn().mockResolvedValue([]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });
    mockedBaiRequest.mockResolvedValue(MOCK_TEMPLATE as any);

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateTemplate('tpl-1', {
        template: MOCK_TEMPLATE.template,
      });
    });

    expect(mockedBaiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: '/template/session/tpl-1',
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteTemplate mutation
// ---------------------------------------------------------------------------

describe('useSessionTemplates – deleteTemplate mutation', () => {
  it('DELETEs /template/session/:id', async () => {
    const listFn = jest.fn().mockResolvedValue([]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });
    mockedBaiRequest.mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteTemplate('tpl-1');
    });

    expect(mockedBaiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/template/session/tpl-1',
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: refresh()
// ---------------------------------------------------------------------------

describe('useSessionTemplates – refresh()', () => {
  it('calls updateFetchKey once and does not call invalidateQueries', async () => {
    const { useUpdatableState } = jest.requireMock('backend.ai-ui');
    const updateFetchKeyMock = jest.fn();
    useUpdatableState.mockReturnValue(['key-1', updateFetchKeyMock]);

    const listFn = jest.fn().mockResolvedValue([]);
    useSuspendedBackendaiClient.mockReturnValue({
      sessionTemplate: { list: listFn },
    });

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);

    const { result } = renderHook(() => useSessionTemplates(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.refresh();
    });

    expect(updateFetchKeyMock).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
