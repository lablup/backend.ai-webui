/**
 * FR-2650: Locale-aware screenshot capture for the user manual docs.
 *
 * Iterates through a manifest of (filename, url, optional setup, optional capture target),
 * and for each entry captures the screen in **ko, ja, th** UI locales using the
 * `window.switchLanguage(lang)` global (added in PR #5796 / FR-2230).
 *
 * Outputs are written to `packages/backend.ai-webui-docs/src/{lang}/images/<file>.png`.
 *
 * ## Run
 *
 *     pnpm exec playwright test e2e/screenshot-locale-capture.spec.ts --project=chromium
 *
 * Or to capture only a subset (e.g. by filename keyword):
 *
 *     SCREENSHOT_FILTER=dashboard pnpm exec playwright test e2e/screenshot-locale-capture.spec.ts --project=chromium
 *
 * ## Adding a new entry
 *
 * Append to `MANIFEST` below. Each entry is documented inline with the `ManifestEntry` type.
 *
 * - `file`: filename relative to `images/` (must match the existing one in `en/images/`)
 * - `url`: page to navigate to before capture
 * - `setup`: optional async function that opens a modal, fills a form, etc.
 * - `target`: viewport (default), CSS selector for an element-only screenshot,
 *             or a clip rect `{ x, y, width, height }` for cropped captures.
 * - `cleanup`: optional function to undo `setup` (close modals, delete folders).
 *
 * ## Notes
 *
 * - The spec hides the React Grab dev toolbar before each screenshot.
 * - Viewport is fixed at 1440x900 logical (output PNGs are 1x non-retina per
 *   `SCREENSHOT-GUIDELINES.md`).
 * - `window.switchLanguage` updates the UI in-place without a page reload, so
 *   all 3 languages are captured from the same setup state.
 */
