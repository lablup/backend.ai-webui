import { describe, expect, it } from 'vitest';
import {
  annotateLinks,
  LIST_RESOURCE_BY_TYPE,
  NO_LINK_HINT,
  resolveLinkId,
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
