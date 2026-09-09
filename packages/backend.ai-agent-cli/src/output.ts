import type { CliError, ErrorCode } from './errors.js';

export const API_VERSION = 'bai-agent/v1';

export interface SuccessEnvelope<T = unknown> {
  apiVersion: typeof API_VERSION;
  type: string;
  data: T;
}

export interface ErrorEnvelope {
  apiVersion: typeof API_VERSION;
  error: string;
  code: ErrorCode;
  suggestions?: string[];
  hint?: string;
}

export type Envelope<T = unknown> = SuccessEnvelope<T> | ErrorEnvelope;

export function successEnvelope<T>(type: string, data: T): SuccessEnvelope<T> {
  return { apiVersion: API_VERSION, type, data };
}

export function errorEnvelope(error: CliError): ErrorEnvelope {
  const envelope: ErrorEnvelope = {
    apiVersion: API_VERSION,
    error: error.message,
    code: error.code,
  };
  if (error.suggestions) envelope.suggestions = error.suggestions;
  if (error.hint) envelope.hint = error.hint;
  return envelope;
}

/** Verbosity requested through the global `--dense` / `--detail` flags. */
export type Verbosity = 'dense' | 'normal' | 'detail';

export interface RenderOptions {
  verbosity: Verbosity;
}

/**
 * The text blocks documented in the README, mirroring the Astryx CLI's
 * output contract so both are greppable the same way.
 */
export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'section'; title: string; subtitle?: string }
  | { kind: 'record'; entries: Array<[string, string]> }
  | { kind: 'list'; items: string[] };

export const text = (value: string): Block => ({ kind: 'text', text: value });

export const section = (title: string, subtitle?: string): Block => ({
  kind: 'section',
  title,
  subtitle,
});

export const list = (items: string[]): Block => ({ kind: 'list', items });

export function record(
  entries: Array<[string, string | number | boolean | undefined]>,
): Block {
  return {
    kind: 'record',
    entries: entries
      .filter(
        (entry): entry is [string, string | number | boolean] =>
          entry[1] !== undefined && entry[1] !== '',
      )
      .map(([key, value]) => [key, String(value)]),
  };
}

/** Key column width is shared across the whole document, as Astryx does. */
export function renderBlocks(blocks: Block[]): string {
  const keyWidth = Math.max(
    0,
    ...blocks.flatMap((block) =>
      block.kind === 'record'
        ? block.entries.map(([key]) => key.length + 1)
        : [],
    ),
  );

  const chunks: string[] = [];
  for (const block of blocks) {
    switch (block.kind) {
      case 'text':
        chunks.push(block.text);
        break;
      case 'section':
        chunks.push(
          block.subtitle ? `${block.title}\n${block.subtitle}` : block.title,
        );
        break;
      case 'list':
        chunks.push(block.items.map((item) => `- ${item}`).join('\n'));
        break;
      case 'record':
        chunks.push(
          block.entries
            .map(([key, value]) => `${`${key}:`.padEnd(keyWidth + 1)}${value}`)
            .join('\n'),
        );
        break;
    }
  }
  return chunks.filter((chunk) => chunk.length > 0).join('\n\n');
}

export function renderErrorText(error: CliError): string {
  const blocks: Block[] = [
    record([
      ['error', error.message],
      ['code', error.code],
    ]),
  ];
  if (error.suggestions) {
    blocks.push(section('Suggestions'), list(error.suggestions));
  }
  if (error.hint) blocks.push(record([['hint', error.hint]]));
  return renderBlocks(blocks);
}
