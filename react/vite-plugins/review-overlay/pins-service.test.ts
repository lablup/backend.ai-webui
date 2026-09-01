import { createPinsService } from './pins-service.js';
import type { PrOccurrences } from './pins/github.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const PIN_BODY = '📍 **Start › button** · `c_zdv3rhz`';

const prResult = (
  pr: number,
  over: Partial<PrOccurrences> = {},
  id = 'c_zdv3rhz',
): PrOccurrences => ({
  pr,
  state: 'OPEN',
  truncated: false,
  occurrences: [
    {
      id,
      anchorB64: null,
      quoted: true,
      pr,
      channel: 'github',
      kind: 'comment',
      url: `https://github.com/l/r/pull/${pr}#issuecomment-1`,
      author: 'reviewer',
      createdAt: '2026-09-01T08:00:00Z',
      text: PIN_BODY,
      normalized: `start button ${id}`,
      remainder: '',
      resolved: false,
      resolvedBy: null,
      outdated: false,
      hint: false,
      native: false,
      replies: [],
    },
  ],
  ...over,
});

let clock = 1_000_000;
const now = () => clock;

const deps = (over: Partial<Parameters<typeof createPinsService>[0]> = {}) => ({
  repoInfo: vi.fn().mockResolvedValue({
    nameWithOwner: 'lablup/backend.ai-webui',
    isPrivate: false,
  }),
  servedSet: vi.fn().mockResolvedValue([{ pr: 9354, branch: 'top' }]),
  fetchPr: vi.fn(async (_repo: string, pr: number) => prResult(pr)),
  now,
  ...over,
});

beforeEach(() => {
  clock = 1_000_000;
});

