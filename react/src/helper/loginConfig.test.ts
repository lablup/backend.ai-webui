/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig, refreshConfigFromToml } from './loginConfig';

describe('refreshConfigFromToml — enableWebMCP', () => {
  it('defaults to true', () => {
    expect(getDefaultLoginConfig().enableWebMCP).toBe(true);
    expect(refreshConfigFromToml({ general: {} }).enableWebMCP).toBe(true);
    expect(refreshConfigFromToml(null).enableWebMCP).toBe(true);
  });

  it('reads [general] enableWebMCP', () => {
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: true } }).enableWebMCP,
    ).toBe(true);
    expect(
      refreshConfigFromToml({ general: { enableWebMCP: false } }).enableWebMCP,
    ).toBe(false);
  });

  it('stays off for a quoted value', () => {
    for (const quoted of ['false', 'true']) {
      expect(
        refreshConfigFromToml({ general: { enableWebMCP: quoted } })
          .enableWebMCP,
      ).toBe(false);
    }
  });
});
