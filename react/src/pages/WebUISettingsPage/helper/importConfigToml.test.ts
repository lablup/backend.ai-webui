/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WEBUI_SETTING_DEFINITIONS } from '../../../helper/webuiSettings';
import {
  exportConfigToml,
  importConfigToml,
  tomlPathsOf,
} from './importConfigToml';
import { describe, expect, it } from 'vitest';

const valueOf = (text: string, key: string) => {
  const result = importConfigToml(text);
  if (!result.ok) throw new Error(result.error);
  return result.imported.find((entry) => entry.definition.key === key)?.value;
};

const skippedOf = (text: string) => {
  const result = importConfigToml(text);
  if (!result.ok) throw new Error(result.error);
  return result.skipped;
};

describe('tomlPathsOf', () => {
  // The paths the file parser read before #10664 (refreshConfigFromToml).
  const OLD_PATHS: Record<string, string> = {
    autoLogout: 'general.autoLogout',
    allowChangeSigninMode: 'general.allowChangeSigninMode',
    singleSignOnVendors: 'general.singleSignOnVendors',
    debug: 'general.debug',
    storageWarningThreshold: 'resources.storageWarningThreshold',
    pluginLogin: 'plugin.login',
    pluginPage: 'plugin.page',
    defaultSessionEnvironment: 'general.defaultSessionEnvironment',
    maxCountForPreopenPorts: 'general.maxCountForPreopenPorts',
    maxCPUCoresPerContainer: 'resources.maxCPUCoresPerContainer',
    maxMemoryPerContainer: 'resources.maxMemoryPerContainer',
    maxShmPerContainer: 'resources.maxShmPerContainer',
    maxATOMPLUSDevicesPerContainer: 'resources.maxATOMPLUSDevicesPerContainer',
    showNonInstalledImages: 'environments.showNonInstalledImages',
    openPortToPublic: 'resources.openPortToPublic',
    allowNonAuthTCP: 'resources.allowNonAuthTCP',
    maxFileUploadSize: 'resources.maxFileUploadSize',
    menuBlocklist: 'menu.blocklist',
    menuInactivelist: 'menu.inactivelist',
    fasttrackEndpoint: 'pipeline.frontendEndpoint',
    appDownloadUrl: 'general.appDownloadUrl',
    allowSignout: 'general.allowSignout',
  };

  it('reads each setting from the path the old file parser used', () => {
    for (const definition of WEBUI_SETTING_DEFINITIONS) {
      const expected = OLD_PATHS[definition.key];
      if (expected) expect(tomlPathsOf(definition)[0]).toBe(expected);
    }
  });

  it('gives every definition a path, and no two definitions the same one', () => {
    const paths = WEBUI_SETTING_DEFINITIONS.flatMap((d) => tomlPathsOf(d));
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('importConfigToml', () => {
  it('reads booleans, numbers, strings and lists by their table and name', () => {
    const text = `
[general]
hideAgents = false
maxCountForPreopenPorts = 5
defaultSessionEnvironment = "cr.backend.ai/stable/python:3.11"
singleSignOnVendors = "saml, openid"
[resources]
maxCPUCoresPerContainer = 128
[menu]
blocklist = "data, statistics"
[pipeline]
frontendEndpoint = "https://fasttrack.example"
[plugin]
login = "auth/signup"
page = "a, b/c"
`;
    expect(valueOf(text, 'hideAgents')).toBe(false);
    expect(valueOf(text, 'maxCountForPreopenPorts')).toBe(5);
    expect(valueOf(text, 'defaultSessionEnvironment')).toBe(
      'cr.backend.ai/stable/python:3.11',
    );
    expect(valueOf(text, 'singleSignOnVendors')).toEqual(['saml', 'openid']);
    expect(valueOf(text, 'maxCPUCoresPerContainer')).toBe(128);
    expect(valueOf(text, 'menuBlocklist')).toEqual(['data', 'statistics']);
    expect(valueOf(text, 'fasttrackEndpoint')).toBe(
      'https://fasttrack.example',
    );
    expect(valueOf(text, 'pluginLogin')).toBe('auth/signup');
    expect(valueOf(text, 'pluginPage')).toEqual(['a', 'b/c']);
  });

  it('treats empty strings and [placeholders] as unset, as the old parser did', () => {
    const text = `
[general]
appDownloadUrl = ""
defaultSessionEnvironment = "[Default session kernel]"
[resources]
maxCPUCoresPerContainer = ""
[menu]
blocklist = ""
`;
    const result = importConfigToml(text);
    expect(result.ok && result.imported).toEqual([]);
    expect(skippedOf(text)).toEqual(
      expect.arrayContaining([
        { path: 'general.appDownloadUrl', reason: 'empty' },
        { path: 'general.defaultSessionEnvironment', reason: 'empty' },
        { path: 'resources.maxCPUCoresPerContainer', reason: 'empty' },
        { path: 'menu.blocklist', reason: 'empty' },
      ]),
    );
  });

  it('parses numbers with parseInt and accepts a numeric string', () => {
    expect(
      valueOf(
        '[resources]\nmaxMemoryPerContainer = "32"',
        'maxMemoryPerContainer',
      ),
    ).toBe(32);
    expect(
      valueOf('[resources]\nmaxShmPerContainer = 2.5', 'maxShmPerContainer'),
    ).toBe(2);
  });

  it('accepts a TOML array for a list and drops values outside its options', () => {
    expect(
      valueOf(
        '[general]\nsingleSignOnVendors = ["saml", "ldap"]',
        'singleSignOnVendors',
      ),
    ).toEqual(['saml']);
  });

  it('skips a value of the wrong type', () => {
    expect(
      skippedOf(
        '[general]\nhideAgents = "yes"\n[resources]\nmaxCPUCoresPerContainer = "many"',
      ),
    ).toEqual([
      { path: 'general.hideAgents', reason: 'invalid' },
      { path: 'resources.maxCPUCoresPerContainer', reason: 'invalid' },
    ]);
  });

  it('separates file-only keys from keys nothing reads', () => {
    expect(
      skippedOf(`
[general]
apiEndpoint = "https://api.example"
connectionMode = "SESSION"
force2FA = true
[wsproxy]
proxyURL = "http://127.0.0.1:5050/"
[license]
edition = "Enterprise"
`),
    ).toEqual([
      { path: 'general.apiEndpoint', reason: 'fileOnly' },
      { path: 'general.connectionMode', reason: 'fileOnly' },
      { path: 'general.force2FA', reason: 'unknown' },
      { path: 'wsproxy.proxyURL', reason: 'fileOnly' },
      { path: 'license.edition', reason: 'fileOnly' },
    ]);
  });

  it('reads both ATOM+ spellings and keeps the first', () => {
    const text =
      '[resources]\nmaxATOMPLUSDevicesPerContainer = 4\nmaxATOMPlUSDevicesPerContainer = 8';
    expect(valueOf(text, 'maxATOMPLUSDevicesPerContainer')).toBe(4);
    expect(skippedOf(text)).toEqual([
      { path: 'resources.maxATOMPlUSDevicesPerContainer', reason: 'duplicate' },
    ]);
  });

  it('returns the parse error for a file that is not TOML', () => {
    const result = importConfigToml('[general\nhideAgents = ');
    expect(result.ok).toBe(false);
  });
});

describe('exportConfigToml', () => {
  const sample = (key: string): unknown => {
    const definition = WEBUI_SETTING_DEFINITIONS.find((d) => d.key === key)!;
    switch (definition.type) {
      case 'boolean':
        return true;
      case 'number':
        return 7;
      case 'stringList':
        return definition.options ? [definition.options[0].value] : ['a'];
      default:
        return 'x';
    }
  };
  const fileConfig = {
    general: {
      apiEndpoint: 'https://api.example',
      connectionMode: 'SESSION',
      debug: false,
    },
    wsproxy: { proxyURL: 'https://proxy.example/' },
    resources: { openPortToPublic: false },
  };

  it('imports back to the settings it exported in the full format', () => {
    const text = exportConfigToml({
      valueOf: (definition) => sample(definition.key),
      fileConfig,
      includeSettings: true,
    });
    const result = importConfigToml(text);
    if (!result.ok) throw new Error(result.error);
    expect(result.imported).toHaveLength(WEBUI_SETTING_DEFINITIONS.length);
    for (const entry of result.imported) {
      expect(entry.value).toEqual(sample(entry.definition.key));
    }
    expect(result.skipped.map((s) => s.reason)).toEqual([
      'fileOnly',
      'fileOnly',
      'fileOnly',
    ]);
  });

  it('keeps only the file-only keys in the current format', () => {
    const text = exportConfigToml({
      valueOf: (definition) => sample(definition.key),
      fileConfig,
      includeSettings: false,
    });
    expect(text.trim()).toBe(
      [
        '[general]',
        'apiEndpoint = "https://api.example"',
        'connectionMode = "SESSION"',
        '',
        '[wsproxy]',
        'proxyURL = "https://proxy.example/"',
      ].join('\n'),
    );
  });

  it('leaves out settings with no value', () => {
    const text = exportConfigToml({
      valueOf: (definition) => (definition.key === 'debug' ? true : undefined),
      includeSettings: true,
    });
    expect(text.trim()).toBe('[general]\ndebug = true');
  });
});
