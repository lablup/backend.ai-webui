// @ts-nocheck
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  appNameBudget,
  boardCatalogUrl,
  boardCatalogUrls,
  readDevGwConfig,
  shareBaseOf,
  shareUrlFor,
} from './dev-gw.mjs';

const LEGACY = {
  box: 'jongeun',
  gateway: '10.82.0.159',
  domain: '10-82-0-159.sslip.io',
  port: 21001,
  target_port: 1357,
  share_base: 'http://{app}.jongeun.10-82-0-159.sslip.io',
  bare_url: 'http://jongeun.10-82-0-159.sslip.io',
};
const CURRENT = {
  ...LEGACY,
  public_domain: 'frontend.internal.lablup.ai',
  share_base: 'https://{app}--jongeun.frontend.internal.lablup.ai',
  bare_url: 'https://box--jongeun.frontend.internal.lablup.ai',
  legacy_share_base: 'http://{app}.jongeun.10-82-0-159.sslip.io',
  legacy_bare_url: 'http://jongeun.10-82-0-159.sslip.io',
};
const BOX32 = 'abcdefghijklmnopqrstuvwxyz012345';

describe('dev-gw config', () => {
  it('accepts both share_base forms and nothing else', () => {
    expect(shareBaseOf(LEGACY)).toBe(LEGACY.share_base);
    expect(shareBaseOf(CURRENT)).toBe(CURRENT.share_base);
    expect(shareBaseOf({ share_base: 'https://box--jongeun.example' })).toBeNull();
    expect(shareBaseOf({ share_base: 42 })).toBeNull();
    expect(shareBaseOf(null)).toBeNull();
  });

  it('fills the template, keeping its scheme', () => {
    expect(shareUrlFor(shareBaseOf(LEGACY), 'gh-1-pr2-x')).toEqual({
      url: 'http://gh-1-pr2-x.jongeun.10-82-0-159.sslip.io',
    });
    expect(shareUrlFor(shareBaseOf(CURRENT), 'gh-1-pr2-x')).toEqual({
      url: 'https://gh-1-pr2-x--jongeun.frontend.internal.lablup.ai',
    });
  });

  it('budgets the app name so <app>--<box> fits one DNS label', () => {
    expect(appNameBudget(LEGACY.share_base)).toBe(63);
    expect(appNameBudget(CURRENT.share_base)).toBe(63 - '--jongeun'.length);
    const base = `https://{app}--${BOX32}.frontend.internal.lablup.ai`;
    expect(appNameBudget(base)).toBe(29);
    expect(shareUrlFor(base, 'a'.repeat(29)).url).toBeDefined();
    expect(shareUrlFor(base, 'a'.repeat(30)).error).toMatch(/30 characters.*allows 29/);
  });

  it('refuses `box` and dotted names only on the one-label form', () => {
    expect(shareUrlFor(CURRENT.share_base, 'box').error).toMatch(/reserved/);
    expect(shareUrlFor(CURRENT.share_base, 'feat.webui').error).toMatch(/single DNS label/);
    expect(shareUrlFor(LEGACY.share_base, 'box').url).toBe(
      'http://box.jongeun.10-82-0-159.sslip.io',
    );
  });

  it('reads the board from public_domain, else the legacy domain', () => {
    expect(boardCatalogUrl(CURRENT)).toBe(
      'https://board.frontend.internal.lablup.ai/api/catalog',
    );
    expect(boardCatalogUrl(LEGACY)).toBe('http://board.10-82-0-159.sslip.io/api/catalog');
    expect(boardCatalogUrl({ box: 'x' })).toBeNull();
    expect(boardCatalogUrls(CURRENT)).toEqual([
      'https://board.frontend.internal.lablup.ai/api/catalog',
      'http://board.10-82-0-159.sslip.io/api/catalog',
    ]);
  });

  it('reads a missing or malformed file as not joined', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-gw-'));
    expect(readDevGwConfig(path.join(dir, 'none.json'))).toBeNull();
    fs.writeFileSync(path.join(dir, 'bad.json'), '{');
    expect(readDevGwConfig(path.join(dir, 'bad.json'))).toBeNull();
    fs.writeFileSync(path.join(dir, 'ok.json'), JSON.stringify(CURRENT));
    expect(readDevGwConfig(path.join(dir, 'ok.json'))).toEqual(CURRENT);
    fs.rmSync(dir, { recursive: true });
  });
});
