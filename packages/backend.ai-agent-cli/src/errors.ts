/**
 * Error codes are snake_case and stable: they are part of the JSON contract.
 */
export const ERROR_CODES = [
  'usage',
  'auth_required',
  'mutation_refused',
  'not_found',
  'repo_not_found',
  'repo_incomplete',
  'internal',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const EXIT = {
  ok: 0,
  error: 1,
  usage: 2,
  authRequired: 3,
  mutationRefused: 4,
  notFound: 5,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

const EXIT_BY_CODE: Record<ErrorCode, ExitCode> = {
  usage: EXIT.usage,
  auth_required: EXIT.authRequired,
  mutation_refused: EXIT.mutationRefused,
  not_found: EXIT.notFound,
  repo_not_found: EXIT.error,
  repo_incomplete: EXIT.error,
  internal: EXIT.error,
};

export function exitCodeForError(code: ErrorCode): ExitCode {
  return EXIT_BY_CODE[code] ?? EXIT.error;
}

export interface CliErrorOptions {
  /** Alternatives the caller could try; rendered as a list. */
  suggestions?: string[];
  /** A concrete next command to run, never prose. */
  hint?: string;
  cause?: unknown;
}

export class CliError extends Error {
  readonly code: ErrorCode;
  readonly exitCode: ExitCode;
  readonly suggestions?: string[];
  readonly hint?: string;

  constructor(code: ErrorCode, message: string, options: CliErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCodeForError(code);
    this.suggestions = options.suggestions?.length
      ? options.suggestions
      : undefined;
    this.hint = options.hint;
  }
}

export function toCliError(error: unknown): CliError {
  if (error instanceof CliError) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new CliError('internal', message, {
    hint: 'bai-agent doctor',
    cause: error,
  });
}
