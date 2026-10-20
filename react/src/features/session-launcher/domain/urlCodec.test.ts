/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  decodeLauncherFormValues,
  encodeLauncherFormValues,
  toUrlFormValues,
} from './urlCodec';
import { describe, expect, it } from 'vitest';

const VALUES = {
  sessionType: 'interactive',
  environments: {
    environment: 'cr.backend.ai/stable/python',
    version: 'cr.backend.ai/stable/python:3.11@x86_64',
    image: { id: 'image-1' },
    customizedTag: 'tag',
  },
  resource: { cpu: 1, mem: '1.0625g', shmem: '64m', accelerator: 0 },
  envvars: [
    { variable: 'MY_PASSWORD', value: 'secret' },
    { variable: 'PLAIN', value: '1' },
  ],
  batch: { enabled: false, command: undefined },
};

describe('urlCodec', () => {
  it('P-03 P-04 writes the bytes the page wrote: image fields dropped, sensitive envs blanked', () => {
    expect(encodeLauncherFormValues(VALUES)).toBe(
      '{"sessionType":"interactive",' +
        '"environments":{"environment":"cr.backend.ai/stable/python","version":"cr.backend.ai/stable/python:3.11@x86_64"},' +
        '"resource":{"cpu":1,"mem":"1.0625g","shmem":"64m","accelerator":0},' +
        '"batch":{"enabled":false},' +
        '"envvars":[{"variable":"MY_PASSWORD","value":""},{"variable":"PLAIN","value":"1"}]}',
    );
  });

  it('does not mutate the form snapshot', () => {
    const values = structuredClone(VALUES);
    toUrlFormValues(values);
    expect(values).toEqual(VALUES);
  });

  it('H22 an absent envvars list still writes an empty array', () => {
    expect(toUrlFormValues({ sessionType: 'batch' })).toEqual({
      sessionType: 'batch',
      envvars: [],
    });
  });

  it('round-trips through the search string', () => {
    const search = new URLSearchParams({
      step: '4',
      formValues: encodeLauncherFormValues(VALUES),
    }).toString();
    expect(decodeLauncherFormValues(search)).toEqual({
      step: 4,
      formValues: toUrlFormValues(VALUES),
    });
  });

  it('P-33 migrates legacy mount_ids to vfolderMounts', () => {
    const search = new URLSearchParams({
      formValues: JSON.stringify({
        mount_ids: ['0123456789abcdef0123456789abcdef'],
        vfoldersNameMap: { '0123456789abcdef0123456789abcdef': 'legacy' },
      }),
    }).toString();
    expect(decodeLauncherFormValues(search).formValues).toEqual({
      vfolderMounts: [
        {
          vfolderId: '01234567-89ab-cdef-0123-456789abcdef',
          name: 'legacy',
          mountDestination: '',
          subpath: '',
        },
      ],
    });
  });

  it('reads absent or unparsable values as defaults, as nuqs does', () => {
    expect(decodeLauncherFormValues('')).toEqual({
      step: 0,
      formValues: null,
    });
    expect(decodeLauncherFormValues('step=x&formValues=%7Bbroken')).toEqual({
      step: 0,
      formValues: null,
    });
    expect(decodeLauncherFormValues('formValues=5').formValues).toBeNull();
  });
});
