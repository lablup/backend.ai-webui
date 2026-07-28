/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Contract tests for the route-error boundary's status resolution
 * (FR-3279). `getRouteErrorStatus` decides the boundary's entire behavior:
 *
 *   404          -> Page404
 *   401 / 403    -> forbidden page
 *   other number -> generic unexpected-error notice
 *   undefined    -> the boundary re-throws so `BAIErrorBoundary` keeps
 *                   ownership of generic render/Relay errors
 */
import { getRouteErrorStatus } from './RouteErrorBoundary';
import { describe, expect, it } from 'vitest';

/**
 * Shape-compatible with react-router's internal ErrorResponseImpl, which is
 * what `isRouteErrorResponse` duck-types against (`status` + `statusText` +
 * `internal` + `data`). Loader/action `throw new Response(...)` reaches the
 * boundary wrapped in this shape, NOT as a raw Response.
 */
const routerErrorResponse = (status: number) => ({
  status,
  statusText: '',
  internal: false,
  data: null,
});

describe('getRouteErrorStatus', () => {
  it('recognizes router ErrorResponse values (loader/action throws)', () => {
    expect(getRouteErrorStatus(routerErrorResponse(404))).toBe(404);
    expect(getRouteErrorStatus(routerErrorResponse(401))).toBe(401);
    expect(getRouteErrorStatus(routerErrorResponse(403))).toBe(403);
    expect(getRouteErrorStatus(routerErrorResponse(500))).toBe(500);
  });

  it('recognizes raw Response values (render-time throws)', () => {
    expect(getRouteErrorStatus(new Response(null, { status: 404 }))).toBe(404);
    expect(getRouteErrorStatus(new Response(null, { status: 401 }))).toBe(401);
    expect(getRouteErrorStatus(new Response(null, { status: 403 }))).toBe(403);
    expect(getRouteErrorStatus(new Response(null, { status: 503 }))).toBe(503);
  });

  it.each([
    ['a plain Error', new Error('boom')],
    ['a string', 'boom'],
    ['null', null],
    ['undefined', undefined],
    ['an object without the ErrorResponse shape', { status: 404 }],
  ])('returns undefined for %s (boundary re-throws)', (_label, value) => {
    expect(getRouteErrorStatus(value)).toBeUndefined();
  });
});
