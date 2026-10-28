/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import MyResource from './MyResource';
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

vi.mock('../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({ id: 'project-0000', name: 'default' }),
  useCurrentResourceGroupValue: () => 'default',
}));

vi.mock('../hooks/backendai', () => ({
  useResourceSlotsDetails: () => ({
    resourceSlotsInRG: {
      cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
    },
  }),
}));

// Only the statistics the card hands over matter here.
vi.mock('backend.ai-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('backend.ai-ui')>()),
  BAIBoardItemTitle: () => null,
  ResourceStatistics: ({ resourceData }: { resourceData: unknown }) => (
    <pre data-testid="resource-data">{JSON.stringify(resourceData)}</pre>
  ),
}));

const renderCard = () => {
  const environment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <MyResource />
    </RelayEnvironmentProvider>,
  );
  return environment;
};

const readResourceData = async () =>
  JSON.parse((await screen.findByTestId('resource-data')).textContent ?? '');

describe('MyResource', () => {
  it("shows every keypair's usage against the smaller remainder of the effective and user scopes", async () => {
    const environment = renderCard();
    environment.mock.resolveMostRecentOperation({
      data: {
        effectiveResourceAllocationV2: {
          assignable: [
            { resourceType: 'cpu', quantity: '6', unlimited: false },
          ],
        },
        myUserResourceAllocationV2: {
          user: {
            used: [{ resourceType: 'cpu', quantity: '3' }],
            assignable: [
              { resourceType: 'cpu', quantity: '4', unlimited: false },
            ],
          },
        },
      },
    });

    const data = await readResourceData();
    expect(data.cpu.used).toEqual({ current: 3, total: 7 });
    expect(data.cpu.free).toEqual({ current: 4, total: 7 });
  });

  it('keeps a rejected query inside the card', async () => {
    const environment = renderCard();
    environment.mock.rejectMostRecentOperation(
      new Error('Cannot query field "myUserResourceAllocationV2"'),
    );

    expect(await readResourceData()).toEqual({
      cpu: null,
      memory: null,
      accelerators: [],
    });
  });
});
