/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardEditSider, {
  type DashboardEditSiderProps,
} from './DashboardEditSider';
import type { CatalogEntry } from './boardModel';
import type { PanelDefinition, PersistedPanel } from './types';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { name?: string }) =>
        options?.name ? `${key} ${options.name}` : key,
    }),
  };
});

vi.mock('../../hooks/backendai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/backendai')>();
  return { ...actual, useCurrentUserRole: () => 'user' };
});

const entry = (key: string): CatalogEntry => ({
  definition: {
    key,
    kind: 'custom',
    titleKey: `title.${key}`,
    group: 'session',
    page: ['project'],
    defaultSize: { columnSpan: 1, rowSpan: 1 },
    minSize: { columnSpan: 1, rowSpan: 1 },
  } as unknown as PanelDefinition,
  locked: false,
});

const customPanel = (id: string, title: string): PersistedPanel => ({
  id,
  panelType: 'resourceTable',
  descriptor: { resourceType: 'session', title },
});

const renderSider = (overrides: Partial<DashboardEditSiderProps> = {}) => {
  const props: DashboardEditSiderProps = {
    catalogEntries: [entry('sessions')],
    activeKeys: new Set(['sessions', 'custom-a']),
    onTogglePanels: vi.fn(),
    panels: [
      customPanel('custom-a', 'GPU sessions'),
      customPanel('custom-b', 'Old folders'),
    ],
    onRequestAdd: vi.fn(),
    onRequestEdit: vi.fn(),
    onRemove: vi.fn(),
    onResetLayout: vi.fn(),
    settingsTargetOf: () => null,
    onRequestSettings: vi.fn(),
    ...overrides,
  };
  render(<DashboardEditSider {...props} />);
  return props;
};

const customGroup = () => screen.getByTestId('dashboard-custom-panels');

describe('DashboardEditSider custom panels', () => {
  it('lists user-made panels as checkbox rows, checked when on the board', () => {
    renderSider();
    const group = within(customGroup());
    expect(group.getAllByText('dashboard.editSider.Title')[0]).toBeVisible();
    expect(group.getByRole('checkbox', { name: /GPU sessions/ })).toBeChecked();
    expect(
      group.getByRole('checkbox', { name: /Old folders/ }),
    ).not.toBeChecked();
  });

  it('puts a panel on the board or takes it off by its id', async () => {
    const user = userEvent.setup();
    const props = renderSider();
    const group = within(customGroup());
    await user.click(group.getByRole('checkbox', { name: /Old folders/ }));
    expect(props.onTogglePanels).toHaveBeenLastCalledWith(['custom-b'], true);
    await user.click(group.getByRole('checkbox', { name: /GPU sessions/ }));
    expect(props.onTogglePanels).toHaveBeenLastCalledWith(['custom-a'], false);
  });

  it('keeps the add button in the group header and edit and delete on each row', async () => {
    const user = userEvent.setup();
    const props = renderSider();
    const group = within(customGroup());
    await user.click(group.getByRole('button', { name: 'button.Add' }));
    expect(props.onRequestAdd).toHaveBeenCalled();
    await user.click(group.getAllByRole('button', { name: 'button.Edit' })[0]!);
    expect(props.onRequestEdit).toHaveBeenCalledWith(props.panels[0]);
    expect(props.onTogglePanels).not.toHaveBeenCalled();
    expect(
      group.getAllByRole('button', { name: 'button.Delete' }),
    ).toHaveLength(2);
  });

  it('shows the empty hint with the add button when there are no panels', () => {
    renderSider({ panels: [] });
    const group = within(customGroup());
    expect(group.getByText('dashboard.editSider.Empty')).toBeInTheDocument();
    expect(
      group.getByRole('button', { name: 'button.Add' }),
    ).toBeInTheDocument();
  });

  it('filters the panels with the search and leaves the group out when none match', async () => {
    const user = userEvent.setup();
    renderSider();
    const search = screen.getByRole('textbox', {
      name: 'dashboard.editSider.SearchCards',
    });
    await user.type(search, 'gpu');
    expect(
      within(customGroup()).queryByRole('checkbox', { name: /Old folders/ }),
    ).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'title.sessions');
    expect(
      screen.queryByTestId('dashboard-custom-panels'),
    ).not.toBeInTheDocument();
  });

  it('includes the panels in select all', async () => {
    const user = userEvent.setup();
    const props = renderSider();
    await user.click(screen.getByTestId('dashboard-card-select-all'));
    expect(props.onTogglePanels).toHaveBeenCalledWith(['custom-b'], true);
  });
});
