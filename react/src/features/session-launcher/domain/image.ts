/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ImageEnvironmentSelectFormItemsQuery$data } from '../../../__generated__/ImageEnvironmentSelectFormItemsQuery.graphql';
import {
  compareImageVersions,
  getImageFullName,
  isPrivateImage,
  localeCompare,
  parseImageString,
  removeArchitectureFromImageFullName,
} from '../../../helper';
import * as _ from 'lodash-es';

export type LauncherImage = NonNullable<
  NonNullable<ImageEnvironmentSelectFormItemsQuery$data>['images']
>[0];

export type EnvironmentGroup = {
  environmentName: string;
  displayName: string;
  prefix?: string;
  images: LauncherImage[];
  dedicatedAccelerators: string[];
};

export type ImageGroup = {
  groupName: string;
  environmentGroups: EnvironmentGroup[];
};

// Quick-pick options repeat an environment listed below, so they need their own value.
// `~` cannot start a registry host, so no real `registry/namespace` carries this prefix.
export const DEDICATED_OPTION_VALUE_PREFIX = '~accelerator-dedicated:';

/** The environment an option value names, with the quick-pick prefix removed. */
export const stripDedicatedOptionPrefix = <T>(selectedValue: T): T | string =>
  _.isString(selectedValue) &&
  selectedValue.startsWith(DEDICATED_OPTION_VALUE_PREFIX)
    ? selectedValue.slice(DEDICATED_OPTION_VALUE_PREFIX.length)
    : selectedValue;

// An image's explicit `supported_accelerators`; empty for a generic image
// (`*`, or `''` from pre-BA-2358 managers).
export const getDedicatedAccelerators = (
  image: LauncherImage | undefined,
): string[] => {
  if (_.includes(image?.supported_accelerators, '*')) return [];
  return _.uniq(
    _.filter(
      image?.supported_accelerators,
      (accelerator): accelerator is string => !!accelerator,
    ),
  );
};

export interface BuildImageGroupsInput {
  images: ReadonlyArray<LauncherImage> | null | undefined;
  showPrivate?: boolean;
  filter?: (image: LauncherImage) => boolean;
  /** E-11: dedicated-accelerator images and environments sort first. */
  dedicatedFirst: boolean;
  /** Image-metadata group of an image ('Custom Environments' when unknown). */
  groupNameOf: (image: LauncherImage) => string | undefined;
  groupSortKeyOf: (groupName: string) => string | undefined;
  /** Display name from image metadata for an image key (`registry/ns/<key>`). */
  displayNameOf: (imageKey: string) => string | undefined;
}

/**
 * Images grouped by metadata group, then by `registry/namespace`; each
 * environment's images newest first (then by architecture).
 */
export const buildImageGroups = ({
  images,
  showPrivate,
  filter,
  dedicatedFirst,
  groupNameOf,
  groupSortKeyOf,
  displayNameOf,
}: BuildImageGroupsInput): ImageGroup[] =>
  _.sortBy(
    _.map(
      _.groupBy(
        _.filter(images, (image) => {
          return (
            (showPrivate ? true : !isPrivateImage(image)) &&
            (filter ? filter(image) : true)
          );
        }),
        (image) => groupNameOf(image) || 'Custom Environments',
      ),
      (images, groupName) => {
        return {
          groupName,
          groupSortKey: groupSortKeyOf(groupName) || groupName,
          environmentGroups: _.sortBy(
            _.map(
              _.groupBy(images, (image) => {
                return `${image?.registry}/${image?.namespace}`;
              }),
              (images, environmentName) => {
                const imageKey = environmentName.split('/')?.[2];
                const displayName =
                  (imageKey && displayNameOf(imageKey)) ||
                  (_.last(environmentName.split('/')) as string);
                const sortedImages = images.sort(
                  (a, b) =>
                    compareImageVersions(
                      // latest version comes first
                      b?.tag?.split('-')?.[0] ?? '',
                      a?.tag?.split('-')?.[0] ?? '',
                    ) || localeCompare(a?.architecture, b?.architecture),
                );

                return {
                  environmentName,
                  displayName,
                  prefix: environmentName.split('/').slice(1, -1).join('/'),
                  // `_.sortBy` is stable, so the version order holds within each half.
                  images: dedicatedFirst
                    ? _.sortBy(sortedImages, (image) =>
                        _.isEmpty(getDedicatedAccelerators(image)) ? 1 : 0,
                      )
                    : sortedImages,
                  dedicatedAccelerators: _.uniq(
                    _.flatMap(images, (image) =>
                      getDedicatedAccelerators(image),
                    ),
                  ),
                };
              },
            ),
            dedicatedFirst
              ? [
                  (item: EnvironmentGroup) =>
                    _.isEmpty(item.dedicatedAccelerators) ? 1 : 0,
                  (item: EnvironmentGroup) => item.displayName,
                ]
              : (item: EnvironmentGroup) => item.displayName,
          ),
        };
      },
    ),
    (item) => item.groupSortKey,
  );

