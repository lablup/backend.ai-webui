/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Shared logic for the model-service Start Command UI (FR-3205).
 *
 * Backend contract (`ModelServiceConfigInput.command` / `shell`, added to the
 * schema in 26.7.0):
 * - `shell` set  → backend runs `shell -c {command}` (shell operators work).
 * - `shell` null → backend `shlex.split(command)` then exec (argv, no shell).
 *
 * The WebUI therefore stops tokenizing on the write path and sends the user's
 * raw command string in `command` plus a `shell` derived from the UI mode. The
 * deprecated `startCommand: [String!]` token list is only sent to managers that
 * the WebUI gates below 26.8.0 (see `formatShellCommand` /
 * `tokenizeShellCommand`, and the capability comment in `client.ts`).
 */
import { formatShellCommand } from './parseCliCommand';

/**
 * Default shell for the model service — the backend/server default, and the
 * Shell input's placeholder.
 */
export const DEFAULT_MODEL_SERVICE_SHELL = '/bin/bash';

/**
 * Suggestion surfaced as the Shell input's placeholder (the user types the
 * path/binary directly) — the backend's own logic assumes `/bin/bash` is
 * present in the image, and steering users toward another shell risks a
 * launch failure if that binary isn't there, so only the one assumption the
 * backend actually makes is suggested.
 */
export const COMMAND_SHELL_OPTIONS: Array<{ value: string }> = [
  { value: DEFAULT_MODEL_SERVICE_SHELL },
];

export type CommandExecutionMode = 'shell' | 'exec';

export interface CommandModeState {
  /** Raw command string shown in the command input. */
  command: string;
  /** Execution mode (Shell or Exec). */
  execution: CommandExecutionMode;
  /** Shell value shown in the Shell input; only meaningful when execution is 'shell'. */
  shell: string;
}

/**
 * Derive the Execution + Shell UI state from the stored service fields for
 * prefill.
 *
 * - When the new single-string `command` field is present, the mode is
 *   derived from `shell`: null/empty → Exec (no shell), any other value →
 *   Shell with that shell.
 * - When only the deprecated `startCommand` token list exists (legacy
 *   revisions, or managers that strip `command`), reconstruct the command
 *   string via `formatShellCommand` and treat it as Exec — a legacy
 *   `startCommand` was an argv array run WITHOUT a shell, so reconstructing
 *   it as Shell would re-interpret operators / expand `$VAR` that were never
 *   meant to be shell syntax.
 */
export function deriveCommandModeState(params: {
  command?: string | null;
  shell?: string | null;
  startCommand?: readonly string[] | null;
}): CommandModeState {
  const { command, shell, startCommand } = params;
  const usingNewCommand = command != null && command !== '';
  const commandString = usingNewCommand
    ? command!
    : formatShellCommand(startCommand ?? []);

  if (!usingNewCommand) {
    if (!commandString) {
      // No command at all (neither `command` nor legacy `startCommand`).
      return {
        command: '',
        execution: 'shell',
        shell: DEFAULT_MODEL_SERVICE_SHELL,
      };
    }
    return {
      command: commandString,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    };
  }
  // The backend treats a null OR empty shell as "no shell wrapping" (Exec).
  if (shell == null || shell.trim() === '') {
    return {
      command: commandString,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    };
  }
  return {
    command: commandString,
    execution: 'shell',
    shell,
  };
}

/**
 * Resolve the `shell` value to submit given the current UI state.
 * - Shell → the selected shell (required; falls back to `/bin/bash`).
 * - Exec → `null` (no shell).
 *
 * Backend contract (`ModelServiceConfig.shell`, default `/bin/bash`): when a
 * shell is set the kernel runs `[shell, '-c', command]`; a null/empty shell
 * disables shell wrapping and runs the command directly (argv).
 *
 * `execution` is optional: when a caller omits it — e.g. a legacy manager that
 * renders no Execution control at all — it is treated as Shell, so the result
 * is never null. Both callers of the shared Service Configuration form do
 * expose Exec (FR-3474), so for them `execution` is always supplied.
 */
export function resolveCommandShell(params: {
  execution?: CommandExecutionMode;
  shell?: string | null;
}): string | null {
  const { execution, shell } = params;
  if (execution === 'exec') return null;
  return shell?.trim() || DEFAULT_MODEL_SERVICE_SHELL;
}
