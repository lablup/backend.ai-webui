import { resolveRepoContext } from '../repo-context.js';
import { latestDocsVersion } from './docs-config.js';
import { resolveDocsVersion } from './engine.js';
import {
  DOCS_VERSION_FALLBACK,
  DOCS_VERSION_NEXT,
  docsSectionUrl,
  docsVersionFor,
} from './urls.js';
import { describe, expect, it } from 'vitest';

describe('docsVersionFor', () => {
  it('maps a stable release to its major.minor channel', () => {
    expect(docsVersionFor('26.9.0')).toBe('26.9');
    expect(docsVersionFor('26.10.3')).toBe('26.10');
  });

  it('maps every prerelease to the next channel', () => {
    expect(docsVersionFor('26.9.0-alpha.0')).toBe(DOCS_VERSION_NEXT);
    expect(docsVersionFor('26.9.0-beta.1')).toBe(DOCS_VERSION_NEXT);
    expect(docsVersionFor('26.9.0-rc.2')).toBe(DOCS_VERSION_NEXT);
  });

  it('falls back when the version says nothing usable', () => {
    expect(docsVersionFor('')).toBe(DOCS_VERSION_FALLBACK);
    expect(docsVersionFor('unknown')).toBe(DOCS_VERSION_FALLBACK);
    expect(docsVersionFor('26')).toBe(DOCS_VERSION_FALLBACK);
  });

  it('falls back to the caller-supplied channel instead of the literal', () => {
    expect(docsVersionFor('unknown', '26.8')).toBe('26.8');
    expect(docsVersionFor('', '26.8')).toBe('26.8');
    expect(docsVersionFor('26.9.0', '26.8')).toBe('26.9');
  });
});

describe('resolveDocsVersion', () => {
  const context = resolveRepoContext(import.meta.dirname);

  it('derives the channel from the checkout', () => {
    expect(resolveDocsVersion(context)).toBe(
      docsVersionFor(context.repoVersion),
    );
  });

  it('points an unusable checkout version at the latest published label', () => {
    // `latest/<lang>/<slug>.html` does not exist on the site — only the
    // redirect stub at `latest/<lang>/index.html` — so deep links need the
    // label the config marks `latest: true`.
    const latest = latestDocsVersion(context);
    expect(latest).not.toBeNull();
    expect(latest).not.toBe(DOCS_VERSION_FALLBACK);
    for (const repoVersion of ['', 'unknown', '26']) {
      expect(resolveDocsVersion({ ...context, repoVersion })).toBe(latest);
    }
  });

  it('lets --docs-version override the derived channel', () => {
    expect(resolveDocsVersion(context, '26.8')).toBe('26.8');
    expect(resolveDocsVersion(context, 'latest')).toBe('latest');
    // An empty override is not an override.
    expect(resolveDocsVersion(context, '  ')).toBe(
      docsVersionFor(context.repoVersion),
    );
  });
});

describe('docsSectionUrl', () => {
  it('builds the deployed page and section URLs', () => {
    expect(docsSectionUrl('next', 'en', 'admin_menu')).toBe(
      'https://webui.docs.backend.ai/next/en/admin_menu.html',
    );
    expect(
      docsSectionUrl('26.8', 'ko', 'vfolder', 'vfolder-스토리지-폴더-생성'),
    ).toBe(
      'https://webui.docs.backend.ai/26.8/ko/vfolder.html#vfolder-스토리지-폴더-생성',
    );
  });
});
