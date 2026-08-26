import integration from '../../astryx.integration';
import { parseDoc, parseReference } from '@astryxdesign/cli/authoring';
import fg from 'fast-glob';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Guards the Astryx CLI integration BUI ships (`astryx.integration.ts`).
 *
 * The CLI's discovery is deliberately fault-tolerant — a doc file that fails
 * the authoring schema is skipped with a warning instead of crashing the
 * command — so a broken doc drops its component out of `astryx component` /
 * `astryx search` silently. These assertions are what make that loud.
 */
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const componentsRoot = resolve(packageDir, integration.components);
const docsRoot = resolve(packageDir, integration.docs);

const componentDocs = fg.sync('**/*.doc.ts', {
  cwd: componentsRoot,
  absolute: true,
});
const referenceDocs = fg.sync('*.doc.ts', { cwd: docsRoot, absolute: true });

const stemOf = (file: string) => basename(file, '.doc.ts');

interface DocProp {
  name: string;
  description: string;
}

/** Every prop list in a doc — the top-level one, or each `components` entry's. */
const propLists = (docs: {
  props?: DocProp[];
  components?: Array<{ props?: DocProp[] }>;
}): DocProp[][] =>
  docs.props
    ? [docs.props]
    : (docs.components ?? [])
        .map((entry) => entry.props)
        .filter((props): props is DocProp[] => !!props);

describe('astryx integration manifest', () => {
  it('points at roots that exist', () => {
    expect(existsSync(componentsRoot)).toBe(true);
    expect(existsSync(docsRoot)).toBe(true);
  });

  it('ships at least one component doc and one reference doc', () => {
    expect(componentDocs.length).toBeGreaterThan(0);
    expect(referenceDocs.length).toBeGreaterThan(0);
  });
});

describe.each(componentDocs.map((file) => [stemOf(file), file]))(
  'component doc %s',
  (stem, file) => {
    it('documents a component that exists next to it', () => {
      expect(existsSync(resolve(dirname(file), `${stem}.tsx`))).toBe(true);
    });

    it('exports `docs` as both the named and the default export', async () => {
      // The CLI's component loader reads the NAMED export only, while the
      // authoring docs describe a default export. Shipping one without the
      // other loads as `undefined` on one of the two paths.
      const mod = await import(/* @vite-ignore */ file);
      expect(mod.docs).toBeDefined();
      expect(mod.default).toBe(mod.docs);
    });

    it('satisfies the authoring schema', async () => {
      const { docs } = await import(/* @vite-ignore */ file);
      expect(() => parseDoc(docs)).not.toThrow();
    });

    it('stamps a single-component doc and leaves a multi-component one unstamped', async () => {
      const { docs } = await import(/* @vite-ignore */ file);
      // The stamped `type: 'component'` schema requires a top-level `props`
      // array and has no multi-component variant (CLI 0.5.0). A file that
      // exports several components documents them under `components` and
      // therefore has to go through the unstamped, shape-sniffed path.
      if (docs.components) {
        expect(docs.type).toBeUndefined();
      } else {
        expect(docs.type).toBe('component');
      }
    });

    it('is named after its file, with a BAI-prefixed display name', async () => {
      const { docs } = await import(/* @vite-ignore */ file);
      // Discovery keys a component on the doc file's stem; a `name` that
      // disagrees makes `astryx component <name>` miss it.
      expect(docs.name).toBe(stem);
      expect(docs.displayName).toBeTruthy();
      if (stem.startsWith('BAI')) {
        expect(docs.displayName).toMatch(/^BAI /);
      }
    });

    it('documents only props the component source mentions', async () => {
      // The cheapest defence against a doc that drifts away from its
      // component: a prop the source never names cannot be a prop. It does
      // not prove the type or the default is still right — review and
      // `tsc` cover the shape — but it catches renamed and deleted props,
      // which is how these files go stale.
      const { docs } = await import(/* @vite-ignore */ file);
      const source = readFileSync(
        resolve(dirname(file), `${stem}.tsx`),
        'utf-8',
      );
      for (const props of propLists(docs)) {
        for (const prop of props) {
          expect(
            new RegExp(`\\b${prop.name}\\b`).test(source),
            `${stem}.doc.ts documents a prop \`${prop.name}\` that ${stem}.tsx never names`,
          ).toBe(true);
        }
      }
    });

    it('documents each prop once, with a description', async () => {
      const { docs } = await import(/* @vite-ignore */ file);
      for (const props of propLists(docs)) {
        const names = props.map((prop) => prop.name);
        expect(names).toEqual([...new Set(names)]);
        for (const prop of props) {
          expect(prop.description.trim().length).toBeGreaterThan(0);
        }
      }
    });
  },
);

describe.each(referenceDocs.map((file) => [stemOf(file), file]))(
  'reference doc %s',
  (stem, file) => {
    it('satisfies the ReferenceDoc schema and is named after its file', async () => {
      const mod = await import(/* @vite-ignore */ file);
      expect(mod.docs).toBeDefined();
      expect(mod.default).toBe(mod.docs);
      expect(() => parseReference(mod.docs)).not.toThrow();
      // A topic name is a CLI argument and a docsite path.
      expect(mod.docs.name).toBe(stem);
      expect(mod.docs.name).toMatch(/^[\w-]+$/);
    });
  },
);

/** Component-ish names re-exported from one of the components barrels. */
const barrelExports = (file: string): string[] => {
  const source = readFileSync(file, 'utf-8');
  const names: string[] = [];
  for (const match of source.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const part of match[1].split(',')) {
      const entry = part.trim();
      if (!entry || entry.startsWith('type ')) continue;
      const name = /^(?:default as\s+)?([A-Za-z_]\w*)/.exec(entry)?.[1];
      // Components are PascalCase. `use*` hooks and SCREAMING_CASE constants
      // are neither components nor candidates for a component catalog.
      if (name && /^[A-Z]/.test(name) && name !== name.toUpperCase()) {
        names.push(name);
      }
    }
  }
  return names;
};

describe('catalog coverage', () => {
  it('documents every component the barrel exports', async () => {
    // Partial coverage is worse than none: the catalog looks authoritative, so
    // a gap reads as "no BAI* component exists for this" rather than "not
    // documented yet", and that is the answer that pushes new code onto the
    // primitive instead of the wrapper. A component that should not appear in
    // human-facing listings still gets a doc — one with `hidden: true`.
    const exported = new Set([
      ...barrelExports(resolve(componentsRoot, 'index.ts')),
      ...barrelExports(resolve(componentsRoot, 'Table/index.ts')),
    ]);

    const documented = new Set<string>();
    for (const file of componentDocs) {
      const { docs } = await import(/* @vite-ignore */ file);
      documented.add(docs.name);
      for (const entry of docs.components ?? []) documented.add(entry.name);
    }

    const missing = [...exported].filter((name) => !documented.has(name));
    expect(
      missing,
      `these components have no Astryx doc: ${missing.join(', ')}`,
    ).toEqual([]);
  });
});