import { loginAsAdmin } from './utils/test-util';
import { Page, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_IMG_BASE = path.join(
  REPO_ROOT,
  'packages',
  'backend.ai-webui-docs',
  'src',
);
const WEBUI_ENDPOINT =
  process.env.E2E_WEBUI_ENDPOINT ?? 'http://localhost:9081';

function fullUrl(path: string): string {
  return path.startsWith('http')
    ? path
    : `${WEBUI_ENDPOINT}${path.startsWith('/') ? path : '/' + path}`;
}

type ClipRect = { x: number; y: number; width: number; height: number };

type ManifestEntry = {
  /** Output filename, relative to `images/` */
  file: string;
  /** URL to navigate to (must start with `/`) */
  url: string;
  /** Optional setup steps run after navigation, before captures */
  setup?: (page: Page) => Promise<void>;
  /**
   * What region to capture:
   *  - undefined / 'viewport': full viewport screenshot (default)
   *  - { selector: string }: element screenshot via `page.locator(...).screenshot()`
   *  - { clip: ClipRect }: viewport screenshot cropped to a rect
   */
  target?: 'viewport' | { selector: string } | { clip: ClipRect };
  /** Optional cleanup (close modals, delete created data) */
  cleanup?: (page: Page) => Promise<void>;
};

const FILTER = process.env.SCREENSHOT_FILTER ?? '';

/**
 * Manifest of images to capture. Add entries here as you implement them.
 *
 * Sections covered: see FR-2650 description. Excludes single-language exception
 * files (terminal/CLI/version prints/MLflow/diagrams) and files already updated
 * in PR #6868 (sessions_page, data_page, rename_vfolder, vfolder_create_modal,
 * vfolder_delete_dialog, move_to_trash).
 */
const MANIFEST: ManifestEntry[] = [
  // ── No-setup full-viewport pages ──────────────────────────────────────
  { file: 'dashboard.png', url: '/dashboard' },
  { file: 'summary.png', url: '/summary' },
  { file: 'agent_summary.png', url: '/agent-summary' },
  { file: 'statistics.png', url: '/statistics' },
  { file: 'my_environment_page.png', url: '/my-environment' },
  { file: 'start_page.png', url: '/start' },
  { file: 'admin_dashboard.png', url: '/dashboard' },
  { file: 'image_list_page.png', url: '/environment' },
  { file: 'agent_list.png', url: '/agent' },
  { file: 'admin_user_page.png', url: '/credential' },
  { file: 'admin_serving_page.png', url: '/serving' },
  { file: 'model_store_page_overview.png', url: '/model-store' },

  // ── More no-setup page-overview captures ─────────────────────────────
  { file: 'chat_page.png', url: '/chat' },
  { file: 'credential_list_tab.png', url: '/credential' },
  { file: 'credentials.png', url: '/credential' },
  { file: 'agent_settings.png', url: '/agent' },
  { file: 'admin_model_card_list_v2.png', url: '/model-store' },
  { file: 'fair_share_user_page.png', url: '/credential' },
  { file: 'fair_share_project_page.png', url: '/credential' },
  { file: 'fair_share_domain_page.png', url: '/credential' },
  { file: 'fair_share_resource_group_page.png', url: '/credential' },

  // ── Header element only ───────────────────────────────────────────────
  {
    file: 'header.png',
    url: '/dashboard',
    target: { selector: '[data-testid="webui-header"]' },
  },

  // TODO: Additional entries to be added incrementally.
  // Complex setups (modal opens, form fills, action sequences) require
  // per-image `setup` functions — append as they are implemented.
  //
  // To capture a modal:
  //   {
  //     file: 'foo_modal.png',
  //     url: '/data',
  //     setup: async (page) => { await page.getByRole('button', { name: 'Create Folder' }).click(); },
  //     target: { selector: '.ant-modal-wrap .ant-modal' },
  //     cleanup: async (page) => { await page.getByRole('button', { name: 'Cancel' }).click(); },
  //   },
];

const LANGS = ['ko', 'ja', 'th'] as const;

async function hideReactGrab(page: Page) {
  await page.evaluate(() => {
    const last = document.body.children[document.body.children.length - 1];
    if (
      last &&
      (last as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot
    ) {
      (last as HTMLElement).style.display = 'none';
    }
  });
}

async function ensureSwitchLanguageReady(page: Page) {
  await page.waitForFunction(
    () =>
      typeof (window as unknown as { switchLanguage?: unknown })
        .switchLanguage === 'function',
    null,
    { timeout: 10_000 },
  );
}

async function captureForLang(page: Page, entry: ManifestEntry, lang: string) {
  const outDir = path.join(DOCS_IMG_BASE, lang, 'images');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, entry.file);

  await page.evaluate((l) => {
    (
      window as unknown as { switchLanguage: (s: string) => void }
    ).switchLanguage(l);
  }, lang);
  // Allow re-render to settle.
  await page.waitForTimeout(300);
  await hideReactGrab(page);

  const target = entry.target ?? 'viewport';
  if (target === 'viewport') {
    await page.screenshot({
      path: outPath,
      fullPage: false,
      scale: 'css',
      type: 'png',
    });
  } else if ('selector' in target) {
    const locator = page.locator(target.selector).first();
    await locator.screenshot({ path: outPath, scale: 'css', type: 'png' });
  } else if ('clip' in target) {
    await page.screenshot({
      path: outPath,
      fullPage: false,
      scale: 'css',
      type: 'png',
      clip: target.clip,
    });
  }
}

const filteredManifest = FILTER
  ? MANIFEST.filter((e) => e.file.includes(FILTER))
  : MANIFEST;

test.describe.configure({ mode: 'serial' });
test.describe('FR-2650 locale screenshot capture', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  for (const entry of filteredManifest) {
    test(`capture ${entry.file}`, async ({ page }) => {
      await page.goto(fullUrl(entry.url));
      await ensureSwitchLanguageReady(page);
      // Wait for "Loading components" splash to disappear
      await page
        .getByText('Loading components')
        .first()
        .waitFor({ state: 'hidden', timeout: 30_000 })
        .catch(() => {
          /* splash may not be present */
        });
      // Wait for network to settle so lazy-loaded chunks (page content,
      // Relay queries) finish before we capture. Some pages keep websockets
      // open so cap the wait.
      await page
        .waitForLoadState('networkidle', { timeout: 15_000 })
        .catch(() => {});
      // Settle render after async content lands.
      await page.waitForTimeout(800);

      if (entry.setup) {
        await entry.setup(page);
      }

      // Hide React Grab once before the loop; switchLanguage may re-render
      // and the toolbar can re-appear, so captureForLang re-hides each time.
      await hideReactGrab(page);

      for (const lang of LANGS) {
        await captureForLang(page, entry, lang);
      }

      if (entry.cleanup) {
        await entry.cleanup(page);
      }
    });
  }
});
