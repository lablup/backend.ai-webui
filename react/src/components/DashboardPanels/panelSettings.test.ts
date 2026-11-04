/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { needsDeploymentDetails } from './memberCards/DeploymentHealthTable';
import {
  describePanelSettings,
  formatWindowLabel,
  isStoredRange,
  mergeSettings,
  sanitizeColumnOverrides,
  sanitizePanelSettings,
} from './panelSettings';
import { MAX_WINDOW_DAYS, windowRange } from './timeRange';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useRouteScope', () => ({
  useProjectPath: () => () => '',
}));

describe('sanitizePanelSettings column overrides', () => {
  const tableCard = { settings: [], columnSettings: true };

  it('keeps well-typed overrides on a card with column settings', () => {
    expect(
      sanitizePanelSettings(
        {
          columnOverrides: {
            owner: { hidden: false, width: 120, order: 2 },
            status: { hidden: true },
          },
        },
        tableCard,
      ),
    ).toEqual({
      columnOverrides: {
        owner: { hidden: false, width: 120, order: 2 },
        status: { hidden: true },
      },
    });
  });

  it('drops overrides on a card without column settings', () => {
    expect(
      sanitizePanelSettings(
        { columnOverrides: { owner: { hidden: false } } },
        { settings: [] },
      ),
    ).toBeUndefined();
  });

  it('drops malformed entries and fields', () => {
    expect(
      sanitizeColumnOverrides({
        owner: { hidden: 'yes', width: -3, order: Number.NaN },
        model: null,
        labels: { hidden: false, extra: 1 },
      }),
    ).toEqual({ labels: { hidden: false } });
    expect(sanitizeColumnOverrides(['owner'])).toBeUndefined();
    expect(sanitizeColumnOverrides({ owner: {} })).toBeUndefined();
  });
});

describe('mergeSettings', () => {
  it('keeps the other fields and removes an undefined one', () => {
    expect(
      mergeSettings(
        { range: 'now-1h', columnOverrides: { owner: { hidden: false } } },
        { columnOverrides: undefined },
      ),
    ).toEqual({ range: 'now-1h' });
    expect(mergeSettings(undefined, { columnOverrides: undefined })).toBe(
      undefined,
    );
  });
});

describe('needsDeploymentDetails', () => {
  it('is true only when a detail column is turned on', () => {
    expect(needsDeploymentDetails(undefined)).toBe(false);
    expect(needsDeploymentDetails({ createdAt: { hidden: false } })).toBe(
      false,
    );
    expect(needsDeploymentDetails({ owner: { hidden: true } })).toBe(false);
    expect(needsDeploymentDetails({ owner: { hidden: false } })).toBe(true);
  });
});

const t = ((key: string) => key) as unknown as TFunction;
const RANGE = { settings: ['range'] as const };
const at = (local: string) => new Date(local).toISOString();
const WINDOW = {
  after: at('2026-10-29T09:39:00'),
  before: at('2026-10-30T09:39:00'),
};

describe('range settings', () => {
  it('keeps a preset or a well-formed fixed window', () => {
    expect(sanitizePanelSettings({ range: 'now-7d' }, RANGE)).toEqual({
      range: 'now-7d',
    });
    const range = windowRange(WINDOW);
    expect(isStoredRange(range)).toBe(true);
    expect(sanitizePanelSettings({ range }, RANGE)).toEqual({ range });
  });

  it('drops a malformed, reversed or too long window, so the card reads the default', () => {
    const reversed = `${WINDOW.before}/${WINDOW.after}`;
    const tooLong = windowRange({
      after: dayjs(WINDOW.before)
        .subtract(MAX_WINDOW_DAYS + 1, 'day')
        .toISOString(),
      before: WINDOW.before,
    });
    for (const range of [reversed, tooLong, 'now-3y', 'yesterday', 7]) {
      expect(sanitizePanelSettings({ range }, RANGE)).toBeUndefined();
    }
  });

  it('drops a custom range longer than the card cap, and keeps it under the global cap', () => {
    const eightDays = windowRange({
      after: dayjs(WINDOW.before).subtract(8, 'day').toISOString(),
      before: WINDOW.before,
    });
    expect(
      sanitizePanelSettings(
        { range: eightDays },
        { ...RANGE, maxRangeDays: 7 },
      ),
    ).toBeUndefined();
    expect(
      sanitizePanelSettings({ range: 'now-7d' }, { ...RANGE, maxRangeDays: 7 }),
    ).toEqual({ range: 'now-7d' });
    expect(sanitizePanelSettings({ range: eightDays }, RANGE)).toEqual({
      range: eightDays,
    });
  });

  it('labels a fixed window compactly and describes it in the sider', () => {
    const range = windowRange(WINDOW);
    expect(formatWindowLabel(range)).toBe('Oct 29 09:39 - Oct 30 09:39');
    expect(formatWindowLabel('now-24h')).toBeUndefined();
    expect(describePanelSettings({ range }, t)).toBe(
      'Oct 29 09:39 - Oct 30 09:39',
    );
    expect(describePanelSettings({ range: 'now-1h' }, t)).toBe(
      'dashboard.settings.Last1Hour',
    );
  });
});
