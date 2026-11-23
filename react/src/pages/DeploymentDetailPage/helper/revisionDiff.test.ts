/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  diffRevisions,
  flattenJson,
  type RevisionDiffInput,
} from './revisionDiff';

const base: RevisionDiffInput = {
  clusterConfig: { mode: 'SINGLE_NODE', size: 1 },
  resourceSlots: [
    { slotName: 'cpu', quantity: '4' },
    { slotName: 'mem', quantity: '8589934592' },
  ],
  resourceConfig: {
    resourceOpts: { entries: [{ name: 'shmem', value: '64m' }] },
  },
  modelRuntimeConfig: {
    runtimeVariant: { name: 'vllm' },
    inferenceRuntimeConfig: { tensor: { parallel: 1 } },
    environ: {
      entries: [
        { name: 'HF_TOKEN', value: 'secret-a' },
        { name: 'LOG_LEVEL', value: 'info' },
      ],
    },
    runtimeVariantPresetValues: [
      { presetId: 'p1', value: 'bf16', preset: { displayName: 'DType' } },
    ],
  },
  modelMountConfig: {
    vfolderId: 'f1',
    mountDestination: '/models',
    definitionPath: 'model-definition.yaml',
    vfolder: { name: 'llama' },
  },
  extraMounts: [
    {
      vfolderId: 'x1',
      mountDestination: '/data',
      mountPerm: 'RO',
      vfolder: { name: 'data' },
    },
  ],
  imageV2: {
    identity: { canonicalName: 'cr/vllm:0.9', architecture: 'x86_64' },
  },
  modelDefinition: {
    models: [
      {
        name: 'llama',
        modelPath: '/models',
        service: { command: 'vllm serve', port: 8000 },
      },
    ],
  },
};

const rowOf = (rows: ReturnType<typeof diffRevisions>, key: string) =>
  rows.find((row) => row.key === key);

