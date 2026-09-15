/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { baiSignedRequestWithPromise } from '../helper';
import { useTanMutation } from './reactQueryAlias';
import { usePainKiller } from './usePainKiller';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

/**
 * `RescanImagesResponse` / `ImageDTO` from
 * `ai.backend.common.dto.manager.image.response`. Only the fields the callers
 * read are declared; the client package cannot host it while `@ts-nocheck`
 * stands on its resource files.
 */
export interface ScanImageResponse {
  item: {
    id: string;
    name: string;
    registry: string;
    project: string | null;
    tag: string | null;
    architecture: string;
  };
  errors: Array<string>;
}

export interface ScanImageVariables {
  canonical: string;
  architecture: string;
}

/** `POST /admin/images/rescan` for one canonical — the import modal and the Images row action. */
export const useScanImage = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  return useTanMutation<ScanImageResponse, unknown, ScanImageVariables>({
    mutationFn: (values) =>
      baiSignedRequestWithPromise<ScanImageResponse>({
        method: 'POST',
        url: '/admin/images/rescan',
        body: values,
        client: baiClient,
      }),
  });
};

/**
 * Every caller invokes this from a `catch`, so it must never throw and must
 * always return something the reader can act on. A 404 `image_read_not-found`
 * is today's behaviour for a canonical the manager's DB does not already
 * carry, and a 5xx is how a missing tag or manifest surfaces
 * (lablup/backend.ai#14612). What a 404 MEANS differs per caller, so each
 * passes its own copy.
 */
export const useDescribeScanImageError = () => {
  'use memo';
  const { t } = useTranslation();
  const painKiller = usePainKiller();

  return (error: any, notFoundMessage: string) => {
    const statusCode = error?.statusCode;
    if (statusCode === 404 && error?.error_code === 'image_read_not-found') {
      return notFoundMessage;
    }
    if (statusCode === 403) {
      return t('environment.ImportImageRequiresSuperadmin');
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
      // unguarded and throws when config.toml never loaded; guarded here
      // rather than in the hook, which every error path shares (FR-3953).
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
