import { useBAIBreakpoint } from './breakpoints';
import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * matchMedia mock with a mutable viewport width: `matches` follows the query,
 * and crossing a boundary fires that list's 'change' listeners — the part of
 * the real MediaQueryList the store subscribes to.
 */
type MockMQL = {
  matches: boolean;
  media: string;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
};

let viewportWidth = 1600;
const mockLists: Array<
  MockMQL & { listeners: Set<() => void>; evaluate: () => boolean }
> = [];

function evaluateQuery(query: string, width: number): boolean {
  const min = query.match(/min-width:\s*([\d.]+)px/);
  if (min) return width >= parseFloat(min[1]);
  const max = query.match(/max-width:\s*([\d.]+)px/);
  if (max) return width <= parseFloat(max[1]);
  throw new Error(`unsupported query: ${query}`);
}

function setViewportWidth(width: number) {
  viewportWidth = width;
  mockLists.forEach((list) => {
    const next = list.evaluate();
    if (next !== list.matches) {
      list.matches = next;
      list.listeners.forEach((cb) => cb());
    }
  });
}

beforeAll(() => {
  window.matchMedia = ((query: string) => {
    const listeners = new Set<() => void>();
    const list = {
      media: query,
      matches: evaluateQuery(query, viewportWidth),
      evaluate: () => evaluateQuery(query, viewportWidth),
      listeners,
      addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_type: string, cb: () => void) =>
        listeners.delete(cb),
    };
    mockLists.push(list);
    return list;
  }) as typeof window.matchMedia;
});

const Probe: React.FC<{ id: string }> = ({ id }) => {
  const { xl } = useBAIBreakpoint();
  return <span data-testid={id}>{xl ? 'xl' : 'not-xl'}</span>;
};

describe('useBAIBreakpoint', () => {
  it('reflects the current viewport on first render', () => {
    act(() => setViewportWidth(1600));
    render(<Probe id="first" />);
    expect(screen.getByTestId('first')).toHaveTextContent('xl');
  });

  // FR-3606: with a per-subscriber handler comparing against the shared
  // cache, only the FIRST subscriber was notified per flip — every other
  // component kept the stale snapshot until reload.
  it('notifies every subscriber when a breakpoint flips', () => {
    act(() => setViewportWidth(1600));
    render(
      <>
        <Probe id="a" />
        <Probe id="b" />
        <Probe id="c" />
      </>,
    );
    act(() => setViewportWidth(1000));
    expect(screen.getByTestId('a')).toHaveTextContent('not-xl');
    expect(screen.getByTestId('b')).toHaveTextContent('not-xl');
    expect(screen.getByTestId('c')).toHaveTextContent('not-xl');

    act(() => setViewportWidth(1600));
    expect(screen.getByTestId('a')).toHaveTextContent('xl');
    expect(screen.getByTestId('b')).toHaveTextContent('xl');
    expect(screen.getByTestId('c')).toHaveTextContent('xl');
  });
});
