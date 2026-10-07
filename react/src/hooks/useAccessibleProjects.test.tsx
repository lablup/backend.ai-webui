/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAccessibleProjects } from './useAccessibleProjects';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({ _config: { blockList: null } }),
  useCurrentDomainValue: () => 'default',
}));
vi.mock('./backendai', () => ({
  useCurrentUserRole: () => 'superadmin',
}));

const projectEdge = (index: number) => ({
  cursor: `cursor-${index}`,
  node: {
    __typename: 'ProjectV2',
    id: btoa(
      `ProjectV2:00000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
    ),
    basicInfo: { name: `project-${index}`, type: 'GENERAL' },
    organization: { resourcePolicy: 'default' },
    lifecycle: { isActive: true },
  },
});

const renderAsAdmin = () => {
  const environment = createMockEnvironment();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>{children}</Suspense>
    </RelayEnvironmentProvider>
  );
  const rendered = renderHook(() => useAccessibleProjects(), { wrapper });
  return { environment, ...rendered };
};

const page = (indexes: Array<number>, hasNextPage: boolean) => ({
  edges: indexes.map(projectEdge),
  pageInfo: {
    hasNextPage,
    endCursor: `cursor-${indexes[indexes.length - 1]}`,
  },
});

const PAGINATION_QUERY = 'useAccessibleProjectsDomainProjectsPaginationQuery';

const paginationOperations = (
  environment: ReturnType<typeof createMockEnvironment>,
) =>
  environment.mock
    .getAllOperations()
    .filter((op) => op.request.node.params.name === PAGINATION_QUERY);

const resolveFirstPage = async (
  environment: ReturnType<typeof createMockEnvironment>,
) => {
  await act(async () => {
    environment.mock.resolveMostRecentOperation({
      data: {
        domainProjectsV2: page([1, 2], true),
        myUserV2: { id: 'dXNlcg==', projects: { edges: [] } },
      },
    });
  });
};

describe('useAccessibleProjects', () => {
  it('keeps loading pages until the last one', async () => {
    const { environment, result } = renderAsAdmin();
    await resolveFirstPage(environment);

    for (const [indexes, hasNextPage, after] of [
      [[3, 4], true, 'cursor-2'],
      [[5], false, 'cursor-4'],
    ] as const) {
      await waitFor(() =>
        expect(paginationOperations(environment)).toHaveLength(1),
      );
      const next = paginationOperations(environment)[0];
      expect(next.request.variables).toMatchObject({
        after,
        first: 1000,
        domainName: 'default',
      });
      await act(async () => {
        environment.mock.resolve(next, {
          data: { domainProjectsV2: page([...indexes], hasNextPage) },
        });
      });
    }

    await waitFor(() =>
      expect(result.current.groups.map((project) => project.name)).toEqual([
        'project-1',
        'project-2',
        'project-3',
        'project-4',
        'project-5',
      ]),
    );
    expect(paginationOperations(environment)).toHaveLength(0);
  });

  it('does not refetch a page that failed', async () => {
    const { environment, result } = renderAsAdmin();
    await resolveFirstPage(environment);

    await waitFor(() =>
      expect(paginationOperations(environment)).toHaveLength(1),
    );
    await act(async () => {
      environment.mock.reject(
        paginationOperations(environment)[0],
        new Error('boom'),
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(paginationOperations(environment)).toHaveLength(0);
    expect(result.current.groups.map((project) => project.name)).toEqual([
      'project-1',
      'project-2',
    ]);
  });
});
