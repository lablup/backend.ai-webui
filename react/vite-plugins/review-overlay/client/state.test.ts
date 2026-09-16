/**
 * FR-3880 — the built overlay reads its state off the document, the dev one
 * off `/__review/state`, and neither may throw on the other's shape.
 */
import {
  fetchServerState,
  readEmbeddedState,
  STATE_ELEMENT_ID,
} from './state.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const embed = (text: string) => {
  const node = document.createElement('script');
  node.type = 'application/json';
  node.id = STATE_ELEMENT_ID;
  node.textContent = text;
  document.body.appendChild(node);
};

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readEmbeddedState', () => {
  it('is null on a dev server, whose document carries no block', () => {
    expect(readEmbeddedState()).toBeNull();
  });

  it('reads the build plugin’s block', () => {
    embed(
      JSON.stringify({
        pr: null,
        repo: null,
        branch: 'main',
        source: 'none',
        root: null,
        host: 'static',
      }),
    );
    expect(readEmbeddedState()).toEqual({
      pr: null,
      repo: null,
      branch: 'main',
      source: 'none',
      root: null,
      host: 'static',
    });
  });

  it('is null rather than a throw when the block is not JSON', () => {
    embed('<!doctype html>');
    expect(readEmbeddedState()).toBeNull();
  });

  it('is null for JSON that is not an object', () => {
    embed('"static"');
    expect(readEmbeddedState()).toBeNull();
  });

  it('is null for an empty block', () => {
    embed('');
    expect(readEmbeddedState()).toBeNull();
  });
});

describe('fetchServerState', () => {
  it('returns what the dev server answered', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ pr: 42, source: 'gh' }),
        }),
      ),
    );
    await expect(fetchServerState()).resolves.toEqual({ pr: 42, source: 'gh' });
  });

  it('is null when the endpoint answers something that is not JSON', async () => {
    // What a static host does: an unknown path is answered with index.html.
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.reject(new SyntaxError('Unexpected token <')),
        }),
      ),
    );
    await expect(fetchServerState()).resolves.toBeNull();
  });

  it('is null when the request itself fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    await expect(fetchServerState()).resolves.toBeNull();
  });
});
