/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildImageGroups,
  DEDICATED_OPTION_VALUE_PREFIX,
  findFullNameMatchedImage,
  type LauncherImage,
  resolveImage,
  type ResolveImageInput,
  selectEnvironment,
  stripDedicatedOptionPrefix,
} from './image';

const image = (
  namespace: string,
  tag: string,
  extra: Partial<Record<string, unknown>> = {},
): LauncherImage =>
  ({
    id: `${namespace}:${tag}`,
    registry: 'cr.backend.ai',
    namespace,
    tag,
    architecture: 'x86_64',
    labels: [],
    resource_limits: [],
    supported_accelerators: ['*'],
    ...extra,
  }) as unknown as LauncherImage;

const PY_OLD = image('stable/python', '3.9-ubuntu20.04');
const PY_NEW = image('stable/python', '3.11-ubuntu22.04');
const PY_NEW_CUDA = image('stable/python', '3.10-cuda', {
  supported_accelerators: ['cuda'],
});
const TORCH = image('stable/pytorch', '2.0-py311', {
  supported_accelerators: ['cuda'],
});
const PRIVATE = image('stable/secret', '1.0', {
  labels: [{ key: 'ai.backend.features', value: 'private' }],
});

const groups = (dedicatedFirst: boolean) =>
  buildImageGroups({
    images: [PY_OLD, PY_NEW, PY_NEW_CUDA, TORCH, PRIVATE],
    dedicatedFirst,
    groupNameOf: () => undefined,
    groupSortKeyOf: () => undefined,
    displayNameOf: () => undefined,
  });

const fullName = (img: LauncherImage) =>
  `${img?.registry}/${img?.namespace}:${img?.tag}@${img?.architecture}`;

describe('buildImageGroups', () => {
  it('hides private images, sorts versions newest first', () => {
    const [group] = groups(false);
    expect(group.groupName).toBe('Custom Environments');
    expect(
      group.environmentGroups.map((env) => [
        env.environmentName,
        env.images.map((img) => img?.tag),
      ]),
    ).toEqual([
      [
        'cr.backend.ai/stable/python',
        ['3.11-ubuntu22.04', '3.10-cuda', '3.9-ubuntu20.04'],
      ],
      ['cr.backend.ai/stable/pytorch', ['2.0-py311']],
    ]);
  });

  it('E-11: dedicated images and environments sort first', () => {
    const [group] = groups(true);
    expect(
      group.environmentGroups.map((env) => [
        env.environmentName,
        env.images.map((img) => img?.tag),
        env.dedicatedAccelerators,
      ]),
    ).toEqual([
      [
        'cr.backend.ai/stable/python',
        ['3.10-cuda', '3.11-ubuntu22.04', '3.9-ubuntu20.04'],
        ['cuda'],
      ],
      ['cr.backend.ai/stable/pytorch', ['2.0-py311'], ['cuda']],
    ]);
  });
});

