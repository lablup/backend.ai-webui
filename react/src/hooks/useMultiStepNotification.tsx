/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { listenToBackgroundTask } from '../helper';
import { CLOSING_DURATION, useSetBAINotification } from './useBAINotification';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Lifecycle states for a single step in a multi-step notification sequence.
 * - `idle`: Step has not started yet
 * - `pending`: Step is currently executing
 * - `resolved`: Step completed successfully
 * - `rejected`: Step failed with an error
 * - `cancelled`: Step was cancelled before completion
 */
export type StepStatus =
  | 'idle'
  | 'pending'
  | 'resolved'
  | 'rejected'
  | 'cancelled';

/**
 * Type of async work a step performs.
 * - `promise`: Step wraps a standard Promise
 * - `sse`: Step uses Server-Sent Events (SSE) via a background task ID
 */
export type StepType = 'promise' | 'sse';

/**
 * Configuration for the action button displayed alongside a notification step.
 */
export interface StepActionButton {
  label: string;
  onClick: () => void;
}

/**
 * Per-status action button overrides for a step.
 * Each key corresponds to a `StepStatus` value that may show a button.
 */
export interface StepActionButtons {
  pending?: StepActionButton;
  resolved?: StepActionButton;
  rejected?: StepActionButton;
  cancelled?: StepActionButton;
}

/**
 * Per-status notification message overrides for a step.
 * Matches the existing `backgroundTask.onChange` pattern in `useBAINotification`.
 */
export interface StepOnChange {
  pending?: string;
  resolved?: string;
  rejected?: string;
}

/**
 * Configuration for a single step in a multi-step notification sequence.
 *
 * @template T - The resolved value type of this step's executor
 * @template P - The resolved value type of the previous step (passed as `prevResult`)
 */
export interface StepDefinition<T = unknown, P = unknown> {
  /**
   * Human-readable label displayed in the notification step counter.
   */
  label: string;

  /**
   * The type of async work this step performs.
   */
  type: StepType;

  /**
   * The async work to execute for this step.
   *
   * For `type: 'promise'`, return a `Promise<T>`.
   * For `type: 'sse'`, return an object with a `taskId` string that identifies
   * the background task to listen to via SSE.
   *
   * @param prevResult - The resolved result of the previous step, or `undefined`
   *   if this is the first step or `dependsOn` is `false`.
   * @param signal - An `AbortSignal` that is aborted when `cancel()` is called.
   */
  executor: (
    prevResult: P | undefined,
    signal: AbortSignal,
  ) => Promise<T> | { taskId: string };

  /**
   * Whether this step depends on the previous step's result.
   * When `false`, the step starts immediately after the previous step begins
   * (eager execution). Defaults to `true`.
   */
  dependsOn?: boolean;

  /**
   * Notification message overrides for each status transition of this step.
   * Follows the same pattern as `backgroundTask.onChange` in `useBAINotification`.
   */
  onChange?: StepOnChange;

  /**
   * Per-status action button configurations for this step's notification.
   */
  actionButtons?: StepActionButtons;
}

/**
 * Runtime state of a single step during execution.
 *
 * @template T - The resolved value type of this step
 */
export interface StepState<T = unknown> {
  /**
   * Current lifecycle status of the step.
   */
  status: StepStatus;

  /**
   * The resolved value from the step's executor, available when `status` is `'resolved'`.
   */
  result?: T;

  /**
   * The error thrown by the step's executor, available when `status` is `'rejected'`.
   */
  error?: Error;

  /**
   * Progress percentage (0–100) for SSE-type steps.
   * Updated as SSE progress events are received.
   */
  progress?: number;
}

/**
 * Action button configuration for the final notification state
 * (e.g., shown when all steps complete or the sequence is cancelled).
 */
export interface FinalStateActionButtons {
  primary?: StepActionButton;
}

/**
 * Top-level configuration object passed to `useMultiStepNotification`.
 */
export interface MultiStepNotificationConfig {
  /**
   * Notification key used for upsert operations. Must be unique per notification instance.
   */
  key: string;

  /**
   * Title displayed in the notification.
   */
  message: string;

  /**
   * Ordered list of steps to execute in sequence.
   */
  steps: StepDefinition[];

