/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  APP_CONFIG_FIXTURE,
  analyzeAppConfigFixture,
  checkAppConfigFixture,
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
    plan: planAppConfigFixtureRepair(analysis, definitions, allowList),
  };
};

describe('app config fixture check', () => {
  it('passes when the fixture is registered exactly', () => {
    const { results, plan } = run(fullDefinitions(), fullAllowList());
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('app-config-fixture-passed');
    expect(results[0].severity).toBe('passed');
    expect(plan.mode).toBe('none');
  });

  it('accepts lowercase scope types and ignores unrelated config names', () => {
    const allowList = fullAllowList().map((e) => ({
      ...e,
      scopeType: e.scopeType.toLowerCase(),
    }));
    const { results } = run(
      [...fullDefinitions(), { entityId: 'other', configName: 'otherConfig' }],
      [
        ...allowList,
        {
          entityId: 'other-al',
          configName: 'otherConfig',
          scopeType: 'PUBLIC',
          rank: 1,
        },
      ],
    );
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-passed']);
  });

  it('reports everything missing on an empty manager and plans a create', () => {
    const { results, plan } = run([], []);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-missing']);
    expect(results[0].severity).toBe('warning');
    expect(results[0].remediationKey).toBe(
      'diagnostics.AppConfigFixtureMissingFix',
    );
    expect(results[0].interpolationValues?.items).toBe(
      'userConfig, domainConfig, publicConfigByDomain, userConfig @ domain (200), userConfig @ user (300), domainConfig @ domain (200), publicConfigByDomain @ public (100)',
    );
    expect(plan.mode).toBe('create');
    expect(plan.createDefinitions).toEqual(APP_CONFIG_FIXTURE.definitions);
    expect(plan.createAllowList).toEqual(APP_CONFIG_FIXTURE.allowList);
    expect(plan.purgeDefinitionIds).toEqual([]);
  });

  it('creates only the missing allow-list entry', () => {
    const allowList = fullAllowList().filter(
      (e) => !(e.configName === 'userConfig' && e.scopeType === 'USER'),
    );
    const { plan } = run(fullDefinitions(), allowList);
    expect(plan.mode).toBe('create');
    expect(plan.createDefinitions).toEqual([]);
    expect(plan.createAllowList).toEqual([
      { configName: 'userConfig', scopeType: 'USER', rank: 300 },
    ]);
  });

  it('treats a wrong rank as malformed and plans a reset', () => {
    const allowList = fullAllowList().map((e) =>
      e.configName === 'domainConfig' ? { ...e, rank: 150 } : e,
    );
    const { results, plan } = run(fullDefinitions(), allowList);
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-wrong-rank']);
    expect(results[0].interpolationValues?.items).toBe(
      'domainConfig @ domain (150) → 200',
    );
    expect(plan.mode).toBe('reset');
    expect(plan.purgeDefinitionIds).toHaveLength(3);
    expect(plan.purgeAllowListIds).toHaveLength(4);
    expect(plan.createDefinitions).toEqual(APP_CONFIG_FIXTURE.definitions);
    expect(plan.createAllowList).toEqual(APP_CONFIG_FIXTURE.allowList);
  });

  it('treats an extra scope for a fixture name as malformed', () => {
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
    expect(plan.mode).toBe('reset');
    expect(plan.purgeAllowListIds).toContain('extra');
  });

  it('treats a duplicate definition as malformed', () => {
    const { results } = run(
      [...fullDefinitions(), { entityId: 'dup', configName: 'userConfig' }],
      fullAllowList(),
    );
    expect(results.map((r) => r.id)).toEqual(['app-config-fixture-unexpected']);
  });

  it('reports missing and malformed together, and the reset wins', () => {
    const allowList = fullAllowList()
      .filter((e) => e.configName !== 'publicConfigByDomain')
      .map((e) =>
        e.configName === 'userConfig' && e.scopeType === 'USER'
          ? { ...e, rank: 1 }
          : e,
      );
    const { results, plan } = run(fullDefinitions(), allowList);
    expect(results.map((r) => r.id)).toEqual([
      'app-config-fixture-missing',
      'app-config-fixture-wrong-rank',
    ]);
    expect(results[0].remediationKey).toBe(
      'diagnostics.AppConfigFixtureResetFix',
    );
    expect(plan.mode).toBe('reset');
  });
});
