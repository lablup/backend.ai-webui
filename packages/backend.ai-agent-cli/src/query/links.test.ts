import { resolveRepoContext } from '../repo-context.js';
import { loadSchema } from '../search/schema-sdl.js';
import { describe, expect, it } from 'vitest';
import {
  annotateLinks,
  LIST_RESOURCE_BY_TYPE,
  listResourceForRootField,
  NO_LINK_HINT,
  resolveLinkId,
  resourceForRootField,
} from './links.js';

const UUID = '4a3b2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d';
const globalId = (type: string, id: string) =>
  Buffer.from(`${type}:${id}`, 'utf8').toString('base64');

describe('resolveLinkId', () => {
  it('passes a uuid through, dashed or 32-hex', () => {
    expect(resolveLinkId('session', UUID)).toBe(UUID);
    expect(resolveLinkId('vfolder', UUID.replaceAll('-', ''))).toBe(
      UUID.replaceAll('-', ''),
    );
  });

  it('decodes a Relay global id to the uuid the page takes', () => {
    expect(resolveLinkId('session', globalId('ComputeSessionNode', UUID))).toBe(
      UUID,
    );
    expect(resolveLinkId('vfolder', globalId('VFolder', UUID))).toBe(UUID);
  });

  it('refuses an id that is neither', () => {
    expect(resolveLinkId('session', 'row-0')).toBeUndefined();
    // Base64 that decodes to something with no uuid in it.
    expect(
      resolveLinkId('session', globalId('ComputeSessionNode', 'not-a-uuid')),
    ).toBeUndefined();
    expect(
      resolveLinkId('vfolder', Buffer.from(UUID).toString('base64')),
    ).toBeUndefined();
  });

  it('keeps the global id for the one page that matches on it', () => {
    const encoded = globalId('RoleNode', UUID);
    expect(resolveLinkId('role', encoded)).toBe(encoded);
  });
});

describe('annotateLinks', () => {
  it('links a node carrying only a global id', () => {
    const value = { id: globalId('ComputeSessionNode', UUID) };
    const links = annotateLinks(value, 'session', 'node', undefined);

    expect(links).toEqual([
      {
        path: 'node',
        resource: 'session',
        id: UUID,
        webui_path: `/session?sessionDetail=${UUID}`,
      },
    ]);
  });

  it('hints instead of linking when the id resolves to nothing', () => {
    const value = { id: 'row-0' } as Record<string, unknown>;
    expect(annotateLinks(value, 'session', 'node', undefined)).toEqual([]);
    expect(value.webui_link_hint).toBe(NO_LINK_HINT);
    expect(value.webui_path).toBeUndefined();
  });
});

describe('LIST_RESOURCE_BY_TYPE', () => {
  it('carries both subgraph spellings of every resource it covers', () => {
    // The Strawberry rows the table used to be missing: `adminKeypairsV2`
    // resolves to `KeyPairV2` and `adminImagesV2` to `ImageV2`, so without
    // them the V2 lists got no link although their Graphene twins did.
    expect(LIST_RESOURCE_BY_TYPE.KeyPairV2).toBe('keypair');
    expect(LIST_RESOURCE_BY_TYPE.ImageV2).toBe('environment');

    for (const [graphene, strawberry] of [
      ['User', 'UserV2'],
      ['KeyPair', 'KeyPairV2'],
      ['Agent', 'AgentV2'],
      ['ScalingGroup', 'ResourceGroup'],
      ['Group', 'ProjectV2'],
      ['ResourcePreset', 'ResourcePresetV2'],
      ['Image', 'ImageV2'],
    ] as const) {
      expect(LIST_RESOURCE_BY_TYPE[strawberry]).toBe(
        LIST_RESOURCE_BY_TYPE[graphene],
      );
    }
  });
});

describe('listResourceForRootField', () => {
  const schema = loadSchema(resolveRepoContext(import.meta.dirname));
  const listOf = (field: string) =>
    listResourceForRootField(schema, 'Query', field);

  it('gives a singular root field no list link', () => {
    // Each of these resolves to a type that IS in `LIST_RESOURCE_BY_TYPE`, so
    // the type name alone would link it — but one row is not a list, and most
    // of those pages are admin-only.
    for (const field of [
      'user',
      'user_from_uuid',
      'user_node',
      'keypair',
      'agent',
      'group',
      'image',
      'resource_preset',
      'scaling_group',
    ]) {
      expect([field, listOf(field)]).toEqual([field, undefined]);
    }
  });

  it('still links every list-shaped root field the table covers', () => {
    const fields = [
      // GraphQL list types — `[User]`, `[Agent]`, …
      ['users', 'user'],
      ['keypairs', 'keypair'],
      ['agents', 'agent'],
      ['groups', 'project'],
      ['groups_by_name', 'project'],
      ['scaling_groups', 'resource_group'],
      ['resource_presets', 'resource_preset'],
      ['images', 'environment'],
      // Graphene `*List` containers — `items: [X]!`
      ['user_list', 'user'],
      ['keypair_list', 'keypair'],
      ['agent_list', 'agent'],
      // Relay connections — `edges { node }`
      ['user_nodes', 'user'],
      ['agent_nodes', 'agent'],
      ['group_nodes', 'project'],
      ['image_nodes', 'environment'],
      ['adminUsersV2', 'user'],
      ['myKeypairs', 'keypair'],
      ['adminKeypairsV2', 'keypair'],
      ['adminProjectsV2', 'project'],
      ['domainProjectsV2', 'project'],
      ['adminResourcePresetsV2', 'resource_preset'],
      ['adminImagesV2', 'environment'],
    ] as const;

    expect(fields.map(([field]) => [field, listOf(field)])).toEqual(
      fields.map(([field, resource]) => [field, resource]),
    );
  });

  it('leaves the per-row link of a singular root field alone', () => {
    // The list-shape rule is `listResourceForRootField`'s alone: a detail page
    // addresses one row, which is exactly what a singular field returns.
    expect(resourceForRootField(schema, 'Query', 'compute_session')).toBe(
      'session',
    );
    expect(resourceForRootField(schema, 'Query', 'vfolder_node')).toBe(
      'vfolder',
    );
    expect(resourceForRootField(schema, 'Query', 'endpoint')).toBe('deployment');
  });
});