  /**
   * Configuration for the final notification state shown after all steps complete successfully.
   */
  onAllCompleted?: {
    message: string;
    actionButtons?: FinalStateActionButtons;
  };

  /**
   * Configuration for the notification state shown when the sequence is cancelled.
   */
  onCancelled?: {
    message: string;
  };
}

/**
 * Overall status of the multi-step notification sequence.
 */
export type OverallStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Aggregated runtime state of the multi-step notification sequence.
 */
export interface MultiStepState {
  /**
   * Zero-based index of the currently executing step.
   */
  currentStep: number;

  /**
   * Total number of steps in the sequence.
   */
  totalSteps: number;

  /**
   * Individual runtime states for each step, indexed in the same order as
   * `MultiStepNotificationConfig.steps`.
   */
  steps: StepState[];

  /**
   * Aggregate status of the entire step sequence.
   */
  overallStatus: OverallStatus;
}

/**
 * Controls and state returned by the `useMultiStepNotification` hook.
 */
export interface MultiStepControls {
  /**
   * Starts the step sequence from the beginning.
   * Has no effect if the sequence is already running.
   */
  start: () => void;

  /**
   * Retries the sequence from the first failed step.
   * Has no effect if the sequence is not in a failed state.
   */
  retry: () => void;

  /**
   * Cancels the currently running sequence.
   * Aborts the active step's signal and transitions the sequence to `'cancelled'`.
   * Has no effect if the sequence is not running.
   */
  cancel: () => void;

  /**
   * Current runtime state of the multi-step sequence.
   */
  state: MultiStepState;
}

function createInitialStepStates(count: number): StepState[] {
  return Array.from({ length: count }, () => ({
    status: 'idle' as StepStatus,
  }));
}

function buildMultiStepData(
  steps: StepDefinition[],
  stepStates: StepState[],
  currentStep: number,
  overallStatus: OverallStatus,
) {
  return {
    currentStep,
    totalSteps: steps.length,
    steps: steps.map((step, idx) => ({
      label: step.label,
      status: stepStates[idx]?.status ?? 'idle',
      progress: stepStates[idx]?.progress,
    })),
    overallStatus,
  };
}

// no-op handler to suppress unhandled promise rejections
const noop = () => {};

/**
 * Hook for managing multi-step async notification sequences.
 *
 * Each step can be a `Promise`-based or SSE-based task. Steps are executed
 * sequentially, with optional eager execution via `dependsOn: false`.
 * The notification is updated at each step transition.
 *
 * @param config - Configuration for the multi-step notification sequence.
 * @returns Controls and state for managing the sequence.
 *
 * @example
 * ```tsx
 * const { start, cancel, state } = useMultiStepNotification({
 *   key: 'my-workflow',
 *   message: 'Running workflow…',
 *   steps: [
 *     {
 *       label: 'Upload',
 *       type: 'promise',
 *       executor: async (_prev, signal) => uploadFile(signal),
 *     },
 *     {
 *       label: 'Process',
 *       type: 'sse',
 *       executor: (prevResult) => ({ taskId: prevResult.taskId }),
 *     },
 *   ],
 *   onAllCompleted: { message: 'Workflow complete' },
 * });
 * ```
 */
