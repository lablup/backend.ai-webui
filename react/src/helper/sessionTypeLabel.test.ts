import { getSessionTypeLabel } from './sessionTypeLabel';
import type { TFunction } from 'i18next';

const t = ((key: string) => `t:${key}`) as unknown as TFunction;

describe('getSessionTypeLabel', () => {
  it('translates every session type, in either case', () => {
    expect(getSessionTypeLabel(t, 'interactive')).toBe('t:session.Interactive');
    expect(getSessionTypeLabel(t, 'BATCH')).toBe('t:session.Batch');
    expect(getSessionTypeLabel(t, 'inference')).toBe('t:session.Inference');
    expect(getSessionTypeLabel(t, 'system')).toBe('t:session.System');
  });

  it('falls back to the raw value for an unknown type', () => {
    expect(getSessionTypeLabel(t, 'custom')).toBe('custom');
    expect(getSessionTypeLabel(t, undefined)).toBe('');
  });
});
