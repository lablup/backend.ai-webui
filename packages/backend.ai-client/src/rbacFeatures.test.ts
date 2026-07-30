// @vitest-environment jsdom
// The `Client` constructor reads `localStorage` for a cached login session.
import { Client } from './client';
import { ClientConfig } from './client-config';
import { describe, expect, it } from 'vitest';

/**
 * A client whose only meaningful state is the manager version, so
 * `_updateSupportList()` can be exercised without a live manager.
 */
function clientOnManagerVersion(managerVersion: string): Client {
  const client = new Client(
    new ClientConfig('', '', 'http://localhost', 'SESSION'),
    'rbac-feature-test',
  );
  // `supports()` reads the version through `isManagerVersionCompatibleWith`,
  // which is what the version gates in `_updateSupportList` are built on.
  (client as unknown as { _managerVersion: string })._managerVersion =
    managerVersion;
  return client;
}

describe('rbac-entity-scope-filter capability (FR-3406)', () => {
  // `EntityFilter.scopeType` / `scopeId` are "Added in 26.8.0" in the
  // supergraph. Sending them to an older manager fails query validation, which
  // is what broke the RBAC role detail drawer on 26.4.8.
  it.each(['26.4.3', '26.4.4', '26.4.8', '26.7.0', '26.7.9'])(
    'is off on manager %s',
    (managerVersion) => {
      expect(
        clientOnManagerVersion(managerVersion).supports(
          'rbac-entity-scope-filter',
        ),
      ).toBe(false);
    },
  );

  it.each(['26.8.0', '26.8.1', '26.9.0'])(
    'is on on manager %s',
    (managerVersion) => {
      expect(
        clientOnManagerVersion(managerVersion).supports(
          'rbac-entity-scope-filter',
        ),
      ).toBe(true);
    },
  );

  it('stays off on 26.8.0 release candidates', () => {
    // PEP440 sorts 26.8.0rcN below 26.8.0, so rc builds fall on the "no
    // server-side scope filter" side of the stable gate. That is the safe
    // direction — the client-side fallback works against every manager — and it
    // matches how the neighbouring 26.8.0 capabilities behave. Pin the gate to
    // an rc tag if an rc build ever needs the server-side path.
    expect(
      clientOnManagerVersion('26.8.0rc1').supports('rbac-entity-scope-filter'),
    ).toBe(false);
  });
});
