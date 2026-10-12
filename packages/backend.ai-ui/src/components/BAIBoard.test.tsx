import BAIBoard, { type BAIBoardItem } from './BAIBoard';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom has no layout: report a four-column width as soon as observed.
class FakeResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: 1000 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});
afterEach(() => vi.unstubAllGlobals());

const items: Array<BAIBoardItem> = [
  { id: 'a', rowSpan: 2, columnSpan: 2, data: { content: <h5>Alpha</h5> } },
  { id: 'b', rowSpan: 2, columnSpan: 2, data: { content: <h5>Beta</h5> } },
];

const shell = (title: string) =>
  screen
    .getByRole('heading', { name: title })
    .closest('.uic-board-item') as HTMLElement;

describe('BAIBoard', () => {
  it('renders each item content inside the board shell', () => {
    const { container } = render(
      <BAIBoard items={items} onItemsChange={() => {}} />,
    );
    expect(container.querySelector('.uic-board')).toHaveClass('bai-board');
    expect(shell('Alpha')).toHaveAttribute('data-board-item-id', 'a');
    expect(shell('Beta')).toHaveAttribute('data-board-item-id', 'b');
  });

  it('renders handles only for movable / resizable, and a border only when bordered', () => {
    const { rerender } = render(
      <BAIBoard items={items} onItemsChange={() => {}} />,
    );
    expect(screen.queryByRole('button', { name: 'Drag handle' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Resize handle' })).toBeNull();
    expect(shell('Alpha')).not.toHaveClass('uic-board-item--bordered');

    rerender(
      <BAIBoard
        items={items}
        movable
        resizable
        bordered
        onItemsChange={() => {}}
      />,
    );
    expect(screen.getAllByRole('button', { name: 'Drag handle' })).toHaveLength(
      2,
    );
    expect(
      screen.getAllByRole('button', { name: 'Resize handle' }),
    ).toHaveLength(2);
    expect(shell('Alpha')).toHaveClass('uic-board-item--bordered');
  });

  it('lets a custom renderItem replace the default content', () => {
    render(
      <BAIBoard
        items={items}
        renderItem={(item) => <h5>Custom {item.id}</h5>}
        onItemsChange={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Custom a' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Alpha' })).toBeNull();
  });

  it('wraps a committed change as { detail } with the items in their new order', async () => {
    const onItemsChange = vi.fn();
    render(<BAIBoard items={items} movable onItemsChange={onItemsChange} />);

    within(shell('Beta')).getByRole('button', { name: 'Drag handle' }).focus();
    await userEvent.keyboard('{Enter}{ArrowLeft}{ArrowLeft}{Enter}');

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    const event = onItemsChange.mock.calls[0][0];
    expect(event.detail.items.map((item: BAIBoardItem) => item.id)).toEqual([
      'b',
      'a',
    ]);
    expect(event.detail.movedItem?.id).toBe('b');
    expect(event.detail.resizedItem).toBeUndefined();
    expect(event.detail.items[0].data).toBe(items[1].data);
  });
});
