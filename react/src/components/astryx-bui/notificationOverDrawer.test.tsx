/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3607: an app launched from the session detail drawer must show its
 launch-progress notice. A scrimmed drawer used to open with `showModal()`,
 whose top layer painted over the fixed notification stack — the notice
 existed in state but was invisible behind the drawer panel, and inert. The
 FR-3585 portal keeps the drawer out of the top layer (`show()`), and the z
 ladder keeps `notification` above the whole modal band; this suite pins the
 notice-over-open-drawer arrangement the launch flow depends on.

 NOTE: `setupTests` polyfills showModal/show/close, so a `showModal()` would
 not fail on its own — the two calls are spied on explicitly, as in
 `BAIDrawerPortal.test.tsx`.
*/
import {
  BAINotificationStackHost,
  useBAINotificationEffect,
  useBAINotificationState,
} from '../../hooks/useBAINotification';
import BAIDrawerAstryx from './BAIDrawerAstryx';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('../../hooks', () => ({
  useWebUINavigate: () => vi.fn(),
}));
vi.mock('../../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [false, vi.fn()],
}));
vi.mock('../../helper', () => ({
  listenToBackgroundTask: vi.fn(),
}));
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});
vi.mock('../BAINodeNotificationItem', () => ({
  default: () => <div>node-item</div>,
}));
vi.mock('../BAIMultiStepNotificationItem', () => ({
  default: () => <div>multistep-item</div>,
}));

let latestSetters: ReturnType<typeof useBAINotificationState>[1] | null = null;

const Effects: React.FC = () => {
  useBAINotificationEffect();
  return null;
};

const SettersProbe: React.FC = () => {
  const [, setters] = useBAINotificationState();
  React.useEffect(() => {
    latestSetters = setters;
  });
  return null;
};

// The app arrangement under test: the always-mounted notification host next
// to an open scrimmed drawer (`SessionDetailDrawer`'s shape).
const Harness: React.FC<{ onDrawerClose?: () => void }> = ({
  onDrawerClose,
}) => (
  <>
    <Effects />
    <SettersProbe />
    <BAINotificationStackHost />
    <BAIDrawerAstryx open onClose={onDrawerClose} title="Session Info">
      <span>drawer body</span>
    </BAIDrawerAstryx>
  </>
);

const NOTICE_KEY = 'app-launch-ttyd';

/** `launchAppWithNotification`'s progress upsert, minus the promise. */
const upsertLaunchProgress = () => {
  act(() => {
    latestSetters?.upsertNotification({
      key: NOTICE_KEY,
      message: 'Session: mysession',
      description: 'Preparing Console',
      open: true,
      duration: 0,
      backgroundTask: { status: 'pending', percent: 30 },
      skipDesktopNotification: true,
    });
  });
};

const queryNotice = () =>
  document.querySelector(`[data-notification-key="${NOTICE_KEY}"]`);

describe('FR-3607 — launch notice over an open scrimmed drawer', () => {
  afterEach(() => {
    act(() => {
      latestSetters?.clearAllNotifications?.();
    });
    vi.restoreAllMocks();
  });

  it('the drawer promotes nothing to the top layer that could cover the stack', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const show = vi.spyOn(HTMLDialogElement.prototype, 'show');

    render(<Harness />);

    // `show()` is what keeps the fixed notification stack paintable above the
    // drawer: nothing joins the top layer, so the z ladder decides.
    expect(show).toHaveBeenCalledTimes(1);
    expect(showModal).not.toHaveBeenCalled();
  });

  it('renders a launch-progress notice upserted while the drawer is open', async () => {
    render(<Harness />);
    upsertLaunchProgress();

    await waitFor(() => expect(queryNotice()).not.toBeNull());
    expect(screen.getByTestId('notification-description')).toHaveTextContent(
      'Preparing Console',
    );
    // The determinate launch progress bar the drawer used to hide.
    expect(queryNotice()?.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('keeps the notice interactive: dismiss closes it, the drawer stays open', async () => {
    const onDrawerClose = vi.fn();
    render(<Harness onDrawerClose={onDrawerClose} />);
    upsertLaunchProgress();
    await waitFor(() => expect(queryNotice()).not.toBeNull());

    // With no cancel/retry/action wired, the only button is Banner's dismiss.
    const dismiss = queryNotice()?.querySelector('button');
    expect(dismiss).not.toBeNull();
    await userEvent.click(dismiss as HTMLButtonElement);

    await waitFor(() => expect(queryNotice()).toBeNull());
    expect(onDrawerClose).not.toHaveBeenCalled();
  });
});
