/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PendingSessionRow } from './PendingSessionsPanel';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderRow = (
  props: Partial<React.ComponentProps<typeof PendingSessionRow>> = {},
) => {
  const onOpenHistory = vi.fn();
  render(
    <MemoryRouter>
      <PendingSessionRow
        reason="No agent has enough cuda.shares"
        name="train-llm"
        waited="00:12:30"
        onOpenHistory={onOpenHistory}
        {...props}
      />
    </MemoryRouter>,
  );
  return onOpenHistory;
};

describe('PendingSessionRow', () => {
  it('shows the reason first, then the name and how long the session waited', () => {
    renderRow({ project: 'default' });
    expect(
      screen.getByText('No agent has enough cuda.shares'),
    ).toBeInTheDocument();
    expect(screen.getByText('train-llm')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(
      screen.getByText(/dashboard\.card\.Waiting\s+00:12:30/),
    ).toBeInTheDocument();
  });

  it('joins a multi-line scheduler message into one line', () => {
    renderRow({ reason: 'first\n  second' });
    expect(screen.getByText('first second')).toBeInTheDocument();
  });

  it('says the scheduler has not tried yet', () => {
    renderRow({ reason: null });
    expect(screen.getByText('dashboard.card.NotTriedYet')).toBeInTheDocument();
  });

  it('shows "-" when the reason lookup did not return the session', () => {
    renderRow({ reason: undefined });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('opens the scheduling history once from the session name', () => {
    const onOpenHistory = renderRow();
    fireEvent.click(screen.getByText('train-llm'));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });
});