export type ImageResolution =
  /** Nothing to write. */
  | { kind: 'none' }
  /** E-01: a manual image is set, so the selects are cleared. */
  | { kind: 'clear-for-manual' }
  /** E-02: the resolved environment / version / image. */
  | {
      kind: 'image';
      environment: string;
      version: string | undefined;
      image: LauncherImage;
      customizedTag: string | undefined;
    }
  /** E-03: no match while manual names are allowed; the reference moves to `manual`. */
  | { kind: 'manual'; manual: string; customizedTag: string | undefined }
  /** E-04: no image at all while manual names are allowed. */
  | { kind: 'manual-only'; manual: string | undefined };

export interface ResolveImageInput {
  imageGroups: ImageGroup[];
  /** Watched `environments.manual`, `environment`, `version` (E-01 guard). */
  watchedManual: string | undefined;
  watchedEnvironment: string | undefined;
  watchedVersion: string | undefined;
  /** Stored `environments.version` (the reference to resolve). */
  version: string | undefined;
  /** Stored `environments.environment` (the env fallback). */
  environment: string | undefined;
  allowManual: boolean | undefined;
}

/**
 * E-01..E-04: resolve the stored image reference against `imageGroups`
 * (exact → no-arch → `registry/ns` newest → current env first → first image
 * of the first group). "First" follows `imageGroups` order, so dedicated-first
 * sorting (E-11) decides it.
 */
