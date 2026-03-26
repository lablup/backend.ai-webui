/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

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

/**
 * Hook for managing multi-step async notification sequences.
 *
 * Each step can be a `Promise`-based or SSE-based task. Steps are executed
 * sequentially, with optional eager execution via `dependsOn: false`.
 * The notification is updated at each step transition.
 *
 * @param _config - Configuration for the multi-step notification sequence.
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
 *
 * @remarks
 * This is a placeholder. The implementation will be added in a follow-up task.
 */
export function useMultiStepNotification(
  _config: MultiStepNotificationConfig,
): MultiStepControls {
  throw new Error('Not implemented yet');
}
