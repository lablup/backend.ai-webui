/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  collectPagedExportRows,
  type PagedExportPage,
} from '../helper/pagedExport';
import { CLOSING_DURATION, useSetBAINotification } from './useBAINotification';
import { useBAILogger } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

export interface PagedCSVExportOptions<Row> {
  fetchPage: (limit: number, offset: number) => Promise<PagedExportPage<Row>>;
  /** Builds and downloads the file from every row the walk collected. */
  writeCSV: (rows: Row[]) => void;
}

/**
 * Exports a paginated connection to CSV, reporting each fetched page as
 * progress on one notification. The row cap is announced before this runs —
 * `BAIExportSettings.notice` in the export modal — so the notification only
 * reports the walk. Resolves once the notification has reached its final
 * state; it never rejects.
 */
export const usePagedCSVExport = () => {
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { logger } = useBAILogger();

  return async <Row,>({ fetchPage, writeCSV }: PagedCSVExportOptions<Row>) => {
    const key = upsertNotification({
      message: t('resourcePolicy.ExportCSV'),
      description: t('resourcePolicy.ExportPreparing'),
      open: true,
      backgroundTask: { status: 'pending' },
    });
    try {
      const result = await collectPagedExportRows(
        fetchPage,
        ({ fetched, total }) => {
          upsertNotification({
            key,
            description: t('resourcePolicy.ExportFetchProgress', {
              fetched,
              total,
            }),
            backgroundTask: {
              status: 'pending',
              percent: total > 0 ? (fetched / total) * 100 : 100,
            },
            skipDesktopNotification: true,
          });
        },
      );
      if (result.rows.length === 0) {
        upsertNotification({
          key,
          description: t('resourcePolicy.NoDataToExport'),
          backgroundTask: { status: 'rejected' },
          duration: CLOSING_DURATION,
        });
        return;
      }
      writeCSV(result.rows);
      upsertNotification({
        key,
        description: t('resourcePolicy.ExportedRows', {
          count: result.fetched,
        }),
        backgroundTask: { status: 'resolved', percent: 100 },
        duration: CLOSING_DURATION,
      });
    } catch (error) {
      logger.error(error);
      upsertNotification({
        key,
        description: t('general.FailedToExportCSV'),
        backgroundTask: { status: 'rejected' },
        duration: CLOSING_DURATION,
      });
    }
  };
};
