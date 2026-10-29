/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  effectivePanelSettings,
  nextOverride,
  overrideKeyOf,
  overriddenSettings,
} from './panelSettingOverrides';
import { describe, expect, it } from 'vitest';

const BOTH = { settings: ['resourceGroup', 'range'] as const };
const RANGE_ONLY = { settings: ['range'] as const };

describe('effectivePanelSettings', () => {
  it('reads the saved settings when nothing is picked in the header', () => {
    expect(
      effectivePanelSettings(
        { resourceGroups: ['a'], range: 'now-7d' },
        undefined,
        BOTH,
      ),
    ).toEqual({ resourceGroups: ['a'], range: 'now-7d' });
    expect(effectivePanelSettings(undefined, undefined, BOTH)).toBeUndefined();
  });

  it('prefers the header pick over the saved setting, field by field', () => {
    expect(
      effectivePanelSettings(
        { resourceGroups: ['a'], range: 'now-7d' },
        { range: 'now-1h' },
        BOTH,
      ),
    ).toEqual({ resourceGroups: ['a'], range: 'now-1h' });
    expect(
      effectivePanelSettings(
        { resourceGroups: ['a'] },
        { resourceGroups: ['c'] },
        BOTH,
      ),
    ).toEqual({ resourceGroups: ['c'] });
  });

  it('reads only the first group of an older multi-group setting', () => {
    expect(
      effectivePanelSettings({ resourceGroups: ['a', 'b'] }, undefined, BOTH),
    ).toEqual({ resourceGroups: ['a'] });
  });

  it('treats an empty resource group pick as the card default', () => {
    expect(
      effectivePanelSettings(
        { resourceGroups: ['a'] },
        { resourceGroups: [] },
        BOTH,
      ),
    ).toBeUndefined();
  });

  it('drops the default range and settings the card does not declare', () => {
    expect(
      effectivePanelSettings(
        { resourceGroups: ['a'] },
        { range: 'now-24h' },
        RANGE_ONLY,
      ),
    ).toBeUndefined();
  });
});

describe('overriddenSettings', () => {
  it('flags only the fields that differ from the saved settings', () => {
    expect(
      overriddenSettings({ range: 'now-7d' }, { range: 'now-1h' }, BOTH),
    ).toEqual({ resourceGroup: false, range: true });
    expect(overriddenSettings(undefined, { range: 'now-24h' }, BOTH)).toEqual({
      resourceGroup: false,
      range: false,
    });
    expect(
      overriddenSettings(
        { resourceGroups: ['a', 'b'] },
        { resourceGroups: ['a'] },
        BOTH,
      ),
    ).toEqual({ resourceGroup: false, range: false });
    expect(
      overriddenSettings(
        { resourceGroups: ['a'] },
        { resourceGroups: ['b'] },
        BOTH,
      ),
    ).toEqual({ resourceGroup: true, range: false });
  });
});

describe('nextOverride', () => {
  it('keeps a pick that differs and drops one equal to the saved setting', () => {
    const picked = nextOverride(
      undefined,
      { resourceGroups: ['b'] },
      { resourceGroups: ['a'] },
      BOTH,
    );
    expect(picked).toEqual({ resourceGroups: ['b'] });
    expect(
      nextOverride(
        picked,
        { range: 'now-1h' },
        { resourceGroups: ['a'] },
        BOTH,
      ),
    ).toEqual({ resourceGroups: ['b'], range: 'now-1h' });
    expect(
      nextOverride(
        picked,
        { resourceGroups: ['a'] },
        { resourceGroups: ['a'] },
        BOTH,
      ),
    ).toBeUndefined();
  });
});

describe('overrideKeyOf', () => {
  it('keeps the same card on two boards apart', () => {
    expect(overrideKeyOf('board-1', 'myResource')).not.toBe(
      overrideKeyOf('board-2', 'myResource'),
    );
  });
});
