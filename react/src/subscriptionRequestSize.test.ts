import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A federated gateway opens a subscription against its subgraph over SSE, which
 * carries the whole operation in the GET query string. The manager's HTTP server
 * caps a request line at 8190 bytes and answers a longer one with a bare 400, so
 * an oversized subscription document fails before it is ever parsed (FR-4012).
 */
const MAX_REQUEST_LINE_BYTES = 8190;

const ARTIFACT_DIRS = [
  path.resolve(__dirname, '__generated__'),
  path.resolve(__dirname, '../../packages/backend.ai-ui/src/__generated__'),
];

/** Longest subgraph path plus the ` HTTP/1.1` suffix and a UUID-sized variables payload. */
const REQUEST_LINE_OVERHEAD = 'GET /admin/gql/strawberry HTTP/1.1'.length + 200;

const readOperationText = (file: string): string | null => {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^ {4}"text": (".*")$/m);
  return match ? (JSON.parse(match[1]) as string) : null;
};

const subscriptionArtifacts = ARTIFACT_DIRS.flatMap((dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('Subscription.graphql.ts'))
        .map((name) => path.join(dir, name))
    : [],
);

describe('subscription request size', () => {
  it('finds the compiled subscription artifacts', () => {
    expect(subscriptionArtifacts.length).toBeGreaterThan(0);
  });

  it.each(subscriptionArtifacts)('%s fits the manager request line', (file) => {
    const text = readOperationText(file);
    expect(text).not.toBeNull();

    const operationName = path.basename(file, '.graphql.ts');
    const requestLine =
      REQUEST_LINE_OVERHEAD +
      `?query=${encodeURIComponent(text as string)}&operationName=${operationName}`
        .length;

    expect(requestLine).toBeLessThan(MAX_REQUEST_LINE_BYTES);
  });
});
