import { resolveCSVExportRoute } from './useCSVExport';
import { describe, expect, it } from 'vitest';

const resolve = (
  overrides: Partial<Parameters<typeof resolveCSVExportRoute>[0]> = {},
) =>
  resolveCSVExportRoute({
    nodeKey: 'sessions',
    scope: 'admin',
    userRole: 'user',
    supportsExportCSV: true,
    supportsMySessionsExport: true,
    ...overrides,
  });

describe('resolveCSVExportRoute', () => {
  it('keeps a superadmin on the admin route regardless of the requested scope', () => {
    expect(resolve({ userRole: 'superadmin' })).toBe('admin');
    expect(resolve({ userRole: 'superadmin', scope: 'my' })).toBe('admin');
    expect(resolve({ userRole: 'superadmin', nodeKey: 'users' })).toBe('admin');
  });

  it('routes a non-superadmin asking for the personal scope to the my route', () => {
    expect(resolve({ scope: 'my' })).toBe('my');
    expect(resolve({ scope: 'my', userRole: 'admin' })).toBe('my');
  });

  it('gives a non-superadmin no route without the personal scope', () => {
    expect(resolve({ userRole: 'admin' })).toBe('none');
    expect(resolve({ userRole: undefined })).toBe('none');
  });

  it('offers the personal scope for sessions only', () => {
    expect(resolve({ scope: 'my', nodeKey: 'users' })).toBe('none');
    expect(resolve({ scope: 'my', nodeKey: 'audit-logs' })).toBe('none');
  });

  it('falls back to no route on managers without the matching feature', () => {
    expect(resolve({ scope: 'my', supportsMySessionsExport: false })).toBe(
      'none',
    );
    expect(resolve({ userRole: 'superadmin', supportsExportCSV: false })).toBe(
      'none',
    );
  });
});
