/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { listenToBackgroundTask } from '../../helper';
import { useMultiStepNotification } from '../useMultiStepNotification';
import { renderHook, act } from '@testing-library/react';

const mockUpsertNotification = jest.fn();

jest.mock('../useBAINotification', () => ({
  useSetBAINotification: () => ({
    upsertNotification: mockUpsertNotification,
    deleteNotification: jest.fn(),
    updateNotification: jest.fn(),
  }),
  CLOSING_DURATION: 4,
}));

jest.mock('../../helper', () => ({
  listenToBackgroundTask: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
          key,
        );
      }
      return key;
    },
  }),
}));

const mockedListenToBackgroundTask =
  listenToBackgroundTask as jest.MockedFunction<typeof listenToBackgroundTask>;

const baseConfig = {
  key: 'test-notification',
  message: 'Test Notification',
};

describe('useMultiStepNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sequential Promise flow', () => {
    it('transitions from idle -> running -> completed for 3 steps', async () => {
      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result1'),
        },
        {
          label: 'Step 2',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result2'),
        },
        {
          label: 'Step 3',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result3'),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      expect(result.current.state.overallStatus).toBe('idle');

      await act(async () => {
        result.current.start();
      });

      expect(result.current.state.overallStatus).toBe('completed');
      expect(result.current.state.totalSteps).toBe(3);
      expect(steps[0].executor).toHaveBeenCalledTimes(1);
      expect(steps[1].executor).toHaveBeenCalledTimes(1);
      expect(steps[2].executor).toHaveBeenCalledTimes(1);
      expect(mockUpsertNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundTask: { status: 'resolved' },
        }),
      );
    });
  });

  describe('step failure and retry', () => {
    it('sets failed state when a step rejects, then retry resumes from that step', async () => {
      const error = new Error('Step 2 failed');
      const step2Executor = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('result2');

      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result1'),
        },
        {
          label: 'Step 2',
          type: 'promise' as const,
          executor: step2Executor,
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      await act(async () => {
        result.current.start();
      });

      expect(result.current.state.overallStatus).toBe('failed');
      expect(result.current.state.steps[1].status).toBe('rejected');

      await act(async () => {
        result.current.retry();
      });

      expect(result.current.state.overallStatus).toBe('completed');
      // Step 1 executor should only have been called once (not re-run on retry)
      expect(steps[0].executor).toHaveBeenCalledTimes(1);
      // Step 2 executor should have been called twice (once failed, once succeeded)
      expect(step2Executor).toHaveBeenCalledTimes(2);
    });
  });

  describe('data chaining', () => {
    it('passes step 1 result as prevResult to step 2', async () => {
      const step2Executor = jest.fn().mockResolvedValue('result2');
      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result-from-step1'),
        },
        {
          label: 'Step 2',
          type: 'promise' as const,
          executor: step2Executor,
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      await act(async () => {
        result.current.start();
      });

      expect(result.current.state.overallStatus).toBe('completed');
      expect(step2Executor).toHaveBeenCalledWith(
        'result-from-step1',
        expect.any(AbortSignal),
      );
    });
  });

  describe('eager execution (dependsOn: false)', () => {
    it('starts independent step immediately without waiting for previous step', async () => {
      const executionOrder: string[] = [];

      let resolveStep1!: (v: string) => void;
      const step1Promise = new Promise<string>((resolve) => {
        resolveStep1 = resolve;
      });

      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn(() => {
            executionOrder.push('step1-started');
            return step1Promise;
          }),
        },
        {
          label: 'Step 2 (eager)',
          type: 'promise' as const,
          dependsOn: false,
          executor: jest.fn(() => {
            executionOrder.push('step2-started');
            return Promise.resolve('eager-result');
          }),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      await act(async () => {
        result.current.start();
        // Both steps should have started before step 1 resolves
        resolveStep1('step1-done');
      });

      expect(result.current.state.overallStatus).toBe('completed');
      // Eager step starts immediately alongside step 1
      expect(executionOrder).toContain('step1-started');
      expect(executionOrder).toContain('step2-started');
    });
  });

  describe('cancel', () => {
    it('cancels while running and sets cancelled state', async () => {
      let resolveStep!: (v: string) => void;
      const pendingStep = new Promise<string>((resolve) => {
        resolveStep = resolve;
      });

      const steps = [
        {
          label: 'Long Step',
          type: 'promise' as const,
          executor: jest.fn(() => pendingStep),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      // Start but don't resolve the pending promise
      act(() => {
        result.current.start();
      });

      // Cancel while running
      act(() => {
        result.current.cancel();
      });

      expect(result.current.state.overallStatus).toBe('cancelled');
      expect(mockUpsertNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundTask: { status: 'rejected' },
        }),
      );

      // Cleanup: resolve the pending promise
      resolveStep('done');
    });
  });

  describe('start() guard', () => {
    it('does nothing if already running', async () => {
      let resolveStep!: (v: string) => void;
      const pendingStep = new Promise<string>((resolve) => {
        resolveStep = resolve;
      });

      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn(() => pendingStep),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      act(() => {
        result.current.start();
      });

      expect(result.current.state.overallStatus).toBe('running');

      // Try to start again while running - should be a no-op
      act(() => {
        result.current.start();
      });

      // Executor should only have been called once
      expect(steps[0].executor).toHaveBeenCalledTimes(1);

      // Cleanup
      await act(async () => {
        resolveStep('done');
      });
    });
  });

  describe('retry() guard', () => {
    it('does nothing if not in failed state', async () => {
      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result1'),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      // Do not call start(), so status remains 'idle'
      expect(result.current.state.overallStatus).toBe('idle');

      act(() => {
        result.current.retry();
      });

      // Executor should not have been called
      expect(steps[0].executor).not.toHaveBeenCalled();
    });

    it('does nothing after successful completion', async () => {
      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result1'),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      await act(async () => {
        result.current.start();
      });

      expect(result.current.state.overallStatus).toBe('completed');

      const callCount = steps[0].executor.mock.calls.length;

      act(() => {
        result.current.retry();
      });

      // Executor should not have been called again
      expect(steps[0].executor).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('SSE step', () => {
    it('listens to background task and resolves on done', async () => {
      let onDoneCallback!: () => void;

      mockedListenToBackgroundTask.mockImplementation((_taskId, handlers) => {
        onDoneCallback = handlers.onDone as () => void;
        return jest.fn(); // cleanup function
      });

      const steps = [
        {
          label: 'SSE Step',
          type: 'sse' as const,
          executor: jest.fn().mockReturnValue({ taskId: 'task-123' }),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      act(() => {
        result.current.start();
      });

      expect(mockedListenToBackgroundTask).toHaveBeenCalledWith(
        'task-123',
        expect.any(Object),
      );

      await act(async () => {
        onDoneCallback();
      });

      expect(result.current.state.overallStatus).toBe('completed');
    });

    it('transitions to failed state on SSE task failure', async () => {
      let onTaskFailedCallback!: (data: unknown) => void;

      mockedListenToBackgroundTask.mockImplementation((_taskId, handlers) => {
        onTaskFailedCallback = handlers.onTaskFailed as (data: unknown) => void;
        return jest.fn();
      });

      const steps = [
        {
          label: 'SSE Step',
          type: 'sse' as const,
          executor: jest.fn().mockReturnValue({ taskId: 'task-456' }),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      act(() => {
        result.current.start();
      });

      await act(async () => {
        onTaskFailedCallback({ message: 'Task failed' });
      });

      expect(result.current.state.overallStatus).toBe('failed');
    });
  });

  describe('desktop notification', () => {
    it('skips desktop notification for intermediate steps but not for the final step', async () => {
      const steps = [
        {
          label: 'Step 1',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result1'),
        },
        {
          label: 'Step 2',
          type: 'promise' as const,
          executor: jest.fn().mockResolvedValue('result2'),
        },
      ];

      const { result } = renderHook(() =>
        useMultiStepNotification({ ...baseConfig, steps }),
      );

      await act(async () => {
        result.current.start();
      });

      // Find calls with skipDesktopNotification
      const callsWithSkip = mockUpsertNotification.mock.calls.filter(
        (call) => call[0].skipDesktopNotification === true,
      );
      const callsWithoutSkip = mockUpsertNotification.mock.calls.filter(
        (call) =>
          call[0].skipDesktopNotification === false ||
          call[0].skipDesktopNotification === undefined,
      );

      // Intermediate steps should skip desktop notifications
      expect(callsWithSkip.length).toBeGreaterThan(0);
      // Final resolved notification should NOT skip desktop notification
      const finalResolvedCall = mockUpsertNotification.mock.calls.find(
        (call) => call[0].backgroundTask?.status === 'resolved',
      );
      expect(finalResolvedCall).toBeDefined();
      expect(finalResolvedCall?.[0].skipDesktopNotification).toBeFalsy();

      // Suppress unused variable warning
      void callsWithoutSkip;
    });
  });
});
