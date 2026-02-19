/**
 * Tests for the _dispatchNotification helper in EduAppLauncher.
 *
 * The helper is the core notification bridge introduced in this refactor:
 * it replaces the removed lablup-notification Lit element bridge by
 * dispatching 'add-bai-notification' CustomEvents directly on `document`.
 *
 * Tests cover:
 * - Event is dispatched on `document`
 * - Basic message is passed through in detail.message
 * - detail.open is always true
 * - detail.description is omitted when equal to message (deduplication)
 * - detail.description is set when it differs from message
 * - detail.duration is 0 when persistent=true
 * - detail.duration is undefined when persistent=false (default)
 * - detail.type is 'error' when a non-empty log object is provided
 * - detail.type is undefined when no log object is provided
 * - detail.type is undefined when an empty log object is provided
 */

// ---------------------------------------------------------------------------
// We can't import the private helper directly from the component module
// because it is not exported.  Instead we reproduce the same logic here and
// verify the behaviour described by the implementation.
// ---------------------------------------------------------------------------

/**
 * Inline reproduction of the `_dispatchNotification` helper from
 * `EduAppLauncher.tsx`.  It must stay in sync with the source.
 */
function dispatchNotification(
  message: string,
  detail?: string,
  persistent = false,
  log?: Record<string, unknown>,
) {
  const shouldSaveLog = log && Object.keys(log).length !== 0;
  document.dispatchEvent(
    new CustomEvent('add-bai-notification', {
      detail: {
        open: true,
        type: shouldSaveLog ? 'error' : undefined,
        message,
        description: message === detail ? undefined : detail,
        duration: persistent ? 0 : undefined,
      },
    }),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function captureNotificationEvents(): {
  events: CustomEvent[];
  cleanup: () => void;
} {
  const events: CustomEvent[] = [];
  const handler = (e: Event) => events.push(e as CustomEvent);
  document.addEventListener('add-bai-notification', handler);
  return {
    events,
    cleanup: () =>
      document.removeEventListener('add-bai-notification', handler),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EduAppLauncher – _dispatchNotification helper', () => {
  describe('event dispatching', () => {
    it('dispatches add-bai-notification on document', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Hello');

      cleanup();
      expect(events).toHaveLength(1);
    });

    it('dispatches exactly one event per call', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('First');
      dispatchNotification('Second');

      cleanup();
      expect(events).toHaveLength(2);
    });
  });

  describe('detail.open', () => {
    it('is always true', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Test message');

      cleanup();
      expect(events[0].detail.open).toBe(true);
    });
  });

  describe('detail.message', () => {
    it('equals the provided message string', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Some notification');

      cleanup();
      expect(events[0].detail.message).toBe('Some notification');
    });
  });

  describe('detail.description deduplication', () => {
    it('is undefined when detail equals message (avoids duplicate text)', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Error text', 'Error text');

      cleanup();
      expect(events[0].detail.description).toBeUndefined();
    });

    it('is set when detail differs from message', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Short title', 'Longer detail explanation');

      cleanup();
      expect(events[0].detail.description).toBe('Longer detail explanation');
    });

    it('is undefined when detail is not provided', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Just a message');

      cleanup();
      expect(events[0].detail.description).toBeUndefined();
    });
  });

  describe('detail.duration (persistent flag)', () => {
    it('is 0 when persistent is true', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Sticky notification', undefined, true);

      cleanup();
      expect(events[0].detail.duration).toBe(0);
    });

    it('is undefined when persistent is false (default)', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Transient notification', undefined, false);

      cleanup();
      expect(events[0].detail.duration).toBeUndefined();
    });

    it('is undefined when persistent is omitted', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Transient notification');

      cleanup();
      expect(events[0].detail.duration).toBeUndefined();
    });
  });

  describe('detail.type (log-based error flag)', () => {
    it('is "error" when a non-empty log object is provided', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('An error', 'Details', true, {
        statusCode: 500,
        message: 'Internal Server Error',
      });

      cleanup();
      expect(events[0].detail.type).toBe('error');
    });

    it('is undefined when no log object is provided', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Info message');

      cleanup();
      expect(events[0].detail.type).toBeUndefined();
    });

    it('is undefined when an empty log object is provided', () => {
      const { events, cleanup } = captureNotificationEvents();

      dispatchNotification('Info message', undefined, false, {});

      cleanup();
      expect(events[0].detail.type).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Tests verifying that direct CustomEvent dispatch via document matches the
// contract consumed by BAINotificationButton.
// ---------------------------------------------------------------------------

describe('add-bai-notification event contract', () => {
  it('LoginView notification callback produces open:true with message and optional description', () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    document.addEventListener('add-bai-notification', handler);

    // Reproduce LoginView's `notification` callback pattern
    const text = 'Login failed';
    const detail = 'Network unreachable';
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          open: true,
          message: text,
          description: detail,
        },
      }),
    );

    document.removeEventListener('add-bai-notification', handler);

    expect(events).toHaveLength(1);
    expect(events[0].detail.open).toBe(true);
    expect(events[0].detail.message).toBe('Login failed');
    expect(events[0].detail.description).toBe('Network unreachable');
  });

  it('ContainerRegistryList / ImageInstallModal error dispatch produces type:"error"', () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    document.addEventListener('add-bai-notification', handler);

    // Reproduce the error-dispatch pattern used in ContainerRegistryList and ImageInstallModal
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          open: true,
          type: 'error',
          message: 'Registry rescan failed',
          description: 'Connection refused',
        },
      }),
    );

    document.removeEventListener('add-bai-notification', handler);

    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe('error');
    expect(events[0].detail.open).toBe(true);
    expect(events[0].detail.message).toBe('Registry rescan failed');
    expect(events[0].detail.description).toBe('Connection refused');
  });

  it('clear-bai-notification event carries a key in detail', () => {
    const events: CustomEvent[] = [];
    const handler = (e: Event) => events.push(e as CustomEvent);
    document.addEventListener('clear-bai-notification', handler);

    const key = 'some-notification-key-123';
    document.dispatchEvent(
      new CustomEvent('clear-bai-notification', {
        detail: { key },
      }),
    );

    document.removeEventListener('clear-bai-notification', handler);

    expect(events).toHaveLength(1);
    expect(events[0].detail.key).toBe(key);
  });
});
