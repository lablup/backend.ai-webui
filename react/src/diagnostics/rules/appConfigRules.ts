/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';
import * as _ from 'lodash-es';

export type AppConfigScopeType = 'PUBLIC' | 'DOMAIN' | 'USER';

export interface AppConfigFixtureAllowListEntry {
  configName: string;
  scopeType: AppConfigScopeType;
  rank: number;
}

/** The app config definitions and allow list the manager must have registered (#10229). */
export const APP_CONFIG_FIXTURE: {
  definitions: string[];
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
  /** Definitions and allow-list entries beyond the fixture: unknown pairs and duplicates. */
  unexpectedDefinitions: RegisteredAppConfigDefinition[];
  unexpectedAllowList: RegisteredAppConfigAllowListEntry[];
}

const pairKey = (configName: string, scopeType: string) =>
  `${configName}@${scopeType.toUpperCase()}`;

export function analyzeAppConfigFixture(
  definitions: RegisteredAppConfigDefinition[],
  allowList: RegisteredAppConfigAllowListEntry[],
): AppConfigFixtureAnalysis {
  const fixtureNames = new Set(APP_CONFIG_FIXTURE.definitions);
  const relevantDefinitions = definitions.filter((d) =>
    fixtureNames.has(d.configName),
  );
  const relevantAllowList = allowList.filter((a) =>
    fixtureNames.has(a.configName),
  );

  const definitionsByName = _.groupBy(relevantDefinitions, 'configName');
  const missingDefinitions = APP_CONFIG_FIXTURE.definitions.filter(
    (name) => !definitionsByName[name],
  );
  const unexpectedDefinitions = _.flatMap(definitionsByName, (group) =>
    group.slice(1),
  );

  const fixtureByPair = _.keyBy(APP_CONFIG_FIXTURE.allowList, (e) =>
    pairKey(e.configName, e.scopeType),
  );
  const allowListByPair = _.groupBy(relevantAllowList, (e) =>
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
      severity: 'warning',
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
  /** `create` registers what is missing; `reset` purges these config names and registers the fixture again. */
  mode: 'none' | 'create' | 'reset';
  purgeAllowListIds: string[];
  purgeDefinitionIds: string[];
  createDefinitions: string[];
  createAllowList: AppConfigFixtureAllowListEntry[];
}

export function planAppConfigFixtureRepair(
  analysis: AppConfigFixtureAnalysis,
  definitions: RegisteredAppConfigDefinition[],
  allowList: RegisteredAppConfigAllowListEntry[],
): AppConfigFixtureRepairPlan {
  if (isAppConfigFixtureMalformed(analysis)) {
    const fixtureNames = new Set(APP_CONFIG_FIXTURE.definitions);
    return {
      mode: 'reset',
      purgeAllowListIds: allowList
        .filter((a) => fixtureNames.has(a.configName))
        .map((a) => a.entityId),
      purgeDefinitionIds: definitions
        .filter((d) => fixtureNames.has(d.configName))
        .map((d) => d.entityId),
      createDefinitions: [...APP_CONFIG_FIXTURE.definitions],
      createAllowList: [...APP_CONFIG_FIXTURE.allowList],
    };
  }
  if (isAppConfigFixtureMissing(analysis)) {
    return {
      mode: 'create',
      purgeAllowListIds: [],
      purgeDefinitionIds: [],
      createDefinitions: analysis.missingDefinitions,
      createAllowList: analysis.missingAllowList,
    };
  }
  return {
    mode: 'none',
    purgeAllowListIds: [],
    purgeDefinitionIds: [],
    createDefinitions: [],
    createAllowList: [],
  };
}
