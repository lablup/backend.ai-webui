type Token = { number: number } | { word: string };

function tokenize(version: string): Token[] {
  const tokens: Token[] = [];
  for (const match of version.toLowerCase().matchAll(/(\d+)|([a-z]+)/g)) {
    tokens.push(
      match[1] !== undefined
        ? { number: Number(match[1]) }
        : { word: match[2] },
    );
  }
  return tokens;
}

/**
 * PEP 440-ish ordering over the versions Backend.AI actually writes
 * (`26.4.10`, `24.09.0`, `25.6.0rc1`). Leading zeros are numeric, and a
 * trailing alphabetic run is a pre-release: `26.4.10rc1` < `26.4.10`.
 */
export function compareVersions(a: string, b: string): number {
  const left = tokenize(a);
  const right = tokenize(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const one = left[i];
    const other = right[i];
    // A side that ran out is the plain release; a remaining word is a
    // pre-release suffix, so the shorter side is the greater one.
    if (one === undefined) return 'word' in other ? 1 : -1;
    if (other === undefined) return 'word' in one ? -1 : 1;
    if ('number' in one && 'number' in other) {
      if (one.number !== other.number)
        return one.number < other.number ? -1 : 1;
      continue;
    }
    if ('number' in one) return 1;
    if ('number' in other) return -1;
    if (one.word !== other.word) return one.word < other.word ? -1 : 1;
  }
  return 0;
}
