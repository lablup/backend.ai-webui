import { resolveRepoContext } from '../repo-context.js';
import {
  docsLanguages,
  INDEX_LANG,
  loadDocsPage,
  loadDocsPages,
} from './docs-corpus.js';
import type { DocsPage } from './docs-corpus.js';
import { describe, expect, it } from 'vitest';

const context = resolveRepoContext(import.meta.dirname);
const languages = docsLanguages(context);
const englishPages = loadDocsPages(context, INDEX_LANG);
const cache = new Map<string, DocsPage | null>();

/**
 * Anchors read off the deployed site (https://webui.docs.backend.ai/next/…).
 * They pin the algorithm to what the published pages actually carry, including
 * the entity-decoded apostrophe and the raw Korean heading slug.
 */
const DEPLOYED_ANCHORS: Array<[string, string, string]> = [
  ['en', 'admin_menu/admin_menu.md', 'admin_menu-manage-users-keypairs'],
  ['en', 'admin_menu/admin_menu.md', 'admin_menu-manage-images'],
  ['en', 'admin_menu/admin_menu.md', 'admin_menu-browse-and-manage-users'],
  [
    'en',
    'deployment/deployment.md',
    'deployment-pre-configuring-a-deployment-deployment-configyaml',
  ],
  [
    'en',
    'trouble_shooting/trouble_shooting.md',
    'trouble_shooting-faqs-troubleshooting',
  ],
  ['ko', 'vfolder/vfolder.md', 'vfolder-데이터-폴더-활용하기'],
  ['ko', 'vfolder/vfolder.md', 'vfolder-스토리지-폴더-생성'],
  ['ko', 'vfolder/vfolder.md', 'vfolder-filebrowser-기본-사용법'],
];

describe('deployed anchor parity', () => {
  it.each(DEPLOYED_ANCHORS)(
    '%s %s carries the published anchor %s',
    (lang, relativePath, anchor) => {
      const page = loadDocsPage(context, lang, relativePath, cache);
      expect(page).not.toBeNull();
      expect(page!.parsed.headings.map((heading) => heading.anchor)).toContain(
        anchor,
      );
    },
  );
});

describe('heading structure across the four languages', () => {
  it('publishes the four manual languages', () => {
    expect(languages).toEqual(['en', 'ja', 'ko', 'th']);
    expect(englishPages.length).toBeGreaterThan(0);
  });

  it.each(languages.filter((lang) => lang !== INDEX_LANG))(
    '%s mirrors the en heading levels page for page',
    (lang) => {
      for (const page of englishPages) {
        const translated = loadDocsPage(
          context,
          lang,
          page.relativePath,
          cache,
        );
        expect(
          translated,
          `${lang}/${page.relativePath} missing`,
        ).not.toBeNull();
        expect(
          translated!.parsed.headings.map((heading) => heading.level),
          `${lang}/${page.relativePath} heading levels`,
        ).toEqual(page.parsed.headings.map((heading) => heading.level));
      }
    },
  );

  it.each(languages)(
    '%s anchors are page-slug prefixed and stay in their own script',
    (lang) => {
      for (const page of englishPages) {
        const translated = loadDocsPage(
          context,
          lang,
          page.relativePath,
          cache,
        );
        for (const heading of translated!.parsed.headings) {
          expect(heading.anchor.startsWith(`${page.slug}-`)).toBe(true);
          expect(heading.anchor).toBe(heading.anchor.toLowerCase());
          expect(heading.anchor).not.toMatch(/[\s.,'"()]/);
        }
      }
    },
  );
});