describe('resolveImage (E-01..E-04)', () => {
  const input = (overrides: Partial<ResolveImageInput>): ResolveImageInput => ({
    imageGroups: groups(false),
    watchedManual: undefined,
    watchedEnvironment: undefined,
    watchedVersion: undefined,
    version: undefined,
    environment: undefined,
    allowManual: false,
    ...overrides,
  });

  it.each([
    {
      name: 'E-01 manual set with selects filled -> clear',
      overrides: { watchedManual: 'my/img:1', watchedVersion: 'x' },
      expected: { kind: 'clear-for-manual' },
    },
    {
      name: 'E-01 manual set, selects empty -> nothing',
      overrides: { watchedManual: 'my/img:1' },
      expected: { kind: 'none' },
    },
  ])('$name', ({ overrides, expected }) => {
    expect(resolveImage(input(overrides))).toEqual(expected);
  });

  it.each([
    {
      name: 'exact full name',
      overrides: { version: fullName(PY_OLD) },
      expected: PY_OLD,
    },
    {
      name: 'tag without architecture',
      overrides: { version: 'cr.backend.ai/stable/python:3.9-ubuntu20.04' },
      expected: PY_OLD,
    },
    {
      name: 'registry/namespace -> newest',
      overrides: { version: 'cr.backend.ai/stable/pytorch' },
      expected: TORCH,
    },
    {
      name: 'unknown version -> current environment, first image',
      overrides: {
        version: 'cr.backend.ai/stable/nope:1@x86_64',
        environment: 'cr.backend.ai/stable/pytorch',
      },
      expected: TORCH,
    },
    {
      name: 'nothing -> first image of the first group',
      overrides: {},
      expected: PY_NEW,
    },
  ])('E-02 $name', ({ overrides, expected }) => {
    expect(resolveImage(input(overrides))).toMatchObject({
      kind: 'image',
      environment: `cr.backend.ai/${expected?.namespace}`,
      version: fullName(expected),
      image: expected,
    });
  });

  it('E-02 with dedicated-first: "newest" is the dedicated image', () => {
    expect(
      resolveImage(
        input({
          imageGroups: groups(true),
          version: 'cr.backend.ai/stable/python',
        }),
      ),
    ).toMatchObject({ kind: 'image', image: PY_NEW_CUDA });
  });

  it('E-03 unmatched version moves to manual when allowed', () => {
    expect(
      resolveImage(
        input({ version: 'my.registry/custom:1.0', allowManual: true }),
      ),
    ).toEqual({
      kind: 'manual',
      manual: 'my.registry/custom:1.0',
      customizedTag: undefined,
    });
  });

  it('E-04 no image at all + manual allowed -> manual = version', () => {
    expect(
      resolveImage(
        input({ imageGroups: [], version: 'x/y:1', allowManual: true }),
      ),
    ).toEqual({ kind: 'manual-only', manual: 'x/y:1' });
  });

  it('no image at all, manual not allowed -> nothing', () => {
    expect(resolveImage(input({ imageGroups: [], version: 'x/y:1' }))).toEqual({
      kind: 'none',
    });
  });

  it('carries the customized-image tag', () => {
    const custom = image('custom/mine', '1.0', {
      labels: [{ key: 'ai.backend.customized-image.name', value: 'my-tag' }],
    });
    const imageGroups = buildImageGroups({
      images: [custom],
      dedicatedFirst: false,
      groupNameOf: () => undefined,
      groupSortKeyOf: () => undefined,
      displayNameOf: () => undefined,
    });
    expect(resolveImage(input({ imageGroups }))).toMatchObject({
      kind: 'image',
      customizedTag: 'my-tag',
    });
  });
});

describe('selectEnvironment (E-05)', () => {
  it('writes the option key and its first image', () => {
    expect(
      selectEnvironment({
        imageGroups: groups(false),
        selectedValue: 'cr.backend.ai/stable/python',
        fullNameMatchedImage: undefined,
      }),
    ).toEqual({
      environment: 'cr.backend.ai/stable/python',
      version: fullName(PY_NEW),
      image: PY_NEW,
    });
  });

  it('strips the dedicated quick-pick prefix', () => {
    expect(
      selectEnvironment({
        imageGroups: groups(true),
        selectedValue: `${DEDICATED_OPTION_VALUE_PREFIX}cr.backend.ai/stable/python`,
        fullNameMatchedImage: undefined,
      }),
    ).toMatchObject({
      environment: 'cr.backend.ai/stable/python',
      image: PY_NEW_CUDA,
    });
  });

  it('H5: a full-name search match writes the bare namespace', () => {
    expect(
      selectEnvironment({
        imageGroups: groups(false),
        selectedValue: 'anything',
        fullNameMatchedImage: TORCH,
      }),
    ).toEqual({
      environment: 'stable/pytorch',
      version: fullName(TORCH),
      image: TORCH,
    });
  });

  it('an unknown option clears the environment', () => {
    expect(
      selectEnvironment({
        imageGroups: groups(false),
        selectedValue: 'nope',
        fullNameMatchedImage: undefined,
      }),
    ).toEqual({ environment: '', version: undefined, image: undefined });
  });
});

describe('findFullNameMatchedImage / stripDedicatedOptionPrefix', () => {
  it.each([
    [fullName(TORCH), TORCH],
    ['cr.backend.ai/stable/pytorch', undefined],
    ['', undefined],
  ])('%s', (search, expected) => {
    expect(findFullNameMatchedImage(groups(false), search)).toBe(expected);
  });

  it.each([
    [`${DEDICATED_OPTION_VALUE_PREFIX}a/b`, 'a/b'],
    ['a/b', 'a/b'],
    [undefined, undefined],
  ])('%s -> %s', (value, expected) => {
    expect(stripDedicatedOptionPrefix(value)).toBe(expected);
  });
});
