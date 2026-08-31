import type { ExitCode } from './errors.js';
import type { RenderOptions } from './output.js';

export interface FlagSpec {
  /** As shown in help / manifest, e.g. `--json` or `--limit <n>`. */
  flag: string;
  description: string;
  type: 'boolean' | 'string';
  default?: string;
}

export interface RunContext {
  cwd: string;
  /** The command table, passed in so no command has to import the registry. */
  commands: AnyCommand[];
  /** Positional arguments after the command name. */
  args: string[];
  flags: Record<string, string | boolean>;
  json: boolean;
  render: RenderOptions;
  /** Progress lines; goes to stderr so `--json` stdout stays one envelope. */
  notify(message: string): void;
}

export interface CommandModule<D> {
  name: string;
  summary: string;
  usage: string;
  flags: FlagSpec[];
  /** Positional arguments accepted; extras are a usage error. */
  maxArgs?: number;
  run(context: RunContext): D | Promise<D>;
  /** Text output MUST be derived from the same data the JSON envelope carries. */
  render(data: D, options: RenderOptions): string;
  exitCode?(data: D): ExitCode;
}

export interface AnyCommand {
  name: string;
  summary: string;
  usage: string;
  flags: FlagSpec[];
  maxArgs?: number;
  run(context: RunContext): Promise<unknown>;
  render(data: unknown, options: RenderOptions): string;
  exitCode?(data: unknown): ExitCode;
}

export function defineCommand<D>(spec: CommandModule<D>): AnyCommand {
  const exitCode = spec.exitCode;
  return {
    name: spec.name,
    summary: spec.summary,
    usage: spec.usage,
    flags: spec.flags,
    maxArgs: spec.maxArgs,
    run: async (context) => spec.run(context),
    render: (data, options) => spec.render(data as D, options),
    exitCode: exitCode ? (data) => exitCode(data as D) : undefined,
  };
}
