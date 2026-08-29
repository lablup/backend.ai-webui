/**
 * A hand-rolled MCP stdio client for `@mcp-b/webmcp-local-relay` (FR-3771).
 *
 * The CLI ships with no runtime dependencies, so the MCP SDK is not available
 * here — but the relay speaks newline-delimited JSON-RPC 2.0 over stdio, which
 * is small enough to write out. The framing is the same one
 * `scripts/webmcp-client.mjs` uses; this module is that script's logic made
 * testable: the transport is a spawned command, so a test can point it at a
 * fake server instead of the real relay.
 */
import { CliError } from '../errors.js';
import { CLI_NAME } from '../meta.js';
import { tryResolveRepoContext } from '../repo-context.js';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/** MCP protocol revision the relay 4.x negotiates. */
export const MCP_PROTOCOL_VERSION = '2025-06-18';

/** The relay's own management tools; a tab's tools never start with this. */
export const RELAY_TOOL_PREFIX = 'webmcp_';

export const LIST_SOURCES_TOOL = 'webmcp_list_sources';
export const LIST_TOOLS_TOOL = 'webmcp_list_tools';

/** The WebUI's page-independent navigation tool (`WebMCPGlobalTools.tsx`). */
export const OPEN_RESOURCE_TOOL = 'bai_open_resource';

/** One connected browser tab, as `webmcp_list_sources` reports it. */
export interface RelaySource {
  sourceId: string;
  tabId: string;
  origin?: string;
  url?: string;
  title?: string;
  toolCount: number;
  lastSeenAt?: number;
}

/** One aggregated tool, as `webmcp_list_tools` reports it. */
export interface RelayTool {
  /** Public name, suffixed with a short tab id when two tabs collide. */
  name: string;
  /** Name the page registered, before disambiguation. */
  originalName?: string;
  description?: string;
  sources?: RelaySource[];
}

export interface CallToolResult {
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

interface JsonRpcResponse {
  id?: number;
  result?: unknown;
  error?: { code: number; message: string };
  method?: string;
}

export interface RelayCommand {
  command: string;
  args: string[];
  /** Where the binary came from, for `doctor` and error messages. */
  source: 'checkout' | 'npx' | 'env';
  /** Package version, when it can be read off disk. */
  version?: string;
}

/** The relay's own `package.json` version, next to the resolved entry. */
function relayVersion(entryDir: string): string | undefined {
  try {
    const manifest = JSON.parse(
      readFileSync(join(entryDir, '..', 'package.json'), 'utf8'),
    ) as { version?: string };
    return manifest.version;
  } catch {
    return undefined;
  }
}

/** Points the CLI at a different relay binary (a pinned build, or a test double). */
export const RELAY_CMD_ENV = 'BAI_AGENT_RELAY_CMD';

/**
 * The relay binary to spawn. `$BAI_AGENT_RELAY_CMD` wins; otherwise the
 * checkout's own copy — it is the version the dev server's embed script was
 * built against — and `npx` is the fallback for a CLI installed outside one.
 */
export function resolveRelayCommand(
  cwd: string,
  extraArgs: string[] = [],
  env: NodeJS.ProcessEnv = process.env,
): RelayCommand {
  const override = env[RELAY_CMD_ENV]?.trim();
  if (override) {
    const [command, ...args] = override.split(/\s+/);
    return { command, args: [...args, ...extraArgs], source: 'env' };
  }
  const resolved = tryResolveRepoContext(cwd);
  if (resolved.ok) {
    try {
      const require = createRequire(
        join(resolved.context.repoRoot, 'react', 'package.json'),
      );
      // The package's exports map hides its bin, so resolve the main entry and
      // walk to the sibling `cli.mjs`.
      const entryDir = dirname(require.resolve('@mcp-b/webmcp-local-relay'));
      const cli = join(entryDir, 'cli.mjs');
      if (existsSync(cli)) {
        const version = relayVersion(entryDir);
        return {
          command: process.execPath,
          args: [cli, ...extraArgs],
          source: 'checkout',
          ...(version ? { version } : {}),
        };
      }
    } catch {
      // Fall through to npx.
    }
  }
  return {
    command: 'npx',
    args: ['-y', '@mcp-b/webmcp-local-relay', ...extraArgs],
    source: 'npx',
  };
}

export interface RelayClientOptions {
  command: string;
  args: string[];
  /** Per-request timeout. */
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}

export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

/** A live relay process plus the JSON-RPC conversation with it. */
export class RelayClient {
  private child: ChildProcessWithoutNullStreams | null = null;
  private nextId = 1;
  private buffer = '';
  private stderr = '';
  private exited = false;
  /** `serverInfo` from the handshake: the relay's own name and version. */
  serverInfo: { name?: string; version?: string } = {};
  private readonly pending = new Map<
    number,
    {
      resolve: (value: JsonRpcResponse) => void;
      reject: (error: Error) => void;
    }
  >();

  constructor(private readonly options: RelayClientOptions) {}

  /** Spawns the relay and completes the MCP handshake. */
  async start(): Promise<void> {
    const child = spawn(this.options.command, this.options.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: this.options.env ?? process.env,
    }) as ChildProcessWithoutNullStreams;
    this.child = child;

