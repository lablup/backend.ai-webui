/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Shared logic for the model-service Start Command UI (FR-3205).
 *
 * Backend contract (26.7.0+, `ModelServiceConfigInput.command` / `shell`):
 * - `shell` set  → backend runs `shell -c {command}` (shell operators work).
 * - `shell` null → backend `shlex.split(command)` then exec (argv, no shell).
 *
 * The WebUI therefore stops tokenizing on the write path and sends the user's
 * raw command string in `command` plus a `shell` derived from the UI mode. The
 * deprecated `startCommand: [String!]` token list is only sent to managers that
 * predate 26.7.0 (see `formatShellCommand` / `tokenizeShellCommand`).
 */
import { formatShellCommand } from './parseCliCommand';

/**
 * Default shell for the model service — the backend/server default, also used
 * as the Basic-mode value and the Advanced → Shell input placeholder.
 */
export const DEFAULT_MODEL_SERVICE_SHELL = '/bin/bash';

/**
 * Frequently used shells offered as suggestions in the Advanced → Shell input.
 * Rendered via `AutoComplete`, so the user can pick one of these or type a
 * custom shell path/binary. Full paths match the backend default form.
 */
export const COMMAND_SHELL_OPTIONS: Array<{ value: string }> = [
  { value: '/bin/bash' },
  { value: '/bin/sh' },
  { value: '/bin/zsh' },
  { value: '/bin/ash' },
];

export type CommandExecutionMode = 'shell' | 'exec';

/**
 * Shell operators / expansions that only work under a shell (Execution = Shell).
 * Used to warn when they appear in an Exec-mode command, where they are passed
 * literally to `execve` and never interpreted.
 */
export const SHELL_OPERATOR_PATTERN = /[;&|<>$`]/;

export interface CommandModeState {
  /** Raw command string shown in the command input. */
  command: string;
  /** Whether the Advanced controls (Execution / Shell) are revealed. */
  advanced: boolean;
  /** Execution mode; only meaningful when `advanced` is true. */
  execution: CommandExecutionMode;
  /** Shell value shown in the Advanced → Shell input. */
  shell: string;
}

/**
 * Derive the Basic/Advanced + Execution + Shell UI state from the stored
 * service fields for prefill.
 *
 * - When the new single-string `command` field is present, the mode is derived
 *   from `shell`: null → Advanced/Exec (no shell), the default `/bin/bash` →
 *   Basic, any other value → Advanced/Shell with that shell.
 * - When only the deprecated `startCommand` token list exists (legacy
 *   revisions, or managers that strip `command`), reconstruct the command
 *   string via `formatShellCommand` and fall back to Basic mode.
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
    return {
      command: commandString,
      advanced: false,
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    };
  }
  if (shell == null) {
    return {
      command: commandString,
      advanced: true,
      execution: 'exec',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    };
  }
  if (shell === DEFAULT_MODEL_SERVICE_SHELL) {
    return {
      command: commandString,
      advanced: false,
      execution: 'shell',
      shell: DEFAULT_MODEL_SERVICE_SHELL,
    };
  }
  return {
    command: commandString,
    advanced: true,
    execution: 'shell',
    shell,
  };
}

/**
 * Resolve the `shell` value to submit given the current UI state.
 * - Basic mode → `undefined` (omit the field entirely so the backend applies
 *   its own default shell instead of the client hard-coding it).
 * - Advanced + Shell → the selected shell (required; falls back to `/bin/bash`).
 * - Advanced + Exec → `null` (no shell).
 *
 * Backend contract (`ModelServiceConfig.shell`, default `/bin/bash`): when a
 * shell is set the kernel runs `[shell, '-c', command]`; a null/empty shell
 * disables shell wrapping and runs the command directly (argv). The Exec mode
 * therefore maps to a null shell.
 *
 * Omitting the field (Basic) relies on the GraphQL input defaulting `shell` to
 * `/bin/bash` (backend BA-6742). On managers predating that change the omitted
 * field collapses to null (= no shell); callers that must guarantee a shell
 * (e.g. the required-shell preset input) coerce `undefined` to the default.
 *
 * `execution` is optional: when omitted (e.g. the preset form, which has no
 * Exec mode) it is treated as Shell, so the result is never null.
 */
export function resolveCommandShell(params: {
  advanced: boolean;
  execution?: CommandExecutionMode;
  shell?: string | null;
}): string | null | undefined {
  const { advanced, execution, shell } = params;
  if (!advanced) return undefined;
  if (execution === 'exec') return null;
  return shell?.trim() || DEFAULT_MODEL_SERVICE_SHELL;
}
