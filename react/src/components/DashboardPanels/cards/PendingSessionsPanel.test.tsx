/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PENDING_DEFAULT_COLUMNS,
  PendingReasonCell,
  customizePendingColumns,
} from './PendingSessionsPanel';
import { fireEvent, render, screen } from '@testing-library/react';
import type { BAIColumnType, SessionV2InList } from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const t = ((key: string) => key) as unknown as TFunction;
const BASE_COLUMNS = [
  'name',
  'sessionId',
  'status',
  'elapsedTime',
  'resourceGroup',
  'project',
  'owner',
].map((key) => ({ key, title: key }) as BAIColumnType<SessionV2InList>);
const SESSION = {
  entityId: 's-1',
  metadata: { name: 'train-llm' },
} as unknown as SessionV2InList;

const columnsWith = (onOpenHistory = vi.fn()) =>
  customizePendingColumns(BASE_COLUMNS, {
    renderReason: (session) => `reason of ${session.entityId}` as ReactNode,
    t,
    onOpenHistory,
  });

const renderCell = (
  column: BAIColumnType<SessionV2InList> | undefined,
  session: SessionV2InList = SESSION,
) =>
  render(
    <MemoryRouter>
      <>{column?.render?.(undefined, session, 0) as React.ReactNode}</>
    </MemoryRouter>,
  );

describe('customizePendingColumns', () => {
  it('shows the name, the latest reason and the time waited; the rest sit in the column settings', () => {
    const columns = columnsWith();
    expect(columns.map((column) => column.key).slice(0, 2)).toEqual([
      'name',
      'reason',
    ]);
    expect(
      columns
        .filter((column) => !column.defaultHidden)
        .map((column) => column.key),
    ).toEqual(PENDING_DEFAULT_COLUMNS);
    for (const key of ['owner', 'resourceGroup', 'project']) {
      expect(columns.find((column) => column.key === key)?.defaultHidden).toBe(
        true,
      );
    }
    expect(columns.find((column) => column.key === 'reason')?.title).toBe(
      'dashboard.card.LatestSchedulingReason',
    );
    expect(columns.find((column) => column.key === 'elapsedTime')?.title).toBe(
      'dashboard.card.Waiting',
    );
  });

  it('renders each row reason through renderReason', () => {
    const reason = columnsWith().find((column) => column.key === 'reason');
    renderCell(reason);
    expect(screen.getByText('reason of s-1')).toBeInTheDocument();
  });

  it('opens the scheduling history once from the session name', () => {
    const onOpenHistory = vi.fn();
    const onRowClick = vi.fn();
    const name = columnsWith(onOpenHistory).find(
      (column) => column.key === 'name',
    );
    render(
      <MemoryRouter>
        <div onClick={onRowClick}>
          {name?.render?.(undefined, SESSION, 0) as React.ReactNode}
        </div>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('train-llm'));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
    expect(onOpenHistory).toHaveBeenCalledWith(SESSION);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('PendingReasonCell', () => {
  it('joins a multi-line scheduler message into one line', () => {
    render(<PendingReasonCell reason={'first\n  second'} />);
    expect(screen.getByText('first second')).toBeInTheDocument();
  });

  it('says the scheduler has not tried yet', () => {
    render(<PendingReasonCell reason={null} />);
    expect(screen.getByText('dashboard.card.NotTriedYet')).toBeInTheDocument();
  });

  it('shows "-" when the history could not be read', () => {
    render(<PendingReasonCell reason={undefined} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
