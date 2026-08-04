/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise, useSuspendedBackendaiClient } from '.';
import {
  useDefaultImagesWithFallbackQuery,
  useDefaultImagesWithFallbackQuery$data,
} from '../__generated__/useDefaultImagesWithFallbackQuery.graphql';
import {
  getImageFullName,
  parseImageString,
  resolveImageStringFromImages,
} from '../helper';
import { atom, useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

const IMAGES_QUERY = graphql`
  query useDefaultImagesWithFallbackQuery($installed: Boolean) {
    images(is_installed: $installed) {
      id
      tag
      registry
      architecture
      name @deprecatedSince(version: "24.12.0")
      namespace @since(version: "24.12.0")
      labels {
        key
        value
      }
      tags @since(version: "24.12.0") {
        key
        value
      }
      resource_limits {
        key
        min
        max
      }
    }
  }
`;

const defaultFileBrowserImageAtom = atomWithDefault<
  string | null | undefined | Promise<string | null | undefined>
>(async () => {
  const baiClient = await backendaiClientPromise;
  return _.isEmpty(baiClient._config?.defaultFileBrowserImage)
    ? undefined
    : baiClient._config?.defaultFileBrowserImage;
});

const systemSSHImageAtom = atomWithDefault<
  string | null | undefined | Promise<string | null | undefined>
>(async () => {
  const baiClient = await backendaiClientPromise;
  return _.isEmpty(baiClient._config?.systemSSHImage)
    ? undefined
    : baiClient._config?.systemSSHImage;
});
const systemSSHImageInfoAtom =
  atom<NonNullable<useDefaultImagesWithFallbackQuery$data['images']>[number]>();

export const useDefaultFileBrowserImageWithFallback = () => {
  'use memo';
  const [defaultFileBrowserImage, setDefaultFileBrowserImage] = useAtom(
    defaultFileBrowserImageAtom,
  );
  const relayEnv = useRelayEnvironment();

  const getImage = useEffectEvent(() => {
    if (defaultFileBrowserImage === undefined) {
      // TODO: Currently, file browser filtering by server-side is not supported.
      // Once supported, modify the query to fetch only relevant images.
      fetchQuery<useDefaultImagesWithFallbackQuery>(
        relayEnv,
        IMAGES_QUERY,
        {
          installed: true,
        },
        {
          fetchPolicy: 'store-or-network',
        },
      )
        .toPromise()
        .then((response) =>
          response?.images?.filter((image) =>
            image?.labels?.find(
              (label) =>
                label?.key === 'ai.backend.service-ports' &&
                label?.value?.toLowerCase().includes('filebrowser'),
            ),
          ),
        )
        .then(async (filebrowserImages) => {
          const firstImage = _.first(filebrowserImages);
          setDefaultFileBrowserImage(
            firstImage ? getImageFullName(firstImage) : null,
          );
        })
        .catch(() => {
          // in case of error, set null to disable file browser button
          setDefaultFileBrowserImage(null);
        });
    }
  });

  useEffect(() => {
    getImage();
  }, []);

  return defaultFileBrowserImage;
};

/**
 * Resolve a possibly-partial image reference into a full
 * `registry/namespace:tag@arch` name, using the registered image list.
 *
 * `ImageEnvironmentSelectFormItems` performs this matching for the session
 * launcher form, but launch paths that never render that form (the Start from
 * URL import features) previously passed the configured string straight to the
 * manager. A documented partial value such as `cr.backend.ai/stable/python`
 * then reached the manager verbatim, which resolves it to a `:latest` tag that
 * is not registered, failing the launch (FR-3462).
 *
 * A fully-qualified reference skips the lookup entirely, and anything that
 * cannot be resolved is returned unchanged so the server keeps reporting the
 * misconfiguration exactly as before.
 */
export const useImageReferenceResolver = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const baiClient = useSuspendedBackendaiClient();
  // Mirror the candidate set `ImageEnvironmentSelectFormItems` queries, so both
  // launch paths resolve the same reference to the same image. Narrowing to
  // installed images here would make a tag-less default pick an older image
  // than the launcher form does when `showNonInstalledImages` is enabled.
  const imageQueryVariables = baiClient?._config?.showNonInstalledImages
    ? {}
    : { installed: true };

  const resolveImageReference = async (
    imageString: string | undefined,
  ): Promise<string | undefined> => {
    if (!imageString) return imageString;

    const { hasTag, hasArch } = parseImageString(imageString);
    // Already fully qualified — no lookup needed.
    if (hasTag && hasArch) return imageString;

    try {
      const response = await fetchQuery<useDefaultImagesWithFallbackQuery>(
        relayEnv,
        IMAGES_QUERY,
        imageQueryVariables,
        {
          fetchPolicy: 'store-or-network',
        },
      ).toPromise();

      return (
        resolveImageStringFromImages(imageString, response?.images) ??
        imageString
      );
    } catch {
      // Keep the original value so the launch surfaces the server-side error
      // instead of silently doing nothing.
      return imageString;
    }
  };

  return { resolveImageReference };
};

export const useDefaultSystemSSHImageWithFallback = () => {
  'use memo';
  const [systemSSHImage, setSystemSSHImage] = useAtom(systemSSHImageAtom);
  const [systemSSHImageInfo, setSystemSSHImageInfo] = useAtom(
    systemSSHImageInfoAtom,
  );
  const relayEnv = useRelayEnvironment();

  const getImage = useEffectEvent(() => {
    if (systemSSHImage === undefined) {
      // TODO: Currently, SSH/SFTP filtering by server-side is not supported.
      // Once supported, modify the query to fetch only relevant images.
      fetchQuery<useDefaultImagesWithFallbackQuery>(
        relayEnv,
        IMAGES_QUERY,
        {
          installed: true,
        },
        {
          fetchPolicy: 'store-or-network',
        },
      )
        .toPromise()
        .then((response) =>
          response?.images?.filter((image) =>
            image?.labels?.find(
              (label) =>
                label?.key === 'ai.backend.role' &&
                label?.value?.toLowerCase().includes('system'),
            ),
          ),
        )
        .then(async (sshImages) => {
          const firstImage = _.first(sshImages);
          setSystemSSHImage(firstImage ? getImageFullName(firstImage) : null);
          setSystemSSHImageInfo(firstImage || undefined);
        })
        .catch(() => {
          // in case of error, set null to disable SFTP button
          setSystemSSHImage(null);
        });
    }
  });

  useEffect(() => {
    getImage();
  }, []);

  return { systemSSHImage, systemSSHImageInfo };
};
