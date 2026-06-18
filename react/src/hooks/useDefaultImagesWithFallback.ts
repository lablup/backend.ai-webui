/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise } from '.';
import {
  useDefaultImagesWithFallbackQuery,
  useDefaultImagesWithFallbackQuery$data,
} from '../__generated__/useDefaultImagesWithFallbackQuery.graphql';
import { findMatchingImage, getImageFullName } from '../helper';
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

// Start as `undefined` so the hook's effect always runs the image fetch and
// resolves the configured image (if any) against the installed image list via
// `findMatchingImage`. This lets shorthand config values
// (e.g. "registry/namespace" without a tag/arch) be matched to a concrete
// installed image instead of being used verbatim. Resolution falls back to the
// raw config value when no installed image matches, so a configured value is
// never lost.
const defaultFileBrowserImageAtom = atomWithDefault<
  string | null | undefined | Promise<string | null | undefined>
>(async () => undefined);

const systemSSHImageAtom = atomWithDefault<
  string | null | undefined | Promise<string | null | undefined>
>(async () => undefined);
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
          const baiClient = await backendaiClientPromise;
          const configValue = baiClient._config?.defaultFileBrowserImage;
          const validImages =
            filebrowserImages?.filter(
              (image): image is NonNullable<typeof image> => image != null,
            ) ?? [];

          // Use findMatchingImage if config value exists, otherwise take first filtered image
          const matchedImage = configValue
            ? findMatchingImage(configValue, validImages)
            : _.first(validImages);

          // Fall back to the raw config value when it cannot be resolved to an
          // installed image, so an explicitly configured image is never lost.
          setDefaultFileBrowserImage(
            matchedImage
              ? getImageFullName(matchedImage)
              : configValue || null,
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
          const baiClient = await backendaiClientPromise;
          const configValue = baiClient._config?.systemSSHImage;
          const validImages =
            sshImages?.filter(
              (image): image is NonNullable<typeof image> => image != null,
            ) ?? [];

          // Use findMatchingImage if config value exists, otherwise take first filtered image
          const matchedImage = configValue
            ? findMatchingImage(configValue, validImages)
            : _.first(validImages);

          // Fall back to the raw config value when it cannot be resolved to an
          // installed image, so an explicitly configured image is never lost.
          setSystemSSHImage(
            matchedImage ? getImageFullName(matchedImage) : configValue || null,
          );
          setSystemSSHImageInfo(matchedImage || undefined);
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
