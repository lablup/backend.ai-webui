import BAIBoard, { type BAIBoardItem } from './BAIBoard';
import BAIBoardItemTitle from './BAIBoardItemTitle';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

  it('renders a BAIBoardItemTitle in the content as the item title row', () => {
    render(
      <BAIBoard
        items={[
          {
            id: 'a',
            rowSpan: 2,
            columnSpan: 2,
            data: {
              content: (
                <>
                  <BAIBoardItemTitle title="Alpha" />
                  <p>Body</p>
                  <BAIBoardItemTitle title="Section" inline />
                </>
              ),
            },
          },
        ]}
        onItemsChange={() => {}}
      />,
    );
    const item = shell('Alpha');
    const header = item.querySelector('.uic-board-item__header')!;
    const content = item.querySelector('.uic-board-item__content')!;
    expect(
      within(header as HTMLElement).getByRole('heading'),
    ).toHaveTextContent('Alpha');
    expect(content).toHaveTextContent('Body');
    expect(content).toHaveTextContent('Section');
    expect(header).not.toHaveTextContent('Section');
  });

  it('passes an item with its own title and description through', () => {
    render(
      <BAIBoard
        items={[{ id: 'a', title: 'Own', description: 'Text', data: {} }]}
        onItemsChange={() => {}}
      />,
    );
    expect(shell('Own')).toHaveTextContent('Text');
  });

  it('keeps one title row and reports no title nodes over repeated moves', async () => {
    const reported: Array<ReadonlyArray<BAIBoardItem>> = [];
    const Controlled = () => {
      const [state, setState] = useState(
        items.map((item) => ({
          ...item,
          data: {
            content: (
              <BAIBoardItemTitle title={item.id === 'a' ? 'Alpha' : 'Beta'} />
            ),
          },
        })),
      );
      return (
        <BAIBoard
          items={state}
          movable
          onItemsChange={({ detail }) => {
            reported.push(detail.items);
            setState([...detail.items]);
          }}
        />
      );
    };
    render(<Controlled />);
    for (let i = 0; i < 3; i++) {
      within(shell('Beta'))
        .getByRole('button', { name: 'Drag handle' })
        .focus();
      await userEvent.keyboard('{Enter}{ArrowLeft}{ArrowLeft}{Enter}');
      within(shell('Beta'))
        .getByRole('button', { name: 'Drag handle' })
        .focus();
      await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}');
    }
    expect(reported.length).toBeGreaterThanOrEqual(2);
    for (const reportedItems of reported) {
      for (const item of reportedItems) {
        expect(item).not.toHaveProperty('title');
        expect(item).not.toHaveProperty('description');
      }
    }
    expect(
      shell('Beta').querySelectorAll('.uic-board-item-title'),
    ).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: 'Beta' })).toHaveLength(1);
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
