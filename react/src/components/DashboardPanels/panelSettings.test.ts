/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { needsDeploymentDetails } from './memberCards/DeploymentHealthTable';
import {
  mergeSettings,
  sanitizeColumnOverrides,
  sanitizePanelSettings,
} from './panelSettings';
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
