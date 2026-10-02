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

describe('useAccessibleProjects', () => {
  it('loads every page of the admin project list', async () => {
    const environment = createMockEnvironment();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback={null}>{children}</Suspense>
      </RelayEnvironmentProvider>
    );
    const { result } = renderHook(() => useAccessibleProjects(), { wrapper });

    await act(async () => {
      environment.mock.resolveMostRecentOperation({
        data: {
          domainProjectsV2: {
            edges: [projectEdge(1), projectEdge(2)],
            pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
          },
          myUserV2: { id: 'dXNlcg==', projects: { edges: [] } },
        },
      });
    });

    await waitFor(() =>
      expect(
        environment.mock.getMostRecentOperation().request.node.params.name,
      ).toBe('useAccessibleProjectsDomainProjectsPaginationQuery'),
    );
    const nextPage = environment.mock.getMostRecentOperation();
    expect(nextPage.request.variables).toMatchObject({
      after: 'cursor-2',
      first: 1000,
      domainName: 'default',
    });

    await act(async () => {
      environment.mock.resolve(nextPage, {
        data: {
          domainProjectsV2: {
            edges: [projectEdge(3)],
            pageInfo: { hasNextPage: false, endCursor: 'cursor-3' },
          },
        },
      });
    });

    await waitFor(() =>
      expect(result.current.groups.map((project) => project.name)).toEqual([
        'project-1',
        'project-2',
        'project-3',
      ]),
    );
  });
});
