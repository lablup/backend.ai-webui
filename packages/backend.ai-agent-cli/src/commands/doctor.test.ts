import { EXIT } from '../errors.js';
import type { DocsPage } from '../search/docs-corpus.js';
import { parseMarkdown } from '../search/markdown.js';
import { runCli } from '../run.js';
import type { CheckStatus, DoctorCheck, DoctorData } from './doctor.js';
import {
  briefHeadline,
  doctorCommand,
  headingLevelsMatch,
  renderBrief,
} from './doctor.js';
import { beforeEach, describe, expect, it } from 'vitest';

const page = (source: string): DocsPage => ({
  slug: 'p',
  relativePath: 'p/p.md',
  repoPath: 'docs/p/p.md',
  title: 'P',
  parsed: parseMarkdown(source, 'p'),
});

describe('headingLevelsMatch', () => {
  it('accepts the same level sequence under different text', () => {
    expect(
      headingLevelsMatch(
        page('# A\n## B\n### C\n'),
        page('# 가\n## 나\n### 다\n'),
      ),
    ).toBe(true);
  });

  it('rejects a different count', () => {
    expect(headingLevelsMatch(page('# A\n## B\n'), page('# A\n'))).toBe(false);
  });

  it('rejects the same count with drifted levels', () => {
    expect(
      headingLevelsMatch(
        page('# A\n## B\n### C\n'),
        page('# A\n### B\n## C\n'),
      ),
    ).toBe(false);
  });
});

const check = (
  group: string,
  name: string,
  status: CheckStatus,
  detail = `${group}/${name}`,
): DoctorCheck => ({ group, check: name, status, detail });

const doctorData = (checks: DoctorCheck[]): DoctorData => ({
  brief: true,
  checks,
  summary: {
    total: checks.length,
    ok: checks.filter((one) => one.status === 'ok').length,
    warn: checks.filter((one) => one.status === 'warn').length,
    fail: checks.filter((one) => one.status === 'fail').length,
  },
});

const HEALTHY: DoctorCheck[] = [
  check('runtime', 'node version', 'ok'),
  check('checkout', 'checkout detection', 'ok', '/repo (version 26.8.0)'),
  check('checkout', 'synced data', 'ok', 'main at abc123def'),
  check('docs', 'manual sources', 'ok', '42 en page(s)'),
  check('docs', 'languages', 'ok'),
  check('schema', 'sdl parses', 'ok', 'data/schema.graphql parsed'),
  check('schema', 'marker coverage', 'ok'),
  check('auth', 'session file', 'ok', 'mode 0600'),
  check(
    'auth',
    'whoami',
    'ok',
    'admin@lablup.com (superadmin) at http://m:8090',
  ),
  check('mappings', 'mapping files', 'ok'),
  check('alignment', 'sdl present', 'ok'),
  check('alignment', 'verdict', 'ok', 'schema matches manager 26.8.0rc1'),
];

describe('doctor --brief', () => {
  it('is a registered flag, so --help and manifest show it', () => {
    expect(doctorCommand.flags.map((flag) => flag.flag)).toContain('--brief');
    expect(doctorCommand.usage).toContain('--brief');
  });

  it('leads with auth, then alignment, then the checkout/data lines', () => {
    const { rows } = briefHeadline(HEALTHY);
    expect(rows.map(([label]) => label)).toEqual([
      'auth',
      'alignment',
      'checkout',
      'data',
      'docs',
      'schema',
    ]);
    expect(rows[0][1]).toContain('admin@lablup.com');
    expect(rows[1][1]).toContain('26.8.0rc1');
  });

  it('falls back to the session file when whoami never ran', () => {
    const { rows } = briefHeadline([
      check('auth', 'session file', 'warn', 'no session stored'),
    ]);
    expect(rows).toEqual([['auth', 'warn — no session stored']]);
  });

  it('prints only the warn and fail checks under the headline', () => {
    const rendered = renderBrief(
      doctorData([
        ...HEALTHY,
        check('mappings', 'value coverage', 'warn', 'two values uncurated'),
        check('runtime', 'i18n index', 'fail', 'nothing labelled'),
      ]),
    );
    expect(rendered).toContain(
      'warn mappings/value coverage: two values uncurated',
    );
    expect(rendered).toContain('fail runtime/i18n index: nothing labelled');
    expect(rendered).not.toContain('docs/languages');
    expect(rendered).not.toContain('schema/marker coverage');
    expect(rendered).toContain('summary: 14 check(s) — 12 ok, 1 warn, 1 fail');
  });

  it('stays under 40 lines however many checks warn', () => {
    const noisy = Array.from({ length: 60 }, (_, index) =>
      check('mappings', `issue ${index}`, 'warn', 'x'.repeat(400)),
    );
    const rendered = renderBrief(doctorData([...HEALTHY, ...noisy]));
    const lines = rendered.split('\n');
    expect(lines.length).toBeLessThanOrEqual(40);
    expect(lines.every((line) => line.length <= 200)).toBe(true);
    expect(rendered).toContain('42 more — bai-agent doctor --json');
  });
});

describe('bai-agent doctor --brief end to end', () => {
  let out: string[];

  const run = (argv: string[]) =>
    runCli({
      argv,
      cwd: import.meta.dirname,
      io: {
        stdout: (chunk) => out.push(chunk),
        stderr: () => {},
      },
    });

  beforeEach(() => {
    out = [];
  });

  // `--mappings` is the one group that reaches no network.
  it('renders at most 40 lines of text', async () => {
    await expect(run(['doctor', '--mappings', '--brief'])).resolves.toBe(
      EXIT.ok,
    );
    const lines = out.join('').trimEnd().split('\n');
    expect(lines.length).toBeLessThanOrEqual(40);
    expect(lines.at(-1)).toMatch(/^summary: \d+ check\(s\) — /);
  });

  it('leaves --json carrying every check', async () => {
    await run(['doctor', '--mappings', '--brief', '--json']);
    const brief = JSON.parse(out.join('')) as { data: DoctorData };
    out = [];
    await run(['doctor', '--mappings', '--json']);
    const full = JSON.parse(out.join('')) as { data: DoctorData };
    expect(brief.data.checks).toEqual(full.data.checks);
    expect(brief.data.summary).toEqual(full.data.summary);
    expect(brief.data.brief).toBe(true);
    expect(full.data.brief).toBe(false);
  });
});
