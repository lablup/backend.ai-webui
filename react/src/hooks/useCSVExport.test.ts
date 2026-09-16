import {
  MY_SESSION_EXPORT_FIELDS,
  resolveCSVExportRoute,
  useCSVExport,
} from './useCSVExport';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    supports: (flag: string) => supportedFeatures.has(flag),
  }),
}));

vi.mock('./backendai', () => ({
  useCurrentUserRole: () => currentUserRole,
}));

// The query function runs eagerly here so a route that must never touch the
// superadmin-only report GET is observed either issuing it or not.
vi.mock('./reactQueryAlias', () => ({
  useSuspenseTanQuery: ({ queryFn }: { queryFn: () => unknown }) => {
    const data = queryFn();
    return { data: Array.isArray(data) ? data : [] };
  },
}));

vi.mock('backend.ai-ui', () => ({
  useBAISignedRequestWithPromise: () => baiRequest,
  useErrorMessageResolver: () => ({
    getErrorMessage: (_err: unknown, fallback: string) => fallback,
  }),
}));

vi.mock('../helper/csv-util', () => ({
  downloadCSV: (...args: Array<unknown>) => downloadCSVMock(...args),
}));

let supportedFeatures = new Set<string>();
let currentUserRole: string | undefined;
const baiRequest = vi.fn();
const downloadCSVMock = vi.fn();

const resolve = (
  overrides: Partial<Parameters<typeof resolveCSVExportRoute>[0]> = {},
) =>
  resolveCSVExportRoute({
    nodeKey: 'sessions',
    scope: 'admin',
    userRole: 'user',
    supportsExportCSV: true,
    ...overrides,
  });

describe('resolveCSVExportRoute', () => {
  it('keeps a superadmin on the admin route regardless of the requested scope', () => {
    expect(resolve({ userRole: 'superadmin' })).toBe('admin');
    expect(resolve({ userRole: 'superadmin', scope: 'my' })).toBe('admin');
    expect(resolve({ userRole: 'superadmin', nodeKey: 'users' })).toBe('admin');
  });

  it('routes a non-superadmin asking for the personal scope to the my route', () => {
    expect(resolve({ scope: 'my' })).toBe('my');
    expect(resolve({ scope: 'my', userRole: 'admin' })).toBe('my');
  });

  it('gives a non-superadmin no route without the personal scope', () => {
    expect(resolve({ userRole: 'admin' })).toBe('none');
    expect(resolve({ userRole: undefined })).toBe('none');
  });

  it('offers the personal scope for sessions only', () => {
    expect(resolve({ scope: 'my', nodeKey: 'users' })).toBe('none');
    expect(resolve({ scope: 'my', nodeKey: 'audit-logs' })).toBe('none');
  });

  it('falls back to no route on managers without export-csv', () => {
    expect(resolve({ scope: 'my', supportsExportCSV: false })).toBe('none');
    expect(resolve({ userRole: 'superadmin', supportsExportCSV: false })).toBe(
      'none',
    );
  });
});

describe('useCSVExport', () => {
  beforeEach(() => {
    supportedFeatures = new Set(['export-csv']);
    currentUserRole = 'user';
    baiRequest.mockReset();
    baiRequest.mockImplementation(({ method }: { method: string }) =>
      method === 'GET'
        ? Promise.resolve({ report: { fields: [{ key: 'id' }] } })
        : Promise.resolve('id,name\n1,a\n'),
    );
    downloadCSVMock.mockReset();
  });

  it('posts a non-superadmin personal export to the my route and never issues the report GET', async () => {
    const { result } = renderHook(() =>
      useCSVExport('sessions', { scope: 'my' }),
    );

    expect(result.current.supportedFields).toEqual(MY_SESSION_EXPORT_FIELDS);
    expect(baiRequest).not.toHaveBeenCalled();

    const filter = { status: ['TERMINATED', 'CANCELLED'] };
    await act(async () => {
      await result.current.exportCSV(['id', 'name'], filter);
    });

    expect(baiRequest).toHaveBeenCalledTimes(1);
    expect(baiRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: '/v2/export/sessions/my/csv',
      body: { fields: ['id', 'name'], filter },
    });
    expect(downloadCSVMock).toHaveBeenCalledTimes(1);
  });

  it('keeps a superadmin on the admin report GET and the admin export POST', async () => {
    currentUserRole = 'superadmin';
    const { result } = renderHook(() =>
      useCSVExport('sessions', { scope: 'my' }),
    );

    expect(baiRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: '/export/reports/sessions',
    });

    baiRequest.mockClear();
    await act(async () => {
      await result.current.exportCSV(['id']);
    });

    expect(baiRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: '/export/sessions/csv',
      body: { fields: ['id'] },
    });
  });
});
