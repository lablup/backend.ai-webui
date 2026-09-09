/**
 * The block must never carry the driver's filesystem, whichever way
 * `/__review/state` behaves: slow — a pick that outruns the fetch — or broken,
 * where the root never arrives at all. Both are driven through the real boot,
 * because the gate is `prepare`'s and only `main.ts` owns it.
 */
import type { Plugin, PluginHooks, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT = '/home/driver/Workspace/backend.ai-webui/.claude/worktrees/x';
const FILE = 'packages/backend.ai-ui/src/components/BAIFlex.tsx';

let hooks: PluginHooks;

/** Boot a fresh overlay against `state`, then pick `#target` through react-grab. */
async function pickWith(state: () => Promise<unknown>): Promise<string> {
  document.body.innerHTML = '<button id="target">Login</button>';
  hooks = {};
  window.__REACT_GRAB__ = {
    activate: () => undefined,
    deactivate: () => undefined,
    isActive: () => false,
    registerPlugin: (plugin: Plugin) => {
      hooks = plugin.hooks ?? {};
    },
    getStackContext: () =>
      Promise.resolve(
        `  in BAIFlex (at ${ROOT}/${FILE})` +
          `\n  in WebUIHeader (at /src/components/MainLayout/WebUIHeader.tsx)`,
      ),
    getSource: () =>
      Promise.resolve({
        componentName: 'BAIFlex',
        filePath: `${ROOT}/${FILE}`,
        lineNumber: 79,
        columnNumber: 26,
      }),
    getDisplayName: () => 'Flex',
  } as unknown as ReactGrabAPI;
  vi.stubGlobal('fetch', state);

  vi.resetModules();
  delete window.__baiReviewOverlay;
  await import('./main.js');

  hooks.onElementSelect?.(document.getElementById('target') as Element);
  // The deferred open, the state gate, the fiber walk and the encode.
  for (let i = 0; i < 12; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  const host = document.querySelector('[data-bai-review-overlay]');
  return host?.shadowRoot?.textContent ?? '';
}

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelector('[data-bai-review-overlay]')?.remove();
  delete window.__REACT_GRAB__;
});

describe('the composer never shows an absolute source path', () => {
  it('waits for a slow /__review/state instead of racing it', async () => {
    const text = await pickWith(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({ json: () => Promise.resolve({ pr: 7, root: ROOT }) }),
            30,
          ),
        ),
    );

    expect(text).toContain(`in BAIFlex (at ${FILE})`);
    expect(text).not.toContain(ROOT);
  });

  it('drops the source location when the endpoint fails', async () => {
    const text = await pickWith(() => Promise.reject(new Error('offline')));

    // The frame still names the component — that is what the ⚛️ stack is for.
    expect(text).toContain('in BAIFlex');
    expect(text).not.toContain(ROOT);
    expect(text).not.toContain('(at ');
  });
});
