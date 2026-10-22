/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Pure tests for the environment slice; rows are Dependency map v2 ids
// (#10454), expectations are today's behaviour, pinned end to end by the
// characterization suite in `src/__characterization__/session-launcher/`.
import {
  buildImageGroups,
  DEDICATED_OPTION_VALUE_PREFIX,
  type LauncherImage,
} from '../domain/image';
import {
  compose,
  pathKey,
  transition,
  type AppliedPatch,
  type LauncherEvent,
  type LauncherInputs,
  type LauncherValues,
  type Loadable,
} from '../model';
import { environmentSlice, type EnvironmentInputs } from './environment';
import { describe, expect, it } from 'vitest';

const model = compose([environmentSlice]);

const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value });

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

const fullName = (img: LauncherImage) =>
  `${img?.registry}/${img?.namespace}:${img?.tag}@${img?.architecture}`;

const PY_OLD = image('stable/python', '3.9-ubuntu20.04');
const PY_NEW = image('stable/python', '3.11-ubuntu22.04');
const PY_CUDA = image('stable/python', '3.10-cuda', {
  supported_accelerators: ['cuda'],
});
const CUSTOMIZED = image('stable/custom', '1.0', {
  labels: [{ key: 'ai.backend.customized-image.name', value: 'my-image' }],
});
const IMAGES = [PY_OLD, PY_NEW, PY_CUDA, CUSTOMIZED];
const PYTHON = 'cr.backend.ai/stable/python';

const groupsOf = (dedicatedFirst: boolean, images = IMAGES) =>
  buildImageGroups({
    images,
    dedicatedFirst,
    groupNameOf: () => undefined,
    groupSortKeyOf: () => undefined,
    displayNameOf: () => undefined,
  });

const baseInputs: EnvironmentInputs = {
  imageGroups: groupsOf(true),
  images: IMAGES,
  fullNameMatchedImage: undefined,
  watchedEnvironment: undefined,
  watchedVersion: undefined,
  watchedManual: undefined,
  allowManualImageName: false,
};

const inputsOf = (overrides: Partial<EnvironmentInputs> = {}): LauncherInputs =>
  Object.fromEntries(
    Object.entries({ ...baseInputs, ...overrides }).map(([key, value]) => [
      key,
      ready(value),
    ]),
  );

/** Every key arrives, as on mount. */
const MOUNT: LauncherEvent = {
  type: 'dataArrived',
  keys: Object.keys(baseInputs),
};

const environments = (
  values: Record<string, unknown> = {},
): LauncherValues => ({
  environments: values,
});

const run = (
  values: LauncherValues,
  event: LauncherEvent,
  inputs: LauncherInputs = inputsOf(),
) => transition(model, { values, provenance: {} }, event, inputs);

/** `[path, value, method, provenance]` per applied patch. */
const summary = (patches: AppliedPatch[]) =>
  patches.map((patch) => [
    pathKey(patch.path),
    patch.value,
    patch.write.method,
    patch.provenance,
  ]);

