/**
 * `#bai=v3` anchor codec: JSON → deflate-raw → base64url, and back.
 *
 * `CompressionStream` (not `pako`) keeps the client dependency-free; it is
 * available in every browser this dev overlay targets and in Node >= 18, so
 * the round-trip is unit-testable outside a browser.
 */
import type { AnchorV3 } from './types.js';

export const b64urlFromBytes = (bytes: Uint8Array): string => {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const bytesFromB64url = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

/**
 * A pasted anchor must never navigate off-origin. `^/` alone is not enough:
 * the URL parser strips TAB/LF/CR before parsing (so `/<LF>/evil` becomes
 * `//evil`) and treats `\` as a path separator for special schemes (so
 * `/\evil.com` becomes `//evil.com`). Both resolve to another origin.
 */
export const isSafePath = (p: unknown): p is string =>
  typeof p === 'string' && !/[\t\n\r]/.test(p) && /^\/(?![/\\])/.test(p);

/**
 * Feed `bytes` through a (de)compression stream and collect the result.
 *
 * Hand-rolled rather than `new Response(blob.stream().pipeThrough(…))`: jsdom
 * implements neither `Blob.stream()` nor a streaming `Response` body, and the
 * codec is the piece we most want covered by unit tests.
 */
async function pipeStream(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const reader = source
    .pipeThrough(stream as ReadableWritablePair<Uint8Array, Uint8Array>)
    .getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function encodeAnchor(anchor: AnchorV3): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(anchor));
  return b64urlFromBytes(
    await pipeStream(raw, new CompressionStream('deflate-raw')),
  );
}

export async function decodeAnchor(b64url: string): Promise<AnchorV3 | null> {
  try {
    const inflated = await pipeStream(
      bytesFromB64url(b64url),
      new DecompressionStream('deflate-raw'),
    );
    const obj = JSON.parse(new TextDecoder().decode(inflated));
    if (!obj || typeof obj !== 'object') return null;
    if (obj.p != null && !isSafePath(obj.p)) return null;
    return obj as AnchorV3;
  } catch {
    return null;
  }
}
