/**
 * CLI command parser for the "Paste Your Command" feature.
 *
 * Parses CLI commands (vllm serve, sglang, docker run, etc.) and extracts:
 * - Runtime type (for port/health-check defaults)
 * - Port number (from --port flag or docker -p)
 * - GPU hint (from --tp / --tensor-parallel-size)
 * - Docker env vars (from -e KEY=VALUE)
 * - Shell-tokenized start_command array
 *
 * All parsing is client-side with no external API calls (closed-network compatible).
 */

export type DetectedRuntime = 'vllm' | 'sglang' | 'tgi' | 'unknown';

export interface RuntimeDefaults {
  port: number;
  healthCheckPath: string;
}

export interface ParsedCliCommand {
  /** Detected runtime type (internal hint, not shown in UI) */
  runtime: DetectedRuntime;
  /** Port number: from --port flag, docker -p, or runtime default */
  port: number;
  /** Health check path based on detected runtime */
  healthCheckPath: string;
  /** Model mount destination (always /models for now) */
  modelMountDestination: string;
  /** GPU count hint from --tp / --tensor-parallel-size (null if not found) */
  gpuHint: number | null;
  /** Environment variables extracted from docker -e flags */
  envVars: Array<{ variable: string; value: string }>;
  /** Shell-tokenized command for model-definition.yaml start_command */
  startCommandTokens: string[];
  /** The actual command to execute (docker run arguments stripped) */
  effectiveCommand: string;
}

const RUNTIME_DEFAULTS: Record<DetectedRuntime, RuntimeDefaults> = {
  vllm: { port: 8000, healthCheckPath: '/health' },
  sglang: { port: 9001, healthCheckPath: '/health' },
  tgi: { port: 3000, healthCheckPath: '/info' },
  unknown: { port: 8000, healthCheckPath: '/health' },
};

/**
 * Tokenize a shell command string into an array of tokens.
 * Handles single quotes, double quotes, and escaped characters.
 */
export function tokenizeShellCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\' && !inSingle) {
      escaped = true;
      continue;
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if ((ch === ' ' || ch === '\t' || ch === '\n') && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Detect the runtime type from the first meaningful token(s) of a command.
 */
function detectRuntime(tokens: string[]): DetectedRuntime {
  if (tokens.length === 0) return 'unknown';

  const first = tokens[0].toLowerCase();

  // Direct binary match
  if (first === 'vllm' || first.endsWith('/vllm')) return 'vllm';
  if (first === 'sglang' || first.endsWith('/sglang')) return 'sglang';
  if (
    first === 'text-generation-launcher' ||
    first.endsWith('/text-generation-launcher')
  )
    return 'tgi';

  // python -m module
  if ((first === 'python' || first === 'python3') && tokens[1] === '-m') {
    const module = tokens[2]?.toLowerCase() ?? '';
    if (module === 'vllm' || module.startsWith('vllm.')) return 'vllm';
    if (module === 'sglang' || module.startsWith('sglang.')) return 'sglang';
  }

  return 'unknown';
}

/**
 * Extract --port N or --port=N value from tokens.
 * Returns null if not found.
 */
function extractPort(tokens: string[]): number | null {
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    // --port=N
    if (tok.startsWith('--port=')) {
      const val = parseInt(tok.slice(7), 10);
      if (!isNaN(val) && val > 0 && val <= 65535) return val;
    }

    // --port N
    if (tok === '--port' && i + 1 < tokens.length) {
      const val = parseInt(tokens[i + 1], 10);
      if (!isNaN(val) && val > 0 && val <= 65535) return val;
    }

    // -p N (short form, common in some tools)
    if (tok === '-p' && i + 1 < tokens.length) {
      // Only treat as port if NOT in docker context (docker -p is host:container)
      // This is handled separately in parseDockerCommand
      const val = parseInt(tokens[i + 1], 10);
      if (!isNaN(val) && val > 0 && val <= 65535) {
        // Check if the value contains ':' which indicates docker port mapping
        if (!tokens[i + 1].includes(':')) return val;
      }
    }
  }
  return null;
}

