import type { LoggerPlugin } from './useBAILogger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadLogger = async () => {
  vi.resetModules();
  const { default: getLoggerHandle } = await import('./useBAILogger');
  return getLoggerHandle().logger;
};

describe('useBAILogger', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('writes to the console when enabled', async () => {
    const logger = await loadLogger();
    logger.setEnabled(true);
    logger.error('boom');
    expect(errorSpy).toHaveBeenCalledWith('boom');
  });

  it('runs plugins but stays silent on the console when disabled', async () => {
    const logger = await loadLogger();
    const plugin: LoggerPlugin = {
      beforeLog: vi.fn((context) => context),
      afterLog: vi.fn(),
    };
    logger.setEnabled(false).use(plugin);

    logger.error('boom');

    expect(errorSpy).not.toHaveBeenCalled();
    expect(plugin.beforeLog).toHaveBeenCalledTimes(1);
    expect(plugin.afterLog).toHaveBeenCalledWith(
      expect.objectContaining({ level: 4, args: ['boom'] }),
    );
  });

  it('skips console output and afterLog when beforeLog aborts', async () => {
    const logger = await loadLogger();
    const afterLog = vi.fn();
    logger.setEnabled(true).use({ beforeLog: () => null, afterLog });

    logger.error('boom');

    expect(errorSpy).not.toHaveBeenCalled();
    expect(afterLog).not.toHaveBeenCalled();
  });

  it('passes withContext metadata to plugins and clears it afterwards', async () => {
    const logger = await loadLogger();
    const afterLog = vi.fn();
    logger.setEnabled(false).use({ afterLog });

    logger.withContext('component', 'Example').error('boom');
    logger.error('plain');

    expect(afterLog.mock.calls[0][0].metadata).toEqual({
      context: { component: 'Example' },
    });
    expect(afterLog.mock.calls[1][0].metadata).toEqual({});
  });

  it('reports plugin failures through onError', async () => {
    const logger = await loadLogger();
    const failure = new Error('plugin failed');
    const onError = vi.fn();
    logger.setEnabled(false).use({
      afterLog: () => {
        throw failure;
      },
      onError,
    });

    logger.error('boom');

    expect(onError).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({ args: ['boom'] }),
    );
  });
});
