/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../../__test__/matchMedia.mock.js';
import '../../../../__test__/resizeObserver.mock.js';
import { MyResourcesInResourceGroup } from './MyResourcesPanel';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../../../hooks', () => ({
  useCurrentDomain: () => ({ id: 'domain-0000', name: 'default' }),
}));

vi.mock('backend.ai-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('backend.ai-ui')>()),
  useBAIResourceSlots: () => ({ mergedResourceSlots: {} }),
  ResourceStatistics: ({ resourceData }: { resourceData: unknown }) => (
    <pre data-testid="resource-data">{JSON.stringify(resourceData)}</pre>
  ),
}));

const renderCard = () => {
  const environment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <MyResourcesInResourceGroup
        projectId="project-0000"
        resourceGroupName="default"
        fetchKey="0"
      />
    </RelayEnvironmentProvider>,
  );
  return environment;
};

const allocation = {
  myUserResourceAllocationV2: {
    user: {
      used: [{ resourceType: 'cpu', quantity: '3' }],
      assignable: [
        { resourceType: 'cpu', quantity: '4', unlimited: false },
        { resourceType: 'cuda.device', quantity: '0', unlimited: true },
        { resourceType: 'atom.device', quantity: '0', unlimited: true },
      ],
    },
  },
  projectResourceAllocationV2: { project: { assignable: [] } },
};

const readResourceData = async () =>
  JSON.parse((await screen.findByTestId('resource-data')).textContent ?? '');

describe('MyResourcesInResourceGroup', () => {
  it('lists only the slots the resource group offers', async () => {
    const environment = renderCard();
    environment.mock.resolve(environment.mock.getMostRecentOperation(), {
      data: {
        ...allocation,
        scopedResourceGroups: {
          edges: [
            {
              node: {
                resourceInfo: {
                  capacity: {
                    entries: [
                      { resourceType: 'cpu', quantity: '8' },
                      { resourceType: 'cuda.device', quantity: '2' },
                    ],
                  },
                  free: { entries: [] },
                },
              },
            },
          ],
        },
      },
    });

    const data = await readResourceData();
    expect(data.cpu.used).toEqual({ current: 3, total: 7 });
    expect(data.accelerators.map((a: { key: string }) => a.key)).toEqual([
      'cuda.device',
    ]);
  });

  it('shows the no-resource-group text when the picked group is not found', async () => {
    const environment = renderCard();
    environment.mock.resolve(environment.mock.getMostRecentOperation(), {
      data: { ...allocation, scopedResourceGroups: { edges: [] } },
    });

    expect(
      await screen.findByText('dashboard.card.NoResourceGroup'),
    ).toBeInTheDocument();
  });

  it('keeps CPU and memory only when the group reports no capacity', async () => {
    const environment = renderCard();
    environment.mock.resolve(environment.mock.getMostRecentOperation(), {
      data: {
        ...allocation,
        scopedResourceGroups: { edges: [{ node: { resourceInfo: null } }] },
      },
    });

    const data = await readResourceData();
    expect(data.cpu.used).toEqual({ current: 3, total: 7 });
    expect(data.accelerators).toEqual([]);
  });

  it('keeps CPU and memory only when the group read comes back null', async () => {
    const environment = renderCard();
    environment.mock.resolve(environment.mock.getMostRecentOperation(), {
      data: { ...allocation, scopedResourceGroups: null },
    });

    const data = await readResourceData();
    expect(data.cpu.used).toEqual({ current: 3, total: 7 });
    expect(data.accelerators).toEqual([]);
  });
});
