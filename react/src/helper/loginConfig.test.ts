/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig, refreshConfigFromToml } from './loginConfig';

describe('refreshConfigFromToml — enableWebMCP', () => {
  it('defaults to false', () => {
    expect(getDefaultLoginConfig().enableWebMCP).toBe(false);
    expect(refreshConfigFromToml({ general: {} }).enableWebMCP).toBe(false);
    expect(refreshConfigFromToml(null).enableWebMCP).toBe(false);
  });

  it('reads [general] enableWebMCP', () => {
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: true } }).enableWebMCP,
    ).toBe(true);
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: false } }).enableWebMCP,
    ).toBe(false);
  });
});
