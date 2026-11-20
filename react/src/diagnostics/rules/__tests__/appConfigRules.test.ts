/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  APP_CONFIG_FIXTURE,
  analyzeAppConfigFixture,
  checkAppConfigFixture,
  hasAppConfigFixturePurge,
  hasAppConfigFixtureRepair,
  planAppConfigFixtureRepair,
} from '../appConfigRules';
import type {
  RegisteredAppConfigAllowListEntry,
  RegisteredAppConfigDefinition,
} from '../appConfigRules';

const fullDefinitions = (): RegisteredAppConfigDefinition[] =>
  APP_CONFIG_FIXTURE.definitions.map((configName) => ({
    entityId: `def-${configName}`,
    configName,
  }));

const fullAllowList = (): RegisteredAppConfigAllowListEntry[] =>
  APP_CONFIG_FIXTURE.allowList.map((e) => ({
    ...e,
    entityId: `al-${e.configName}-${e.scopeType}`,
  }));

const run = (
  definitions: RegisteredAppConfigDefinition[],
  allowList: RegisteredAppConfigAllowListEntry[],
) => {
  const analysis = analyzeAppConfigFixture(definitions, allowList);
  return {
    analysis,
    results: checkAppConfigFixture(analysis),
    plan: planAppConfigFixtureRepair(analysis),
  };
};

describe('app config fixture check', () => {
  it('passes when the fixture is registered exactly', () => {
    const { results, plan } = run(fullDefinitions(), fullAllowList());
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('app-config-fixture-passed');
    expect(results[0].severity).toBe('passed');
    expect(hasAppConfigFixtureRepair(plan)).toBe(false);
  });

  it('accepts lowercase scope types', () => {
    const allowList = fullAllowList().map((e) => ({
      ...e,
      scopeType: e.scopeType.toLowerCase(),
    }));
    const { results } = run(fullDefinitions(), allowList);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-passed']);
  });

  it('reports everything missing on an empty manager and plans only creates', () => {
    const { results, plan } = run([], []);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-missing']);
    expect(results[0].severity).toBe('critical');
    expect(results[0].remediationKey).toBe(
      'diagnostics.AppConfigFixtureRepairFix',
    );
    expect(results[0].interpolationValues?.items).toBe(
      'userConfig, domainConfig, publicConfigByDomain, userConfig @ domain (200), userConfig @ user (300), domainConfig @ domain (200), publicConfigByDomain @ public (100)',
    );
    expect(plan.createDefinitions).toEqual(APP_CONFIG_FIXTURE.definitions);
    expect(plan.createAllowList).toEqual(APP_CONFIG_FIXTURE.allowList);
    expect(hasAppConfigFixturePurge(plan)).toBe(false);
    expect(plan.updateRanks).toEqual([]);
  });

  it('creates only the missing allow-list entry', () => {
    const allowList = fullAllowList().filter(
      (e) => !(e.configName === 'userConfig' && e.scopeType === 'USER'),
    );
    const { plan } = run(fullDefinitions(), allowList);
    expect(plan.createDefinitions).toEqual([]);
    expect(plan.createAllowList).toEqual([
      { configName: 'userConfig', scopeType: 'USER', rank: 300 },
    ]);
    expect(hasAppConfigFixturePurge(plan)).toBe(false);
  });

  it('corrects a wrong rank in place without purging', () => {
    const allowList = fullAllowList().map((e) =>
      e.configName === 'domainConfig' ? { ...e, rank: 150 } : e,
    );
    const { results, plan } = run(fullDefinitions(), allowList);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-wrong-rank']);
    expect(results[0].interpolationValues?.items).toBe(
      'domainConfig @ domain (150) → 200',
    );
    expect(plan.updateRanks).toEqual([
      { id: 'al-domainConfig-DOMAIN', rank: 200 },
    ]);
    expect(hasAppConfigFixturePurge(plan)).toBe(false);
    expect(plan.createDefinitions).toEqual([]);
    expect(plan.createAllowList).toEqual([]);
  });

  it('purges only a misnamed definition and registers the right one', () => {
    const definitions = fullDefinitions().map((d) =>
      d.configName === 'domainConfig'
        ? { entityId: 'typo', configName: 'ddomainConfig' }
        : d,
    );
    const allowList = fullAllowList().map((e) =>
      e.configName === 'domainConfig'
        ? { ...e, entityId: 'typo-al', configName: 'ddomainConfig' }
        : e,
    );
    const { results, plan } = run(definitions, allowList);
    expect(results.map((r) => r.id)).toEqual([
      'app-config-fixture-missing',
      'app-config-fixture-unexpected',
    ]);
    expect(results[1].interpolationValues?.items).toBe('ddomainConfig');
    expect(results[1].remediationKey).toBe(
      'diagnostics.AppConfigFixtureUnexpectedFix',
    );
    // The misnamed definition's allow-list entry goes with it.
    expect(plan.purgeDefinitions.map((d) => d.entityId)).toEqual(['typo']);
    expect(plan.purgeAllowList).toEqual([]);
    expect(plan.createDefinitions).toEqual(['domainConfig']);
    expect(plan.createAllowList).toEqual([
      { configName: 'domainConfig', scopeType: 'DOMAIN', rank: 200 },
    ]);
  });

  it('purges only an extra scope of a fixture name', () => {
    const { results, plan } = run(fullDefinitions(), [
      ...fullAllowList(),
      {
        entityId: 'extra',
        configName: 'userConfig',
        scopeType: 'PUBLIC',
        rank: 100,
      },
    ]);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-unexpected']);
    expect(results[0].interpolationValues?.items).toBe(
      'userConfig @ public (100)',
    );
    expect(plan.purgeAllowList.map((e) => e.entityId)).toEqual(['extra']);
    expect(plan.purgeDefinitions).toEqual([]);
  });

  it('plans every kind of repair together', () => {
    const allowList = fullAllowList()
      .filter((e) => e.configName !== 'publicConfigByDomain')
      .map((e) =>
        e.configName === 'userConfig' && e.scopeType === 'USER'
          ? { ...e, rank: 1 }
          : e,
      );
    const { results, plan } = run(
      [...fullDefinitions(), { entityId: 'other', configName: 'otherConfig' }],
      allowList,
    );
    expect(results.map((r) => r.id)).toEqual([
      'app-config-fixture-missing',
      'app-config-fixture-wrong-rank',
      'app-config-fixture-unexpected',
    ]);
    expect(plan.createAllowList).toEqual([
      { configName: 'publicConfigByDomain', scopeType: 'PUBLIC', rank: 100 },
    ]);
    expect(plan.updateRanks).toEqual([{ id: 'al-userConfig-USER', rank: 300 }]);
    expect(plan.purgeDefinitions.map((d) => d.entityId)).toEqual(['other']);
  });
});
