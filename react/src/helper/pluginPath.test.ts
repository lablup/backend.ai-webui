/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isValidPluginPath,
  joinPluginPath,
  pluginPathName,
  resolvePluginScriptUrl,
  splitPluginPath,
} from './pluginPath';
import { afterEach, describe, expect, it } from 'vitest';

describe('isValidPluginPath', () => {
  it('accepts a bare name and slash-separated segments', () => {
    expect(isValidPluginPath('test-plugin1')).toBe(true);
    expect(isValidPluginPath('signup_cloud')).toBe(true);
    expect(isValidPluginPath('vendor/login')).toBe(true);
    expect(isValidPluginPath('a/b-c/d_e')).toBe(true);
  });

  it('rejects traversal, empty segments and edge slashes', () => {
    for (const bad of [
      '',
      '..',
      '../x',
      'a/../b',
      'a/./b',
      '/a',
      'a/',
      'a//b',
      'a b',
      'a.js',
      'a?x=1',
      'http://evil/x',
    ]) {
      expect(isValidPluginPath(bad), bad).toBe(false);
    }
  });
});

describe('split / join / name', () => {
  it('round-trips folder and file', () => {
    expect(splitPluginPath('file')).toEqual({ folder: '', file: 'file' });
    expect(splitPluginPath('a/b/file')).toEqual({
      folder: 'a/b',
      file: 'file',
    });
    expect(joinPluginPath('', 'file')).toBe('file');
    expect(joinPluginPath('a/b', 'file')).toBe('a/b/file');
    expect(joinPluginPath(' /a/b/ ', ' file ')).toBe('a/b/file');
    expect(pluginPathName('a/b/file')).toBe('file');
    expect(pluginPathName('file')).toBe('file');
  });
});

describe('resolvePluginScriptUrl', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).isElectron;
  });

  it('serves from the app origin outside Electron', () => {
    expect(resolvePluginScriptUrl('a/b', 'https://api')).toBe(
      '/dist/plugins/a/b.js',
    );
  });

  it('prefixes the API endpoint in Electron', () => {
    (globalThis as Record<string, unknown>).isElectron = true;
    expect(resolvePluginScriptUrl('a/b', 'https://api')).toBe(
      'https://api/dist/plugins/a/b.js',
    );
    expect(resolvePluginScriptUrl('a/b', null)).toBe('/dist/plugins/a/b.js');
  });

  it('returns undefined for a rejected path', () => {
    expect(resolvePluginScriptUrl('../x')).toBeUndefined();
  });
});
