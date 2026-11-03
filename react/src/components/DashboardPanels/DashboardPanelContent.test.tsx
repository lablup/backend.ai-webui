/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardPanelContent from './DashboardPanelContent';
import { DashboardResourceGroupsContext } from './DashboardResourceGroups';
import { DeniedPanelsContext, PermissionDeniedError } from './panelPermission';
import { effectivePanelSettings } from './panelSettingOverrides';
import type { PanelDefinition, PersistedPanelV2 } from './types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The header's resource group; a dashboard card must never read it.
vi.mock('../../hooks/useCurrentProject', () => ({
  useCurrentResourceGroupValue: () => 'header-rg',
  useCurrentProjectValue: () => ({ id: 'header-project', name: 'header' }),
}));

const Denied: React.FC = () => {
  throw new PermissionDeniedError('permission_access_forbidden');
};

const definition: Pick<PanelDefinition, 'settings'> = {
  settings: ['resourceGroup', 'range'],
};

const renderCard = (panel: PersistedPanelV2, isUserPanel = false) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const report = vi.fn();
  render(
    <DeniedPanelsContext value={report}>
      <DashboardPanelContent
        panel={panel}
        isPageRefetching={false}
        isUserPanel={isUserPanel}
      >
        {() => <Denied />}
      </DashboardPanelContent>
    </DeniedPanelsContext>,
  );
  return report;
};

const panel: PersistedPanelV2 = {
  id: 'sessionStatus',
  key: 'sessionStatus',
  columnSpan: 4,
  rowSpan: 3,
};

describe('a denied card in DashboardPanelContent', () => {
  it('is reported for hiding when nothing narrows it', () => {
    const report = renderCard(panel);
    expect(report).toHaveBeenCalledWith(
      'sessionStatus',
      'permission_access_forbidden',
    );
    expect(screen.queryByTestId('dashboard-card-permission-notice')).toBeNull();
  });

  it('shows a notice instead while a header pick narrows its resource group', () => {
    const report = renderCard({
      ...panel,
      settings: effectivePanelSettings(
        undefined,
        { resourceGroups: ['gpu'] },
        definition,
      ),
    });
    expect(report).not.toHaveBeenCalled();
    expect(
      screen.getByText('dashboard.permission.NoPermissionForResourceGroup'),
    ).toBeTruthy();
  });

  it('shows a notice instead while a saved range narrows it', () => {
    const report = renderCard({ ...panel, settings: { range: 'now-7d' } });
    expect(report).not.toHaveBeenCalled();
    expect(
      screen.getByText('dashboard.permission.NoPermissionForScope'),
    ).toBeTruthy();
  });

  it('shows a notice on a user-made panel', () => {
    const report = renderCard({ ...panel, id: 'preset-1' }, true);
    expect(report).not.toHaveBeenCalled();
    expect(
      screen.getByText('dashboard.permission.NoPermissionToView'),
    ).toBeTruthy();
  });
});

describe("a card's resource group in DashboardPanelContent", () => {
  const allowed = {
    names: ['cuda-ent', 'default'],
    isComplete: true,
    defaultResourceGroup: 'cuda-ent',
    scope: { project: [{ value: 'p-url' }] },
    filter: undefined,
  };

  const resourceGroupOf = (settings: PersistedPanelV2['settings']) => {
    let read: string | null = 'unread';
    render(
      <DashboardResourceGroupsContext value={allowed}>
        <DashboardPanelContent
          panel={{ ...panel, settings }}
          isPageRefetching={false}
        >
          {({ vars }) => {
            read = vars.resourceGroup;
            return null;
          }}
        </DashboardPanelContent>
      </DashboardResourceGroupsContext>,
    );
    return read;
  };

  it("reads the page project's first allowed group without a setting, not the header's", () => {
    expect(resourceGroupOf(undefined)).toBe('cuda-ent');
  });

  it('reads a saved or picked group the project may use', () => {
    expect(resourceGroupOf({ resourceGroups: ['default'] })).toBe('default');
    expect(
      resourceGroupOf(
        effectivePanelSettings(
          { resourceGroups: ['cuda-ent'] },
          { resourceGroups: ['default'] },
          definition,
        ),
      ),
    ).toBe('default');
  });

  it('falls back to the default for a group the project can no longer use', () => {
    expect(resourceGroupOf({ resourceGroups: ['header-rg'] })).toBe('cuda-ent');
  });
});
