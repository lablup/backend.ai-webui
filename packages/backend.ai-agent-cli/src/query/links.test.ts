import { annotateLinks, toLocalId } from './links.js';
import { describe, expect, it } from 'vitest';

const globalId = (type: string, local: string): string =>
  Buffer.from(`${type}:${local}`, 'utf8').toString('base64');

describe('toLocalId', () => {
  it('decodes a Relay global id to the id the URL params take', () => {
    expect(toLocalId(globalId('VFolder', 'abc-123'))).toBe('abc-123');
    expect(toLocalId(globalId('ComputeSessionNode', 'sess-1'))).toBe('sess-1');
  });

  it('leaves a raw UUID alone', () => {
    const uuid = '0195a2b3-c4d5-6789-abcd-ef0123456789';
    expect(toLocalId(uuid)).toBe(uuid);
  });

  it('leaves base64 that is not a global id alone', () => {
    const plain = Buffer.from('no colon here', 'utf8').toString('base64');
    expect(toLocalId(plain)).toBe(plain);
  });
});

describe('annotateLinks', () => {
  it('links a Strawberry node that only exposes a global id', () => {
    const result = {
      vfolder: { id: globalId('VFolder', 'vf-1'), metadata: { name: 'demo' } },
    };
    const links = annotateLinks(
      result,
      'vfolder',
      'createVfolderV2',
      'https://ui.example.com',
    );
    expect(links).toEqual([
      {
        path: 'createVfolderV2.vfolder',
        resource: 'vfolder',
        id: 'vf-1',
        webui_path: '/data?folder=vf-1',
        webui_url: 'https://ui.example.com/data?folder=vf-1',
      },
    ]);
  });

  it('prefers row_id and leaves it undecoded', () => {
    const result = { node: { row_id: 'row-1', id: globalId('X', 'other') } };
    expect(annotateLinks(result, 'session', 'root', undefined)[0]).toMatchObject(
      { id: 'row-1', webui_path: '/session?sessionDetail=row-1' },
    );
  });
});
