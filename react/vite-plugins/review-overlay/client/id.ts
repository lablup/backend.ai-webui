/**
 * Pin id: `'c_' + base32(sha256(pr + anchor + at))[:7]`.
 *
 * SHA-256 is hand-rolled rather than `crypto.subtle` on purpose — a dev
 * server reached through the plain-http team gateway is not a secure context,
 * so `crypto.subtle` is `undefined` there (the same gap that costs us
 * `navigator.clipboard`). The id is a content fingerprint, not a secret.
 */

/**
 * FIPS 180-4's constants, derived rather than tabulated: the fractional parts
 * of the square (H) and cube (K) roots of the first 64 primes. Module scope —
 * the primality sieve ran on every call before.
 */
const { K, H } = (() => {
  const K: number[] = [];
  const H: number[] = [];
  for (let p = 2, n = 0; n < 64; p++) {
    let prime = true;
    for (let f = 2; f * f <= p; f++) if (p % f === 0) prime = false;
    if (!prime) continue;
    if (n < 8) H[n] = (Math.pow(p, 0.5) * 2 ** 32) | 0;
    K[n] = (Math.pow(p, 1 / 3) * 2 ** 32) | 0;
    n++;
  }
  return { K, H };
})();

const rr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

function sha256Bytes(msgBytes: Uint8Array): Uint8Array {
  const len = msgBytes.length;
  const bitLen = len * 8;
  const withPad = new Uint8Array((((len + 8) >> 6) << 6) + 64);
  withPad.set(msgBytes);
  withPad[len] = 0x80;
  const dv = new DataView(withPad.buffer);
  dv.setUint32(withPad.length - 4, bitLen >>> 0);
  dv.setUint32(withPad.length - 8, Math.floor(bitLen / 2 ** 32));
  const w = new Int32Array(64);
  const h = H.slice();
  for (let i = 0; i < withPad.length; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rr(w[t - 15], 7) ^ rr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rr(w[t - 2], 17) ^ rr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setInt32(i * 4, h[i]);
  return out;
}

const B32 = 'abcdefghijklmnopqrstuvwxyz234567';

export function base32(bytes: Uint8Array, chars: number): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5 && out.length < chars) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    if (out.length >= chars) break;
  }
  return out;
}

export { sha256Bytes };

/** `c_` + 7 base32 chars — short enough to read aloud, long enough to be unique. */
export function pinId(pr: number, anchorB64: string, at: string): string {
  const bytes = new TextEncoder().encode(`${pr}${anchorB64}${at}`);
  return `c_${base32(sha256Bytes(bytes), 7)}`;
}
