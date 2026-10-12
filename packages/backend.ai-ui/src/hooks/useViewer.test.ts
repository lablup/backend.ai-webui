import { resolveViewerRole } from './useViewer';

describe('resolveViewerRole', () => {
  it('maps every UserRoleV2 value to the lowercase role', () => {
    expect(resolveViewerRole('USER')).toBe('user');
    expect(resolveViewerRole('ADMIN')).toBe('admin');
    expect(resolveViewerRole('SUPERADMIN')).toBe('superadmin');
    expect(resolveViewerRole('MONITOR')).toBe('monitor');
  });

  it('returns null for a missing or unknown role', () => {
    expect(resolveViewerRole(null)).toBeNull();
    expect(resolveViewerRole(undefined)).toBeNull();
    expect(resolveViewerRole('OWNER')).toBeNull();
  });
});
