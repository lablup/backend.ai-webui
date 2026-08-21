import BAIAppShell from './BAIAppShell';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

/**
 * The shared `matchMedia` mock answers `matches: false` to everything, which
 * puts AppShell above its `md` breakpoint — the inline-rail layout. The drawer
 * is only mounted BELOW the breakpoint (and only when a `sideNav` exists, which
 * is what turns AppShell's mobile nav on), so the drawer cases install a mock
 * that matches the `(max-width: …)` query instead.
 */
const setViewportIsMobile = (isMobile: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile && query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const drawerProps = {
  'data-testid': 'drawer',
  label: 'Menu',
  header: <span data-testid="brand">Backend.AI</span>,
  children: <div data-testid="drawer-nav">nav</div>,
};

describe('BAIAppShell', () => {
  afterEach(() => {
    setViewportIsMobile(false);
  });

  it('renders the children, banner and sideNav slots', () => {
    setViewportIsMobile(false);
    render(
      <BAIAppShell
        data-testid="app-shell"
        banner={<div data-testid="banner">banner</div>}
        sideNav={<div data-testid="side-nav">nav</div>}
      >
        <div data-testid="content">content</div>
      </BAIAppShell>,
    );

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByTestId('side-nav')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders no drawer when `drawer` is omitted', () => {
    setViewportIsMobile(true);
    render(
      <BAIAppShell
        data-testid="app-shell"
        sideNav={<div data-testid="side-nav">nav</div>}
      >
        <div>content</div>
      </BAIAppShell>,
    );

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('mounts the drawer with the brand band and the nav surface', () => {
    setViewportIsMobile(true);
    render(
      <BAIAppShell sideNav={<div>rail</div>} drawer={drawerProps}>
        <div>content</div>
      </BAIAppShell>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveClass('bai-app-shell-drawer');
    expect(
      drawer.querySelector('.bai-app-shell-drawer-brand'),
    ).toBeInTheDocument();
    expect(drawer.querySelector('.bai-nav-surface')).toBeInTheDocument();
    expect(screen.getByTestId('brand')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-nav')).toBeInTheDocument();
  });

  it('applies the host `wrap` to the drawer element', () => {
    setViewportIsMobile(true);
    render(
      <BAIAppShell
        sideNav={<div>rail</div>}
        drawer={{
          ...drawerProps,
          wrap: (d) => <div data-testid="drawer-wrapper">{d}</div>,
        }}
      >
        <div>content</div>
      </BAIAppShell>,
    );

    expect(screen.getByTestId('drawer-wrapper')).toContainElement(
      screen.getByTestId('drawer'),
    );
  });

  it('keeps the drawer mounted across a pathname change', () => {
    // jsdom has no top-layer semantics for the `showModal()` MobileNav drives,
    // so the OPEN state is not observable here — what is, is that the
    // adjust-during-render close re-renders cleanly.
    setViewportIsMobile(true);
    const { rerender } = render(
      <BAIAppShell sideNav={<div>rail</div>} pathname="/a" drawer={drawerProps}>
        <div>content</div>
      </BAIAppShell>,
    );

    expect(screen.getByTestId('drawer')).toBeInTheDocument();

    rerender(
      <BAIAppShell sideNav={<div>rail</div>} pathname="/b" drawer={drawerProps}>
        <div>content</div>
      </BAIAppShell>,
    );

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });
});
