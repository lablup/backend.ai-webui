/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { pathKey } from './path';
import type { NamePath, Provenance, ProvenanceMap } from './types';

export const ruleProvenance = (ruleId: string): Provenance => `rule:${ruleId}`;

export const isRuleProvenance = (
  provenance: Provenance | undefined,
): provenance is `rule:${string}` => !!provenance?.startsWith('rule:');

export const provenanceOf = (
  provenance: ProvenanceMap,
  path: NamePath,
): Provenance | undefined => provenance[pathKey(path)];

export const isUserSet = (provenance: ProvenanceMap, path: NamePath) =>
  provenanceOf(provenance, path) === 'user';
