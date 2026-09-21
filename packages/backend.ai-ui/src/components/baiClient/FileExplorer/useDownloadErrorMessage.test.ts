import { DownloadFailedError } from '../../../helper';
import { useDownloadErrorMessage } from './hooks';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// No react-i18next mock on purpose: BUI's own i18n instance is initialised
// synchronously with the bundled locales, so the hook resolves the real
// English copy here and a missing key would surface as the raw key string.
const DOWNLOAD_URL = 'http://10.0.0.1:6021/download?token=jwt';

const renderMessageHook = () => renderHook(() => useDownloadErrorMessage());

describe('useDownloadErrorMessage', () => {
  it('names the proxy origin when the download is unreachable', () => {
    const { result } = renderMessageHook();

    expect(
      result.current(new DownloadFailedError(DOWNLOAD_URL, 'unreachable')),
    ).toBe(
      'Could not reach the storage proxy at http://10.0.0.1:6021. The download did not start.',
    );
  });

  it('reports the HTTP status when the proxy rejected the download', () => {
    const { result } = renderMessageHook();

    expect(
      result.current(
        new DownloadFailedError(DOWNLOAD_URL, 'rejected', { status: 403 }),
      ),
    ).toBe(
      'The storage proxy refused the download (HTTP 403). The download did not start.',
    );
  });

  it('tells the user to allow pop-ups when the download window was blocked', () => {
    const { result } = renderMessageHook();

    expect(
      result.current(new DownloadFailedError(DOWNLOAD_URL, 'popup-blocked')),
    ).toBe(
      'The browser blocked the download window. Allow pop-ups for this site and try again.',
    );
  });

  it('falls back to message, then title, for any other error', () => {
    const { result } = renderMessageHook();

    expect(result.current({ message: 'boom', title: 'Boom' })).toBe('boom');
    expect(result.current({ title: 'Boom' })).toBe('Boom');
    expect(result.current({ message: '', title: 'Boom' })).toBe('Boom');
    expect(result.current(new Error('plain error'))).toBe('plain error');
  });

  it('returns undefined when the error carries no text at all', () => {
    const { result } = renderMessageHook();

    expect(result.current(undefined)).toBeUndefined();
    expect(result.current(null)).toBeUndefined();
    expect(result.current({})).toBeUndefined();
  });
});
