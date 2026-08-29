import type { AnyCommand } from './command.js';
import { successEnvelope } from './output.js';
import type { Verbosity } from './output.js';
import { COMMANDS } from './registry.js';
import { describe, expect, it } from 'vitest';

const cwd = import.meta.dirname;

function leaves(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(leaves);
  if (typeof value === 'object') return Object.values(value).flatMap(leaves);
  const leaf = String(value);
  return leaf.length > 0 ? [leaf] : [];
}

async function dataFor(command: AnyCommand): Promise<unknown> {
  return command.run({
    cwd,
    commands: COMMANDS,
    args: [],
    flags: {},
    json: false,
    render: { verbosity: 'detail' },
  });
}

describe.each(COMMANDS.map((command) => [command.name, command] as const))(
  '%s renders text and JSON from one data object',
  (name, command) => {
    it('emits every JSON leaf in the --detail text output', async () => {
      const data = await dataFor(command);
      const text = command.render(data, { verbosity: 'detail' });
      for (const leaf of leaves(data)) {
        expect(text, `missing leaf "${leaf}" in ${name} text output`).toContain(
          leaf,
        );
      }
    });

    it('renders deterministically from the same data at every verbosity', async () => {
      const data = await dataFor(command);
      const verbosities: Verbosity[] = ['dense', 'normal', 'detail'];
      for (const verbosity of verbosities) {
        const first = command.render(data, { verbosity });
        const second = command.render(data, { verbosity });
        expect(first).toBe(second);
        expect(first.length).toBeGreaterThan(0);
      }
      // The JSON surface is the same object, wrapped — never re-derived.
      expect(successEnvelope(name, data).data).toBe(data);
    });
  },
);
