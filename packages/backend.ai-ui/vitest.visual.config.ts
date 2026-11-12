import storybookViteConfig from './.storybook/vite.config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { existsSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import type { Reporter, Vitest } from 'vitest/node';

const root = dirname(fileURLToPath(import.meta.url));

// Read by Chromium on Linux; pins the generic font families.
process.env.FONTCONFIG_FILE = resolve(root, 'test/visual/fonts.conf');

// pnpm's global virtual store lives outside the repository (react/vite.config.ts).
const STORE_PACKAGE =
  /^(\/.*\/v\d+\/links)\/[^/]+\/[^/]+\/[^/]+\/[0-9a-f]+\/node_modules\/vitest\/package\.json$/;
function resolveStoreLinks(): string | undefined {
  const real = realpathSync(
    createRequire(import.meta.url).resolve('vitest/package.json'),
  );
  const links = STORE_PACKAGE.exec(real)?.[1];
  if (!links || !isAbsolute(links)) return undefined;
  const inRepo = relative(resolve(root, '../..'), links);
  return inRepo.startsWith('..') || isAbsolute(inRepo) ? links : undefined;
}
const storeLinks = resolveStoreLinks();

const isBaselineContainer = process.env.BUI_VISUAL_CONTAINER === '1';

const BASELINES = resolve(root, 'test/visual/__screenshots__');
const BASELINE_SUFFIX = '-chromium-linux.png';

function baselineDir(testFileDirectory: string, testFileName: string) {
  return resolve(
    BASELINES,
    relative('src', testFileDirectory),
    testFileName.replace(/\.stories\.tsx?$/, ''),
  );
}

const resolvedBaselines = new Set<string>();

function committedBaselines(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(BASELINE_SUFFIX))
    .map((entry) => join(entry.parentPath, entry.name));
}

function storyFileOwner(file: string): string | undefined {
  for (
    let dir = dirname(file);
    dir.startsWith(BASELINES + sep);
    dir = dirname(dir)
  ) {
    const source = resolve(root, 'src', relative(BASELINES, dir));
    if (['.stories.tsx', '.stories.ts'].some((ext) => existsSync(source + ext)))
      return dir;
  }
  return undefined;
}

function staleBaselineReporter(): Reporter {
  let vitest: Vitest;
  return {
    onInit(ctx) {
      vitest = ctx;
    },
    onTestRunStart() {
      resolvedBaselines.clear();
    },
    onTestRunEnd(testModules, _errors, reason) {
      if (!isBaselineContainer || reason === 'interrupted') return;
      const stale = new Set<string>();
      for (const testModule of testModules) {
        const tests = [...testModule.children.allTests()];
        if (tests.some((test) => test.result().state !== 'passed')) continue;
        const dir = baselineDir(
          relative(root, dirname(testModule.moduleId)),
          basename(testModule.moduleId),
        );
        for (const file of committedBaselines(dir)) {
          if (storyFileOwner(file) === dir && !resolvedBaselines.has(file))
            stale.add(file);
        }
      }
      for (const file of committedBaselines(BASELINES)) {
        if (!storyFileOwner(file)) stale.add(file);
      }
      if (stale.size === 0) return;
      const files = [...stale].sort().map((file) => relative(root, file));
      if (vitest.config.snapshotOptions.updateSnapshot === 'all') {
        for (const file of stale) rmSync(file);
        vitest.logger.log(
          `Removed ${files.length} stale visual baseline(s):\n  ${files.join('\n  ')}`,
        );
        return;
      }
      vitest.logger.error(
        `${files.length} visual baseline(s) belong to no current story; rerun with -u to remove them:\n  ${files.join('\n  ')}`,
      );
      process.exitCode = 1;
    },
  };
}

// The frame and the page must be the same size, or Vitest scales the shot down.
const VIEWPORT = { width: 1200, height: 900 };

export default mergeConfig(
  storybookViteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        configDir: join(root, '.storybook'),
        tags: { exclude: ['no-vrt'] },
      }),
    ],
    server: {
      fs: {
        allow: [resolve(root, '../..'), ...(storeLinks ? [storeLinks] : [])],
      },
    },
    test: {
      name: 'visual',
      // Vitest writes screenshots through its API, which addon-vitest disables otherwise.
      api: { allowWrite: true },
      setupFiles: ['./test/visual/setup.ts'],
      reporters: ['default', staleBaselineReporter()],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          contextOptions: {
            reducedMotion: 'reduce',
            viewport: VIEWPORT,
            locale: 'en-US',
            timezoneId: 'UTC',
          },
        }),
        instances: [{ browser: 'chromium' }],
        commands: {
          setPageViewport: async ({ page }, width: number, height: number) => {
            await page.setViewportSize({ width, height });
          },
        },
        viewport: VIEWPORT,
        screenshotFailures: false,
        expect: {
          toMatchScreenshot: {
            resolveScreenshotPath: (data) => {
              const file = resolve(
                baselineDir(data.testFileDirectory, data.testFileName),
                `${data.arg}-${data.browserName}-${data.platform}${isBaselineContainer ? '' : '-host'}${data.ext}`,
              );
              resolvedBaselines.add(file);
              return file;
            },
          },
        },
      },
    },
  }),
);
