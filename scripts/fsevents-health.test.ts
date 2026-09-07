// @ts-nocheck
import { probeFsevents } from './fsevents-health.mjs';

const isDarwin = process.platform === 'darwin';

describe('probeFsevents', () => {
  afterEach(() => {
    delete process.env.BAI_FSEVENTS_HEALTH;
  });

  it.runIf(!isDarwin)(
    'is a no-op reporting healthy off darwin, override or not',
    async () => {
      await expect(probeFsevents()).resolves.toBe(true);
      // The override must not be able to make a Linux/CI run look broken.
      process.env.BAI_FSEVENTS_HEALTH = 'broken';
      await expect(probeFsevents()).resolves.toBe(true);
    },
  );

  it.runIf(isDarwin)('honors the BAI_FSEVENTS_HEALTH override', async () => {
    process.env.BAI_FSEVENTS_HEALTH = 'broken';
    await expect(probeFsevents()).resolves.toBe(false);
    process.env.BAI_FSEVENTS_HEALTH = 'OK';
    await expect(probeFsevents()).resolves.toBe(true);
  });

  it.runIf(isDarwin)(
    'reports healthy on a machine with working FSEvents',
    async () => {
      await expect(probeFsevents()).resolves.toBe(true);
    },
  );
});
