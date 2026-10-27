/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** Rows per request when a CSV export walks a paginated connection. */
export const CSV_EXPORT_PAGE_SIZE = 100;
/** Rows one export holds at most: ten serial requests of a page each. */
export const CSV_EXPORT_MAX_ROWS = 1000;

export interface PagedExportPage<Row> {
  /** The connection's total under the export's filter. */
  count: number;
  rows: Row[];
}

export interface PagedExportProgress {
  fetched: number;
  /** Rows this export will hold: the count, capped at `maxRows`. */
  total: number;
  /** The connection's total; larger than `total` when the export is capped. */
  count: number;
}

export interface PagedExportResult<Row> extends PagedExportProgress {
  rows: Row[];
  truncated: boolean;
}

/**
 * Walks a paginated connection one page at a time, in order, until it holds
 * every row or `maxRows`, whichever comes first. Requests are never issued in
 * parallel.
 */
export const collectPagedExportRows = async <Row>(
  fetchPage: (limit: number, offset: number) => Promise<PagedExportPage<Row>>,
  onProgress?: (progress: PagedExportProgress) => void,
  {
    pageSize = CSV_EXPORT_PAGE_SIZE,
    maxRows = CSV_EXPORT_MAX_ROWS,
  }: { pageSize?: number; maxRows?: number } = {},
): Promise<PagedExportResult<Row>> => {
  const rows: Row[] = [];
  let count = 0;
  let total = 0;
  do {
    const page = await fetchPage(
      Math.min(pageSize, maxRows - rows.length),
      rows.length,
    );
    count = page.count;
    total = Math.min(count, maxRows);
    rows.push(...page.rows.slice(0, Math.max(total - rows.length, 0)));
    onProgress?.({ fetched: rows.length, total, count });
    // A page with no rows while the count still promises more: stop rather
    // than re-request the same offset forever.
    if (page.rows.length === 0) break;
  } while (rows.length < total);
  return {
    rows,
    fetched: rows.length,
    total,
    count,
    truncated: count > total,
  };
};