export function useMultiStepNotification(
  config: MultiStepNotificationConfig,
): MultiStepControls {
  'use memo';

  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();

  const stepStatesRef = useRef<StepState[]>(
    createInitialStepStates(config.steps.length),
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const sseCleanupMapRef = useRef<Map<number, () => void>>(new Map());
  /**
   * Cache of eagerly-started promises for steps with `dependsOn === false`.
   * Keyed by step index. Entries are deleted once the step is resolved/rejected
   * in the sequential display loop.
   */
  const eagerResultsRef = useRef<Map<number, Promise<unknown>>>(new Map());
  const isMountedRef = useRef(true);

  // Unmount cleanup: abort running sequence and clean up SSE connections
  useEffect(() => {
    const sseCleanupMap = sseCleanupMapRef.current;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      sseCleanupMap.forEach((cleanup) => cleanup());
      sseCleanupMap.clear();
    };
  }, []);

  const [multiStepState, setMultiStepState] = useState<MultiStepState>({
    currentStep: 0,
    totalSteps: config.steps.length,
    steps: createInitialStepStates(config.steps.length),
    overallStatus: 'idle',
  });

  const syncState = useCallback(
    (overallStatus: OverallStatus, currentStep: number) => {
      if (!isMountedRef.current) return;
      const snapshot = _.cloneDeep(stepStatesRef.current);
      setMultiStepState({
        currentStep,
        totalSteps: config.steps.length,
        steps: snapshot,
        overallStatus,
      });
    },
    [config.steps.length],
  );

  const runFromStep = useCallback(
    async (startIndex: number) => {
      const { key, message, steps, onAllCompleted } = config;
      const total = steps.length;

      // Guard: empty steps
      if (total === 0) {
        syncState('completed', 0);
        return;
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      const defaultStepDescription = (idx: number) =>
        t('notification.StepProgress', {
          current: idx + 1,
          total,
          label: steps[idx]?.label ?? '',
        });

      // Open notification as pending
      upsertNotification({
        key,
        message,
        backgroundTask: { status: 'pending', percent: undefined },
        description: defaultStepDescription(startIndex),
        open: true,
        duration: 0,
        skipDesktopNotification: true,
        multiStep: buildMultiStepData(
          steps,
          stepStatesRef.current,
          startIndex,
          'running',
        ),
        extraData: { actionButton: undefined },
      });

      syncState('running', startIndex);

      let prevResult: unknown = undefined;

      // Preserve results from already-completed steps before startIndex
      for (let i = 0; i < startIndex; i++) {
        const existingState = stepStatesRef.current[i];
        if (existingState?.status === 'resolved') {
          prevResult = existingState.result;
        }
      }

      // Fire eager (independent) steps immediately in parallel before entering
      // the sequential display loop. Steps with `dependsOn === false` do not
      // need a previous result so they can start right away.
      for (let i = startIndex; i < total; i++) {
        const step = steps[i];
        if (
          step.dependsOn === false &&
          stepStatesRef.current[i]?.status !== 'resolved'
        ) {
          stepStatesRef.current[i] = { status: 'pending' };
          const eagerStepIndex = i;
          const eagerPromise = (async () => {
            const executorResult = step.executor(undefined as never, signal);
            if (executorResult instanceof Promise) {
              return executorResult;
            }
            // SSE eager step – wrap in a promise identical to the sequential path
            const sseResult = executorResult as { taskId: string };
            return new Promise<unknown>((resolve, reject) => {
              const cleanup = listenToBackgroundTask(sseResult.taskId, {
                onUpdated: _.throttle(
                  () => {
                    // Progress updates for eager SSE steps are intentionally
                    // suppressed here; the sequential display loop will reflect
                    // progress once the display catches up to this step index.
                  },
                  100,
                  { leading: true, trailing: false },
                ),
                onDone: () => {
                  resolve(sseResult);
                },
                onTaskFailed: (data: any) => {
                  reject(new Error(data?.message || 'Background task failed'));
                },
                onFailed: (data: any) => {
                  reject(new Error(data?.message || 'Background task failed'));
                },
                onTaskCancelled: () => {
                  reject(new Error('Background task cancelled'));
                },
              });
              sseCleanupMapRef.current.set(eagerStepIndex, cleanup);

              // Wire abort signal to reject this SSE promise on cancel
              signal.addEventListener(
                'abort',
                () => {
                  cleanup();
                  reject(new Error('Cancelled'));
                },
                { once: true },
              );
            });
          })();
          // Attach .catch(noop) to prevent unhandled rejection if the
          // sequential loop exits early (e.g., earlier step fails).
          eagerPromise.catch(noop);
          eagerResultsRef.current.set(i, eagerPromise);
        }
      }

      for (let i = startIndex; i < total; i++) {
        // Stop the loop if cancel() was called between steps
        if (signal.aborted) return;

        const step = steps[i];

        // Update step to pending
        stepStatesRef.current[i] = { status: 'pending' };
        syncState('running', i);

        const stepPendingDescription =
          step.onChange?.pending ?? defaultStepDescription(i);

        upsertNotification({
          key,
          message,
          backgroundTask: { status: 'pending', percent: undefined },
          description: stepPendingDescription,
          open: true,
          duration: 0,
          skipDesktopNotification: true,
          multiStep: buildMultiStepData(
            steps,
            stepStatesRef.current,
            i,
            'running',
          ),
          extraData: {
            actionButton: step.actionButtons?.pending ?? undefined,
          },
        });

        try {
          if (eagerResultsRef.current.has(i)) {
            // This step was eagerly started – await its cached promise.
            // If it already resolved the await returns immediately; if still
            // pending we wait here just as in the normal sequential path.
            const result = await eagerResultsRef.current.get(i)!;
            eagerResultsRef.current.delete(i);

            // Guard: cancel may have happened while awaiting
            if (signal.aborted) return;

            stepStatesRef.current[i] = { status: 'resolved', result };
            prevResult = result;
          } else {
            const executorInput =
              step.dependsOn === false ? undefined : prevResult;
            const executorResult = step.executor(
              executorInput as never,
              signal,
            );

            if (executorResult instanceof Promise) {
              const result = await executorResult;

              // Guard: cancel may have happened while awaiting
              if (signal.aborted) return;

              stepStatesRef.current[i] = { status: 'resolved', result };
              prevResult = result;
            } else {
              // SSE step - listen to background task via SSE
              const sseResult = executorResult as { taskId: string };
              const result = await new Promise<unknown>((resolve, reject) => {
                const cleanup = listenToBackgroundTask(sseResult.taskId, {
                  onUpdated: _.throttle(
                    (data: any) => {
                      const ratio =
                        data.total_progress > 0
                          ? data.current_progress / data.total_progress
                          : 0;
                      stepStatesRef.current[i] = {
                        ...stepStatesRef.current[i],
                        status: 'pending',
                        progress: ratio * 100,
                      };
                      syncState('running', i);
                      upsertNotification({
                        key,
                        message,
                        backgroundTask: {
                          status: 'pending',
                          percent: ratio * 100,
                        },
                        description: stepPendingDescription,
                        open: true,
                        duration: 0,
                        skipDesktopNotification: true,
                        multiStep: buildMultiStepData(
                          steps,
                          stepStatesRef.current,
                          i,
                          'running',
                        ),
                      });
                    },
                    100,
                    { leading: true, trailing: false },
                  ),
                  onDone: () => {
                    resolve(sseResult);
                  },
                  onTaskFailed: (data: any) => {
                    reject(
                      new Error(data?.message || 'Background task failed'),
                    );
                  },
                  onFailed: (data: any) => {
                    reject(
                      new Error(data?.message || 'Background task failed'),
                    );
                  },
                  onTaskCancelled: () => {
                    reject(new Error('Background task cancelled'));
                  },
                });
                sseCleanupMapRef.current.set(i, cleanup);

                // Wire abort signal to reject this SSE promise on cancel
                signal.addEventListener(
                  'abort',
                  () => {
                    cleanup();
                    reject(new Error('Cancelled'));
                  },
                  { once: true },
                );
              });

              // Guard: cancel may have happened while awaiting
              if (signal.aborted) return;

              stepStatesRef.current[i] = { status: 'resolved', result };
              prevResult = result;
            }
          }

          // Update description after step resolved (intermediate steps skip desktop notification)
          const isLastStep = i === total - 1;
          const stepResolvedDescription =
            step.onChange?.resolved ?? defaultStepDescription(i);

          upsertNotification({
            key,
            message,
            backgroundTask: { status: 'pending', percent: undefined },
            description: stepResolvedDescription,
            open: true,
            duration: 0,
            skipDesktopNotification: !isLastStep,
            multiStep: buildMultiStepData(
              steps,
              stepStatesRef.current,
              i,
              'running',
            ),
            extraData: {
              actionButton: step.actionButtons?.resolved ?? undefined,
            },
          });

          syncState('running', i);
        } catch (err) {
          // If the error is due to abort/cancel, treat as cancellation
          // and let cancel() handle the state transition.
          if (signal.aborted) return;

          const error = err instanceof Error ? err : new Error(String(err));
          stepStatesRef.current[i] = { status: 'rejected', error };
          // Remove the cached eager promise for this step so retry re-executes it
          eagerResultsRef.current.delete(i);

          const stepRejectedDescription =
            step.onChange?.rejected ?? error.message;

          upsertNotification({
            key,
            message,
            backgroundTask: { status: 'rejected', percent: undefined },
            description: stepRejectedDescription,
            open: true,
            duration: CLOSING_DURATION,
            multiStep: buildMultiStepData(
              steps,
              stepStatesRef.current,
              i,
              'failed',
            ),
            extraData: {
              actionButton: step.actionButtons?.rejected ?? undefined,
            },
          });

          syncState('failed', i);
          return;
        }
      }

      // All steps completed
      const completedMessage = onAllCompleted?.message ?? message;
      upsertNotification({
        key,
        message: completedMessage,
        backgroundTask: { status: 'resolved', percent: undefined },
        open: true,
        duration: CLOSING_DURATION,
        multiStep: buildMultiStepData(
          steps,
          stepStatesRef.current,
          total - 1,
          'completed',
        ),
        extraData: {
          actionButton: onAllCompleted?.actionButtons?.primary ?? undefined,
        },
      });

      syncState('completed', total - 1);
    },
    [config, upsertNotification, syncState, t],
  );

  const start = useCallback(() => {
    if (multiStepState.overallStatus === 'running') return;

    // Reset all step states and clear any cached eager promises
    stepStatesRef.current = createInitialStepStates(config.steps.length);
    eagerResultsRef.current.clear();

    runFromStep(0);
  }, [multiStepState.overallStatus, config.steps.length, runFromStep]);

  const retry = useCallback(() => {
    // Retry is only valid from a failed state; cancelled sequences must use start()
    if (multiStepState.overallStatus !== 'failed') return;

    const firstFailedIndex = _.findIndex(
      stepStatesRef.current,
      (s) => s.status === 'rejected',
    );

    if (firstFailedIndex < 0) return;

    // Reset failed and subsequent steps to idle.
    // Preserve already-resolved eager steps so they are not re-executed.
    for (let i = firstFailedIndex; i < stepStatesRef.current.length; i++) {
      const step = config.steps[i];
      const isEagerResolved =
        step?.dependsOn === false &&
        stepStatesRef.current[i]?.status === 'resolved';
      if (!isEagerResolved) {
        stepStatesRef.current[i] = { status: 'idle' };
      }
    }

    // Clear any stale eager promises for steps that were not yet resolved
    eagerResultsRef.current.forEach((_, idx) => {
      if (stepStatesRef.current[idx]?.status !== 'resolved') {
        eagerResultsRef.current.delete(idx);
      }
    });

    runFromStep(firstFailedIndex);
  }, [multiStepState.overallStatus, config.steps, runFromStep]);

  const cancel = useCallback(() => {
    if (multiStepState.overallStatus !== 'running') return;

    abortControllerRef.current?.abort();
    // Clean up all active SSE connections
    sseCleanupMapRef.current.forEach((cleanup) => cleanup());
    sseCleanupMapRef.current.clear();

    // Mark any pending steps as cancelled
    for (let i = 0; i < stepStatesRef.current.length; i++) {
      if (stepStatesRef.current[i]?.status === 'pending') {
        stepStatesRef.current[i] = { status: 'cancelled' };
      }
    }

    // Clear eager results
    eagerResultsRef.current.clear();

    const { key, message, steps, onCancelled } = config;
    const cancelledMessage = onCancelled?.message ?? message;
    const currentStepDef = steps[multiStepState.currentStep];
    const cancelledActionButton = currentStepDef?.actionButtons?.cancelled;

    upsertNotification({
      key,
      message: cancelledMessage,
      backgroundTask: { status: 'rejected', percent: undefined },
      description: onCancelled?.message ?? t('notification.Cancelled'),
      skipDesktopNotification: true,
      open: true,
      duration: CLOSING_DURATION,
      multiStep: buildMultiStepData(
        steps,
        stepStatesRef.current,
        multiStepState.currentStep,
        'cancelled',
      ),
      ...(cancelledActionButton
        ? {
            extraData: {
              actionButton: cancelledActionButton,
            },
          }
        : {}),
    });

    syncState('cancelled', multiStepState.currentStep);
  }, [
    multiStepState.overallStatus,
    multiStepState.currentStep,
    config,
    upsertNotification,
    syncState,
    t,
  ]);

  return {
    start,
    retry,
    cancel,
    state: multiStepState,
  };
}
