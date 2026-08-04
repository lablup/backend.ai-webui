/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useBAINotificationEffect,
  useBAINotificationState,
} from '../useBAINotification';
import { act, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import React from 'react';

vi.mock('..', () => ({
  useWebUINavigate: () => vi.fn(),
}));

vi.mock('../useBAISetting', () => ({
  useBAISettingUserState: () => [false, vi.fn()],
}));

vi.mock('../../helper', () => ({
  listenToBackgroundTask: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../../components/BAINodeNotificationItem', () => ({
  default: () => <div>node-item</div>,
}));
vi.mock('../../components/BAIMultiStepNotificationItem', () => ({
  default: () => <div>multistep-item</div>,
}));
vi.mock('../../components/BAIGeneralNotificationItem', () => ({
  default: ({ notification }: any) => (
    <div data-testid={`general-item-${notification.key}`}>
      {String(notification.description ?? '')}
    </div>
  ),
}));

const Effects: React.FC = () => {
  useBAINotificationEffect();
  return null;
};

let latestState: ReturnType<typeof useBAINotificationState>[0] | null = null;
let latestSetters: ReturnType<typeof useBAINotificationState>[1] | null = null;

const StateProbe: React.FC = () => {
  const [notifications, setters] = useBAINotificationState();
  React.useEffect(() => {
    latestState = notifications;
    latestSetters = setters;
  });
  return null;
};

const Harness: React.FC = () => (
  <App>
    <Effects />
    <StateProbe />
  </App>
);

const getOpen = (key: string) => latestState?.find((n) => n.key === key)?.open;

const upsertOpen = (key: string) => {
  act(() => {
    latestSetters?.upsertNotification({
      key,
      description: key,
      open: true,
      duration: 0,
    });
  });
};

describe('useBAINotification antd <-> state sync', () => {
  beforeEach(() => {
    act(() => {
      latestSetters?.clearAllNotifications?.();
    });
  });

  // Regression: since antd 6.5 (rc-notification 2.x),
  // `notification.destroy(key)` no longer fires the notice's `onClose`
  // callback, so closeNotification must flip `open` in the state itself.
  // Otherwise the reactive opener re-shows the closed notification whenever
  // any other notification changes ("zombie re-open").
  it('closeNotification flips state open to false', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(screen.getByTestId('general-item-session-A')).toBeInTheDocument();
    });
    expect(getOpen('session-A')).toBe(true);

    // Same call as BAIComputeSessionNodeNotificationItem's auto-close on
    // TERMINATED/CANCELLED.
    act(() => {
      latestSetters?.closeNotification('session-A');
    });

    await waitFor(() => {
      expect(getOpen('session-A')).toBe(false);
    });
    // It remains in the list (drawer) — only hidden.
    expect(latestState?.some((n) => n.key === 'session-A')).toBe(true);
  });

  it('a closed notification is not re-opened by an unrelated state change', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(screen.getByTestId('general-item-session-A')).toBeInTheDocument();
    });

    act(() => {
      latestSetters?.closeNotification('session-A');
    });
    await waitFor(() => {
      expect(getOpen('session-A')).toBe(false);
    });

    // An unrelated notification appears.
    upsertOpen('other-B');
    await waitFor(() => {
      expect(screen.getByTestId('general-item-other-B')).toBeInTheDocument();
    });

    // session-A must stay closed.
    expect(getOpen('session-A')).toBe(false);
  });

  it('duration-based auto close flips state open to false via onClose', async () => {
    render(<Harness />);

    act(() => {
      latestSetters?.upsertNotification({
        key: 'auto-C',
        description: 'auto C',
        open: true,
        duration: 0.3,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('general-item-auto-C')).toBeInTheDocument();
    });
    expect(getOpen('auto-C')).toBe(true);

    await waitFor(
      () => {
        expect(getOpen('auto-C')).toBe(false);
      },
      { timeout: 3000 },
    );
  });

  it('clearNotification removes the entry from the list', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(screen.getByTestId('general-item-session-A')).toBeInTheDocument();
    });

    act(() => {
      latestSetters?.clearNotification('session-A');
    });

    await waitFor(() => {
      expect(latestState?.some((n) => n.key === 'session-A')).toBe(false);
    });

    // A later unrelated notification must not resurrect it.
    upsertOpen('other-B');
    await waitFor(() => {
      expect(screen.getByTestId('general-item-other-B')).toBeInTheDocument();
    });
    expect(latestState?.some((n) => n.key === 'session-A')).toBe(false);
  });
});
