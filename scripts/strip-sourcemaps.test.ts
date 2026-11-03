import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  stripSourceMaps,
  stripTrailingSourceMapComments,
} from './strip-sourcemaps.mjs';

describe('stripTrailingSourceMapComments', () => {
  it('removes the trailing JS comment', () => {
    expect(
      stripTrailingSourceMapComments('a();\n//# sourceMappingURL=a.js.map\n'),
    ).toBe('a();\n');
  });

  it('removes the legacy, unspaced and same-line forms', () => {
    expect(stripTrailingSourceMapComments('a();//@ sourceMappingURL=a.map')).toBe(
      'a();\n',
    );
    expect(stripTrailingSourceMapComments('a()\n//#sourceMappingURL=a.map')).toBe(
      'a()\n',
    );
  });

  it('removes a trailing CSS block comment, even across lines', () => {
    expect(
      stripTrailingSourceMapComments(
        'a{}/*# sourceMappingURL=data:application/json;base64,\nAAAA */\n',
      ),
    ).toBe('a{}\n');
  });

  it('keeps a sourceMappingURL that is not the trailing comment', () => {
    const code =
      'w(`\n//# sourceMappingURL=${u}`);\nconsole.log(1);\n';
    expect(stripTrailingSourceMapComments(code)).toBe(code);
  });
});

describe('stripSourceMaps', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-sourcemaps-'));
    fs.mkdirSync(path.join(dir, 'src/assets'), { recursive: true });
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const write = (rel: string, body: string) =>
    fs.writeFileSync(path.join(dir, 'src', rel), body);

  it('skips source maps, strips comments and keeps other .map files', () => {
    write('assets/a.js', 'a();\n//# sourceMappingURL=a.js.map\n');
    write('assets/a.js.map', '{"version":3,"sources":[],"mappings":""}');
    write('assets/b.css.map', '{}');
    write('assets/region.map', 'not a source map');
    write('index.html', '<html></html>');

    const { stats, problems } = stripSourceMaps(
      path.join(dir, 'src'),
      path.join(dir, 'out'),
    );

    expect(problems).toEqual([]);
    expect(stats).toEqual({ skippedMaps: 2, stripped: 1, files: 3 });
    expect(fs.readFileSync(path.join(dir, 'out/assets/a.js'), 'utf8')).toBe(
      'a();\n',
    );
    expect(fs.existsSync(path.join(dir, 'out/assets/a.js.map'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'out/assets/region.map'))).toBe(true);
  });

  it('reports an inline map that is not at the end of a file', () => {
    write(
      'assets/a.js',
      'a();//# sourceMappingURL=data:application/json;base64,AA\nb();\n',
    );
    const { problems } = stripSourceMaps(
      path.join(dir, 'src'),
      path.join(dir, 'out'),
    );
    expect(problems).toEqual([`inline source map: ${path.join('assets', 'a.js')}`]);
  });

  it('reports a map-shaped file under another name', () => {
    write('assets/chunk.map', '{"version":3,"sources":["a.ts"],"mappings":"AAAA"}');
    const { problems } = stripSourceMaps(
      path.join(dir, 'src'),
      path.join(dir, 'out'),
    );
    expect(problems).toEqual([`source map file: ${path.join('assets', 'chunk.map')}`]);
  });
});
