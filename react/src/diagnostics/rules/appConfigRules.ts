/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AppConfigName } from '../../hooks/useAppConfig';
import type { DiagnosticResult } from '../../types/diagnostics';
import * as _ from 'lodash-es';

export type AppConfigScopeType = 'PUBLIC' | 'DOMAIN' | 'USER';

export interface AppConfigFixtureAllowListEntry {
  configName: AppConfigName;
  scopeType: AppConfigScopeType;
  rank: number;
}

/** The app config definitions and allow list the manager must have registered (#10229). */
export const APP_CONFIG_FIXTURE: {
  definitions: AppConfigName[];
  allowList: AppConfigFixtureAllowListEntry[];
} = {
  definitions: ['userConfig', 'domainConfig', 'publicConfigByDomain'],
  allowList: [
    { configName: 'userConfig', scopeType: 'DOMAIN', rank: 200 },
    { configName: 'userConfig', scopeType: 'USER', rank: 300 },
    { configName: 'domainConfig', scopeType: 'DOMAIN', rank: 200 },
    { configName: 'publicConfigByDomain', scopeType: 'PUBLIC', rank: 100 },
  ],
};

export interface RegisteredAppConfigDefinition {
  entityId: string;
  configName: string;
}

export interface RegisteredAppConfigAllowListEntry {
  entityId: string;
  configName: string;
  scopeType: string;
  rank: number;
}

export interface AppConfigFixtureAnalysis {
  missingDefinitions: string[];
  missingAllowList: AppConfigFixtureAllowListEntry[];
  /** Allow-list entries of a fixture pair registered with another rank. */
  wrongRank: Array<
    RegisteredAppConfigAllowListEntry & { expectedRank: number }
  >;
  /** Definitions and allow-list entries beyond the fixture: other config names, unknown pairs and duplicates. */
  unexpectedDefinitions: RegisteredAppConfigDefinition[];
  unexpectedAllowList: RegisteredAppConfigAllowListEntry[];
}

const pairKey = (configName: string, scopeType: string) =>
  `${configName}@${scopeType.toUpperCase()}`;

export function analyzeAppConfigFixture(
  definitions: RegisteredAppConfigDefinition[],
  allowList: RegisteredAppConfigAllowListEntry[],
): AppConfigFixtureAnalysis {
  // The manager must hold exactly the fixture, so any other config name is unexpected too.
  const fixtureNames = new Set<string>(APP_CONFIG_FIXTURE.definitions);
  const definitionsByName = _.groupBy(definitions, 'configName');
  const missingDefinitions = APP_CONFIG_FIXTURE.definitions.filter(
    (name) => !definitionsByName[name],
  );
  const unexpectedDefinitions = _.flatMap(definitionsByName, (group, name) =>
    fixtureNames.has(name) ? group.slice(1) : group,
  );

  const fixtureByPair = _.keyBy(APP_CONFIG_FIXTURE.allowList, (e) =>
    pairKey(e.configName, e.scopeType),
  );
  const allowListByPair = _.groupBy(allowList, (e) =>
    pairKey(e.configName, e.scopeType),
  );
  const missingAllowList = APP_CONFIG_FIXTURE.allowList.filter(
    (e) => !allowListByPair[pairKey(e.configName, e.scopeType)],
  );
  const wrongRank: AppConfigFixtureAnalysis['wrongRank'] = [];
  const unexpectedAllowList: RegisteredAppConfigAllowListEntry[] = [];
  _.forEach(allowListByPair, (group, key) => {
    const expected = fixtureByPair[key];
    if (!expected) {
      unexpectedAllowList.push(...group);
      return;
    }
    const [first, ...duplicates] = group;
    if (first.rank !== expected.rank) {
      wrongRank.push({ ...first, expectedRank: expected.rank });
    }
    unexpectedAllowList.push(...duplicates);
  });

  return {
    missingDefinitions,
    missingAllowList,
    wrongRank,
    unexpectedDefinitions,
    unexpectedAllowList,
  };
}

export function isAppConfigFixtureMalformed(
  analysis: AppConfigFixtureAnalysis,
): boolean {
  return (
    analysis.wrongRank.length > 0 ||
    analysis.unexpectedDefinitions.length > 0 ||
    analysis.unexpectedAllowList.length > 0
  );
}

export function isAppConfigFixtureMissing(
  analysis: AppConfigFixtureAnalysis,
): boolean {
  return (
    analysis.missingDefinitions.length > 0 ||
    analysis.missingAllowList.length > 0
  );
}

const formatAllowListEntry = (entry: {
  configName: string;
  scopeType: string;
  rank: number;
}) => `${entry.configName} @ ${entry.scopeType.toLowerCase()} (${entry.rank})`;

