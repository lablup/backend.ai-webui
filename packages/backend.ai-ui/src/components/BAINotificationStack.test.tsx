import BAINotificationStack from './BAINotificationStack';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// The stack's behaviour is ui-common's `NotificationStack` and is tested
// there; this pins what the WebUI adds on top.
describe('BAINotificationStack', () => {
  it('should carry the e2e test id and the ladder hook by default', () => {
    render(
      <BAINotificationStack notifications={[{ key: 'a', title: 'Saved' }]} />,
    );
    const stack = screen.getByTestId('bai-notification-stack');
    expect(stack).toHaveClass(
      'bai-notification-stack',
      'uic-notification-stack',
    );
    expect(stack.querySelector('[data-notification-key="a"]')).not.toBeNull();
    expect(screen.getByTestId('notification-title')).toHaveTextContent('Saved');
  });

  it('should keep a caller test id and class', () => {
    render(
      <BAINotificationStack
        data-testid="custom"
        className="extra"
        notifications={[{ key: 'a', title: 'Saved' }]}
      />,
    );
    expect(screen.getByTestId('custom')).toHaveClass(
      'bai-notification-stack',
      'extra',
    );
  });
});
