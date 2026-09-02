import BAIOverlayScrollbar from './BAIOverlayScrollbar';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { createRef } from 'react';

/**
 * The shared `matchMedia` mock answers `matches: false` to everything, which is
 * the pointer-FINE branch. The coarse case installs its own mock — and because
 * the component caches the `MediaQueryList` in a module-level singleton (the
 * store contract `useSyncExternalStore` requires), each case runs in its own
 * `vi.resetModules()` import so the cached list is the one it just installed.
 */
const installMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
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

const loadComponent = async (isTouchPrimary: boolean) => {
  vi.resetModules();
  installMatchMedia(isTouchPrimary);
  const mod = await import('./BAIOverlayScrollbar');
  return mod.default;
};

const renderWithTarget = (Component: typeof BAIOverlayScrollbar) => {
  const targetRef = createRef<HTMLDivElement>();
  const result = render(
    <div style={{ position: 'relative' }}>
      <div ref={targetRef} data-testid="target" style={{ overflow: 'auto' }}>
        content
      </div>
      <Component targetRef={targetRef} />
    </div>,
  );
  return { ...result, targetRef };
};

describe('BAIOverlayScrollbar', () => {
  afterEach(() => {
    installMatchMedia(false);
  });

  it('renders the track and opts the target into hiding its native bar on pointer-fine platforms', async () => {
    const Component = await loadComponent(false);
    const { container, targetRef } = renderWithTarget(Component);

    const track = container.querySelector('.bai-overlay-scrollbar');
    expect(track).toBeInTheDocument();
    expect(track).toHaveAttribute('aria-hidden', 'true');
    expect(
      track?.querySelector('.bai-overlay-scrollbar-thumb'),
    ).toBeInTheDocument();
    expect(targetRef.current).toHaveAttribute(
      'data-bai-custom-scrollbar',
      'true',
    );
  });

  it('removes the opt-in attribute on unmount', async () => {
    const Component = await loadComponent(false);
    const { unmount, targetRef } = renderWithTarget(Component);
    const target = targetRef.current;

    unmount();

    expect(target).not.toHaveAttribute('data-bai-custom-scrollbar');
  });

  it('renders nothing and leaves the native indicator alone on touch-primary platforms', async () => {
    const Component = await loadComponent(true);
    const { container, targetRef } = renderWithTarget(Component);

    expect(container.querySelector('.bai-overlay-scrollbar')).toBeNull();
    expect(targetRef.current).not.toHaveAttribute('data-bai-custom-scrollbar');
  });
});
