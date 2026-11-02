/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import RBACPermissionGrid from './RBACPermissionGrid';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The matrix keeps its identity across renders, as a Relay snapshot does.
const { tableRender, matrix } = vi.hoisted(() => ({
  tableRender: vi.fn(),
  matrix: {
    rbacPermissionMatrix: [
      {
        scopeType: 'DOMAIN',
        entities: ['agent', 'vfolder', 'session'].map((entityType) => ({
          entityType,
          actions: [{ requiredPermission: 'READ' }],
        })),
      },
    ],
  },
}));

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useLazyLoadQuery: () => matrix,
}));

vi.mock('backend.ai-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('backend.ai-ui')>()),
  BAITable: ({
    dataSource,
  }: {
    dataSource: ReadonlyArray<{ entityType: string }>;
  }) => {
    tableRender();
    return (
      <ul>
        {dataSource.map((row) => (
          <li key={row.entityType}>{row.entityType}</li>
        ))}
      </ul>
    );
  },
}));

// `t` keeps its identity across renders, as the real one does; a new function
// on each render would rebuild the columns.
const t = (key: string) => key;
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t }),
}));

const GRANTS: ReadonlyArray<never> = [];
const noop = () => {};
const save = async () => [];

const renderGrid = () => {
  render(
    <RBACPermissionGrid
      scopeType="DOMAIN"
      grants={GRANTS}
      grantsVersion={0}
      fetchKey=""
      onRefresh={noop}
      onSave={save}
    />,
  );
  return screen.getByRole('textbox', { name: 'rbac.FilterByPermissionType' });
};

const type = (input: HTMLElement, value: string) =>
  fireEvent.change(input, { target: { value } });

describe('RBACPermissionGrid permission type filter', () => {
  beforeEach(() => {
    tableRender.mockClear();
  });

  it('shows typing at once and leaves the table alone until typing stops', async () => {
    const input = renderGrid();
    tableRender.mockClear();

    for (const value of ['v', 'vf', 'vfo']) {
      type(input, value);
      expect(input).toHaveValue(value);
    }

    expect(tableRender).not.toHaveBeenCalled();
    expect(screen.getByText('agent')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText('agent')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('vfolder')).toBeInTheDocument();
    expect(tableRender).toHaveBeenCalledTimes(1);
  });

  it('brings every row back after the clear button empties the filter', async () => {
    const input = renderGrid();

    type(input, 'vfo');
    await waitFor(() =>
      expect(screen.queryByText('agent')).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(input).toHaveValue('');
    expect(await screen.findByText('agent')).toBeInTheDocument();
    expect(screen.getByText('session')).toBeInTheDocument();
  });
});
