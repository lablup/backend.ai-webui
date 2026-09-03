// @ts-nocheck
import {
  classify,
  extractAddedFeatureFlags,
  extractSupportsUsages,
  flatten,
  hasDestructiveContract,
  parseArgs,
  parseFeatureVersionMap,
} from './release-risk-report.mjs';

// Mirrors client.ts: a call site precedes the definition, guards nest, and
// prettier wraps long declarations onto a second line.
const CLIENT_SOURCE = `
  supports(feature: string): boolean {
    if (Object.keys(this._features).length === 0) {
      this._updateSupportList();
    }
    return this._features[feature] ?? false;
  }

  _updateSupportList() {
    if (this.isAPIVersionCompatibleWith('v4.20190601')) {
      this._features['scaling-group'] = true;
    }
    if (this.isManagerVersionCompatibleWith('22.09')) {
      this._features['force2FA'] = true;
      if (this.isManagerVersionCompatibleWith('25.09.0')) {
        this._features['force2FA'] = false;
      }
    }
    if (this.isManagerVersionCompatibleWith('26.9.0')) {
      this._features['allow-only-ro-permission-for-model-project-folder'] =
        true;
    }
    if (this.isManagerVersionCompatibleWith('23.09.2')) {
      this._features[
        'max-quota-scope-size-in-user-and-project-resource-policy'
      ] = true;
    }
    if (this.isManagerVersionCompatibleWith(['24.03.10'])) {
      this._features['endpoint-lifecycle-stage-filter'] = true;
    }
    if (
      this.isManagerVersionCompatibleWith(['25.1.0', '24.09.6', '24.03.12'])
    ) {
      this._features['vfolder-id-based'] = true;
    }
    this._features['ungated'] = true;
  }

  somethingElse() {
    this._features['after-the-method'] = true;
  }
`;

describe('release risk report', () => {
  describe('parseFeatureVersionMap', () => {
    const map = parseFeatureVersionMap(CLIENT_SOURCE);

    it('starts at the definition, not the call site that precedes it', () => {
      // The call site sits inside supports(); starting there ended the walk early.
      expect(map.has('scaling-group')).toBe(true);
      expect(map.get('scaling-group').version).toBe('v4.20190601');
    });

    it('attributes a flag to its enclosing version guard', () => {
      expect(map.get('force2FA').version).toBe('25.09.0');
      expect(map.get('force2FA').value).toBe(false);
    });

    it('reads a declaration prettier wrapped onto the next line', () => {
      const entry = map.get(
        'allow-only-ro-permission-for-model-project-folder',
      );
      expect(entry).toBeDefined();
      expect(entry.version).toBe('26.9.0');
      expect(entry.value).toBe(true);
    });

    it('reads a declaration whose key prettier wrapped inside the brackets', () => {
      const entry = map.get(
        'max-quota-scope-size-in-user-and-project-resource-policy',
      );
      expect(entry).toBeDefined();
      expect(entry.version).toBe('23.09.2');
      expect(entry.value).toBe(true);
    });

    it('reads an array guard, taking the first entry as the version', () => {
      expect(map.get('endpoint-lifecycle-stage-filter').version).toBe(
        '24.03.10',
      );
    });

    it('reads a guard whose opening brace sits on a later line', () => {
      expect(map.get('vfolder-id-based').version).toBe('25.1.0');
    });

    it('records an unguarded flag with a null version', () => {
      expect(map.get('ungated').version).toBeNull();
    });

    it('stops at the end of the method', () => {
      expect(map.has('after-the-method')).toBe(false);
    });

    it('returns an empty map when the method is absent', () => {
      expect(parseFeatureVersionMap('class A {}').size).toBe(0);
    });
  });

  describe('extractSupportsUsages', () => {
    it('finds a single-line call', () => {
      expect(
        extractSupportsUsages("baiClient.supports('agent-select')"),
      ).toEqual(['agent-select']);
    });

    it('finds the multi-line form with a trailing comma', () => {
      const src =
        "const ok = baiClient.supports(\n  'model-mount-subpath',\n);";
      expect(extractSupportsUsages(src)).toEqual(['model-mount-subpath']);
    });
  });

  describe('extractAddedFeatureFlags', () => {
    it('collects added true declarations, including the wrapped forms', () => {
      const diff = [
        '+++ b/client.ts',
        "+      this._features['one'] = true;",
        "+      this._features['two'] =",
        '+        true;',
        '+      this._features[',
        "+        'three-with-a-very-long-key'",
        '+      ] = true;',
        "+      this._features['four'] = false;",
        "-      this._features['removed'] = true;",
      ].join('\n');
      expect(extractAddedFeatureFlags(diff).sort()).toEqual([
        'one',
        'three-with-a-very-long-key',
        'two',
      ]);
    });
  });

  describe('classify', () => {
    it('counts source components as UI but not tests, stories, or generated', () => {
      const c = classify([
        'react/src/pages/DataPage.tsx',
        'react/src/pages/DataPage.test.tsx',
        'packages/backend.ai-ui/src/components/BAICard.stories.tsx',
        'react/src/__generated__/Foo.graphql.ts',
      ]);
      expect(c.ui).toEqual(['react/src/pages/DataPage.tsx']);
    });

    it('flags a destructive-flow file by name', () => {
      const c = classify([
        'react/src/components/DeleteForeverVFolderModal.tsx',
      ]);
      expect(c.destructive).toHaveLength(1);
    });

    it('counts BUI runtime dirs beyond components/hooks as UI', () => {
      const c = classify([
        'packages/backend.ai-ui/src/app-shim/appShim.tsx',
        'packages/backend.ai-ui/src/form-engine/Form.tsx',
        'packages/backend.ai-ui/src/__test__/helpers.tsx',
        'packages/backend.ai-ui/src/astryx-docs/Intro.tsx',
      ]);
      expect(c.ui).toEqual([
        'packages/backend.ai-ui/src/app-shim/appShim.tsx',
        'packages/backend.ai-ui/src/form-engine/Form.tsx',
      ]);
    });

    it('counts only executable specs as e2e, not e2e/ docs', () => {
      const c = classify([
        'e2e/vfolder/delete.spec.ts',
        'e2e/E2E_COVERAGE_REPORT.md',
        'e2e/README.md',
      ]);
      expect(c.e2e).toEqual(['e2e/vfolder/delete.spec.ts']);
    });

    it('separates e2e, docs, and locale changes', () => {
      const c = classify([
        'e2e/vfolder/delete.spec.ts',
        'packages/backend.ai-webui-docs/src/en/data.md',
        'resources/i18n/ko.json',
      ]);
      expect(c.e2e).toHaveLength(1);
      expect(c.docs).toHaveLength(1);
      expect(c.i18n).toHaveLength(1);
    });
  });

  describe('hasDestructiveContract', () => {
    it('detects the typed-confirm contract regardless of filename', () => {
      expect(
        hasDestructiveContract('<BAIDeleteConfirmModal requireConfirmInput'),
      ).toBe(true);
      expect(hasDestructiveContract('const x = useState()')).toBe(false);
    });
  });

  describe('flatten', () => {
    it('joins nested keys with dots', () => {
      expect(flatten({ a: { b: 'x' }, c: 'y' })).toEqual({
        'a.b': 'x',
        c: 'y',
      });
    });
  });

  describe('parseArgs', () => {
    it('defaults --to to HEAD', () => {
      expect(parseArgs(['--from', 'v1']).to).toBe('HEAD');
    });

    it('rejects an unknown argument', () => {
      expect(() => parseArgs(['--nope'])).toThrow(/unknown argument/);
    });
  });
});