describe('environmentSlice', () => {
  it('runs its rules in the order of the effects they replace (ADR 0013 order test)', () => {
    expect(environmentSlice.rules.map((rule) => rule.id)).toEqual(['E-02']);
  });

  it('writes nothing it validates afterwards (no validateFields in today’s code)', () => {
    const { patches } = run(environments(), MOUNT);
    expect(patches.every((patch) => !patch.write.validateAfter)).toBe(true);
  });

  describe('E-02 resolves the stored version once per watched change', () => {
    it('on mount with no version picks the first image of the first group, dedicated-first (H31)', () => {
      const { patches } = run(environments(), MOUNT);
      expect(summary(patches)).toEqual([
        ['environments.environment', PYTHON, 'setFieldsValue', 'rule:E-02'],
        [
          'environments.version',
          fullName(PY_CUDA),
          'setFieldsValue',
          'rule:E-02',
        ],
        ['environments.image', PY_CUDA, 'setFieldsValue', 'rule:E-02'],
      ]);
    });

    it.each([
      [true, PY_CUDA],
      [false, PY_NEW],
    ])(
      'H31 a bare registry/namespace version with dedicated-first %s resolves to %o',
      (dedicatedFirst, expected) => {
        const { state } = run(
          environments({ version: PYTHON }),
          { type: 'dataArrived', keys: ['watchedVersion'] },
          inputsOf({
            imageGroups: groupsOf(dedicatedFirst),
            watchedVersion: PYTHON,
          }),
        );
        expect(state.values).toEqual(
          environments({
            version: fullName(expected),
            environment: PYTHON,
            image: expected,
          }),
        );
      },
    );

    it('an exact version already resolved writes nothing (equal values are dropped)', () => {
      const values = environments({
        environment: PYTHON,
        version: fullName(PY_OLD),
        image: PY_OLD,
      });
      expect(
        run(values, MOUNT, inputsOf({ watchedVersion: fullName(PY_OLD) }))
          .patches,
      ).toEqual([]);
    });

    it('writes the customized-image tag of the resolved image', () => {
      const { state } = run(
        environments({ version: fullName(CUSTOMIZED) }),
        MOUNT,
      );
      expect(state.values).toMatchObject(
        environments({ image: CUSTOMIZED, customizedTag: 'my-image' }),
      );
    });

    it.each<[string, LauncherEvent]>([
      ['an intent', { type: 'manualImageEdited', payload: '' }],
      // H6: a refetch or a dedicated-first toggle (E-11) re-sorts only.
      [
        'an imageGroups arrival',
        { type: 'dataArrived', keys: ['imageGroups'] },
      ],
      [
        'an environment-only arrival',
        { type: 'dataArrived', keys: ['watchedEnvironment'] },
      ],
    ])('[bug-compat] H6 does not run on %s', (_label, event) => {
      expect(run(environments(), event).patches).toEqual([]);
    });

    it('runs on pass 0 only, so its own write does not re-resolve within one event', () => {
      const runs: number[] = [];
      const [rule] = environmentSlice.rules;
      const spyModel = compose([
        {
          ...environmentSlice,
          rules: [
            {
              ...rule,
              run: (context) => {
                runs.push(context.pass);
                return rule.run(context);
              },
            },
          ],
        },
      ]);
      transition(
        spyModel,
        { values: environments(), provenance: {} },
        MOUNT,
        inputsOf(),
      );
      expect(runs).toEqual([0, 1]);
    });
  });

  describe('E-01 a manual name clears the selects', () => {
    it('clears environment, version and image while a watched one is set', () => {
      const { patches } = run(
        environments({
          environment: PYTHON,
          version: fullName(PY_NEW),
          image: PY_NEW,
          manual: 'my.registry/x:1',
        }),
        { type: 'dataArrived', keys: ['watchedManual'] },
        inputsOf({
          watchedManual: 'my.registry/x:1',
          watchedVersion: fullName(PY_NEW),
        }),
      );
      expect(summary(patches)).toEqual([
        ['environments.environment', undefined, 'setFieldsValue', 'rule:E-02'],
        ['environments.version', undefined, 'setFieldsValue', 'rule:E-02'],
        ['environments.image', undefined, 'setFieldsValue', 'rule:E-02'],
      ]);
    });

    it('writes nothing once neither environment nor version is watched', () => {
      expect(
        run(
          environments({ manual: 'my.registry/x:1' }),
          { type: 'dataArrived', keys: ['watchedManual'] },
          inputsOf({ watchedManual: 'my.registry/x:1' }),
        ).patches,
      ).toEqual([]);
    });
  });

  describe('E-03 / E-04 an unmatched reference moves to manual', () => {
    const MANUAL = 'my.registry/ns/custom:1@aarch64';

    it('E-03 no match with manual names allowed moves the version to manual', () => {
      const { state, patches } = run(
        environments({ version: MANUAL }),
        MOUNT,
        inputsOf({ allowManualImageName: true, watchedVersion: MANUAL }),
      );
      expect(state.values).toEqual(
        environments({
          version: undefined,
          manual: MANUAL,
        }),
      );
      expect(patches.map((patch) => patch.write.method)).toEqual([
        'setFieldsValue',
        'setFieldsValue',
      ]);
    });

    it('without manual names an unmatched version falls back to the first image', () => {
      const { state } = run(environments({ version: MANUAL }), MOUNT);
      expect(state.values).toMatchObject(environments({ image: PY_CUDA }));
    });

    it('E-04 no image at all copies the version to manual with setFieldValue', () => {
      const { patches } = run(
        environments({ version: fullName(PY_NEW) }),
        MOUNT,
        inputsOf({ imageGroups: [], images: [], allowManualImageName: true }),
      );
      expect(summary(patches)).toEqual([
        ['environments.manual', fullName(PY_NEW), 'setFieldValue', 'rule:E-02'],
      ]);
    });

    it('no image and no manual names writes nothing', () => {
      expect(
        run(environments(), MOUNT, inputsOf({ imageGroups: [], images: [] }))
          .patches,
      ).toEqual([]);
    });
  });

  describe('intents', () => {
    it('E-05 environmentSelected writes the environment and its first image (H31)', () => {
      const { patches } = run(environments({ environment: PYTHON }), {
        type: 'environmentSelected',
        payload: PYTHON,
      });
      expect(summary(patches)).toEqual([
        ['environments.version', fullName(PY_CUDA), 'setFieldsValue', 'user'],
        ['environments.image', PY_CUDA, 'setFieldsValue', 'user'],
      ]);
    });

    it('E-05 H32 a quick-pick value is stripped to the environment it repeats', () => {
      const { state } = run(
        environments({
          environment: `${DEDICATED_OPTION_VALUE_PREFIX}${PYTHON}`,
        }),
        {
          type: 'environmentSelected',
          payload: `${DEDICATED_OPTION_VALUE_PREFIX}${PYTHON}`,
        },
      );
      expect(state.values).toEqual(
        environments({
          environment: PYTHON,
          version: fullName(PY_CUDA),
          image: PY_CUDA,
        }),
      );
    });

    it('[bug-compat] E-05 H5 a full-name search match writes the bare namespace', () => {
      const { state } = run(
        environments(),
        { type: 'environmentSelected', payload: 'stable/python' },
        inputsOf({ fullNameMatchedImage: PY_OLD }),
      );
      expect(state.values).toEqual(
        environments({
          environment: 'stable/python',
          version: fullName(PY_OLD),
          image: PY_OLD,
        }),
      );
    });

    it.each([
      [fullName(PY_OLD), PY_OLD],
      ['unknown', undefined],
    ])(
      'E-06 versionSelected %s writes image %o with setFieldValue',
      (value, expected) => {
        const { patches } = run(
          environments({ version: value, image: PY_NEW }),
          { type: 'versionSelected', payload: value },
        );
        expect(summary(patches)).toEqual([
          ['environments.image', expected, 'setFieldValue', 'user'],
        ]);
      },
    );

    it('E-07 a typed manual name clears the selects', () => {
      const { patches } = run(
        environments({
          environment: PYTHON,
          version: fullName(PY_NEW),
          image: PY_NEW,
          manual: 'my.registry/x:2',
        }),
        { type: 'manualImageEdited', payload: 'my.registry/x:2' },
      );
      expect(summary(patches)).toEqual([
        ['environments.environment', undefined, 'setFieldsValue', 'user'],
        ['environments.version', undefined, 'setFieldsValue', 'user'],
        ['environments.image', undefined, 'setFieldsValue', 'user'],
      ]);
    });

    it('E-07 clearing the manual name writes nothing', () => {
      expect(
        run(environments({ environment: PYTHON }), {
          type: 'manualImageEdited',
          payload: '',
        }).patches,
      ).toEqual([]);
    });
  });
});
