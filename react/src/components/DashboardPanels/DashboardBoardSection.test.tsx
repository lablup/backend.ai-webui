/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardBoardSection from './DashboardBoardSection';
import { DEFAULT_BOARD_VARS, activeBoardOf } from './dashboardConfig';
import type { DashboardModel, DashboardPageConfig } from './types';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { number?: number }) =>
        options?.number ? `${key} ${options.number}` : key,
    }),
  };
});

const board = (id: string, title: string): DashboardModel => ({
  id,
  title,
  vars: { ...DEFAULT_BOARD_VARS },
  panels: [],
  knownKeys: [],
});

const renderSection = (initial: DashboardPageConfig) => {
  const latest: { config: DashboardPageConfig } = { config: initial };
  const Harness: React.FC = () => {
    const [config, setConfig] = useState(initial);
    latest.config = config;
    return (
      <DashboardBoardSection
        page="admin"
        catalog={[]}
        boards={{
          config,
          activeBoard: activeBoardOf(config),
          template: board('template', ''),
          update: (fn) => setConfig((current) => fn(current)),
        }}
      />
    );
  };
  render(<Harness />);
  return latest;
};

const nameInput = () =>
  screen.getByRole('textbox', { name: 'dashboard.boards.BoardName' });

describe('DashboardBoardSection', () => {
  it('switches the active board from the selector', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', ''), board('ops', 'Ops')],
      active: 'default',
    });
    expect(nameInput()).toHaveValue('dashboard.boards.DefaultBoard');

    await user.click(
      screen.getByRole('combobox', { name: 'dashboard.boards.Boards' }),
    );
    await user.click(await screen.findByRole('option', { name: 'Ops' }));

    expect(latest.config.active).toBe('ops');
    expect(nameInput()).toHaveValue('Ops');
  });

  it('renames the active board on Enter and on blur', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', ''), board('ops', 'Ops')],
      active: 'ops',
    });

    await user.clear(nameInput());
    await user.type(nameInput(), 'Operations{Enter}');
    expect(latest.config.boards[1].title).toBe('Operations');

    await user.clear(nameInput());
    await user.type(nameInput(), '  Night shift  ');
    act(() => {
      fireEvent.blur(nameInput());
    });
    expect(latest.config.boards[1].title).toBe('Night shift');
  });

  it('keeps the old name and says why when the new one is blank', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', ''), board('ops', 'Ops')],
      active: 'ops',
    });

    await user.clear(nameInput());
    await user.type(nameInput(), '   {Enter}');
    act(() => {
      fireEvent.blur(nameInput());
    });

    expect(latest.config.boards[1].title).toBe('Ops');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'dashboard.boards.BoardNameRequired',
    );
  });

  it('adds a board and makes it active', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', '')],
      active: 'default',
    });

    await user.click(screen.getByTestId('dashboard-board-add'));

    expect(latest.config.boards).toHaveLength(2);
    expect(latest.config.active).toBe(latest.config.boards[1].id);
    expect(latest.config.boards[1].panels).toEqual([]);
  });

  it('numbers a new board past the titles still in use', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [
        board('default', ''),
        board('three', 'dashboard.boards.NewBoardTitle 3'),
      ],
      active: 'default',
    });

    await user.click(screen.getByTestId('dashboard-board-add'));

    expect(latest.config.boards[2].title).toBe(
      'dashboard.boards.NewBoardTitle 4',
    );
  });

  it('cannot delete the last board', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', '')],
      active: 'default',
    });
    const deleteButton = screen.getByTestId('dashboard-board-delete');
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');

    await user.click(deleteButton);

    expect(
      screen.queryByRole('button', { name: 'button.Delete' }),
    ).not.toBeInTheDocument();
    expect(latest.config.boards).toHaveLength(1);
  });

  it('deletes the active board only after its name is typed', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', ''), board('ops', 'Ops')],
      active: 'ops',
    });

    await user.click(screen.getByTestId('dashboard-board-delete'));
    const dialog = await screen.findByRole('dialog');
    const okButton = within(dialog).getByRole('button', {
      name: 'button.Delete',
    });
    expect(okButton).toBeDisabled();

    await user.type(within(dialog).getByRole('textbox'), 'Op');
    expect(okButton).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), 's');
    expect(okButton).toBeEnabled();
    await user.click(okButton);

    expect(latest.config.boards.map(({ id }) => id)).toEqual(['default']);
    expect(latest.config.active).toBe('default');
  });

  it('keeps the board when the delete dialog is cancelled', async () => {
    const user = userEvent.setup();
    const latest = renderSection({
      boards: [board('default', ''), board('ops', 'Ops')],
      active: 'ops',
    });

    await user.click(screen.getByTestId('dashboard-board-delete'));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Ops');
    await user.keyboard('{Escape}');

    expect(latest.config.boards).toHaveLength(2);
    expect(latest.config.active).toBe('ops');
  });
});