describe('createPinsService', () => {
  it('serves one merged payload for a served PR', async () => {
    const service = createPinsService(deps());
    const payload = await service.getPins();
    expect(payload.pins).toHaveLength(1);
    expect(payload.pins[0]).toMatchObject({
      id: 'c_zdv3rhz',
      number: 1,
      sourcePr: 9354,
    });
    expect(payload.served).toEqual([{ pr: 9354, state: 'OPEN' }]);
    expect(payload.sources.github).toEqual({ ok: true, count: 1 });
  });

  // Concurrent viewers cost one GitHub request per 15 s, not one each (R3.4).
  it('shares one upstream fetch between concurrent requests', async () => {
    const d = deps();
    const service = createPinsService(d);
    const [a, b, c] = await Promise.all([
      service.getPins(),
      service.getPins(),
      service.getPins(),
    ]);
    expect(d.fetchPr).toHaveBeenCalledTimes(1);
    expect(a.fetchedAt).toBe(b.fetchedAt);
    expect(b.fetchedAt).toBe(c.fetchedAt);
  });

  it('answers from cache inside the 15 s floor and refetches after it', async () => {
    const d = deps();
    const service = createPinsService(d);
    await service.getPins();
    clock += 14_999;
    await service.getPins();
    expect(d.fetchPr).toHaveBeenCalledTimes(1);
    clock += 2;
    await service.getPins();
    expect(d.fetchPr).toHaveBeenCalledTimes(2);
  });

  it('caches a failure too, so a flapping gh is not retried per viewer', async () => {
    const d = deps({
      fetchPr: vi.fn().mockRejectedValue(new Error('gh: 502 boom')),
    });
    const service = createPinsService(d);
    const payload = await service.getPins();
    expect(payload).toMatchObject({ pins: [], error: 'upstream' });
    expect(payload.sources.github).toEqual({ ok: false, error: 'upstream' });
    await service.getPins();
    expect(d.fetchPr).toHaveBeenCalledTimes(1);
  });

  it('never leaks the upstream error text', async () => {
    const d = deps({
      fetchPr: vi
        .fn()
        .mockRejectedValue(new Error('gh: token ghp_secret rejected')),
    });
    const body = JSON.stringify(await createPinsService(d).getPins());
    expect(body).not.toContain('ghp_secret');
    expect(body).not.toContain('token');
  });

  it('refuses to read a private repository', async () => {
    const d = deps({
      repoInfo: vi
        .fn()
        .mockResolvedValue({ nameWithOwner: 'l/secret', isPrivate: true }),
    });
    const payload = await createPinsService(d).getPins();
    expect(payload).toMatchObject({
      pins: [],
      served: [],
      error: 'private repository',
    });
    expect(d.fetchPr).not.toHaveBeenCalled();
  });

  it('fails closed when the repository check itself fails', async () => {
    const d = deps({
      repoInfo: vi.fn().mockResolvedValue({
        nameWithOwner: null,
        isPrivate: true,
        error: 'gh repo view failed',
      }),
    });
    const payload = await createPinsService(d).getPins();
    expect(payload.pins).toEqual([]);
    expect(payload.error).toBe('gh repo view failed');
    expect(d.fetchPr).not.toHaveBeenCalled();
  });

  it('says so when no PR is served at all', async () => {
    const d = deps({ servedSet: vi.fn().mockResolvedValue([]) });
    const payload = await createPinsService(d).getPins();
    expect(payload.sources.github).toEqual({ ok: false, error: 'no open PR' });
    expect(payload.pins).toEqual([]);
  });

  it('stops polling a layer that merged but freezes its pins', async () => {
    const fetchPr = vi.fn(async (_repo: string, pr: number) =>
      pr === 9320
        ? prResult(pr, { state: 'MERGED' }, 'c_frozen1')
        : prResult(pr),
    );
    const service = createPinsService(
      deps({
        servedSet: vi.fn().mockResolvedValue([
          { pr: 9320, branch: 'bottom' },
          { pr: 9354, branch: 'top' },
        ]),
        fetchPr,
      }),
    );
    await service.getPins();
    clock += 20_000;
    const second = await service.getPins();
    expect(fetchPr.mock.calls.map((call) => call[1])).toEqual([
      9320, 9354, 9354,
    ]);
    // R3.7.5: the layer stops being polled, its pins stay on the board.
    expect(second.pins.map((pin) => [pin.id, pin.sourcePr]).sort()).toEqual([
      ['c_frozen1', 9320],
      ['c_zdv3rhz', 9354],
    ]);
    expect(second.served).toContainEqual({ pr: 9320, state: 'MERGED' });
  });

  it('asks discovery again while no PR is served yet', async () => {
    const servedSet = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ pr: 9360, branch: 'top' }]);
    const service = createPinsService(deps({ servedSet }));
    expect((await service.getPins()).sources.github).toEqual({
      ok: false,
      error: 'no open PR',
    });
    clock += 20_000;
    const second = await service.getPins();
    expect(servedSet).toHaveBeenCalledTimes(2);
    expect(second.pins).toHaveLength(1);
    expect(second.served).toEqual([{ pr: 9360, state: 'OPEN' }]);
  });

  it('does not re-adopt a layer that already merged', async () => {
    const servedSet = vi.fn().mockResolvedValue([{ pr: 9320, branch: 'only' }]);
    const fetchPr = vi.fn(async (_repo: string, pr: number) =>
      prResult(pr, { state: 'MERGED' }),
    );
    const service = createPinsService(deps({ servedSet, fetchPr }));
    await service.getPins();
    clock += 20_000;
    const second = await service.getPins();
    expect(fetchPr).toHaveBeenCalledTimes(1);
    expect(second.pins).toHaveLength(1);
  });

  it('badges a block pasted on a lower layer with that layer’s PR', async () => {
    const d = deps({
      servedSet: vi.fn().mockResolvedValue([
        { pr: 9320, branch: 'bottom' },
        { pr: 9354, branch: 'top' },
      ]),
      fetchPr: vi.fn(async (_repo: string, pr: number) =>
        pr === 9320 ? prResult(pr) : prResult(pr, { occurrences: [] }),
      ),
    });
    const payload = await createPinsService(d).getPins();
    expect(payload.pins[0].sourcePr).toBe(9320);
  });

  it('surfaces truncation without paginating', async () => {
    const d = deps({
      fetchPr: vi.fn(async (_repo: string, pr: number) =>
        prResult(pr, { truncated: true }),
      ),
    });
    expect((await createPinsService(d).getPins()).sources.github).toEqual({
      ok: true,
      count: 1,
      truncated: true,
    });
  });

  it('answers with a whitelisted shape only', async () => {
    const payload = await createPinsService(deps()).getPins();
    expect(Object.keys(payload).sort()).toEqual([
      'fetchedAt',
      'pins',
      'served',
      'sources',
    ]);
  });
});