describe('diffRevisions', () => {
  it('marks every row as same when both revisions are identical', () => {
    const rows = diffRevisions(base, structuredClone(base));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.status === 'same')).toBe(true);
  });

  it('reports a changed scalar with both values', () => {
    const rows = diffRevisions(base, {
      ...base,
      imageV2: {
        identity: { canonicalName: 'cr/vllm:0.10', architecture: 'x86_64' },
      },
    });
    expect(rowOf(rows, 'image:image')).toMatchObject({
      status: 'changed',
      left: 'cr/vllm:0.9@x86_64',
      right: 'cr/vllm:0.10@x86_64',
    });
  });

  it('compares environment variables per key and marks them secret', () => {
    const rows = diffRevisions(base, {
      ...base,
      modelRuntimeConfig: {
        ...base.modelRuntimeConfig,
        environ: {
          entries: [
            { name: 'HF_TOKEN', value: 'secret-b' },
            { name: 'NEW_VAR', value: '1' },
          ],
        },
      },
    });
    expect(rowOf(rows, 'environ:environ:HF_TOKEN')).toMatchObject({
      status: 'changed',
      isSecret: true,
    });
    expect(rowOf(rows, 'environ:environ:LOG_LEVEL')).toMatchObject({
      status: 'removed',
      left: 'info',
      right: null,
    });
    expect(rowOf(rows, 'environ:environ:NEW_VAR')).toMatchObject({
      status: 'added',
      left: null,
      right: '1',
    });
  });

  it('diffs the inference runtime config by JSON key path', () => {
    const rows = diffRevisions(base, {
      ...base,
      modelRuntimeConfig: {
        ...base.modelRuntimeConfig,
        inferenceRuntimeConfig: {
          tensor: { parallel: 2 },
          quantization: 'awq',
        },
      },
    });
    expect(
      rowOf(rows, 'runtime:inferenceRuntimeConfig:tensor.parallel'),
    ).toMatchObject({ status: 'changed', left: '1', right: '2' });
    expect(
      rowOf(rows, 'runtime:inferenceRuntimeConfig:quantization'),
    ).toMatchObject({ status: 'added', right: 'awq' });
  });

  it('keys extra mounts by folder and reports additions and removals', () => {
    const rows = diffRevisions(base, {
      ...base,
      extraMounts: [
        {
          vfolderId: 'x2',
          mountDestination: '/ckpt',
          mountPerm: 'RW',
          vfolder: { name: 'ckpt' },
        },
      ],
    });
    expect(rowOf(rows, 'mounts:extraMount:x1')).toMatchObject({
      status: 'removed',
      name: 'data',
      left: '/data (RO)',
    });
    expect(rowOf(rows, 'mounts:extraMount:x2')).toMatchObject({
      status: 'added',
      name: 'ckpt',
      right: '/ckpt (RW)',
    });
  });

  it('labels preset values with the preset display name', () => {
    const rows = diffRevisions(base, {
      ...base,
      modelRuntimeConfig: {
        ...base.modelRuntimeConfig,
        runtimeVariantPresetValues: [
          { presetId: 'p1', value: 'fp16', preset: { displayName: 'DType' } },
        ],
      },
    });
    expect(rowOf(rows, 'runtime:presetValue:p1')).toMatchObject({
      status: 'changed',
      name: 'DType',
    });
  });

  it('tells an empty environment variable apart from a missing one', () => {
    const rows = diffRevisions(base, {
      ...base,
      modelRuntimeConfig: {
        ...base.modelRuntimeConfig,
        environ: {
          entries: [
            { name: 'HF_TOKEN', value: 'secret-a' },
            { name: 'LOG_LEVEL', value: 'info' },
            { name: 'EMPTY', value: '' },
          ],
        },
      },
    });
    expect(rowOf(rows, 'environ:environ:EMPTY')).toMatchObject({
      status: 'added',
      left: null,
      right: '',
    });
  });

  it('compares the resource group and every model service setting', () => {
    const rows = diffRevisions(
      {
        ...base,
        resourceConfig: { ...base.resourceConfig, resourceGroupName: 'gpu-a' },
      },
      {
        ...base,
        resourceConfig: { ...base.resourceConfig, resourceGroupName: 'gpu-b' },
        modelDefinition: {
          models: [
            {
              name: 'llama',
              modelPath: '/models',
              service: {
                startCommand: ['vllm', 'serve', '--port', '8000'],
                shell: '/bin/bash',
                port: 8000,
                healthCheck: { enable: true, path: '/health' },
                preStartActions: [{ action: 'run', args: { cmd: 'ls' } }],
              },
            },
          ],
        },
      },
    );
    expect(rowOf(rows, 'resources:resourceGroup')).toMatchObject({
      status: 'changed',
      left: 'gpu-a',
      right: 'gpu-b',
    });
    expect(rowOf(rows, 'modelDefinition:command:llama')).toMatchObject({
      status: 'changed',
      right: 'vllm serve --port 8000',
    });
    for (const field of ['shell', 'healthCheck', 'preStartActions']) {
      expect(rowOf(rows, `modelDefinition:${field}:llama`)?.status).toBe(
        'added',
      );
    }
  });

  it('treats a missing revision side as all added', () => {
    const rows = diffRevisions(null, base);
    expect(rowOf(rows, 'image:image')?.status).toBe('added');
    expect(rows.some((row) => row.status === 'removed')).toBe(false);
  });
});

describe('flattenJson', () => {
  it('flattens nested objects and arrays into key paths', () => {
    expect(
      Object.fromEntries(flattenJson({ a: { b: [1, { c: 'x' }] }, d: {} })),
    ).toEqual({ 'a.b[0]': '1', 'a.b[1].c': 'x', d: '{}' });
  });

  it('parses a JSON string and ignores an empty value', () => {
    expect(Object.fromEntries(flattenJson('{"a":1}'))).toEqual({ a: '1' });
    expect(flattenJson(null).size).toBe(0);
    expect(flattenJson(undefined).size).toBe(0);
  });
});
