/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WEBUI_SETTING_DEFINITIONS } from '../../../helper/webuiSettings';
import { parseSettingsJson, toSettingsJson } from './settingsJson';
import { describe, expect, it } from 'vitest';

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

describe('toSettingsJson', () => {
  it('puts every setting under its own scope', () => {
    const json = toSettingsJson((d) => sample(d.key));
    for (const definition of WEBUI_SETTING_DEFINITIONS) {
      expect(json[definition.scope][definition.key]).toEqual(
        sample(definition.key),
      );
    }
  });
});

describe('parseSettingsJson', () => {
  it('reads back what toSettingsJson wrote', () => {
    const text = JSON.stringify(toSettingsJson((d) => sample(d.key)));
    const result = parseSettingsJson(text);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.values).toHaveLength(WEBUI_SETTING_DEFINITIONS.length);
    for (const { definition, value } of result.values) {
      expect(value).toEqual(sample(definition.key));
    }
  });

  it('sets only the keys the document names', () => {
    const result = parseSettingsJson('{"public": {"autoLogout": true}}');
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.values.map((v) => [v.definition.key, v.value])).toEqual([
      ['autoLogout', true],
    ]);
  });

  it('reports unknown keys, a key under the wrong scope and wrong types', () => {
    const result = parseSettingsJson(
      JSON.stringify({
        public: { force2FA: true, autoLogout: 'yes' },
        domain: { autoLogout: true },
        other: {},
      }),
    );
    expect(result).toEqual({
      ok: false,
      issues: [
        { path: 'public.force2FA', reason: 'unknown' },
        { path: 'public.autoLogout', reason: 'invalid' },
        { path: 'domain.autoLogout', reason: 'unknown' },
        { path: 'other', reason: 'unknown' },
      ],
    });
  });

  it('rejects plugin paths the page would reject', () => {
    const result = parseSettingsJson('{"public": {"pluginLogin": "../x"}}');
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'public.pluginLogin', reason: 'invalid' }],
    });
  });

  it('rejects a number outside the setting range', () => {
    const result = parseSettingsJson(
      '{"domain": {"maxCPUCoresPerContainer": -2, "maxFileUploadSize": -1}}',
    );
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'domain.maxCPUCoresPerContainer', reason: 'invalid' }],
    });
  });

  it('returns the parse error of a document that is not JSON', () => {
    const result = parseSettingsJson('{ nope');
    expect(result.ok).toBe(false);
    expect(result).toHaveProperty('error');
  });
});
