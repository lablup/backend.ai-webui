/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentStats from './AgentStats';
import { DetailLinkContext } from './DashboardPanels/detailLink';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

vi.mock('react-relay', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-relay')>();
  return {
    ...actual,
    useRefetchableFragment: () => [
      {
        agentStats: { totalResource: { free: {}, used: {}, capacity: {} } },
        aliveAgents: { count: 2 },
        schedulableAgents: { count: 1 },
      },
      vi.fn(),
    ],
  };
});

vi.mock('../hooks/backendai', () => ({
  useResourceSlotsDetails: () => ({ isLoading: true, resourceSlotsInRG: {} }),
}));

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...actual,
    useProjectPath: () => () => '/admin/agent',
  };
});

const CurrentPath = () => (
  <output data-testid="current-path">{useLocation().pathname}</output>
);

const renderAgentStats = (withLink: boolean) =>
  render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <DetailLinkContext.Provider
        value={
          withLink
            ? {
                scope: 'admin',
                feature: 'agent',
                search: '',
                labelKey: 'webui.menu.Resources',
              }
            : null
        }
      >
        <AgentStats queryRef={{} as never} />
      </DetailLinkContext.Provider>
      <Routes>
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>,
  );

describe('AgentStats', () => {
  it('shows the card detail link in its header and opens it', async () => {
    const user = userEvent.setup();
    renderAgentStats(true);

    await user.click(
      screen.getByRole('button', { name: 'dashboard.card.ViewIn' }),
    );

    expect(screen.getByTestId('current-path')).toHaveTextContent(
      '/admin/agent',
    );
  });

  it('shows no detail link outside a card that has one', () => {
    renderAgentStats(false);

    expect(
      screen.queryByRole('button', { name: 'dashboard.card.ViewIn' }),
    ).not.toBeInTheDocument();
  });
});
