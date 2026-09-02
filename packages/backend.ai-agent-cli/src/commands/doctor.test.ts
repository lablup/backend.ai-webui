import type { DocsPage } from '../search/docs-corpus.js';
import { parseMarkdown } from '../search/markdown.js';
import { headingLevelsMatch } from './doctor.js';
import { describe, expect, it } from 'vitest';

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
