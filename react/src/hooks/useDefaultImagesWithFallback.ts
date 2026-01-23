import { backendaiClientPromise } from '.';
import { atom, useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useEffect, useEffectEvent } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import {
  useDefaultImagesWithFallbackQuery,
  useDefaultImagesWithFallbackQuery$data,
} from 'src/__generated__/useDefaultImagesWithFallbackQuery.graphql';
import { getImageFullName } from 'src/helper';

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
