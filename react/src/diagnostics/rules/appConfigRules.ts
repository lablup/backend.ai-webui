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
  /** Definitions of a config name outside the fixture; their allow-list entries go with them. */
  unexpectedDefinitions: RegisteredAppConfigDefinition[];
  /** Allow-list entries of a fixture name at a scope outside the fixture. */
  unexpectedAllowList: RegisteredAppConfigAllowListEntry[];
}

const pairKey = (configName: string, scopeType: string) =>
  `${configName}@${scopeType.toUpperCase()}`;

// The manager keeps config names and (config name, scope) pairs unique, so duplicates cannot occur.
export function analyzeAppConfigFixture(
  definitions: RegisteredAppConfigDefinition[],
  allowList: RegisteredAppConfigAllowListEntry[],
): AppConfigFixtureAnalysis {
  const fixtureNames = new Set<string>(APP_CONFIG_FIXTURE.definitions);
  const registeredNames = new Set(definitions.map((d) => d.configName));
  const fixtureByPair = _.keyBy(APP_CONFIG_FIXTURE.allowList, (e) =>
    pairKey(e.configName, e.scopeType),
  );
  const registeredPairs = new Set(
    allowList.map((e) => pairKey(e.configName, e.scopeType)),
  );

  const wrongRank: AppConfigFixtureAnalysis['wrongRank'] = [];
  const unexpectedAllowList: RegisteredAppConfigAllowListEntry[] = [];
  for (const entry of allowList) {
    if (!fixtureNames.has(entry.configName)) continue;
    const expected = fixtureByPair[pairKey(entry.configName, entry.scopeType)];
    if (!expected) {
      unexpectedAllowList.push(entry);
    } else if (entry.rank !== expected.rank) {
      wrongRank.push({ ...entry, expectedRank: expected.rank });
    }
  }

  return {
    missingDefinitions: APP_CONFIG_FIXTURE.definitions.filter(
      (name) => !registeredNames.has(name),
    ),
    missingAllowList: APP_CONFIG_FIXTURE.allowList.filter(
      (e) => !registeredPairs.has(pairKey(e.configName, e.scopeType)),
    ),
    wrongRank,
    unexpectedDefinitions: definitions.filter(
      (d) => !fixtureNames.has(d.configName),
    ),
    unexpectedAllowList,
  };
}

export const formatAppConfigAllowListEntry = (entry: {
  configName: string;
  scopeType: string;
  rank: number;
}) => `${entry.configName} @ ${entry.scopeType.toLowerCase()} (${entry.rank})`;

export function checkAppConfigFixture(
  analysis: AppConfigFixtureAnalysis,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  if (
    analysis.missingDefinitions.length > 0 ||
    analysis.missingAllowList.length > 0
  ) {
    results.push({
      id: 'app-config-fixture-missing',
      severity: 'critical',
      category: 'appConfig',
      titleKey: 'diagnostics.AppConfigFixtureMissing',
      descriptionKey: 'diagnostics.AppConfigFixtureMissingDesc',
      remediationKey: 'diagnostics.AppConfigFixtureRepairFix',
      interpolationValues: {
        items: [
          ...analysis.missingDefinitions,
          ...analysis.missingAllowList.map(formatAppConfigAllowListEntry),
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
      remediationKey: 'diagnostics.AppConfigFixtureRepairFix',
      interpolationValues: {
        items: analysis.wrongRank
          .map((e) => `${formatAppConfigAllowListEntry(e)} → ${e.expectedRank}`)
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
      remediationKey: 'diagnostics.AppConfigFixtureUnexpectedFix',
      interpolationValues: {
        items: [
          ...analysis.unexpectedDefinitions.map((d) => d.configName),
          ...analysis.unexpectedAllowList.map(formatAppConfigAllowListEntry),
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

/** Each step touches only what deviates from the fixture; only the purges delete stored fragments. */
export interface AppConfigFixtureRepairPlan {
  purgeDefinitions: RegisteredAppConfigDefinition[];
  purgeAllowList: RegisteredAppConfigAllowListEntry[];
  createDefinitions: string[];
  createAllowList: AppConfigFixtureAllowListEntry[];
  updateRanks: Array<{ id: string; rank: number }>;
}

export function planAppConfigFixtureRepair(
  analysis: AppConfigFixtureAnalysis,
): AppConfigFixtureRepairPlan {
  return {
    purgeDefinitions: analysis.unexpectedDefinitions,
    purgeAllowList: analysis.unexpectedAllowList,
    createDefinitions: analysis.missingDefinitions,
    createAllowList: analysis.missingAllowList,
    updateRanks: analysis.wrongRank.map((e) => ({
      id: e.entityId,
      rank: e.expectedRank,
    })),
  };
}

export const hasAppConfigFixturePurge = (plan: AppConfigFixtureRepairPlan) =>
  plan.purgeDefinitions.length > 0 || plan.purgeAllowList.length > 0;

export const hasAppConfigFixtureRepair = (plan: AppConfigFixtureRepairPlan) =>
  hasAppConfigFixturePurge(plan) ||
  plan.createDefinitions.length > 0 ||
  plan.createAllowList.length > 0 ||
  plan.updateRanks.length > 0;
