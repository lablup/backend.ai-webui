/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LogoConfig } from './customThemeConfig';
import { DEFAULT_DETAIL_LOGO_SRC, resolveDetailLogoSrc } from './logoSource';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const siderOnly: LogoConfig = {
  src: '/sider-light.svg',
  srcCollapsed: '/sider-light-small.svg',
  srcDark: '/sider-dark.svg',
  srcCollapsedDark: '/sider-dark-small.svg',
};

describe('resolveDetailLogoSrc', () => {
  it("uses the area's own key when it is set", () => {
    const logo: LogoConfig = {
      ...siderOnly,
      loginLogoSrc: '/login-light.svg',
      aboutLogoSrcDark: '/about-dark.svg',
    };
    expect(resolveDetailLogoSrc(logo, 'login', 'light')).toEqual({
      src: '/login-light.svg',
      source: 'own',
    });
    expect(resolveDetailLogoSrc(logo, 'about', 'dark')).toEqual({
      src: '/about-dark.svg',
      source: 'own',
    });
  });

  it('borrows the opposite-scheme sider logo when the own key is unset', () => {
    expect(resolveDetailLogoSrc(siderOnly, 'login', 'light')).toEqual({
      src: '/sider-dark.svg',
      source: 'inherited',
      inheritedFrom: 'srcDark',
    });
    expect(resolveDetailLogoSrc(siderOnly, 'about', 'dark')).toEqual({
      src: '/sider-light.svg',
      source: 'inherited',
      inheritedFrom: 'src',
    });
  });

  it('treats an empty own key as unset', () => {
    const logo: LogoConfig = { ...siderOnly, loginLogoSrcDark: '' };
    expect(resolveDetailLogoSrc(logo, 'login', 'dark')).toMatchObject({
      src: '/sider-light.svg',
      source: 'inherited',
    });
  });

  it('falls back to the built-in asset when no key applies', () => {
    const logo = { src: '', srcCollapsed: '' } as LogoConfig;
    expect(resolveDetailLogoSrc(undefined, 'login', 'light')).toEqual({
      src: DEFAULT_DETAIL_LOGO_SRC.login.light,
      source: 'default',
    });
    expect(resolveDetailLogoSrc(logo, 'about', 'dark')).toEqual({
      src: DEFAULT_DETAIL_LOGO_SRC.about.dark,
      source: 'default',
    });
  });

  it('ships every built-in asset it can fall back to', () => {
    const repoRoot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../..',
    );
    for (const byScheme of Object.values(DEFAULT_DETAIL_LOGO_SRC)) {
      for (const src of Object.values(byScheme)) {
        expect(existsSync(resolve(repoRoot, src.replace(/^\//, '')))).toBe(
          true,
        );
      }
    }
  });
});
