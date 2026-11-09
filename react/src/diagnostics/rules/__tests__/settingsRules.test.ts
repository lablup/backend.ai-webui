/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import en from '../../../../../resources/i18n/en.json';
import {
  getDefaultLoginConfig,
  type LoginConfigState,
} from '../../../helper/loginConfig';
import {
  WEBUI_SETTING_DEFINITIONS,
  webuiSettingGroupLabelKey,
  webuiSettingLabelKey,
} from '../../../helper/webuiSettings';
import {
  changedSettingKeys,
  checkIgnoredConfigTomlKeys,
  checkPluginConfiguration,
  checkSettingImageReferences,
  checkSettingMenuKeys,
  checkSettingRanges,
  checkSettingUrls,
  findIgnoredConfigTomlKeys,
} from '../settingsRules';
import * as _ from 'lodash-es';

const state = (
  overrides: Partial<LoginConfigState> = {},
): LoginConfigState => ({
  ...getDefaultLoginConfig(),
  ...overrides,
});

const validMenuKeys = ['start', 'dashboard', 'session', 'data'];

describe('changedSettingKeys', () => {
  it('finds nothing on the code defaults', () => {
    expect(
      changedSettingKeys(state(), getDefaultLoginConfig(), [
        'maxCPUCoresPerContainer',
        'defaultImportEnvironment',
        'appDownloadUrl',
      ]),
    ).toEqual([]);
  });

  it('finds the keys set to another value, by setting key', () => {
    expect(
      changedSettingKeys(
        state({
          maxCPUCoresPerContainer: 8,
          default_import_environment: 'a/b',
        }),
        getDefaultLoginConfig(),
        [
          'maxCPUCoresPerContainer',
          'defaultImportEnvironment',
          'appDownloadUrl',
        ],
      ),
    ).toEqual(['maxCPUCoresPerContainer', 'defaultImportEnvironment']);
  });

  it('does not count an emptied value as set', () => {
    expect(
      changedSettingKeys(
        state({ default_import_environment: '', appDownloadUrl: '' }),
        getDefaultLoginConfig(),
        ['defaultImportEnvironment', 'appDownloadUrl'],
      ),
    ).toEqual([]);
  });
});

describe('checkSettingRanges', () => {
  it('passes the code defaults', () => {
    expect(checkSettingRanges(state())).toEqual([]);
  });

  it('flags an out-of-range value with its setting key', () => {
    const [result, ...rest] = checkSettingRanges(
      state({ maxCPUCoresPerContainer: 0 }),
    );
    expect(rest).toEqual([]);
    expect(result).toMatchObject({
      id: 'settings-out-of-range-maxCPUCoresPerContainer',
      severity: 'warning',
      settingKey: 'maxCPUCoresPerContainer',
      interpolationValues: { value: '0', min: '1', max: '8192' },
    });
  });

  it('accepts -1 for maxFileUploadSize and 0 preopen ports', () => {
    expect(
      checkSettingRanges(
        state({ maxFileUploadSize: -1, maxCountForPreopenPorts: 0 }),
      ),
    ).toEqual([]);
  });

  it('flags preopen ports over 100 and skips an unset cap', () => {
    const results = checkSettingRanges(
      state({
        maxCountForPreopenPorts: 101,
        maxATOMPLUSDevicesPerContainer: undefined,
      }),
    );
    expect(results.map((r) => r.settingKey)).toEqual([
      'maxCountForPreopenPorts',
    ]);
  });
});

describe('checkSettingUrls', () => {
  it('passes the defaults and an empty value', () => {
    expect(checkSettingUrls(state({ fasttrackEndpoint: '' }))).toEqual([]);
  });

  it('flags a value that is not an http(s) URL', () => {
    const results = checkSettingUrls(
      state({ appDownloadUrl: 'ftp://x', fasttrackEndpoint: 'nope' }),
    );
    expect(results.map((r) => r.id)).toEqual([
      'settings-invalid-url-appDownloadUrl',
      'settings-invalid-url-fasttrackEndpoint',
    ]);
    expect(results[1].interpolationValues).toEqual({ value: 'nope' });
  });
});

