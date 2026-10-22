/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The environment section's rule and intents (ADR 0013), migrated as-is from
// `ImageEnvironmentSelectFormItems`; ids are the Dependency map v2 rows (#10454).
import { getImageFullName } from '../../../helper';
import {
  resolveImage,
  selectEnvironment,
  type ImageGroup,
  type LauncherImage,
} from '../domain/image';
import {
  defineSlice,
  getIn,
  type LauncherValues,
  type NamePath,
  type Patch,
  type PatchWrite,
  type ReadyInputs,
  type Rule,
} from '../model';
import * as _ from 'lodash-es';

export const ENVIRONMENT = ['environments', 'environment'];
export const VERSION = ['environments', 'version'];
export const IMAGE = ['environments', 'image'];
export const MANUAL = ['environments', 'manual'];
export const CUSTOMIZED_TAG = ['environments', 'customizedTag'];

const ALL_FIELDS = [ENVIRONMENT, VERSION, IMAGE, MANUAL, CUSTOMIZED_TAG];

/**
 * What `ImageEnvironmentSelectFormItems` reads today, under the names it uses.
 * `watched*` are its `Form.useWatch('environments')` values: E-02 re-ran when
 * `watchedVersion` or `watchedManual` changed, whoever wrote them.
 */
export type EnvironmentInputs = {
  /** Built every render, dedicated-first per the user setting (E-11, H31). */
  imageGroups: ImageGroup[];
  /** The query's images, unfiltered (E-06 looks the version up here). */
  images: ReadonlyArray<LauncherImage> | null | undefined;
  /** The image whose full name equals the environment search text (H5). */
  fullNameMatchedImage: LauncherImage | undefined;
  watchedEnvironment: string | undefined;
  watchedVersion: string | undefined;
  watchedManual: string | undefined;
  allowManualImageName: boolean | undefined;
};

const asEnvironmentInputs = (inputs: ReadyInputs) =>
  inputs as Partial<EnvironmentInputs>;

const SET_FIELDS: PatchWrite = { method: 'setFieldsValue' };
const SET_FIELD: PatchWrite = { method: 'setFieldValue' };

const reasonOf = (id: string) => `sessionLauncher.rule.${id}`;

const patchOf = (
  id: string,
  path: NamePath,
  value: unknown,
  write: PatchWrite,
): Patch => ({ path, value, policy: 'force', reason: reasonOf(id), write });

/** `setFieldsValue({ environments })`, one patch per key it carries. */
const setEnvironments = (id: string, environments: Record<string, unknown>) =>
  _.map(environments, (value, key) =>
    patchOf(id, ['environments', key], value, SET_FIELDS),
  );

/** Keys whose arrival re-ran the resolve effect (its dependency array). */
const E02_TRIGGERS = ['watchedVersion', 'watchedManual'];

/**
 * E-01..E-04: resolve the stored version against the image groups (E-02),
 * clearing the selects for a manual name (E-01) or moving an unmatched
 * reference to `manual` (E-03/E-04). Once per change of the watched version
 * or manual name, and on mount.
 * [bug-compat] H6: a refetch or a dedicated-first toggle (E-11) does not re-run it.
 * [bug-compat] H31: "first" follows `imageGroups`, dedicated-first by default.
 */
const e02: Rule = {
  id: 'E-02',
  reads: ALL_FIELDS,
  writes: ALL_FIELDS,
  needs: ['imageGroups'],
  run: ({ values, event, inputs: readyInputs, pass }) => {
    if (
      pass > 0 ||
      event.type !== 'dataArrived' ||
      !('keys' in event) ||
      _.isEmpty(_.intersection(event.keys, E02_TRIGGERS))
    ) {
      return [];
    }
    const inputs = asEnvironmentInputs(readyInputs);
    const resolution = resolveImage({
      imageGroups: inputs.imageGroups ?? [],
      watchedManual: inputs.watchedManual,
      watchedEnvironment: inputs.watchedEnvironment,
      watchedVersion: inputs.watchedVersion,
      version: getIn(values, VERSION) as string | undefined,
      environment: getIn(values, ENVIRONMENT) as string | undefined,
      allowManual: inputs.allowManualImageName,
    });
    switch (resolution.kind) {
      case 'clear-for-manual':
        return setEnvironments('E-01', {
          environment: undefined,
          version: undefined,
          image: undefined,
        });
      case 'manual':
        return setEnvironments('E-03', {
          environment: undefined,
          version: undefined,
          image: undefined,
          manual: resolution.manual,
          customizedTag: resolution.customizedTag,
        });
      case 'image':
        return setEnvironments('E-02', {
          environment: resolution.environment,
          version: resolution.version,
          image: resolution.image,
          customizedTag: resolution.customizedTag,
        });
      case 'manual-only':
        return [patchOf('E-04', MANUAL, resolution.manual, SET_FIELD)];
      default:
        return [];
    }
  },
};

export const environmentSlice = defineSlice({
  name: 'environment',
  fields: ALL_FIELDS,
  inputs: {
    imageGroups: 'required',
    images: 'required',
    fullNameMatchedImage: 'required',
    watchedEnvironment: 'required',
    watchedVersion: 'required',
    watchedManual: 'required',
    allowManualImageName: 'required',
  },
  intents: {
    // E-05 [bug-compat] H5: a full-name search match writes the bare `namespace`.
    // H32: a quick-pick value is stripped to the environment it repeats.
    environmentSelected: (
      _values: LauncherValues,
      selectedValue: unknown,
      readyInputs: ReadyInputs,
    ) => {
      const inputs = asEnvironmentInputs(readyInputs);
      return setEnvironments(
        'E-05',
        selectEnvironment({
          imageGroups: inputs.imageGroups ?? [],
          selectedValue,
          fullNameMatchedImage: inputs.fullNameMatchedImage,
        }),
      );
    },
    // E-06
    versionSelected: (
      _values: LauncherValues,
      value: unknown,
      readyInputs: ReadyInputs,
    ) => {
      const selectedImage = _.find(
        asEnvironmentInputs(readyInputs).images,
        (image) => getImageFullName(image) === value,
      );
      return [patchOf('E-06', IMAGE, selectedImage, SET_FIELD)];
    },
    // E-07: a non-empty manual name clears the selects; clearing it writes nothing.
    manualImageEdited: (_values: LauncherValues, value: string | undefined) =>
      _.isEmpty(value)
        ? []
        : setEnvironments('E-07', {
            environment: undefined,
            version: undefined,
            image: undefined,
          }),
  },
  rules: [e02],
});
