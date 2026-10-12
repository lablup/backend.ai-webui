import { resolveViewerRole } from './useViewer';

describe('resolveViewerRole', () => {
  it('maps every UserRoleV2 value to the lowercase role', () => {
    expect(resolveViewerRole('USER', null)).toBe('user');
    expect(resolveViewerRole('ADMIN', null)).toBe('admin');
    expect(resolveViewerRole('SUPERADMIN', null)).toBe('superadmin');
    expect(resolveViewerRole('MONITOR', null)).toBe('monitor');
  });

  it('prefers myUserV2 over the encoded role', () => {
    expect(resolveViewerRole('ADMIN', btoa('superadmin'))).toBe('admin');
  });

  it('decodes encoded_user_role when myUserV2 is absent', () => {
    expect(resolveViewerRole(undefined, btoa('superadmin'))).toBe('superadmin');
  });

  it('returns null when neither source carries a role', () => {
    expect(resolveViewerRole(null, null)).toBeNull();
    expect(resolveViewerRole('OWNER', null)).toBeNull();
  });
});