describe('checkSettingImageReferences', () => {
  it('passes the defaults', () => {
    expect(checkSettingImageReferences(state())).toEqual([]);
  });

  it('accepts a port in the registry and an architecture suffix', () => {
    expect(
      checkSettingImageReferences(
        state({
          systemSSHImage: 'registry.local:5000/ns/ssh:1.0',
          defaultFileBrowserImage: 'cr.backend.ai/stable/fb:24.03@x86_64',
        }),
      ),
    ).toEqual([]);
  });

  it('flags a malformed reference by setting key', () => {
    const results = checkSettingImageReferences(
      state({ default_session_environment: 'not an image' }),
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'settings-invalid-image-ref-defaultSessionEnvironment',
      settingKey: 'defaultSessionEnvironment',
      interpolationValues: { value: 'not an image' },
    });
  });

  it('skips placeholders', () => {
    expect(
      checkSettingImageReferences(state({ systemSSHImage: '[SSH image]' })),
    ).toEqual([]);
  });
});

describe('checkSettingMenuKeys', () => {
  it('reports nothing when both lists are empty', () => {
    expect(checkSettingMenuKeys(state(), validMenuKeys)).toEqual([]);
  });

  it('passes a list of known keys', () => {
    expect(
      checkSettingMenuKeys(state({ blockList: ['data'] }), validMenuKeys),
    ).toEqual([
      expect.objectContaining({
        id: 'settings-menu-keys-valid-menuBlocklist',
        severity: 'passed',
        settingKey: 'menuBlocklist',
        interpolationValues: { count: '1' },
      }),
    ]);
  });

  it('checks the inactive list too', () => {
    const results = checkSettingMenuKeys(
      state({ blockList: ['start'], inactiveList: ['dashbord', 'session'] }),
      validMenuKeys,
    );
    expect(results.map((r) => [r.id, r.severity])).toEqual([
      ['settings-menu-keys-valid-menuBlocklist', 'passed'],
      ['settings-invalid-menu-keys-menuInactivelist', 'warning'],
    ]);
    expect(results[1].interpolationValues).toEqual({
      entries: 'dashbord',
      count: '1',
    });
  });

  it('ignores system-settings, which neither list can hide', () => {
    expect(
      checkSettingMenuKeys(state({ blockList: ['system-settings'] }), [
        ...validMenuKeys,
        'system-settings',
      ]),
    ).toEqual([]);
  });
});

describe('checkPluginConfiguration', () => {
  it('returns nothing when no plugin is configured', () => {
    expect(checkPluginConfiguration([], '')).toEqual([]);
  });

  it('accepts the names and folder paths the loader accepts', () => {
    expect(
      checkPluginConfiguration(
        ['plugin_name', 'another-plugin', 'vendor/dashboard'],
        'auth/signup-cloud',
      ),
    ).toEqual([]);
  });

  it('flags page entries and the login plugin the loader would refuse', () => {
    const results = checkPluginConfiguration(
      ['good', 'bad name', 'a/../b'],
      'signup-cloud.js',
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'settings-invalid-plugin-names',
      severity: 'warning',
      settingKey: 'pluginPage',
      interpolationValues: {
        plugins: 'bad name, a/../b, signup-cloud.js',
        count: '3',
      },
    });
  });

  it('skips empty and placeholder entries', () => {
    expect(
      checkPluginConfiguration(['', '[Plugin Page]'], '[Login Plugin]'),
    ).toEqual([]);
  });
});

