import { CliError } from './errors.js';
import { CLI_NAME } from './meta.js';
import { normalizeEndpoint } from './session.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

export const CALLBACK_PATH = '/callback';

/** What the `/cli-login` page POSTs back. */
export interface CallbackPayload {
  sessionId: string;
  endpoint: string;
  state: string;
  email?: string;
}

export interface CallbackCompletion {
  ok: boolean;
  message: string;
}

/** Runs after the payload is accepted; its result is what the page shows. */
export type CallbackHandler = (
  payload: CallbackPayload,
) => Promise<CallbackCompletion>;

export interface CallbackServerOptions {
  state: string;
  expectedEndpoint: string;
  timeoutMs: number;
  onPayload: CallbackHandler;
  port?: number;
}

export interface CallbackServer {
  port: number;
  /** Resolves once a payload passes the state and endpoint checks. */
  wait(): Promise<{
    payload: CallbackPayload;
    completion: CallbackCompletion;
  }>;
  close(): Promise<void>;
}

export function newState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * The code shown in both the terminal and the browser so the user can match
 * them. The `/cli-login` page derives it the same way from the URL `state`.
 */
export function deriveLoginCode(state: string): string {
  return createHash('sha256')
    .update(state)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
}

function statesMatch(expected: string, received: unknown): boolean {
  if (typeof received !== 'string') return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

function corsHeaders(origin: string | undefined): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    // Chrome's Private Network Access preflight (https page -> loopback).
    'Access-Control-Allow-Private-Network': 'true',
    Vary: 'Origin',
  };
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    // A hand-off payload is a few hundred bytes; anything larger is not ours.
    if (size > 64 * 1024) return undefined;
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

function reply(
  response: ServerResponse,
  status: number,
  headers: Record<string, string>,
  body: unknown,
): void {
  response.writeHead(status, {
    ...headers,
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

/**
 * Loopback listener the browser hands the session to. Binds 127.0.0.1 only —
 * nothing off this machine can reach it.
 */
export async function startCallbackServer(
  options: CallbackServerOptions,
): Promise<CallbackServer> {
  const expectedEndpoint = normalizeEndpoint(options.expectedEndpoint);

  let settle: (result: {
    payload: CallbackPayload;
    completion: CallbackCompletion;
  }) => void = () => {};
  let fail: (error: unknown) => void = () => {};
  const done = new Promise<{
    payload: CallbackPayload;
    completion: CallbackCompletion;
  }>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });

  const server = createServer((request, response) => {
    void handle(request, response);
  });

  const handle = async (
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<void> => {
    const cors = corsHeaders(request.headers.origin);
    if (request.method === 'OPTIONS') {
      response.writeHead(204, cors);
      response.end();
      return;
    }
    if (request.method !== 'POST' || request.url !== CALLBACK_PATH) {
      reply(response, 404, cors, { error: 'not_found' });
      return;
    }

    const body = (await readJsonBody(request)) as
      Partial<CallbackPayload> | undefined;
    if (!statesMatch(options.state, body?.state)) {
      reply(response, 403, cors, { error: 'state_mismatch' });
      return;
    }
    if (typeof body?.sessionId !== 'string' || body.sessionId.length === 0) {
      reply(response, 400, cors, { error: 'missing_session_id' });
      return;
    }
    let endpoint: string;
    try {
      endpoint = normalizeEndpoint(String(body.endpoint ?? ''));
    } catch {
      reply(response, 400, cors, { error: 'invalid_endpoint' });
      return;
    }
    if (endpoint !== expectedEndpoint) {
      reply(response, 400, cors, { error: 'endpoint_mismatch' });
      return;
    }

    const payload: CallbackPayload = {
      sessionId: body.sessionId,
      endpoint,
      state: options.state,
      email: typeof body.email === 'string' ? body.email : undefined,
    };
    try {
      const completion = await options.onPayload(payload);
      reply(response, completion.ok ? 200 : 500, cors, completion);
      settle({ payload, completion });
    } catch (error) {
      reply(response, 500, cors, {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      });
      fail(error);
    }
  };

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, '127.0.0.1', resolve);
  });

  const port = (server.address() as AddressInfo).port;
  const close = () =>
    new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections?.();
    });

  return {
    port,
    close,
    wait: async () => {
      let timer: NodeJS.Timeout | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new CliError(
              'auth_required',
              `Timed out after ${Math.round(
                options.timeoutMs / 1000,
              )}s waiting for the browser hand-off.`,
              { hint: `${CLI_NAME} login --paste` },
            ),
          );
        }, options.timeoutMs);
        timer.unref?.();
      });
      try {
        return await Promise.race([done, timeout]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    },
  };
}
