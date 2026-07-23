/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for DevApiEndpointMismatchAlert (FR-3352).
 *
 * The banner is a dev-only aid: it must appear ONLY when a `VITE_DEFAULT_API_ENDPOINT`
 * override is set AND the backend the client is actually connected to differs
 * from it (after trailing-slash normalization). These tests pin that gating
 * contract at the component level — the three regression conditions the
 * component introduces:
 *   - no override set                     → nothing renders
 *   - override === connected (norm.)      → nothing renders
 *   - override !== connected              → banner shows BOTH endpoints
 *
 * `devApiEndpointOverride` and the connected endpoint are module-level / hook
 * values, so both are mocked and driven per test.
 */
import DevApiEndpointMismatchAlert from './DevApiEndpointMismatchAlert';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mutable state the mocks read from, so each test can drive the two inputs.
const mocks = vi.hoisted(() => ({
  override: undefined as string | undefined,
  connectedEndpoint: '' as string,
}));

// `devApiEndpointOverride` is a build-time-frozen module constant in real code;
// expose it as a getter so the live import binding reflects per-test values.
vi.mock('../helper/devLoginOverrides', () => ({
  get devApiEndpointOverride() {
    return mocks.override;
  },
}));

// The banner only reads `_config.endpoint` off the client.
vi.mock('../hooks', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: { endpoint: mocks.connectedEndpoint },
  }),
}));

afterEach(() => {
  mocks.override = undefined;
  mocks.connectedEndpoint = '';
});

describe('DevApiEndpointMismatchAlert', () => {
  it('renders nothing when no dev override is set', () => {
    mocks.override = undefined;
    mocks.connectedEndpoint = 'https://api.connected';

    const { container } = render(<DevApiEndpointMismatchAlert />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the connected endpoint matches the override (ignoring a trailing slash)', () => {
    mocks.override = 'https://api.same';
    mocks.connectedEndpoint = 'https://api.same/';

    const { container } = render(<DevApiEndpointMismatchAlert />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the connected endpoint is empty', () => {
    mocks.override = 'https://api.configured';
    mocks.connectedEndpoint = '';

    const { container } = render(<DevApiEndpointMismatchAlert />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders both endpoints when the connected backend differs from the override', () => {
    mocks.override = 'https://api.configured';
    mocks.connectedEndpoint = 'https://api.connected';

    render(<DevApiEndpointMismatchAlert />);

    expect(screen.getByText('https://api.connected')).toBeInTheDocument();
    expect(screen.getByText('https://api.configured')).toBeInTheDocument();
  });
});
