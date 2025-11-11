import { backendaiClientPromise } from '.';
import { useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useEffect } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { useDefaultFileBrowserImageWithFallbackQuery } from 'src/__generated__/useDefaultFileBrowserImageWithFallbackQuery.graphql';
import { getImageFullName } from 'src/helper';

const defaultFileBrowserAtom = atomWithDefault<
  string | null | undefined | Promise<string | null | undefined>
>(async () => {
  // backendaiClientPromise is a promise instance;
  const baiClient = await backendaiClientPromise;
  return _.isEmpty(baiClient._config?.defaultFileBrowserImage)
    ? undefined //if '', treat as undefined
    : baiClient._config?.defaultFileBrowserImage;
});

export const useDefaultFileBrowserImageWithFallback = () => {
  'use memo';
  const [defaultFileBrowserImage, setDefaultFileBrowserImage] = useAtom(
    defaultFileBrowserAtom,
  );
  const relayEnv = useRelayEnvironment();

  // If no default image is configured, fetch the first available image with filebrowser label
  useEffect(() => {
    if (defaultFileBrowserImage === undefined) {
      // TODO: Currently, file browser filtering by server-side is not supported.
      // Once supported, modify the query to fetch only relevant images.
      fetchQuery<useDefaultFileBrowserImageWithFallbackQuery>(
        relayEnv,
        graphql`
          query useDefaultFileBrowserImageWithFallbackQuery(
            $installed: Boolean
          ) {
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
            }
          }
        `,
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
  }, [relayEnv, defaultFileBrowserImage, setDefaultFileBrowserImage]);

  return defaultFileBrowserImage;
};