export const resolveImage = ({
  imageGroups,
  watchedManual,
  watchedEnvironment,
  watchedVersion,
  version,
  environment,
  allowManual,
}: ResolveImageInput): ImageResolution => {
  if (!_.isEmpty(watchedManual)) {
    return watchedEnvironment || watchedVersion
      ? { kind: 'clear-for-manual' }
      : { kind: 'none' };
  }

  let matchedEnvironmentByVersion: EnvironmentGroup | undefined;
  let matchedImageByVersion: LauncherImage | undefined;

  // 1. exact full name (registry/namespace:tag@arch)
  version &&
    _.find(imageGroups, (group) => {
      matchedEnvironmentByVersion = _.find(
        group.environmentGroups,
        (environmentGroup) => {
          matchedImageByVersion = _.find(
            environmentGroup.images,
            (image) => getImageFullName(image) === version,
          );
          return !!matchedImageByVersion;
        },
      );
      return !!matchedEnvironmentByVersion;
    });

  // 2. partial match
  if (!matchedEnvironmentByVersion && version) {
    const { registryAndNamespace, hasTag, hasArch } = parseImageString(version);

    if (!hasArch && hasTag) {
      // "registry/namespace:tag": match with the architecture removed
      _.find(imageGroups, (group) => {
        matchedEnvironmentByVersion = _.find(
          group.environmentGroups,
          (environmentGroup) => {
            matchedImageByVersion = _.find(environmentGroup.images, (image) => {
              const fullName = getImageFullName(image);
              return removeArchitectureFromImageFullName(fullName) === version;
            });
            return !!matchedImageByVersion;
          },
        );
        return !!matchedEnvironmentByVersion;
      });
    } else if (!hasTag) {
      // "registry/namespace": the first (newest) image of that environment
      _.find(imageGroups, (group) => {
        matchedEnvironmentByVersion = _.find(
          group.environmentGroups,
          (environmentGroup) => {
            if (environmentGroup.environmentName === registryAndNamespace) {
              matchedImageByVersion = environmentGroup.images[0];
              return true;
            }
            return false;
          },
        );
        return !!matchedEnvironmentByVersion;
      });
    }
  }

  let nextEnvironment: EnvironmentGroup | undefined;
  let nextImage: LauncherImage | undefined;
  if (matchedEnvironmentByVersion) {
    nextEnvironment = matchedEnvironmentByVersion;
    nextImage = matchedImageByVersion;
  } else if (environment) {
    _.find(imageGroups, (group) => {
      nextEnvironment = _.find(group.environmentGroups, (environmentGroup) => {
        return environmentGroup.environmentName === environment;
      });
      nextImage = nextEnvironment?.images[0];
      return !!nextEnvironment;
    });
  }

  if (!nextEnvironment || !nextImage) {
    nextEnvironment = imageGroups[0]?.environmentGroups[0];
    nextImage = nextEnvironment?.images[0];
  }

  const customizedImageTag = _.find(
    nextImage?.labels,
    (item) => item !== null && item?.key === 'ai.backend.customized-image.name',
  )?.value;

  if (nextImage) {
    if (!matchedEnvironmentByVersion && allowManual && version) {
      return {
        kind: 'manual',
        manual: version,
        customizedTag: customizedImageTag ?? undefined,
      };
    }
    return {
      kind: 'image',
      environment: (nextEnvironment as EnvironmentGroup).environmentName,
      version: getImageFullName(nextImage),
      image: nextImage,
      customizedTag: customizedImageTag ?? undefined,
    };
  } else if (allowManual) {
    return { kind: 'manual-only', manual: version };
  }
  return { kind: 'none' };
};

/** The image whose full name equals the environment search text, if any. */
export const findFullNameMatchedImage = (
  imageGroups: ImageGroup[],
  environmentSearch: string,
): LauncherImage | undefined => {
  let fullNameMatchedImage: LauncherImage | undefined;
  if (environmentSearch.length) {
    imageGroups
      .flatMap((group) => group.environmentGroups)
      .find((envGroup) => {
        fullNameMatchedImage = _.find(envGroup.images, (image) => {
          return getImageFullName(image) === environmentSearch;
        });
        return !!fullNameMatchedImage;
      });
  }
  return fullNameMatchedImage;
};

/**
 * E-05: the environments written when the user picks an environment option.
 * A full-name search match wins and writes the image's bare `namespace` (H5);
 * otherwise the option's `registry/namespace` with its first (newest) image.
 */
export const selectEnvironment = ({
  imageGroups,
  selectedValue,
  fullNameMatchedImage,
}: {
  imageGroups: ImageGroup[];
  selectedValue: unknown;
  fullNameMatchedImage: LauncherImage | undefined;
}): {
  environment: string;
  version: string | undefined;
  image: LauncherImage | undefined;
} => {
  if (fullNameMatchedImage) {
    return {
      environment: fullNameMatchedImage?.namespace || '',
      version: getImageFullName(fullNameMatchedImage),
      image: fullNameMatchedImage,
    };
  }
  const value = stripDedicatedOptionPrefix(selectedValue);
  // FR-3499: write the option's own key (`registry/namespace`), which every option is keyed by.
  const selectedEnvironmentGroup = _.find(
    _.flatMap(imageGroups, (group) => group.environmentGroups),
    (envGroup) => envGroup.environmentName === value,
  );
  const firstInListImage: LauncherImage | undefined =
    selectedEnvironmentGroup?.images[0];
  return {
    environment: selectedEnvironmentGroup?.environmentName ?? '',
    version: getImageFullName(firstInListImage),
    image: firstInListImage,
  };
};
