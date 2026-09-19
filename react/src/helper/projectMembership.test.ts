/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { partitionProjectMemberships } from './projectMembership';
import { describe, expect, it } from 'vitest';

// Relay global ids are base64 `<TypeName>:<uuid>`, which `toLocalId` decodes.
const edge = (uuid: string, name: string, type: string) => ({
  node: { id: btoa(`ProjectNode:${uuid}`), basicInfo: { name, type } },
});

describe('partitionProjectMemberships', () => {
  it('separates the personal project from the assignable ones', () => {
    const { assignable, personal } = partitionProjectMemberships([
      edge('uuid-coredev', 'coredev', 'GENERAL'),
      edge('uuid-personal', 'seungwon', 'PERSONAL'),
      edge('uuid-store', 'model-store', 'MODEL_STORE'),
    ]);

    expect(assignable.map((project) => project.name)).toEqual([
      'coredev',
      'model-store',
    ]);
    expect(personal.map((project) => project.id)).toEqual(['uuid-personal']);
  });

  it('decodes the global id into the UUID the selector options carry', () => {
    const { assignable } = partitionProjectMemberships([
      edge('uuid-coredev', 'coredev', 'GENERAL'),
    ]);

    expect(assignable[0].id).toBe('uuid-coredev');
  });

  it('treats a missing connection as no memberships', () => {
    expect(partitionProjectMemberships(null)).toEqual({
      assignable: [],
      personal: [],
    });
    expect(partitionProjectMemberships([null, { node: null }])).toEqual({
      assignable: [],
      personal: [],
    });
  });
});