describe('findIgnoredConfigTomlKeys', () => {
  it('skips the keys config.toml still owns and unknown keys', () => {
    expect(
      findIgnoredConfigTomlKeys(
        {
          general: {
            apiEndpoint: 'https://api.example.com',
            connectionMode: 'SESSION',
            force2FA: true,
          },
          wsproxy: { proxyURL: 'http://127.0.0.1:5050/' },
          server: { webServerURL: 'https://web.example.com' },
        },
        state(),
      ),
    ).toEqual([]);
  });

  it('maps the renamed keys of ADR 0028', () => {
    const found = findIgnoredConfigTomlKeys(
      {
        menu: { blocklist: 'data, session', inactivelist: 'dashboard' },
        plugin: { login: 'signup', page: 'a,b' },
        pipeline: { frontendEndpoint: 'https://ft.example.com' },
      },
      state({ blockList: ['data', 'session'], inactiveList: ['dashboard'] }),
    );
    expect(found).toEqual([
      { path: 'menu.blocklist', settingKey: 'menuBlocklist', inEffect: true },
      {
        path: 'menu.inactivelist',
        settingKey: 'menuInactivelist',
        inEffect: true,
      },
      { path: 'plugin.login', settingKey: 'pluginLogin', inEffect: false },
      { path: 'plugin.page', settingKey: 'pluginPage', inEffect: false },
      {
        path: 'pipeline.frontendEndpoint',
        settingKey: 'fasttrackEndpoint',
        inEffect: false,
      },
    ]);
  });

  it('compares the file value with the effective value in the setting shape', () => {
    const found = findIgnoredConfigTomlKeys(
      {
        general: {
          autoLogout: 'true',
          debug: 'false',
          maxCountForPreopenPorts: '10',
        },
        resources: { maxCPUCoresPerContainer: 256 },
      },
      state({ autoLogout: true }),
    );
    expect(_.map(found, (k) => [k.settingKey, k.inEffect])).toEqual([
      ['autoLogout', true],
      ['debug', true],
      ['maxCountForPreopenPorts', true],
      ['maxCPUCoresPerContainer', false],
    ]);
  });

  it('reads boolean strings in any case and leaves junk numbers unmatched', () => {
    const found = findIgnoredConfigTomlKeys(
      {
        general: {
          debug: 'True',
          maxCountForPreopenPorts: '10abc',
          storageWarningThreshold: ' 90 ',
        },
      },
      state(),
    );
    expect(_.map(found, (k) => [k.settingKey, k.inEffect])).toEqual([
      ['debug', false],
      ['maxCountForPreopenPorts', false],
      ['storageWarningThreshold', true],
    ]);
  });

  it('leaves out an empty or placeholder value, which sets nothing', () => {
    const found = findIgnoredConfigTomlKeys(
      {
        general: {
          defaultSessionEnvironment: '[Default session kernel]',
          appDownloadUrl: '',
          systemSSHImage: '',
        },
      },
      state({ systemSSHImage: 'cr.example/ssh:1' }),
    );
    expect(found).toEqual([]);
  });
});

describe('checkIgnoredConfigTomlKeys', () => {
  it('reports nothing without a file or ignored keys', () => {
    expect(checkIgnoredConfigTomlKeys(null, state())).toEqual([]);
    expect(
      checkIgnoredConfigTomlKeys({ general: { apiEndpoint: 'x' } }, state()),
    ).toEqual([]);
  });

  it('warns about values not applied and lists the rest as info', () => {
    const results = checkIgnoredConfigTomlKeys(
      {
        general: { hideAgents: true, maskUserInfo: true },
        resources: { maxCPUCoresPerContainer: 256 },
      },
      state(),
    );
    expect(results).toEqual([
      expect.objectContaining({
        id: 'config-ignored-keys-not-applied',
        severity: 'warning',
        linksSystemSettings: true,
        interpolationValues: {
          keys: 'general.maskUserInfo, resources.maxCPUCoresPerContainer',
          count: '2',
        },
      }),
      expect.objectContaining({
        id: 'config-ignored-keys',
        severity: 'info',
        interpolationValues: { keys: 'general.hideAgents', count: '1' },
      }),
    ]);
  });
});

describe('System Settings labels', () => {
  it('has a row title and a group heading for every setting', () => {
    for (const definition of WEBUI_SETTING_DEFINITIONS) {
      expect(_.get(en, webuiSettingLabelKey(definition.key))).toEqual(
        expect.any(String),
      );
      expect(_.get(en, webuiSettingGroupLabelKey(definition.group))).toEqual(
        expect.any(String),
      );
    }
  });
});
