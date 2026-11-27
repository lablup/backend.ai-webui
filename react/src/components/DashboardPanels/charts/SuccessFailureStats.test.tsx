/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { readSuccessFailure } from '../countAliases';
import { planBuckets } from '../timeRange';
import SuccessFailureStats from './SuccessFailureStats';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('SuccessFailureStats', () => {
  it('draws "-" instead of 0 for a denied total and its delta', () => {
    const denied = {
      ok: false as const,
      errors: [{ extensions: { code: 'user_auth_forbidden' } }],
    };
    const plan = planBuckets('now-1h', Date.parse('2026-11-03T12:05:00Z'));
    const counts = readSuccessFailure(plan, null, {
      liveS0: denied,
      liveF0: denied,
      previousSuccess: denied,
      previousFailure: denied,
    });
    render(<SuccessFailureStats counts={counts} />);
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('0')).toBeNull();
  });
});
