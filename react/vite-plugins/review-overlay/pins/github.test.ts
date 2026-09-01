import { fetchPrOccurrences, PR_QUERY } from './github.js';
import { describe, expect, it, vi } from 'vitest';

const PIN = '#bai=v3.c_zdv3rhz.QUJDREVGR0hJSg';

const comment = (over: Record<string, unknown> = {}) => ({
  id: 'IC_1',
  url: 'https://github.com/lablup/backend.ai-webui/pull/9337#issuecomment-1',
  body: `> 📍 **Start › button "Login"** · \`c_zdv3rhz\`\n> off by 8px\n> [Open on dev server](http://dev/${PIN})`,
  author: { login: 'reviewer' },
  createdAt: '2026-09-01T08:00:00Z',
  isMinimized: false,
  minimizedReason: null,
  reactionGroups: [],
  ...over,
});

const response = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    data: {
      rateLimit: { cost: 1, remaining: 4999 },
      repository: {
        isPrivate: false,
        pullRequest: {
          number: 9337,
          state: 'OPEN',
          comments: { totalCount: 1, nodes: [comment()] },
          reviews: { totalCount: 0, nodes: [] },
          reviewThreads: { totalCount: 0, nodes: [] },
          ...over,
        },
      },
    },
  });

describe('fetchPrOccurrences', () => {
  it('asks for one PR with typed variables and no interpolation', async () => {
    const runGh = vi.fn().mockResolvedValue(response());
    await fetchPrOccurrences('lablup/backend.ai-webui', 9337, runGh);
    expect(runGh).toHaveBeenCalledWith([
      'api',
      'graphql',
      '-f',
      `query=${PR_QUERY}`,
      '-f',
      'owner=lablup',
      '-f',
      'name=backend.ai-webui',
      '-F',
      'number=9337',
    ]);
  });

  it('maps an issue comment to an occurrence carrying the PR it was found on', async () => {
    const runGh = vi.fn().mockResolvedValue(response());
    const result = await fetchPrOccurrences(
      'lablup/backend.ai-webui',
      9337,
      runGh,
    );
    expect(result.state).toBe('OPEN');
    expect(result.truncated).toBe(false);
    expect(result.occurrences).toHaveLength(1);
    expect(result.occurrences[0]).toMatchObject({
      id: 'c_zdv3rhz',
      anchorB64: 'QUJDREVGR0hJSg',
      pr: 9337,
      channel: 'github',
      kind: 'comment',
      author: 'reviewer',
      native: false,
      resolved: false,
      hint: false,
    });
    expect(result.occurrences[0].text).toContain('off by 8px');
  });

  it('treats Hide → Resolved as resolved whatever the case', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: {
          totalCount: 1,
          nodes: [comment({ isMinimized: true, minimizedReason: 'RESOLVED' })],
        },
      }),
    );
    const [pin] = (await fetchPrOccurrences('l/r', 1, runGh)).occurrences;
    expect(pin.resolved).toBe(true);
  });

  it('does not let a minimized-as-spam comment count as resolved', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: {
          totalCount: 1,
          nodes: [comment({ isMinimized: true, minimizedReason: 'spam' })],
        },
      }),
    );
    expect(
      (await fetchPrOccurrences('l/r', 1, runGh)).occurrences[0].resolved,
    ).toBe(false);
  });

  it('reads a positive reaction as a hint only', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: {
          totalCount: 1,
          nodes: [
            comment({
              reactionGroups: [
                { content: 'THUMBS_UP', reactors: { totalCount: 2 } },
                { content: 'CONFUSED', reactors: { totalCount: 1 } },
              ],
            }),
          ],
        },
      }),
    );
    const [pin] = (await fetchPrOccurrences('l/r', 1, runGh)).occurrences;
    expect(pin.hint).toBe(true);
    expect(pin.resolved).toBe(false);
  });

  it('ignores a reaction nobody actually left', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: {
          totalCount: 1,
          nodes: [
            comment({
              reactionGroups: [
                { content: 'ROCKET', reactors: { totalCount: 0 } },
              ],
            }),
          ],
        },
      }),
    );
    expect(
      (await fetchPrOccurrences('l/r', 1, runGh)).occurrences[0].hint,
    ).toBe(false);
  });

  it('takes a review thread’s own state and its later comments as replies', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: { totalCount: 0, nodes: [] },
        reviewThreads: {
          totalCount: 1,
          nodes: [
            {
              id: 'PRRT_1',
              isResolved: true,
              isOutdated: true,
              resolvedBy: { login: 'owner' },
              path: 'react/src/App.tsx',
              comments: {
                totalCount: 2,
                nodes: [
                  comment({
                    id: 'PRRC_1',
                    url: 'https://github.com/l/r/pull/1#discussion_r1',
                  }),
                  comment({
                    id: 'PRRC_2',
                    url: 'https://github.com/l/r/pull/1#discussion_r2',
                    body: 'Fixed in abc1234 — padding.',
                    author: { login: 'claude' },
                    createdAt: '2026-09-01T09:00:00Z',
                  }),
                ],
              },
            },
          ],
        },
      }),
    );
    const [pin] = (await fetchPrOccurrences('l/r', 1, runGh)).occurrences;
    expect(pin).toMatchObject({
      kind: 'thread',
      native: true,
      resolved: true,
      outdated: true,
      resolvedBy: 'owner',
    });
    expect(pin.replies).toEqual([
      {
        author: 'claude',
        body: 'Fixed in abc1234 — padding.',
        createdAt: '2026-09-01T09:00:00Z',
        url: 'https://github.com/l/r/pull/1#discussion_r2',
      },
    ]);
  });

  it('flags truncation instead of paginating', async () => {
    const runGh = vi
      .fn()
      .mockResolvedValue(
        response({ comments: { totalCount: 90, nodes: [comment()] } }),
      );
    expect((await fetchPrOccurrences('l/r', 1, runGh)).truncated).toBe(true);
  });

  it('returns nothing for a PR whose comments carry no pins', async () => {
    const runGh = vi.fn().mockResolvedValue(
      response({
        comments: { totalCount: 1, nodes: [comment({ body: 'looks good' })] },
      }),
    );
    expect((await fetchPrOccurrences('l/r', 1, runGh)).occurrences).toEqual([]);
  });

  it('reports a deleted PR as missing rather than throwing', async () => {
    const runGh = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({ data: { repository: { pullRequest: null } } }),
      );
    const result = await fetchPrOccurrences('l/r', 1, runGh);
    expect(result).toMatchObject({ state: null, occurrences: [] });
  });
});
