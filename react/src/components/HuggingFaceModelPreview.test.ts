import { fetchHuggingFaceModelInfo } from './HuggingFaceModelPreview';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockFetch = (init: { status: number; body?: unknown }) => {
  const spy = vi.fn(async () => ({
    status: init.status,
    ok: init.status >= 200 && init.status < 300,
    json: async () => init.body,
  }));
  vi.stubGlobal('fetch', spy);
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchHuggingFaceModelInfo', () => {
  it('returns the parsed metadata on success', async () => {
    mockFetch({ status: 200, body: { id: 'openai/gpt-oss-20b' } });
    await expect(
      fetchHuggingFaceModelInfo('openai/gpt-oss-20b'),
    ).resolves.toEqual({ id: 'openai/gpt-oss-20b' });
  });

  it('requests the model API with each path segment encoded', async () => {
    const spy = mockFetch({ status: 200, body: { id: 'a b/c d' } });
    await fetchHuggingFaceModelInfo('a b/c d');
    expect(spy).toHaveBeenCalledWith(
      'https://huggingface.co/api/models/a%20b/c%20d',
    );
  });

  // Hugging Face answers 401 for a missing repository as well as for one the
  // caller cannot see, so both must resolve to the same outcome rather than
  // being reported as a lookup failure.
  it.each([401, 404])('reports %i as missing or private', async (status) => {
    mockFetch({ status });
    await expect(fetchHuggingFaceModelInfo('who/knows')).resolves.toEqual({
      isMissingOrPrivate: true,
    });
  });

  it('throws on any other failure so the preview degrades to unavailable', async () => {
    mockFetch({ status: 429 });
    await expect(
      fetchHuggingFaceModelInfo('openai/gpt-oss-20b'),
    ).rejects.toThrow(/429/);
  });
});
