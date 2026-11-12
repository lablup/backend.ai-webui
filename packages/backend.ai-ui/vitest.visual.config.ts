import storybookViteConfig from './.storybook/vite.config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

// Read by Chromium on Linux; pins the generic font families.
process.env.FONTCONFIG_FILE = resolve(root, 'test/visual/fonts.conf');

// pnpm's global virtual store lives outside the repository (react/vite.config.ts).
const storeLinks = realpathSync(
  createRequire(import.meta.url).resolve('vitest/package.json'),
).split('/links/')[0];

// The frame and the page must be the same size, or Vitest scales the shot down.
const VIEWPORT = { width: 1200, height: 900 };

interface ShotData {
  arg: string;
  browserName: string;
  ext: string;
  platform: string;
  testFileDirectory: string;
  testFileName: string;
}

function shotPath(data: ShotData) {
  const story = data.testFileName.replace(/\.stories\.tsx?$/, '');
  return resolve(
    root,
    'test/visual/__screenshots__',
    relative('src', data.testFileDirectory),
    story,
    `${data.arg}-${data.browserName}-${data.platform}${data.ext}`,
  );
}

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
      fs: { allow: [resolve(root, '../..'), storeLinks] },
    },
    test: {
      name: 'visual',
      // Vitest writes screenshots through its API, which addon-vitest disables otherwise.
      api: { allowWrite: true },
      setupFiles: ['./test/visual/setup.ts'],
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
        viewport: VIEWPORT,
        screenshotFailures: false,
        expect: {
          toMatchScreenshot: { resolveScreenshotPath: shotPath },
        },
      },
    },
  }),
);
