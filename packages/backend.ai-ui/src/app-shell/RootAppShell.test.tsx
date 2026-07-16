import { RootAppShell, type RootAppShellMenuItem } from './RootAppShell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const menus: RootAppShellMenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'workflows', label: 'Workflows', group: 'Main' },
  { key: 'experiments', label: 'Experiments', group: 'MLOps' },
];

describe('<RootAppShell />', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders all menu items', () => {
    render(
      <RootAppShell menus={menus}>
        <div>page content</div>
      </RootAppShell>,
    );
    expect(
      screen.getByRole('menuitem', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Workflows' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Experiments' }),
    ).toBeInTheDocument();
  });

  it('renders the children in the content slot', () => {
    render(
      <RootAppShell menus={menus}>
        <div data-testid="page">page content</div>
      </RootAppShell>,
    );
    expect(screen.getByTestId('page')).toHaveTextContent('page content');
  });

  it('selects the first menu item by default (uncontrolled)', () => {
    render(
      <RootAppShell menus={menus}>
        <div />
      </RootAppShell>,
    );
    const selected = screen.getByRole('menuitem', { name: 'Dashboard' });
    expect(selected.className).toMatch(/selected/);
  });

  it('honors defaultSelectedKey when uncontrolled', () => {
    render(
      <RootAppShell menus={menus} defaultSelectedKey="workflows">
        <div />
      </RootAppShell>,
    );
    const selected = screen.getByRole('menuitem', { name: 'Workflows' });
    expect(selected.className).toMatch(/selected/);
  });

  it('calls onSelect when a menu item is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <RootAppShell menus={menus} onSelect={onSelect}>
        <div />
      </RootAppShell>,
    );
    await user.click(screen.getByRole('menuitem', { name: 'Workflows' }));
    expect(onSelect).toHaveBeenCalledWith('workflows');
  });

  it('respects controlled selectedKey (parent owns the state)', () => {
    render(
      <RootAppShell menus={menus} selectedKey="experiments">
        <div />
      </RootAppShell>,
    );
    const selected = screen.getByRole('menuitem', { name: 'Experiments' });
    expect(selected.className).toMatch(/selected/);
  });
});