    child.on('error', (error) => {
      this.exited = true;
      this.failAll(error);
    });
    child.on('exit', (code, signal) => {
      this.exited = true;
      this.failAll(
        new Error(
          `relay exited (code ${code ?? 'null'}, signal ${signal ?? 'null'})${
            this.stderr ? `: ${this.stderr.trim()}` : ''
          }`,
        ),
      );
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      this.stderr += chunk;
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => this.consume(chunk));

    const handshake = await this.request('initialize', {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: CLI_NAME, version: '1' },
    });
    this.serverInfo =
      (handshake.result as { serverInfo?: { name?: string; version?: string } })
        ?.serverInfo ?? {};
    this.write({ jsonrpc: '2.0', method: 'notifications/initialized' });
  }

  private consume(chunk: string): void {
    this.buffer += chunk;
    for (;;) {
      const index = this.buffer.indexOf('\n');
      if (index < 0) return;
      const line = this.buffer.slice(0, index).trim();
      this.buffer = this.buffer.slice(index + 1);
      if (!line) continue;
      let message: JsonRpcResponse;
      try {
        message = JSON.parse(line) as JsonRpcResponse;
      } catch {
        continue; // Log noise on stdout is not our conversation.
      }
      if (message.id === undefined) continue; // A notification.
      const waiter = this.pending.get(message.id);
      if (!waiter) continue;
      this.pending.delete(message.id);
      waiter.resolve(message);
    }
  }

  private failAll(error: Error): void {
    for (const waiter of this.pending.values()) waiter.reject(error);
    this.pending.clear();
  }

  private write(payload: unknown): void {
    this.child?.stdin.write(`${JSON.stringify(payload)}\n`);
  }

  private request(method: string, params: unknown): Promise<JsonRpcResponse> {
    if (this.exited) return Promise.reject(new Error('relay is not running'));
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const id = this.nextId++;
    return new Promise<JsonRpcResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new Error(`relay did not answer ${method} within ${timeoutMs}ms`),
        );
      }, timeoutMs);
      timer.unref?.();
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.write({ jsonrpc: '2.0', id, method, params });
    });
  }

  private async call(method: string, params: unknown): Promise<unknown> {
    const response = await this.request(method, params);
    if (response.error) {
      throw new CliError(
        'internal',
        `relay ${method}: ${response.error.message}`,
        { hint: `${CLI_NAME} doctor --json` },
      );
    }
    return response.result;
  }

  /** Every tool the relay exposes, its own management ones included. */
  async listToolNames(): Promise<string[]> {
    const result = (await this.call('tools/list', {})) as
      | { tools?: Array<{ name: string }> }
      | undefined;
    return result?.tools?.map((tool) => tool.name) ?? [];
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<CallToolResult> {
    return (await this.call('tools/call', {
      name,
      arguments: args,
    })) as CallToolResult;
  }

  /** Connected browser tabs. Empty is a normal answer, not a failure. */
  async listSources(): Promise<RelaySource[]> {
    const result = await this.callTool(LIST_SOURCES_TOOL, {});
    return readStructured<{ sources?: RelaySource[] }>(result)?.sources ?? [];
  }

  /** Aggregated tab tools, each carrying the source(s) that publish it. */
  async listRelayedTools(): Promise<RelayTool[]> {
    const result = await this.callTool(LIST_TOOLS_TOOL, {});
    return readStructured<{ tools?: RelayTool[] }>(result)?.tools ?? [];
  }

  /**
   * Polls `webmcp_list_sources` until a tab shows up. A freshly spawned relay
   * takes over the WebSocket port, so an already-open tab needs a moment to
   * reconnect before it becomes visible.
   */
  async waitForSources(timeoutMs: number, pollMs = 250): Promise<RelaySource[]> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      // Ask for the tool list first, exactly as `scripts/webmcp-client.mjs`
      // does while it waits: a relay running in client mode (one already owns
      // the port) answers `webmcp_list_sources` from a cache the upstream
      // fills by push, and polling only that can miss a tab that is already
      // connected.
      await this.listToolNames().catch(() => []);
      const sources = await this.listSources();
      if (sources.length > 0 || Date.now() >= deadline) return sources;
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  }

  /**
   * Ends the relay process and waits for it to actually go.
   *
   * SIGTERM alone is not enough: the CLI exits within milliseconds, and a relay
   * that does not act on the signal in that window is orphaned and keeps its
   * port — so the wait is bounded and then escalated.
   */
  async close(timeoutMs = 500): Promise<void> {
    const child = this.child;
    this.child = null;
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    const exited = new Promise<void>((resolve) =>
      child.once('exit', () => resolve()),
    );
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    timer.unref?.();
    await exited;
    clearTimeout(timer);
  }
}

/**
 * The JSON payload of a tool result: `structuredContent` when the tool sent
 * one, otherwise the first text block parsed as JSON.
 */
export function readStructured<T>(result: CallToolResult): T | undefined {
  if (result.structuredContent) return result.structuredContent as T;
  const text = result.content?.find((part) => part.type === 'text')?.text;
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

/** The human-readable half of a tool result, for error messages. */
export function resultText(result: CallToolResult): string {
  return (
    result.content
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text ?? '')
      .join('\n')
      .trim() ?? ''
  );
}
