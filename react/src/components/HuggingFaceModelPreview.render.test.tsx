/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Component-level tests for HuggingFaceModelPreview.
 *
 * `HuggingFaceModelPreview.test.ts` covers the fetch helper's status
 * handling; these cover what the user actually sees, plus the one property
 * the feature depends on for not hammering a rate-limited third-party API:
 * a burst of keystrokes must collapse into a single settled request.
 */
import HuggingFaceModelPreview from './HuggingFaceModelPreview';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Partial mock: `backend.ai-ui` initialises its own i18next instance with
// `initReactI18next` at import time, so the rest of the module must survive.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderPreview = (modelId?: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <HuggingFaceModelPreview modelId={modelId} />
    </QueryClientProvider>,
  );
  return {
    ...view,
    rerenderWith: (nextModelId?: string) =>
      view.rerender(
        <QueryClientProvider client={client}>
          <HuggingFaceModelPreview modelId={nextModelId} />
        </QueryClientProvider>,
      ),
  };
};

const respondWith = (status: number, body?: unknown) => {
  // Declares the `url` parameter so `mock.calls` stays typed for the
  // request-URL assertions below.
  const spy = vi.fn(async (_url: string) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }));
  vi.stubGlobal('fetch', spy);
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('HuggingFaceModelPreview', () => {
  it('renders nothing when no model id has been parsed yet', () => {
    respondWith(200, {});
    const { container } = renderPreview(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the model card with its tags and size', async () => {
    respondWith(200, {
      id: 'openai/gpt-oss-20b',
      pipeline_tag: 'text-generation',
      library_name: 'transformers',
      usedStorage: 41382448021,
      lastModified: '2025-08-26T17:25:47.000Z',
    });
    renderPreview('openai/gpt-oss-20b');

    await screen.findByText('openai/gpt-oss-20b');
    expect(screen.getByText('text-generation')).toBeInTheDocument();
    expect(screen.getByText('transformers')).toBeInTheDocument();
    // 41382448021 B → 38.54 GiB
    expect(
      screen.getByText(/import\.HuggingFaceModelSize: 38\.54 GiB/),
    ).toBeInTheDocument();
  });

  it('warns that a gated model needs an accepted license and a token', async () => {
    respondWith(200, {
      id: 'meta-llama/Llama-3.1-8B-Instruct',
      gated: 'manual',
    });
    renderPreview('meta-llama/Llama-3.1-8B-Instruct');

    expect(
      await screen.findByText('import.HuggingFaceModelIsGated'),
    ).toBeInTheDocument();
  });

  it('reports a disabled model as an error, taking priority over gating', async () => {
    respondWith(200, { id: 'some/model', gated: 'auto', disabled: true });
    renderPreview('some/model');

    expect(
      await screen.findByText('import.HuggingFaceModelIsDisabled'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('import.HuggingFaceModelIsGated'),
    ).not.toBeInTheDocument();
  });

  it('reports a 401 as missing-or-private rather than a lookup failure', async () => {
    respondWith(401);
    renderPreview('who/knows');

    expect(
      await screen.findByText('import.HuggingFaceModelNotFoundOrPrivate'),
    ).toBeInTheDocument();
  });

  // The whole design rests on this: a blocked CSP, an air-gapped browser, or a
  // rate-limit must degrade to "could not check" and never look like a verdict
  // on the model.
  it('degrades to "unavailable" when the lookup itself fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('blocked by CSP');
      }),
    );
    renderPreview('openai/gpt-oss-20b');

    expect(
      await screen.findByText('import.HuggingFaceModelInfoUnavailable'),
    ).toBeInTheDocument();
  });
});

describe('HuggingFaceModelPreview debouncing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // Regression guard: the preview is deliberately kept mounted by
  // ImportHuggingFaceModelForm while the input is unparseable. `useDebounce`
  // seeds its state with the value it is mounted with, so a remount per
  // keystroke would issue one request per keystroke at a rate-limited API.
  it('collapses a burst of keystrokes into a single settled request', async () => {
    const spy = respondWith(200, { id: 'openai/gpt-oss-20b' });
    const { rerenderWith } = renderPreview('o');

    for (const partial of [
      'op',
      'ope',
      'openai',
      'openai/g',
      'openai/gpt-oss-20b',
    ]) {
      rerenderWith(partial);
      // The debounce timer and the deferred re-render it triggers both settle
      // inside `act`, otherwise React never commits the low-priority update.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    const requested = spy.mock.calls.map((c) => String(c[0]));
    // One request for the id the component mounted with, one for the value
    // the user settled on — and nothing for the six intermediate states.
    expect(requested).toEqual([
      'https://huggingface.co/api/models/o',
      'https://huggingface.co/api/models/openai/gpt-oss-20b',
    ]);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });

  // The other half of the argument: a *fresh mount* skips the debounce
  // entirely, which is exactly why ImportHuggingFaceModelForm hides the
  // preview's form item instead of unmounting it. If ahooks ever debounces
  // the initial value too, this fails and the form can be simplified.
  it('issues its request immediately on mount, without waiting for the debounce', async () => {
    const spy = respondWith(200, { id: 'openai/gpt-oss-20b' });
    renderPreview('openai/gpt-oss-20b');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
