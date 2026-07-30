// @vitest-environment jsdom
// The `Client` constructor reads `localStorage` for a cached login session.
import { Client } from './client';
import { ClientConfig } from './client-config';
import { describe, expect, it } from 'vitest';

/**
 * A client whose only meaningful state is the manager version, so the version
 * gates in `_updateSupportList()` can be exercised without a live manager.
 */
function supportsOn(managerVersion: string, feature: string): boolean {
  const client = new Client(
    new ClientConfig('', '', 'http://localhost', 'SESSION'),
    'client-features-test',
  );
  // `supports()` reads the version through `isManagerVersionCompatibleWith`,
  // which every gate in `_updateSupportList` is built on.
  (client as unknown as { _managerVersion: string })._managerVersion =
    managerVersion;
  return client.supports(feature);
}

describe('rbac-entity-scope-filter capability (FR-3406)', () => {
  // `EntityFilter.scopeType` / `scopeId` are "Added in 26.8.0" in the
  // supergraph. Sending them to an older manager fails query validation, which
  // is what broke the RBAC role detail drawer on 26.4.8. 26.8.0rc1 sorts below
  // 26.8.0 under PEP440, so rc builds take the client-side fallback too — the
  // safe direction, and consistent with the neighbouring 26.8.0 gates.
  it.each(['26.4.8', '26.7.9', '26.8.0rc1'])(
    'is off on manager %s',
    (managerVersion) => {
      expect(supportsOn(managerVersion, 'rbac-entity-scope-filter')).toBe(
        false,
      );
    },
  );

  it.each(['26.8.0', '26.9.0'])('is on on manager %s', (managerVersion) => {
    expect(supportsOn(managerVersion, 'rbac-entity-scope-filter')).toBe(true);
  });
});
