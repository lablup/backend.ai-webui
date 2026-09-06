/**
 * Error codes are snake_case and stable: they are part of the JSON contract.
 */
export const ERROR_CODES = [
  'usage',
  'auth_required',
  'mutation_refused',
  'schema_mismatch',
  'not_found',
  'version_mismatch',
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

export const EXIT_BY_CODE: Record<ErrorCode, ExitCode> = {
  usage: EXIT.usage,
  auth_required: EXIT.authRequired,
  mutation_refused: EXIT.mutationRefused,
  // A document the local SDL rejects is a plain error (1), not a usage error:
  // the CLI parsed the command fine, the checkout's schema disagrees.
  schema_mismatch: EXIT.error,
  not_found: EXIT.notFound,
  version_mismatch: EXIT.error,
  repo_not_found: EXIT.error,
  repo_incomplete: EXIT.error,
  internal: EXIT.error,
};

export function exitCodeForError(code: ErrorCode): ExitCode {
  return EXIT_BY_CODE[code] ?? EXIT.error;
}

/** What each exit number is called when no single error code names it. */
const EXIT_LABELS: Record<ExitCode, string> = {
  [EXIT.ok]: 'ok',
  [EXIT.error]: 'error',
  [EXIT.usage]: 'usage',
  [EXIT.authRequired]: 'auth_required',
  [EXIT.mutationRefused]: 'mutation_refused',
  [EXIT.notFound]: 'not_found',
};

export interface ExitSummary {
  exit: ExitCode;
  label: string;
  /** Every error code that exits with this number, in `ERROR_CODES` order. */
  codes: ErrorCode[];
}

export function exitSummaries(): ExitSummary[] {
  return [...new Set(Object.values(EXIT))]
    .sort((left, right) => left - right)
    .map((exit) => ({
      exit,
      label: EXIT_LABELS[exit],
      codes: ERROR_CODES.filter((code) => EXIT_BY_CODE[code] === exit),
    }));
}

/**
 * The one-line exit table. Derived from `ERROR_CODES` / `EXIT_BY_CODE` so the
 * CLAUDE.md block and `--help` cannot drift from the codes they describe.
 */
export function exitLine(): string {
  return exitSummaries()
    .map(({ exit, label, codes }) => {
      const extra = codes.filter((code) => code !== label);
      if (extra.length === 0) return `${exit} ${label}`;
      const also = codes.length === extra.length ? '' : 'also ';
      return `${exit} ${label} (${also}${extra.join(', ')})`;
    })
    .join(' · ');
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
