/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  collectPagedExportRows,
  CSV_EXPORT_MAX_ROWS,
  CSV_EXPORT_PAGE_SIZE,
  type PagedExportProgress,
} from './pagedExport';

const makeServer = (count: number) => {
  const calls: Array<{ limit: number; offset: number }> = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const fetchPage = async (limit: number, offset: number) => {
    calls.push({ limit, offset });
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await Promise.resolve();
    inFlight -= 1;
    const rows = Array.from(
      { length: Math.max(Math.min(limit, count - offset), 0) },
      (_, i) => ({ id: offset + i }),
    );
    return { count, rows };
  };
  return { calls, fetchPage, getMaxInFlight: () => maxInFlight };
};

describe('collectPagedExportRows', () => {
  it('walks every page serially with the export page size', async () => {
    const server = makeServer(250);
    const progress: PagedExportProgress[] = [];
    const result = await collectPagedExportRows(server.fetchPage, (p) =>
      progress.push(p),
    );

    expect(result.rows).toHaveLength(250);
    expect(result.rows[249]).toEqual({ id: 249 });
    expect(result.truncated).toBe(false);
    expect(server.calls).toEqual([
      { limit: CSV_EXPORT_PAGE_SIZE, offset: 0 },
      { limit: CSV_EXPORT_PAGE_SIZE, offset: 100 },
      { limit: CSV_EXPORT_PAGE_SIZE, offset: 200 },
    ]);
    expect(server.getMaxInFlight()).toBe(1);
    expect(progress).toEqual([
      { fetched: 100, total: 250, count: 250 },
      { fetched: 200, total: 250, count: 250 },
      { fetched: 250, total: 250, count: 250 },
    ]);
  });

  it('stops at the cap and reports the export as truncated', async () => {
    const server = makeServer(1234);
    const result = await collectPagedExportRows(server.fetchPage);

    expect(result.rows).toHaveLength(CSV_EXPORT_MAX_ROWS);
    expect(result).toMatchObject({
      fetched: 1000,
      total: 1000,
      count: 1234,
      truncated: true,
    });
    expect(server.calls).toHaveLength(10);
    expect(server.calls.at(-1)).toEqual({ limit: 100, offset: 900 });
  });

  it('fetches a single page when the set fits in one', async () => {
    const server = makeServer(4);
    const result = await collectPagedExportRows(server.fetchPage);

    expect(result.rows).toHaveLength(4);
    expect(server.calls).toEqual([{ limit: 100, offset: 0 }]);
  });

  it('returns no rows and one request for an empty set', async () => {
    const server = makeServer(0);
    const result = await collectPagedExportRows(server.fetchPage);

    expect(result).toEqual({
      rows: [],
      fetched: 0,
      total: 0,
      count: 0,
      truncated: false,
    });
    expect(server.calls).toHaveLength(1);
  });

  it('never holds more than the cap even if a page overflows its limit', async () => {
    const fetchPage = async () => ({
      count: 20,
      rows: Array.from({ length: 20 }, (_, i) => ({ id: i })),
    });
    const result = await collectPagedExportRows(fetchPage, undefined, {
      pageSize: 5,
      maxRows: 7,
    });

    expect(result.rows).toHaveLength(7);
    expect(result.truncated).toBe(true);
  });

  it('stops when a page comes back empty before the count is reached', async () => {
    let calls = 0;
    const fetchPage = async () => {
      calls += 1;
      return { count: 500, rows: [] };
    };
    const result = await collectPagedExportRows(fetchPage);

    expect(calls).toBe(1);
    expect(result.rows).toHaveLength(0);
  });
});
