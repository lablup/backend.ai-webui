import type { FlagSpec } from './command.js';
import { CliError } from './errors.js';
import type { Verbosity } from './output.js';

export const GLOBAL_FLAGS: FlagSpec[] = [
  {
    flag: '--json',
    description:
      'Output as typed JSON. Success: { apiVersion, type, data }. Failure: { apiVersion, error, code, suggestions?, hint? }.',
    type: 'boolean',
  },
  {
    flag: '--dense',
    description: 'Text output at the lowest verbosity (token-efficient).',
    type: 'boolean',
  },
  {
    flag: '--detail',
    description: 'Text output at the highest verbosity.',
    type: 'boolean',
  },
  {
    flag: '-h, --help',
    description: 'Show help for the CLI or a command.',
    type: 'boolean',
  },
  {
    flag: '--version',
    description: 'Alias for the `version` command.',
    type: 'boolean',
  },
];

export interface ParsedArgv {
  command?: string;
  args: string[];
  flags: Record<string, string | boolean | string[]>;
  json: boolean;
  help: boolean;
  version: boolean;
  verbosity: Verbosity;
}

const flagNames = (spec: FlagSpec): string[] =>
  spec.flag
    .split(',')
    .map((part) => part.trim().split(/[ =]/)[0])
    .filter((name) => name.startsWith('-'));

function specFor(specs: FlagSpec[], name: string): FlagSpec | undefined {
  return specs.find((spec) => flagNames(spec).includes(name));
}

const canonicalName = (spec: FlagSpec): string =>
  flagNames(spec)
    .find((name) => name.startsWith('--'))!
    .replace(/^--/, '');

/** The command name is the first bare token; needed before its flags parse. */
export function peekCommand(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('-')) return token;
    if (token === '--') return argv[i + 1];
  }
  return undefined;
}

export function parseArgv(
  argv: string[],
  commandFlags: FlagSpec[],
): ParsedArgv {
  const specs = [...GLOBAL_FLAGS, ...commandFlags];
  const flags: Record<string, string | boolean | string[]> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (!token.startsWith('-') || token === '-') {
      positional.push(token);
      continue;
    }
    const [name, inlineValue] = token.includes('=')
      ? [
          token.slice(0, token.indexOf('=')),
          token.slice(token.indexOf('=') + 1),
        ]
      : [token, undefined];

    const spec = specFor(specs, name);
    if (!spec) {
      throw new CliError('usage', `Unknown flag: ${name}`, {
        suggestions: specs.map((candidate) => candidate.flag),
        hint: 'bai-agent --help',
      });
    }
    if (spec.type === 'boolean') {
      if (inlineValue !== undefined) {
        throw new CliError('usage', `Flag ${name} does not take a value.`, {
          hint: 'bai-agent --help',
        });
      }
      flags[canonicalName(spec)] = true;
      continue;
    }
    const value = inlineValue ?? argv[++i];
    if (value === undefined || value.startsWith('-')) {
      throw new CliError('usage', `Flag ${name} requires a value.`, {
        hint: 'bai-agent --help',
      });
    }
    const key = canonicalName(spec);
    if (spec.repeatable) {
      const seen = flags[key];
      flags[key] = Array.isArray(seen) ? [...seen, value] : [value];
      continue;
    }
    flags[key] = value;
  }

  if (flags.dense && flags.detail) {
    throw new CliError(
      'usage',
      '--dense and --detail are mutually exclusive.',
      {
        hint: 'bai-agent --help',
      },
    );
  }

  const [command, ...args] = positional;
  return {
    command,
    args,
    flags,
    json: flags.json === true,
    help: flags.help === true,
    version: flags.version === true,
    verbosity: flags.dense ? 'dense' : flags.detail ? 'detail' : 'normal',
  };
}
