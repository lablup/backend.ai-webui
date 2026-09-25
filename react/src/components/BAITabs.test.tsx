/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-4078: BAITabs switches a view in place, so it exposes the WAI-ARIA tabs
 * pattern instead of a `navigation` landmark of plain buttons.
 */
import BAITabs, { baiTabPanelProps } from './BAITabs';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('BAITabs', () => {
  it('renders a tablist whose selected tab controls its own panel', async () => {
    render(
      <BAITabs
        items={[
          { key: 'a', label: 'Alpha', children: <p>alpha body</p> },
          { key: 'b', label: 'Beta', children: <p>beta body</p> },
        ]}
      />,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    const panel = screen.getByRole('tabpanel', { name: 'Alpha' });
    expect(panel).toHaveTextContent('alpha body');
    expect(alpha).toHaveAttribute('aria-controls', panel.id);

    await userEvent.click(screen.getByRole('tab', { name: 'Beta' }));
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel', { name: 'Beta' })).toHaveTextContent(
      'beta body',
    );
  });

  it('points the tabs at a panel the caller renders outside', () => {
    render(
      <>
        <BAITabs
          panelId="sessions-panel"
          activeKey="all"
          items={[
            { key: 'all', label: 'All' },
            { key: 'batch', label: 'Batch' },
          ]}
        />
        <section {...baiTabPanelProps('sessions-panel', 'all')}>list</section>
      </>,
    );

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
      'aria-controls',
      'sessions-panel',
    );
    expect(screen.getByRole('tabpanel', { name: 'All' })).toHaveTextContent(
      'list',
    );
  });

  it('stays a navigation strip when it carries trailing content', () => {
    render(
      <BAITabs
        activeKey="a"
        items={[{ key: 'a', label: 'Alpha' }]}
        tabBarExtraContent={<a href="#invites">Invitations</a>}
      />,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
