// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseDefault, sortObjectKeys, generateSchema } = require('./gen-theme-schema.cjs');
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('gen-theme-schema', () => {
  describe('parseDefault', () => {
    it('parses boolean true', () => {
      expect(parseDefault('true')).toBe(true);
    });

    it('parses boolean false', () => {
      expect(parseDefault('false')).toBe(false);
    });

    it('parses undefined', () => {
      expect(parseDefault('undefined')).toBeUndefined();
    });

    it('parses null as null (not undefined)', () => {
      expect(parseDefault('null')).toBeNull();
    });

    it('parses integer numbers', () => {
      expect(parseDefault('42')).toBe(42);
      expect(parseDefault('0')).toBe(0);
      expect(parseDefault('-1')).toBe(-1);
    });

    it('parses float numbers', () => {
      expect(parseDefault('3.14')).toBe(3.14);
      expect(parseDefault('0.5')).toBe(0.5);
    });

    it('strips single quotes from strings', () => {
      expect(parseDefault("'hello'")).toBe('hello');
    });

    it('strips double quotes from strings', () => {
      expect(parseDefault('"world"')).toBe('world');
    });

    it('returns raw string for unquoted non-numeric values', () => {
      expect(parseDefault('some-value')).toBe('some-value');
    });

    it('does not parse empty string as number', () => {
      expect(parseDefault('  ')).toBe('  ');
    });
  });

  describe('sortObjectKeys', () => {
    it('sorts object keys alphabetically', () => {
      const result = sortObjectKeys({ c: 1, a: 2, b: 3 });
      expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    });

    it('sorts nested object keys', () => {
      const result = sortObjectKeys({ z: { b: 1, a: 2 }, a: 3 });
      expect(Object.keys(result)).toEqual(['a', 'z']);
      expect(Object.keys(result.z)).toEqual(['a', 'b']);
    });

    it('handles arrays by sorting each element', () => {
      const result = sortObjectKeys([{ b: 1, a: 2 }, { d: 3, c: 4 }]);
      expect(Object.keys(result[0])).toEqual(['a', 'b']);
      expect(Object.keys(result[1])).toEqual(['c', 'd']);
    });

    it('returns null as-is', () => {
      expect(sortObjectKeys(null)).toBeNull();
    });

    it('returns primitives as-is', () => {
      expect(sortObjectKeys(42)).toBe(42);
      expect(sortObjectKeys('hello')).toBe('hello');
      expect(sortObjectKeys(true)).toBe(true);
    });

    it('handles empty object', () => {
      expect(sortObjectKeys({})).toEqual({});
    });
  });

  describe('generateSchema (integration)', () => {
    const antdContextPath = path.resolve(
      __dirname,
      '../react/node_modules/antd/es/config-provider/context.d.ts',
    );
    const hasAntd = fs.existsSync(antdContextPath);

    // Skip integration tests if antd is not installed (e.g., in CI without node_modules)
    const describeIfAntd = hasAntd ? describe : describe.skip;

    describeIfAntd('with antd installed', () => {
      let outputPath: string;
      let tmpDir: string;

      beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-schema-'));
        outputPath = path.join(tmpDir, 'test-schema.json');
      });

      afterEach(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        fs.rmdirSync(tmpDir);
      });

      it('generates a valid JSON schema file', () => {
        const schema = generateSchema(outputPath);

        expect(fs.existsSync(outputPath)).toBe(true);
        const content = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        expect(content.$schema).toBe('http://json-schema.org/draft-07/schema#');
        expect(content.type).toBe('object');
        expect(content.properties).toBeDefined();
      });

      it('includes component entries', () => {
        const schema = generateSchema(outputPath);

        expect(schema.properties.components).toBeDefined();
        expect(schema.properties.components.properties).toBeDefined();
        const componentKeys = Object.keys(schema.properties.components.properties);
        expect(componentKeys.length).toBeGreaterThan(0);
        // antd has many components, expect a reasonable count
        expect(componentKeys).toContain('Button');
        expect(componentKeys).toContain('Input');
      });

      it('includes token properties', () => {
        const schema = generateSchema(outputPath);

        expect(schema.properties.token).toBeDefined();
        expect(schema.properties.token.properties).toBeDefined();
        const tokenKeys = Object.keys(schema.properties.token.properties);
        expect(tokenKeys.length).toBeGreaterThan(0);
      });

      it('includes shared AliasToken definition', () => {
        const schema = generateSchema(outputPath);

        expect(schema.definitions['Partial<AliasToken>']).toBeDefined();
        expect(schema.definitions['Partial<AliasToken>'].type).toBe('object');
      });

      it('uses allOf structure for component entries', () => {
        const schema = generateSchema(outputPath);
        const buttonSchema = schema.properties.components.properties.Button;

        expect(buttonSchema.allOf).toBeDefined();
        expect(buttonSchema.allOf.length).toBeGreaterThanOrEqual(2);
        // Should include Partial<AliasToken> ref
        const refs = buttonSchema.allOf
          .filter((p: any) => p.$ref)
          .map((p: any) => p.$ref);
        expect(refs).toContain('#/definitions/Partial<AliasToken>');
      });

      it('produces sorted output keys', () => {
        const schema = generateSchema(outputPath);
        const content = fs.readFileSync(outputPath, 'utf8');
        const parsed = JSON.parse(content);

        // Check that definitions keys are in sorted order within each definition
        if (parsed.definitions['Partial<AliasToken>']?.properties) {
          const keys = Object.keys(parsed.definitions['Partial<AliasToken>'].properties);
          const sorted = [...keys].sort();
          expect(keys).toEqual(sorted);
        }
      });
    });
  });
});