export function checkAppConfigFixture(
  analysis: AppConfigFixtureAnalysis,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  if (isAppConfigFixtureMissing(analysis)) {
    results.push({
      id: 'app-config-fixture-missing',
      severity: 'critical',
      category: 'appConfig',
      titleKey: 'diagnostics.AppConfigFixtureMissing',
      descriptionKey: 'diagnostics.AppConfigFixtureMissingDesc',
      remediationKey: isAppConfigFixtureMalformed(analysis)
        ? 'diagnostics.AppConfigFixtureResetFix'
        : 'diagnostics.AppConfigFixtureMissingFix',
      interpolationValues: {
        items: [
          ...analysis.missingDefinitions,
          ...analysis.missingAllowList.map(formatAllowListEntry),
        ].join(', '),
      },
    });
  }

  if (analysis.wrongRank.length > 0) {
    results.push({
      id: 'app-config-fixture-wrong-rank',
      severity: 'warning',
      category: 'appConfig',
      titleKey: 'diagnostics.AppConfigFixtureWrongRank',
      descriptionKey: 'diagnostics.AppConfigFixtureWrongRankDesc',
      remediationKey: 'diagnostics.AppConfigFixtureResetFix',
      interpolationValues: {
        items: analysis.wrongRank
          .map((e) => `${formatAllowListEntry(e)} → ${e.expectedRank}`)
          .join(', '),
      },
    });
  }

  if (
    analysis.unexpectedDefinitions.length > 0 ||
    analysis.unexpectedAllowList.length > 0
  ) {
    results.push({
      id: 'app-config-fixture-unexpected',
      severity: 'warning',
      category: 'appConfig',
      titleKey: 'diagnostics.AppConfigFixtureUnexpected',
      descriptionKey: 'diagnostics.AppConfigFixtureUnexpectedDesc',
      remediationKey: 'diagnostics.AppConfigFixtureResetFix',
      interpolationValues: {
        items: [
          ...analysis.unexpectedDefinitions.map((d) => d.configName),
          ...analysis.unexpectedAllowList.map(formatAllowListEntry),
        ].join(', '),
      },
    });
  }

  if (results.length === 0) {
    results.push({
      id: 'app-config-fixture-passed',
      severity: 'passed',
      category: 'appConfig',
      titleKey: 'diagnostics.AppConfigFixtureValid',
      descriptionKey: 'diagnostics.AppConfigFixtureValidDesc',
      interpolationValues: {
        definitionCount: String(APP_CONFIG_FIXTURE.definitions.length),
        allowListCount: String(APP_CONFIG_FIXTURE.allowList.length),
      },
    });
  }

  return results;
}

export interface AppConfigFixtureRepairPlan {
  /** `create` registers what is missing; `reset` purges these definitions (their allow-list entries cascade) and registers the fixture again. */
  mode: 'none' | 'create' | 'reset';
  purgeDefinitionIds: string[];
  createDefinitions: string[];
  createAllowList: AppConfigFixtureAllowListEntry[];
}

export function planAppConfigFixtureRepair(
  analysis: AppConfigFixtureAnalysis,
  definitions: RegisteredAppConfigDefinition[],
): AppConfigFixtureRepairPlan {
  if (isAppConfigFixtureMalformed(analysis)) {
    return {
      mode: 'reset',
      purgeDefinitionIds: definitions.map((d) => d.entityId),
      createDefinitions: [...APP_CONFIG_FIXTURE.definitions],
      createAllowList: [...APP_CONFIG_FIXTURE.allowList],
    };
  }
  if (isAppConfigFixtureMissing(analysis)) {
    return {
      mode: 'create',
      purgeDefinitionIds: [],
      createDefinitions: analysis.missingDefinitions,
      createAllowList: analysis.missingAllowList,
    };
  }
  return {
    mode: 'none',
    purgeDefinitionIds: [],
    createDefinitions: [],
    createAllowList: [],
  };
}

/**
 * What a reset registers after its purge: the fixture minus the definitions
 * whose purge failed, which still exist with their allow-list entries.
 */
export function planAppConfigFixtureReRegistration(
  definitions: RegisteredAppConfigDefinition[],
  failedPurgeIds: string[],
): Pick<AppConfigFixtureRepairPlan, 'createDefinitions' | 'createAllowList'> {
  const surviving = new Set<string>(
    definitions
      .filter((d) => failedPurgeIds.includes(d.entityId))
      .map((d) => d.configName),
  );
  return {
    createDefinitions: APP_CONFIG_FIXTURE.definitions.filter(
      (name) => !surviving.has(name),
    ),
    createAllowList: APP_CONFIG_FIXTURE.allowList.filter(
      (e) => !surviving.has(e.configName),
    ),
  };
}
