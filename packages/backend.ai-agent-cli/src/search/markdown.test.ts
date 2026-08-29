import { pageBody, parseMarkdown, sliceSection } from './markdown.js';
import { headingPlainText, slugFromPath, slugify } from './slug.js';
import { describe, expect, it } from 'vitest';

const FIXTURE = [
  '---',
  'navTitle: Fixture',
  '---',
  '',
  '# Fixture Page',
  '',
  'Intro prose.',
  '',
  '## First section',
  '',
  'First body.',
  '',
  '```bash',
  '# not a heading',
  '```',
  '',
  '### Nested under first',
  '',
  'Nested body.',
  '',
  '## Second section',
  '',
  'Second body.',
  '',
].join('\n');

describe('parseMarkdown', () => {
  const parsed = parseMarkdown(FIXTURE, 'fixture');

  it('skips frontmatter and fenced code, keeping heading order', () => {
    expect(parsed.headings.map((heading) => heading.text)).toEqual([
      'Fixture Page',
      'First section',
      'Nested under first',
      'Second section',
    ]);
    expect(parsed.headings.map((heading) => heading.level)).toEqual([
      1, 2, 3, 2,
    ]);
    expect(pageBody(parsed).startsWith('# Fixture Page')).toBe(true);
  });

  it('anchors every heading against the page slug', () => {
    expect(parsed.headings.map((heading) => heading.anchor)).toEqual([
      'fixture-fixture-page',
      'fixture-first-section',
      'fixture-nested-under-first',
      'fixture-second-section',
    ]);
  });
});

describe('sliceSection', () => {
  const parsed = parseMarkdown(FIXTURE, 'fixture');

  it('runs to the next heading of the same or a higher level', () => {
    const first = sliceSection(parsed, 1);
    expect(first.body).toContain('## First section');
    expect(first.body).toContain('First body.');
    // A deeper heading stays inside the section it is nested in.
    expect(first.body).toContain('### Nested under first');
    expect(first.body).not.toContain('## Second section');
  });

  it('runs to the end of the file for the last section', () => {
    const last = sliceSection(parsed, 3);
    expect(last.body).toContain('Second body.');
    expect(last.end).toBe(parsed.lines.length);
  });

  it('gives a nested section only its own body', () => {
    const nested = sliceSection(parsed, 2);
    expect(nested.body).toContain('Nested body.');
    expect(nested.body).not.toContain('Second body.');
  });
});

describe('headingPlainText', () => {
  it('drops inline markup the site strips before slugifying', () => {
    expect(headingPlainText('Pre-configuring (`deployment-config.yaml`)')).toBe(
      'Pre-configuring (deployment-config.yaml)',
    );
    expect(headingPlainText('**Bold** and *italic*')).toBe('Bold and italic');
    expect(headingPlainText('See [Sessions](#sessions)')).toBe('See Sessions');
    expect(headingPlainText('Manage user&#39;s keypairs')).toBe(
      "Manage user's keypairs",
    );
  });
});

describe('slugify', () => {
  it('matches the docs toolkit: lowercase, punctuation dropped, spaces to -', () => {
    expect(slugify("Manage user's keypairs")).toBe('manage-users-keypairs');
    expect(slugify('FAQs & Troubleshooting')).toBe('faqs-troubleshooting');
    expect(slugify('Pre-configuring (deployment-config.yaml)')).toBe(
      'pre-configuring-deployment-configyaml',
    );
  });

  it('keeps unicode letters instead of transliterating', () => {
    expect(slugify('데이터 & 폴더 활용하기')).toBe('데이터-폴더-활용하기');
    expect(slugify('스토리지 폴더 생성')).toBe('스토리지-폴더-생성');
  });
});

describe('slugFromPath', () => {
  it('keeps underscores so the slug matches the published filename', () => {
    expect(slugFromPath('admin_menu/admin_menu.md')).toBe('admin_menu');
    expect(slugFromPath('quickstart.md')).toBe('quickstart');
    expect(slugFromPath('deployment/deployment_presets.md')).toBe(
      'deployment_presets',
    );
  });
});
