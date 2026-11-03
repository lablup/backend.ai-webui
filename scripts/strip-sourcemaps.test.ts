import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  stripSourceMaps,
  stripTrailingSourceMapComments,
} from './strip-sourcemaps.mjs';

const strip = (text: string) => stripTrailingSourceMapComments(text).text;

describe('stripTrailingSourceMapComments', () => {
  it('removes the trailing JS comments and counts them', () => {
    expect(
      stripTrailingSourceMapComments(
        'a();\n//# sourceMappingURL=a.js.map\n//# sourceMappingURL=a.js.map\n',
      ),
    ).toEqual({ text: 'a();\n', removed: 2 });
  });

  it('removes the legacy, unspaced and same-line forms', () => {
    expect(strip('a();//@ sourceMappingURL=a.map')).toBe('a();\n');
    expect(strip('a()\n//#sourceMappingURL=a.map')).toBe('a()\n');
  });

  it('removes a trailing CSS block comment, even across lines', () => {
    expect(
      strip('a{}/*# sourceMappingURL=data:application/json;base64,\nAAAA */\n'),
    ).toBe('a{}\n');
  });

  it('keeps a sourceMappingURL that is not the trailing comment', () => {
    const code = 'w(`\n//# sourceMappingURL=${u}`);\nconsole.log(1);\n';
    expect(strip(code)).toBe(code);
  });

  it('keeps a quoted sourceMappingURL on the last line', () => {
    const code = 'emit("//# sourceMappingURL=" + url)';
    expect(strip(code)).toBe(code);
  });

  it('stays fast on repeated comment prefixes', () => {
    const started = Date.now();
    strip(`//#sourceMappingURL=${'//#sourceMappingURL='.repeat(5000)}"`);
    strip(`/*#sourceMappingURL=${'*//*#sourceMappingURL='.repeat(5000)}x`);
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('never reaches past code to a later block comment', () => {
    const css = 'a{}\n/*# sourceMappingURL=a.css.map */\nb{color:red}\n/*! end */\n';
    expect(strip(css)).toBe(css);
  });
});

describe('stripSourceMaps', () => {
  let dir: string;
  const src = () => path.join(dir, 'src');
  const out = () => path.join(dir, 'out');
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-sourcemaps-'));
    fs.mkdirSync(path.join(dir, 'src/assets'), { recursive: true });
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const write = (rel: string, body: string | Buffer) =>
    fs.writeFileSync(path.join(src(), rel), body);

  it('leaves out source maps, strips comments and keeps other .map files', () => {
    write('assets/a.js', 'a();\n//# sourceMappingURL=a.js.map\n');
    write('assets/a.js.map', '{}');
    write('assets/types.d.ts.map', '{"version":3,"sources":[],"mappings":""}');
    write('assets/region.map', 'not a source map');
    write('index.html', '<html></html>');

    const { stats, problems } = stripSourceMaps(src(), out());

    expect(problems).toEqual([]);
    expect(stats).toEqual({ skippedMaps: 2, strippedFiles: 1, removedComments: 1 });
    expect(fs.readFileSync(path.join(out(), 'assets/a.js'), 'utf8')).toBe('a();\n');
    expect(fs.existsSync(path.join(out(), 'assets/a.js.map'))).toBe(false);
    expect(fs.existsSync(path.join(out(), 'assets/types.d.ts.map'))).toBe(false);
    expect(fs.existsSync(path.join(out(), 'assets/region.map'))).toBe(true);
  });

  it('copies untouched files byte for byte and keeps their mtime', () => {
    const latin1 = Buffer.from([0x61, 0xe9, 0x3b, 0x0a]);
    write('assets/vendor.js', latin1);
    write('assets/b.js', 'b();\n//# sourceMappingURL=b.js.map\n');
    const old = new Date('2020-01-01T00:00:00Z');
    fs.utimesSync(path.join(src(), 'assets/b.js'), old, old);

    stripSourceMaps(src(), out());

    expect(fs.readFileSync(path.join(out(), 'assets/vendor.js'))).toEqual(latin1);
    expect(fs.statSync(path.join(out(), 'assets/b.js')).mtime).toEqual(old);
  });

  it('copies symlinks', () => {
    fs.symlinkSync('assets', path.join(src(), 'linked'));
    stripSourceMaps(src(), out());
    expect(fs.readlinkSync(path.join(out(), 'linked'))).toBe('assets');
  });

  it('reports an inline map in comment position, not one in a string', () => {
    write(
      'assets/a.js',
      'a();//# sourceMappingURL=data:application/json;base64,AA\nb();\n',
    );
    write('assets/tool.js', 'emit("//# sourceMappingURL=data:"+b64);\n');
    const { problems } = stripSourceMaps(src(), out());
    expect(problems).toEqual([`inline source map: ${path.join('assets', 'a.js')}`]);
  });
});