/**
 * Extract --tensor-parallel-size N, --tp N (and =N variants) for GPU hint.
 * Returns null if not found.
 */
function extractGpuHint(tokens: string[]): number | null {
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    // --tensor-parallel-size=N or --tp=N
    if (tok.startsWith('--tensor-parallel-size=') || tok.startsWith('--tp=')) {
      const eqIdx = tok.indexOf('=');
      const val = parseInt(tok.slice(eqIdx + 1), 10);
      if (!isNaN(val) && val > 0) return val;
    }

    // --tensor-parallel-size N or --tp N
    if (
      (tok === '--tensor-parallel-size' || tok === '--tp') &&
      i + 1 < tokens.length
    ) {
      const val = parseInt(tokens[i + 1], 10);
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return null;
}

/**
 * Parse docker-specific flags from a `docker run` command.
 * Returns env vars, container port, and the actual command (after image name).
 */
interface DockerParseResult {
  envVars: Array<{ variable: string; value: string }>;
  containerPort: number | null;
  /** The command tokens after stripping docker run flags and image */
  commandTokens: string[];
  /** The effective command string */
  effectiveCommand: string;
}

function parseDockerCommand(tokens: string[]): DockerParseResult | null {
  // Check if this is a docker run command
  if (tokens.length < 2) return null;
  const first = tokens[0].toLowerCase();
  if (first !== 'docker' && first !== 'podman') return null;
  if (tokens[1] !== 'run') return null;

  const envVars: Array<{ variable: string; value: string }> = [];
  let containerPort: number | null = null;
  let i = 2; // Skip "docker run"

  // Known docker flags that consume the next token
  const flagsWithArg = new Set([
    '-e',
    '--env',
    '-p',
    '--publish',
    '-v',
    '--volume',
    '-w',
    '--workdir',
    '--name',
    '--network',
    '--runtime',
    '--gpus',
    '--shm-size',
    '--memory',
    '-m',
    '--cpus',
    '--entrypoint',
    '--user',
    '-u',
    '--platform',
    '--mount',
    '-l',
    '--label',
    '--restart',
    '--hostname',
    '-h',
    '--cap-add',
    '--cap-drop',
    '--device',
    '--log-driver',
    '--log-opt',
    '--ulimit',
    '--init',
  ]);

  // Boolean flags (no argument)
  const booleanFlags = new Set([
    '-d',
    '--detach',
    '-i',
    '--interactive',
    '-t',
    '--tty',
    '--rm',
    '--privileged',
    '--read-only',
  ]);

  // Parse docker flags until we hit the image name
  while (i < tokens.length) {
    const tok = tokens[i];

    // Boolean flags
    if (booleanFlags.has(tok) || tok === '-it' || tok === '-dt') {
      i++;
      continue;
    }

    // -e KEY=VALUE or --env KEY=VALUE
    if (tok === '-e' || tok === '--env') {
      i++;
      if (i < tokens.length) {
        const envStr = tokens[i];
        const eqIdx = envStr.indexOf('=');
        if (eqIdx > 0) {
          envVars.push({
            variable: envStr.slice(0, eqIdx),
            value: envStr.slice(eqIdx + 1),
          });
        }
      }
      i++;
      continue;
    }

    // -p HOST:CONTAINER or --publish HOST:CONTAINER
    if (tok === '-p' || tok === '--publish') {
      i++;
      if (i < tokens.length) {
        const portMapping = tokens[i];
        const parts = portMapping.split(':');
        if (parts.length >= 2) {
          // Last part is the container port (may have /tcp, /udp suffix)
          const containerPortStr = parts[parts.length - 1].split('/')[0];
          const val = parseInt(containerPortStr, 10);
          if (!isNaN(val) && val > 0 && val <= 65535) {
            containerPort = val;
          }
        }
      }
      i++;
      continue;
    }

    // Other flags with arguments
    if (flagsWithArg.has(tok)) {
      i += 2;
      continue;
    }

    // Flags with = (e.g., --env=KEY=VALUE, --gpus=all)
    if (tok.startsWith('-') && tok.includes('=')) {
      if (tok.startsWith('-e=') || tok.startsWith('--env=')) {
        const envStr = tok.slice(tok.indexOf('=') + 1);
        const eqIdx = envStr.indexOf('=');
        if (eqIdx > 0) {
          envVars.push({
            variable: envStr.slice(0, eqIdx),
            value: envStr.slice(eqIdx + 1),
          });
        }
      } else if (tok.startsWith('-p=') || tok.startsWith('--publish=')) {
        const portMapping = tok.slice(tok.indexOf('=') + 1);
        const parts = portMapping.split(':');
        if (parts.length >= 2) {
          const containerPortStr = parts[parts.length - 1].split('/')[0];
          const val = parseInt(containerPortStr, 10);
          if (!isNaN(val) && val > 0 && val <= 65535) {
            containerPort = val;
          }
        }
      }
      i++;
      continue;
    }

    // Unknown flag with argument
    if (tok.startsWith('-')) {
      // Check if next token looks like a value (not a flag)
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // First non-flag token is the image name, everything after is the command
    const commandTokens = tokens.slice(i + 1);
    return {
      envVars,
      containerPort,
      commandTokens,
      effectiveCommand: commandTokens.join(' '),
    };
  }

  // No command found after image
  return {
    envVars,
    containerPort,
    commandTokens: [],
    effectiveCommand: '',
  };
}

/**
 * Parse a CLI command string and extract service configuration hints.
 *
 * @param command - The raw CLI command string (e.g., "vllm serve /models/my-model --tp 2")
 * @returns Parsed command with extracted configuration values
 */
export function parseCliCommand(command: string): ParsedCliCommand {
  const trimmed = command.trim();
  if (!trimmed) {
    return {
      runtime: 'unknown',
      port: RUNTIME_DEFAULTS.unknown.port,
      healthCheckPath: RUNTIME_DEFAULTS.unknown.healthCheckPath,
      modelMountDestination: '/models',
      gpuHint: null,
      envVars: [],
      startCommandTokens: [],
      effectiveCommand: '',
    };
  }

  const tokens = tokenizeShellCommand(trimmed);

  // Check if this is a docker command
  const dockerResult = parseDockerCommand(tokens);

  let effectiveTokens: string[];
  let envVars: Array<{ variable: string; value: string }> = [];
  let dockerPort: number | null = null;
  let effectiveCommand: string;

  if (dockerResult) {
    effectiveTokens = dockerResult.commandTokens;
    envVars = dockerResult.envVars;
    dockerPort = dockerResult.containerPort;
    effectiveCommand = dockerResult.effectiveCommand;
  } else {
    effectiveTokens = tokens;
    effectiveCommand = trimmed;
  }

  const runtime = detectRuntime(effectiveTokens);
  const defaults = RUNTIME_DEFAULTS[runtime];

  // Extract port: explicit --port > docker -p > runtime default
  const explicitPort = extractPort(effectiveTokens);
  const port = explicitPort ?? dockerPort ?? defaults.port;

  const gpuHint = extractGpuHint(effectiveTokens);

  // For start_command in yaml: use the effective command tokens (not docker wrapper)
  const startCommandTokens =
    effectiveTokens.length > 0 ? effectiveTokens : tokens;

  return {
    runtime,
    port,
    healthCheckPath: defaults.healthCheckPath,
    modelMountDestination: '/models',
    gpuHint,
    envVars,
    startCommandTokens,
    effectiveCommand,
  };
}
