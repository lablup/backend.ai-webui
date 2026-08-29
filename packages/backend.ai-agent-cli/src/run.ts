import { parseArgv, peekCommand } from './args.js';
import type { AnyCommand } from './command.js';
import type { ExitCode } from './errors.js';
import { CliError, EXIT, toCliError } from './errors.js';
import { renderHelp } from './help.js';
import { errorEnvelope, renderErrorText, successEnvelope } from './output.js';
import { COMMANDS, findCommand } from './registry.js';

export interface CliIO {
  stdout(chunk: string): void;
  stderr(chunk: string): void;
}

export interface RunCliOptions {
  argv: string[];
  cwd?: string;
  io: CliIO;
}

const writeLine = (write: (chunk: string) => void, body: string): void => {
  write(body.endsWith('\n') ? body : `${body}\n`);
};

/** Single top-level handler: renders the envelope and returns the exit code. */
export async function runCli({
  argv,
  cwd = process.cwd(),
  io,
}: RunCliOptions): Promise<ExitCode> {
  // Pre-scanned so a parse failure still renders in the requested format.
  let json = argv.includes('--json');
  try {
    const requestedName = peekCommand(argv);
    const command: AnyCommand | undefined = requestedName
      ? findCommand(requestedName)
      : undefined;

    const parsed = parseArgv(argv, command?.flags ?? []);
    json = parsed.json;

    if (parsed.help) {
      writeLine(io.stdout, renderHelp(command));
      return EXIT.ok;
    }

    const resolved =
      command ??
      (requestedName === undefined && parsed.version
        ? findCommand('version')
        : undefined);

    if (!resolved) {
      if (requestedName === undefined) {
        writeLine(io.stdout, renderHelp());
        return EXIT.ok;
      }
      throw new CliError('usage', `Unknown command: ${requestedName}`, {
        suggestions: COMMANDS.map((entry) => entry.name),
        hint: 'bai-agent manifest',
      });
    }

    const args = command ? parsed.args : [];
    if (resolved.maxArgs !== undefined && args.length > resolved.maxArgs) {
      throw new CliError(
        'usage',
        resolved.maxArgs === 0
          ? `${resolved.name} takes no positional arguments, got: ${args.join(' ')}`
          : `${resolved.name} takes at most ${resolved.maxArgs} positional argument(s), got: ${args.join(' ')}`,
        { hint: `bai-agent ${resolved.name} --help` },
      );
    }
    const data = await resolved.run({
      cwd,
      commands: COMMANDS,
      args,
      flags: parsed.flags,
      json: parsed.json,
      render: { verbosity: parsed.verbosity },
    });

    if (parsed.json) {
      writeLine(
        io.stdout,
        JSON.stringify(successEnvelope(resolved.name, data), null, 2),
      );
    } else {
      writeLine(
        io.stdout,
        resolved.render(data, { verbosity: parsed.verbosity }),
      );
    }
    return resolved.exitCode?.(data) ?? EXIT.ok;
  } catch (error) {
    const cliError = toCliError(error);
    writeLine(
      io.stderr,
      json
        ? JSON.stringify(errorEnvelope(cliError), null, 2)
        : renderErrorText(cliError),
    );
    return cliError.exitCode;
  }
}
