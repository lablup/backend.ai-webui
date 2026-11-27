/**
 * Pins the resolution WEBUIHelpButton used to do inline, before FR-3773 moved
 * the two lookup tables into `helpAnchors.json`.
 */
import { helpAnchors, resolveHelpDocPath } from './helpAnchors';
import { describe, expect, it } from 'vitest';

describe('resolveHelpDocPath', () => {
  it('maps a route to its manual page', () => {
    expect(resolveHelpDocPath('session')).toBe('sessions_all.html');
    expect(resolveHelpDocPath('')).toBe('dashboard.html');
  });

  it('appends the anchor when the entry has one', () => {
    expect(resolveHelpDocPath('scheduler')).toBe(
      'admin_menu.html#fair-share-scheduler',
    );
  });

  it('prefers a tab-specific section over the page default', () => {
    expect(resolveHelpDocPath('agent', 'storages')).toBe(
      'admin_menu.html#storages',
    );
    expect(resolveHelpDocPath('credential', 'credentials')).toBe(
      'admin_menu.html#manage-users-keypairs',
    );
  });

  it('falls back to the page default for an unmapped tab', () => {
    expect(resolveHelpDocPath('credential', 'no-such-tab')).toBe(
      'project_admin.html#users',
    );
  });

  it('prefers the entry for the route scope over the unscoped one', () => {
    expect(resolveHelpDocPath('admin-dashboard', null, 'projectAdmin')).toBe(
      'project_admin.html#project-admin-dashboard',
    );
    expect(resolveHelpDocPath('admin-dashboard', null, 'admin')).toBe(
      'admin_menu.html#admin-dashboard',
    );
    expect(resolveHelpDocPath('admin-dashboard')).toBe(
      'admin_menu.html#admin-dashboard',
    );
  });

  it('falls back to the unscoped entry when the scope has none', () => {
    expect(resolveHelpDocPath('scheduler', null, 'admin')).toBe(
      'admin_menu.html#fair-share-scheduler',
    );
    expect(resolveHelpDocPath('agent', 'storages', 'admin')).toBe(
      'admin_menu.html#storages',
    );
  });

  it('returns an empty path for an unmapped route', () => {
    expect(resolveHelpDocPath('no-such-route')).toBe('');
    expect(resolveHelpDocPath('no-such-route', 'no-such-tab')).toBe('');
  });
});

describe('helpAnchors data', () => {
  it('has no duplicate route/tab keys', () => {
    const keys = helpAnchors.map(
      (entry) => `${entry.scope ?? ''} ${entry.path} ${entry.tab ?? ''}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('names every docPage as an .html page slug', () => {
    for (const entry of helpAnchors) {
      expect(entry.docPage).toMatch(/^[a-z0-9_-]+\.html$/);
      expect(entry.anchor ?? '').not.toContain('#');
    }
  });
});
