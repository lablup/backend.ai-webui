/**
 * `pnpm run review-pins parse [--json] [file|-]` — the overlay's codec, run
 * from a terminal, so every reader of a `#bai=v3` link or 📍 block (the
 * Claude-side review skill included) shares this one implementation instead of
 * keeping a reimplementation in step by hand. See ADR-0002.
 *
 * Exit codes: 0 pins found · 2 usage / unreadable input · 5 no pin found.
 */
import { LINK_LABEL } from './client/block.js';
import { PIN_BODY_SRC, decodeAnchor } from './client/codec.js';
import { pinId } from './client/id.js';
import type { AnchorV3 } from './client/types.js';
import { readFileSync, realpathSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const API_VERSION = 'bai-review/v1';

/** One pin as the CLI hands it over: the link's half plus the block's half. */
export interface CliPin {
  id: string;
  /** `null` when the payload did not decode — the id and link still stand. */
  anchor: AnchorV3 | null;
  url: string;
  label: string;
  note: string;
  stack: string[];
  pr: number | null;
  at: string | null;
  /** `null` when no marker claimed this id, so nothing proved or disproved it. */
  idVerified: boolean | null;
}

export interface ParseResult {
  apiVersion: string;
  pins: CliPin[];
}

/**
 * `[#&]` mirrors `deeplink.ts`'s reader; the body's bounds come from the codec
 * itself, so an over-long anchor is no match here either.
 */
const PIN_RE = new RegExp(`[#&]bai=v3\\.${PIN_BODY_SRC}`, 'g');
/** The same grammar without `g`, for the callers that match exactly one link. */
const ONE_PIN_RE = new RegExp(`[#&]bai=v3\\.${PIN_BODY_SRC}`);
const BLOCK_HEAD_RE =
  /^\s*(?:>\s?)+📍\s*\*\*(.*?)\*\*\s*·\s*`(c_[a-z2-7]{7})`\s*$/;
const QUOTE_PREFIX_RE = /^\s*(?:>\s?)+/;
const QUOTED_RE = /^\s*>/;
const MARKER_RE =
  /<!--\s*bai-review\s+v3\s+id=(c_[a-z2-7]{7})\s+pr=(\d+)\s+at=(\S+?)\s*-->/;
const LINK_RE = new RegExp(`\\[${LINK_LABEL}\\]\\(([^)\\s]+)\\)`);
const STACK_HEAD_RE = /^⚛️?\s*(.+)$/;
const STACK_CONT_RE = /^\s+in \S/;

// --------------------------------------------------------------------------
// input normalisation
// --------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * The entities a comment body actually arrives with. `&nbsp;` becomes a plain
 * space — the stack indentation `STACK_CONT_RE` expects.
 */
export function htmlUnescape(text: string): string {
  return (text || '').replace(
    /&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (whole, ref: string) => {
      if (ref[0] === '#') {
        const code =
          ref[1] === 'x' || ref[1] === 'X'
            ? Number.parseInt(ref.slice(2), 16)
            : Number.parseInt(ref.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : whole;
      }
      return NAMED_ENTITIES[ref.toLowerCase()] ?? whole;
    },
  );
}

/**
 * GitHub's "Quote reply" percent-encodes the link's `#`, `&` and `=`; those
 * sequences are decoded and nothing else (see the commit body). `&amp;` is a
 * plain `&` by the time this runs — `htmlUnescape` goes first.
 */
const PIN_MARKER_ESCAPE_RE = /(%23|%26|[#&])bai(?:%3[Dd]|=)v3/g;

export const decodeBody = (text: string): string =>
  htmlUnescape(text).replace(PIN_MARKER_ESCAPE_RE, (_whole, lead: string) =>
    lead === '#' || lead === '%23' ? '#bai=v3' : '&bai=v3',
  );

/**
 * The body as written, then its unescaped copies. A link is taken from the
 * variant it matched in, so `?filter=a%20b` survives byte-identical.
 */
export function textVariants(text: string): string[] {
  const raw = text || '';
  const variants = [raw];
  for (const candidate of [htmlUnescape(raw), decodeBody(raw)]) {
    if (!variants.includes(candidate)) variants.push(candidate);
  }
  return variants;
}

// --------------------------------------------------------------------------
// links
// --------------------------------------------------------------------------

interface PinRef {
  id: string;
  anchorB64: string;
  url: string;
}

/** Sticky, so a set's later parts are read off the end of the earlier one. */
const SET_TAIL_RE = new RegExp(`&bai=v3\\.${PIN_BODY_SRC}`, 'y');

/**
 * The link is whatever runs up to the match, back to the nearest delimiter —
 * then on past it through the rest of the set, so every pin of a set link is
 * handed the whole set's URL rather than a prefix of it.
 */
function expandUrl(text: string, start: number, end: number): string {
  let left = start;
  while (left > 0 && !' \t\n\r"\'<>()[]`'.includes(text[left - 1])) left -= 1;
  let right = end;
  for (;;) {
    SET_TAIL_RE.lastIndex = right;
    if (!SET_TAIL_RE.exec(text)) break;
    right = SET_TAIL_RE.lastIndex;
  }
  return text.slice(left, right);
}

/**
 * Every distinct `#bai=v3.<id>.<anchor>` link in `text`, in order — one anchor
 * under two URLs is two refs, so `betterLink` gets to rank them.
 */
export function findPinRefs(text: string): PinRef[] {
  const refs: PinRef[] = [];
  const seen = new Set<string>();
  for (const variant of textVariants(text)) {
    PIN_RE.lastIndex = 0;
    for (let m = PIN_RE.exec(variant); m; m = PIN_RE.exec(variant)) {
      const url = expandUrl(variant, m.index, m.index + m[0].length);
      const key = `${m[1]}.${m[2]}.${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push({ id: m[1], anchorB64: m[2], url });
    }
  }
  return refs;
}

// --------------------------------------------------------------------------
// blocks
// --------------------------------------------------------------------------

interface ParsedBlock {
  id: string;
  label: string;
  stack: string[];
  note: string;
  link: string;
  pr: number | null;
  at: string | null;
}

const stripQuote = (line: string) => line.replace(QUOTE_PREFIX_RE, '');

/** A generated block closes on its link line, so an upward note scan stops there. */
const endsABlock = (line: string) =>
  BLOCK_HEAD_RE.test(line) || LINK_RE.test(line);

const closesABlock = (line: string) =>
  QUOTED_RE.test(line) || MARKER_RE.test(line) || endsABlock(line);

/**
 * The reviewer's words are the comment's own prose, above the quote. The run
 * stops at the previous block's end, so two blocks cannot steal each other's.
 */
function precedingNote(
  lines: string[],
  head: number,
  floor: number,
): [number, number] {
  let j = head - 1;
  while (j >= floor && !lines[j].trim()) j -= 1;
  const end = j + 1;
  while (j >= floor && lines[j].trim() && !closesABlock(lines[j])) j -= 1;
  return [j + 1, end];
}

function fillBlockBody(block: ParsedBlock, body: string[]): void {
  const notes: string[] = [];
  let inStack = false;
  for (const line of body) {
    if (MARKER_RE.test(line)) continue;
    const head = STACK_HEAD_RE.exec(line.trim());
    if (head) {
      block.stack.push(head[1].trim());
      inStack = true;
      continue;
    }
    if (inStack && STACK_CONT_RE.test(line)) {
      block.stack.push(line.replace(/\s+$/, ''));
      continue;
    }
    inStack = false;
    const link = LINK_RE.exec(line);
    if (link) {
      block.link = link[1];
      continue;
    }
    notes.push(line);
  }
  block.note = notes.join('\n').trim();
}

function parseBlocksIn(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;
  let floor = 0;
  while (i < lines.length) {
    const head = BLOCK_HEAD_RE.exec(lines[i]);
    if (!head) {
      i += 1;
      continue;
    }
    const block: ParsedBlock = {
      id: head[2],
      label: head[1].trim(),
      stack: [],
      note: '',
      link: '',
      pr: null,
      at: null,
    };
    const [noteStart, noteEnd] = precedingNote(lines, i, floor);
    const body = lines.slice(noteStart, noteEnd);
    const start = (i += 1);
    // A second 📍 closes this block even with nothing between the two: a chat
    // client that ate the markers leaves two pasted blocks as one quote run.
    while (
      i < lines.length &&
      QUOTED_RE.test(lines[i]) &&
      !BLOCK_HEAD_RE.test(lines[i])
    ) {
      i += 1;
    }
    const end = i;
    body.push(...lines.slice(start, end).map(stripQuote));
    // The marker sits outside the quote, on the line after it.
    const tail = i < lines.length ? lines[i] : '';
    for (const candidate of [...body, tail]) {
      const marker = MARKER_RE.exec(candidate);
      if (marker && marker[1] === block.id) {
        block.pr = Number.parseInt(marker[2], 10);
        block.at = marker[3];
        break;
      }
    }
    fillBlockBody(block, body);
    blocks.push(block);
    floor = end;
  }
  return blocks;
}

/** Every 📍 block in `text` — label, stack, note, link, marker. */
export function parseBlocks(text: string): ParsedBlock[] {
  for (const variant of textVariants(text)) {
    const blocks = parseBlocksIn(variant);
    if (blocks.length) return blocks;
  }
  return [];
}

// --------------------------------------------------------------------------
// pins
// --------------------------------------------------------------------------

/**
 * Does this id really hash from this anchor? The id is
 * `sha256(pr + anchor + at)`, so only a marker's `pr` and `at` can say.
 */
function verifyId(ref: PinRef, block: ParsedBlock | null): boolean | null {
  if (!block || block.pr === null || !block.at) return null;
  return pinId(block.pr, ref.anchorB64, block.at) === ref.id;
}

const beforeHash = (link: string) => link.split('#')[0];

/** Its own instance: `findPinRefs` is mid-scan over the shared one. */
const COUNT_PIN_RE = new RegExp(`[#&]bai=v3\\.${PIN_BODY_SRC}`, 'g');

const countPins = (link: string): number => {
  COUNT_PIN_RE.lastIndex = 0;
  let pins = 0;
  while (COUNT_PIN_RE.exec(link)) pins += 1;
  return pins;
};

/**
 * How much a link deserves to be handed back: the overlay's own — path and
 * query still match the anchor it carries — outranks any other `#bai=v3` link,
 * which outranks no link at all. Pins carried breaks the tie WITHIN a tier, so
 * a set beats the prefix of itself an escaped copy leaves behind — and a
 * pasted link cannot buy its way up a tier by carrying more parts.
 */
async function linkRank(link: string): Promise<[tier: number, pins: number]> {
  if (!link) return [0, 0];
  const match = ONE_PIN_RE.exec(link);
  if (!match) return [0, 0];
  const anchor = await decodeAnchor(match[2]);
  const pins = countPins(link);
  if (!anchor) return [1, pins];
  const [path, query = ''] = beforeHash(link).split('?');
  const pathname = path.replace(/^[a-zA-Z][\w+.-]*:\/\/[^/]*/, '');
  const same = pathname === anchor.p && query === (anchor.q ?? '');
  return [same ? 2 : 1, pins];
}

const betterLink = async (first: string, second: string): Promise<string> => {
  const [tier, pins] = await linkRank(first);
  const [otherTier, otherPins] = await linkRank(second);
  const better = otherTier !== tier ? otherTier > tier : otherPins > pins;
  return better ? second : first;
};

/** One pin per id: first non-empty value wins, best-ranked link wins. */
async function mergePins(pins: CliPin[]): Promise<CliPin[]> {
  const merged = new Map<string, CliPin>();
  for (const pin of pins) {
    const existing = merged.get(pin.id);
    if (!existing) {
      merged.set(pin.id, { ...pin });
      continue;
    }
    if (!existing.label) existing.label = pin.label;
    if (!existing.note) existing.note = pin.note;
    if (!existing.anchor) existing.anchor = pin.anchor;
    if (existing.pr === null) existing.pr = pin.pr;
    if (!existing.at) existing.at = pin.at;
    if (existing.idVerified === null) existing.idVerified = pin.idVerified;
    if (!existing.stack.length) existing.stack = pin.stack;
    existing.url = await betterLink(existing.url, pin.url);
  }
  return [...merged.values()];
}

/** Every pin `text` carries, from its links and its blocks, merged by id. */
export async function parsePins(text: string): Promise<CliPin[]> {
  const blocks = new Map<string, ParsedBlock>();
  for (const block of parseBlocks(text)) {
    if (!blocks.has(block.id)) blocks.set(block.id, block);
  }
  const pins: CliPin[] = [];
  for (const ref of findPinRefs(text)) {
    const block = blocks.get(ref.id) ?? null;
    const idVerified = verifyId(ref, block);
    if (idVerified === false) continue;
    const anchor = await decodeAnchor(ref.anchorB64);
    pins.push({
      id: ref.id,
      anchor,
      // The block's prose is the whole note; the anchor's `n` is the capped
      // copy that travels with a bare link.
      note: block?.note || anchor?.n || '',
      label: block?.label ?? '',
      stack: block?.stack ?? [],
      pr: block?.pr ?? null,
      at: block?.at ?? null,
      idVerified,
      url: await betterLink(block?.link ?? '', ref.url),
    });
  }
  return mergePins(pins);
}

export const parseResult = async (text: string): Promise<ParseResult> => ({
  apiVersion: API_VERSION,
  pins: await parsePins(text),
});

// --------------------------------------------------------------------------
// command line
// --------------------------------------------------------------------------

const USAGE = `usage: review-pins parse [--json] [file|-]

  Read every 📍 \`#bai=v3\` pin out of a prompt, a PR comment or a chat paste.
  Reads stdin when no file is given, or when the file is \`-\`.`;

const record = (pin: CliPin): string => {
  const rows: Array<[string, string]> = [
    ['id', pin.id],
    ['label', pin.label],
    ['note', pin.note.split('\n').join(' ⏎ ')],
    ['url', pin.url],
    [
      'path',
      pin.anchor ? pin.anchor.p + (pin.anchor.q ? `?${pin.anchor.q}` : '') : '',
    ],
    ['selector', pin.anchor?.s ?? ''],
    ['testid', pin.anchor?.tid ?? ''],
    [
      'component',
      pin.anchor?.c
        ? [pin.anchor.c.name, pin.anchor.c.src].filter(Boolean).join(' ')
        : '',
    ],
    ['pr', pin.pr === null ? '' : String(pin.pr)],
    ['at', pin.at ?? ''],
    [
      'idVerified',
      pin.idVerified === null ? 'unproven' : String(pin.idVerified),
    ],
  ];
  const width = Math.max(...rows.map(([key]) => key.length));
  const out = rows
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key.padEnd(width)} : ${value}`);
  for (const line of pin.stack) out.push(`${'stack'.padEnd(width)} : ${line}`);
  return out.join('\n');
};

export const renderText = (result: ParseResult): string =>
  result.pins.length ? result.pins.map(record).join('\n\n') : 'no pins found';

export async function main(argv: string[]): Promise<number> {
  const args = argv.filter((a) => a !== '--json');
  const json = argv.includes('--json');
  if (args.length === 0) {
    process.stderr.write(`${USAGE}\n`);
    return 2;
  }
  if (args[0] === '--help' || args[0] === '-h') {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (args[0] !== 'parse') {
    process.stderr.write(`unknown command: ${args[0]}\n${USAGE}\n`);
    return 2;
  }
  const source = args[1] ?? '-';
  let text: string;
  try {
    text = readFileSync(source === '-' ? 0 : source, 'utf8');
  } catch (error) {
    process.stderr.write(
      `cannot read ${source}: ${(error as Error).message}\n`,
    );
    return 2;
  }
  const result = await parseResult(text);
  process.stdout.write(
    json ? `${JSON.stringify(result, null, 2)}\n` : `${renderText(result)}\n`,
  );
  return result.pins.length ? 0 : 5;
}

/** `argv[1]` is the test runner under vitest, so importing this file runs nothing. */
const isEntry = (): boolean => {
  try {
    return (
      !!process.argv[1] &&
      realpathSync(process.argv[1]) ===
        realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
};

if (isEntry()) {
  void main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
