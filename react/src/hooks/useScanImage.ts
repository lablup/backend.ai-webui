/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useScanImageMutation } from '../__generated__/useScanImageMutation.graphql';
import { usePainKiller } from './usePainKiller';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';
import type { PayloadError } from 'relay-runtime';

export interface ScanImageVariables {
  canonical: string;
  architecture: string;
}

/** A GraphQL error as the manager sends it; Relay's type drops `extensions`. */
type ManagerPayloadError = PayloadError & {
  extensions?: { code?: string };
};

/**
 * `adminScanImage` for one canonical — the Images row action. The REST
 * `POST /admin/images/rescan` cannot serve it on 26.10: the manager answers
 * every call with a 400 while serializing the image's resource limits.
 *
 * Rejects with `{ error_code, title }` for a GraphQL error, or with the
 * transport error as the client raised it.
 */
export const useScanImage = () => {
  'use memo';
  const [commitScanImage] = useMutation<useScanImageMutation>(graphql`
    mutation useScanImageMutation($input: ScanImageInput!) {
      adminScanImage(input: $input) {
        item {
          id
        }
      }
    }
  `);

  return (input: ScanImageVariables) =>
    new Promise<void>((resolve, reject) => {
      commitScanImage({
        variables: { input },
        onCompleted: (response, errors) => {
          const error = _.first(errors) as ManagerPayloadError | undefined;
          if (error) {
            reject({
              error_code: error.extensions?.code,
              title: error.message,
            });
          } else if (!response.adminScanImage?.item) {
            reject({});
          } else {
            resolve();
          }
        },
        onError: reject,
      });
    });
};

/** The copy only this caller can word: the same failure means different things. */
export interface ScanImageErrorMessages {
  /** `image_read_not-found`: the registry has no such tag for the architecture. */
  notFound: string;
  /** 403 — naming the operation the caller was actually attempting. */
  forbidden: string;
}

/**
 * Every caller invokes this from a `catch`, so it must never throw and must
 * always return something the reader can act on. The caller words the
 * not-found and 403 copy.
 */
export const useDescribeScanImageError = () => {
  'use memo';
  const { t } = useTranslation();
  const painKiller = usePainKiller();

  return (error: any, messages: ScanImageErrorMessages) => {
    if (error?.error_code === 'image_read_not-found') {
      return messages.notFound;
    }
    const statusCode = error?.statusCode;
    if (statusCode === 403) {
      return messages.forbidden;
    }
    // `client.ts` stamps 408 on both its own 30s deadline and a user abort;
    // the manager keeps scanning either way, so a retry is safe.
    if (statusCode === 408) {
      return t('environment.ImportImageScanTimedOut');
    }
    if (_.isNumber(statusCode) && statusCode >= 500 && statusCode <= 599) {
      return t('environment.ImportImageScanFailedOnServer');
    }
    const title = _.isString(error?.title) ? error.title : undefined;
    let relieved: string | undefined;
    try {
      // `usePainKiller().relieve` reads `globalThis.backendaiwebui.debug`
      // unguarded and throws when config.toml never loaded (FR-3953).
      relieved = title ? painKiller.relieve(title) : undefined;
    } catch {
      relieved = undefined;
    }
    return (
      relieved ||
      title ||
      (error?.isError ? error?.message : undefined) ||
      t('error.UnexpectedError')
    );
  };
};
