import BAIRouteNodes from './BAIRouteNodes';
import { render, screen } from '@testing-library/react';

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useFragment: (_fragment: unknown, ref: unknown) => ref,
}));

vi.mock('../provider/BAIClientProvider/hooks/useConnectedBAIClient', () => ({
  default: () => ({ supports: () => true }),
}));

const route = (localId: string, status: string, healthStatus: string) => ({
  id: btoa(`Route:${localId}`),
  status,
  healthStatus,
  trafficRatio: 1,
  createdAt: '2026-09-18T00:00:00Z',
  errorData: null,
  session: null,
  trafficStatus: 'ACTIVE',
});

const renderRoutes = (routes: Array<ReturnType<typeof route>>) =>
  render(<BAIRouteNodes routesFrgmt={routes as never} />);

const badgeOf = (text: string) =>
  screen.getByText(text).closest('.astryx-badge');

describe('BAIRouteNodes', () => {
  // Regression: a hex colour string was passed where a colour name was
  // expected, so every status fell through to the neutral variant.
  it('paints RUNNING and HEALTHY with the success variant', () => {
    renderRoutes([route('route-1', 'RUNNING', 'HEALTHY')]);

    expect(badgeOf('RUNNING')).toHaveAttribute('data-variant', 'success');
    expect(badgeOf('HEALTHY')).toHaveAttribute('data-variant', 'success');
  });

  it('maps the other route states through the route lookup', () => {
    renderRoutes([route('route-2', 'FAILED_TO_START', 'UNHEALTHY')]);

    expect(badgeOf('FAILED_TO_START')).toHaveAttribute('data-variant', 'error');
    expect(badgeOf('UNHEALTHY')).toHaveAttribute('data-variant', 'warning');
  });
});
