import BAINotificationStack from './BAINotificationStack';
import type { BAINotificationStackItem } from './BAINotificationStack';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const items = (count: number): Array<BAINotificationStackItem> =>
  Array.from({ length: count }, (_, i) => ({
    key: `n${i}`,
    title: `Notice ${i}`,
  }));

const renderedKeys = () =>
  Array.from(
    screen
      .getByTestId('bai-notification-stack')
      .querySelectorAll('[data-notification-key]'),
  ).map((el) => el.getAttribute('data-notification-key'));

describe('BAINotificationStack', () => {
  it('should render every notice when maxVisible is unset', () => {
    render(<BAINotificationStack notifications={items(5)} />);
    expect(renderedKeys()).toEqual(['n0', 'n1', 'n2', 'n3', 'n4']);
  });

  it('should keep only the newest notices when maxVisible is set', () => {
    render(<BAINotificationStack notifications={items(5)} maxVisible={3} />);
    expect(renderedKeys()).toEqual(['n2', 'n3', 'n4']);
  });

  // FR-3829: the scroll cap sits on an inner wrapper, never on the item —
  // `bai-notification-exit` animates the item's own `max-height`.
  it('should wrap an oversized description in the scrollable body', () => {
    render(
      <BAINotificationStack
        notifications={[
          { key: 'e', title: 'Failed', description: 'x'.repeat(5000) },
        ]}
      />,
    );
    const description = screen.getByTestId('notification-description');
    expect(description.closest('.bai-notification-stack-item__body')).not.toBe(
      null,
    );
    expect(
      document.querySelector('.bai-notification-stack-item'),
    ).not.toHaveClass('bai-notification-stack-item__body');
  });

  it('should not render the scrollable body when there is nothing to scroll', () => {
    render(<BAINotificationStack notifications={[{ key: 'a', title: 'A' }]} />);
    expect(
      document.querySelector('.bai-notification-stack-item__body'),
    ).toBeNull();
  });

  // FR-3829: exit bookkeeping runs over the visible slice, so a notice closed
  // while hidden behind `maxVisible` never animates into the corner.
  it('should not surface a hidden notice that is closed', () => {
    const five = items(5);
    const { rerender } = render(
      <BAINotificationStack notifications={five} maxVisible={3} />,
    );
    expect(renderedKeys()).toEqual(['n2', 'n3', 'n4']);

    // Close `n0`, which was never on screen.
    rerender(
      <BAINotificationStack
        notifications={five.filter((n) => n.key !== 'n0')}
        maxVisible={3}
      />,
    );
    expect(renderedKeys()).toEqual(['n2', 'n3', 'n4']);
  });

  it('should keep the dismiss control mounted for an oversized notice', async () => {
    const onClose = vi.fn();
    render(
      <BAINotificationStack
        notifications={[
          { key: 'e', title: 'Failed', description: 'x'.repeat(5000) },
        ]}
        onClose={onClose}
      />,
    );
    const { default: userEvent } = await import('@testing-library/user-event');
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledWith('e');
  });
});
