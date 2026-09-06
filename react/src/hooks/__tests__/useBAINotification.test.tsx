/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  BAINotificationStackHost,
  useBAINotificationEffect,
  useBAINotificationState,
} from '../useBAINotification';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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
  // BUI's locale module (pulled in via the backend.ai-ui barrel) initializes
  // its own i18next instance at import time.
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../../components/BAINodeNotificationItem', () => ({
  default: () => <div>node-item</div>,
}));
vi.mock('../../components/BAIMultiStepNotificationItem', () => ({
  default: () => <div>multistep-item</div>,
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

// The whole app-side wiring: the background-task effect, the state, and the
// floating stack that renders it. No antd provider — ticket 29 removed the
// last `App.useApp().notification` dependency from this module.
const Harness: React.FC = () => (
  <>
    <Effects />
    <StateProbe />
    <BAINotificationStackHost />
  </>
);

const getOpen = (key: string) => latestState?.find((n) => n.key === key)?.open;

/** The notice as it is actually rendered by the stack, or null when hidden. */
const queryNotice = (key: string) =>
  document.querySelector(`[data-notification-key="${key}"]`);

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

describe('useBAINotification state <-> stack sync', () => {
  beforeEach(() => {
    act(() => {
      latestSetters?.clearAllNotifications?.();
    });
  });

  it('renders an opened notification into the stack', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(queryNotice('session-A')).not.toBeNull();
    });
    expect(screen.getByText('session-A')).toBeInTheDocument();
  });

  // A notification that never asked to be shown belongs to the drawer only —
  // the same distinction antd's imperative opener made with `open === true`.
  it('does not float a notification that was never opened', async () => {
    render(<Harness />);

    act(() => {
      latestSetters?.upsertNotification({
        key: 'drawer-only',
        description: 'drawer only',
      });
    });

    await waitFor(() => {
      expect(latestState?.some((n) => n.key === 'drawer-only')).toBe(true);
    });
    expect(queryNotice('drawer-only')).toBeNull();
  });

  it('closeNotification flips state open to false and unmounts the notice', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(queryNotice('session-A')).not.toBeNull();
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
      expect(queryNotice('session-A')).not.toBeNull();
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
      expect(queryNotice('other-B')).not.toBeNull();
    });

    // session-A must stay closed.
    expect(getOpen('session-A')).toBe(false);
  });

  // `duration: 0` is antd's "stay open", and the value this hook puts on every
  // pending background task — it must never be read as "close immediately".
  it('duration 0 keeps the notice open', async () => {
    render(<Harness />);

    upsertOpen('sticky-D');
    await waitFor(() => {
      expect(queryNotice('sticky-D')).not.toBeNull();
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getOpen('sticky-D')).toBe(true);
  });

  it('duration-based auto close flips state open to false', async () => {
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
      expect(queryNotice('auto-C')).not.toBeNull();
    });
    expect(getOpen('auto-C')).toBe(true);

    await waitFor(
      () => {
        expect(getOpen('auto-C')).toBe(false);
      },
      { timeout: 3000 },
    );
  });

  // Open decision #3: antd paused the countdown on hover, and ticket 29 keeps
  // that behaviour rather than recording it as a loss.
  it('hovering pauses the auto-close countdown and leaving resumes it', async () => {
    render(<Harness />);

    act(() => {
      latestSetters?.upsertNotification({
        key: 'hover-E',
        description: 'hover E',
        open: true,
        duration: 0.3,
      });
    });

    const notice = await waitFor(() => {
      const el = queryNotice('hover-E');
      expect(el).not.toBeNull();
      return el!;
    });

    act(() => {
      fireEvent.mouseEnter(notice);
    });
    expect(notice.getAttribute('data-paused')).toBe('true');

    // Well past the 300ms budget — a running timer would have fired by now.
    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(getOpen('hover-E')).toBe(true);

    act(() => {
      fireEvent.mouseLeave(notice);
    });
    await waitFor(
      () => {
        expect(getOpen('hover-E')).toBe(false);
      },
      { timeout: 3000 },
    );
  });

  it('clearNotification removes the entry from the list', async () => {
    render(<Harness />);

    upsertOpen('session-A');
    await waitFor(() => {
      expect(queryNotice('session-A')).not.toBeNull();
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
      expect(queryNotice('other-B')).not.toBeNull();
    });
    expect(latestState?.some((n) => n.key === 'session-A')).toBe(false);
  });
});
