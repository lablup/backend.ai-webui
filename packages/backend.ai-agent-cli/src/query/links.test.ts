import { resolveRepoContext } from '../repo-context.js';
import { loadSchema } from '../search/schema-sdl.js';
import { describe, expect, it } from 'vitest';
import {
  annotateLinks,
  annotateResult,
  LIST_RESOURCE_BY_TYPE,
  listLink,
  listResourceForRootField,
  NO_LINK_HINT,
  resolveLinkId,
  resourceForRootField,
  SELF_SCOPED_LIST_BY_ROOT_FIELD,
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

  it('gives a self-scoped root field the user-scope page, or none', () => {
    // `customized_images` is the field `/my-environment` itself runs, and its
    // rows are `ImageNode` — the type table alone would send a regular account
    // to the admin-only `/admin/environment`.
    expect(listOf('customized_images')).toBe('my_environment');
    // `myKeypairs` resolves to the same `KeyPairV2` the admin field returns,
    // but the only keypair list lives on the admin-gated credentials tab.
    expect(listOf('myKeypairs')).toBeUndefined();
    // The admin-wide twin is unaffected.
    expect(listOf('adminKeypairsV2')).toBe('keypair');
    expect(listOf('images')).toBe('environment');
  });

  it('applies the self-scoped override to Query only', () => {
    expect(
      listResourceForRootField(schema, 'Mutation', 'customized_images'),
    ).toBeUndefined();
  });

  it('names every self-scoped override for the reader', () => {
    expect(SELF_SCOPED_LIST_BY_ROOT_FIELD).toEqual({
      myKeypairs: null,
      customized_images: 'my_environment',
    });
  });
});

describe('link access marker', () => {
  it('marks a list link with the access its page demands', () => {
    expect(listLink('keypair', 'keypairs', undefined).requires).toBe('admin');
    expect(listLink('user', 'users', undefined).requires).toBe('admin');
    expect(listLink('agent', 'agents', undefined).requires).toBe('superadmin');
    expect(listLink('project', 'groups', undefined).requires).toBe(
      'superadmin',
    );
  });

  it('omits the marker on a page any authenticated account can open', () => {
    const link = listLink('my_environment', 'customized_images', undefined);
    expect(link).toEqual({
      path: 'customized_images',
      resource: 'my_environment',
      webui_path: '/my-environment',
    });
    expect('requires' in link).toBe(false);
    expect('requires' in listLink('session', 'sessions', undefined)).toBe(
      false,
    );
  });

  it('marks a per-row link on an admin-gated detail page too', () => {
    const encoded = globalId('RoleNode', UUID);
    const [roleLink] = annotateLinks({ id: encoded }, 'role', 'node', undefined);
    expect(roleLink.resource).toBe('role');
    expect(roleLink.webui_path.startsWith('/admin/rbac?roleDetail=')).toBe(true);
    expect(roleLink.requires).toBe('superadmin');
    expect(
      annotateLinks({ id: UUID }, 'artifact', 'node', undefined)[0].requires,
    ).toBe('admin');
    // A project-scope detail page still carries no marker.
    expect(
      annotateLinks({ id: UUID }, 'session', 'node', undefined)[0],
    ).not.toHaveProperty('requires');
  });
});

describe('annotateResult with root-field aliases', () => {
  const schema = loadSchema(resolveRepoContext(import.meta.dirname));
  const annotate = (
    result: unknown,
    fieldNameByResponseKey?: Record<string, string>,
  ) => annotateResult(schema, 'Query', result, undefined, fieldNameByResponseKey);

  it('resolves the schema field, not the alias, for a list link', () => {
    // `customized_images` is a self-scoped root field; as an ALIAS of `images`
    // it must not drag `/my-environment` onto the admin image list.
    expect(
      annotate({ customized_images: [{ id: 'i-1' }] }, {
        customized_images: 'images',
      }),
    ).toEqual([
      {
        path: 'customized_images',
        resource: 'environment',
        webui_path: '/admin/environment',
        requires: 'admin',
      },
    ]);
  });

  it('does not let an alias trip the null self-scoped override', () => {
    // `myKeypairs` maps to `null` — "emit no link". Aliasing the admin-wide
    // field to that name used to suppress its link entirely.
    expect(
      annotate({ myKeypairs: { edges: [{ node: { id: 'k-1' } }] } }, {
        myKeypairs: 'adminKeypairsV2',
      }),
    ).toEqual([
      {
        path: 'myKeypairs',
        resource: 'keypair',
        webui_path: '/admin/users?tab=credentials',
        requires: 'admin',
      },
    ]);
  });

  it('keeps the response key in the path of a per-row link', () => {
    const links = annotate(
      { sessions: { edges: [{ node: { row_id: UUID } }] } },
      { sessions: 'compute_session_nodes' },
    );
    expect(links).toEqual([
      {
        path: 'sessions.edges[0].node',
        resource: 'session',
        id: UUID,
        webui_path: `/session?sessionDetail=${UUID}`,
      },
    ]);
  });

  it('treats a missing map as identity, unchanged from before', () => {
    const result = { compute_session_nodes: { edges: [{ node: { row_id: UUID } }] } };
    expect(annotate(result)).toEqual(
      annotate(result, { compute_session_nodes: 'compute_session_nodes' }),
    );
    expect(annotate({ customized_images: [{ id: 'i-1' }] })).toEqual([
      {
        path: 'customized_images',
        resource: 'my_environment',
        webui_path: '/my-environment',
      },
    ]);
  });
});
