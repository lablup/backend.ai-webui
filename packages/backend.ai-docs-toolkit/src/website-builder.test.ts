/**
 * Unit tests for website-builder.ts (FR-2726).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *      (which executes `tsx --test src/website-builder.test.ts`)
 *
 * Coverage:
 *   - applyImageAttributes: lazy/decoding/dimensions injection.
 *   - buildWebPage: presence of FR-2726 surfaces (topbar, brand, search
 *     trigger, lang switcher, get-help links, palette, article footer)
 *     so future phases can't silently drop them.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import {
  applyImageAttributes,
  buildWebPage,
  type WebPageContext,
  type PageAssets,
} from "./website-builder.js";
import type { ResolvedDocConfig } from "./config.js";
import type { Chapter } from "./markdown-processor.js";
import type { NavGroup } from "./book-config.js";

function makeConfig(): ResolvedDocConfig {
  const projectRoot = path.resolve("/tmp/fake-project-root");
  return {
    title: "Backend.AI WebUI User Guide",
    subtitle: "User Guide",
    company: "Lablup Inc.",
    logoPath: null,
    logoFallbackHtml: "",
    projectRoot,
    srcDir: path.join(projectRoot, "src"),
    distDir: path.join(projectRoot, "dist"),
    versionSource: "",
    version: null,
    languageLabels: {
      en: "English",
      ko: "한국어",
      ja: "日本語",
      th: "ภาษาไทย",
    },
    localizedStrings: {
      en: { userGuide: "User Guide", tableOfContents: "TOC" },
    },
    admonitionTitles: { en: { note: "NOTE" } },
    figureLabels: { en: "Figure" },
    pdfFilenameTemplate: "{title}.pdf",
    pdfMetadata: { author: "a", subject: "b", creator: "c" },
    cjkFontPaths: [],
    pathFallbacks: {},
    productName: "Backend.AI WebUI Docs",
    code: { lightTheme: "github-light" },
    branding: {
      primaryColor: "#FF7A00",
      primaryColorHover: "#FF9729",
      primaryColorActive: "#E65C00",
      primaryColorSoft: "#FFF4E5",
      logoLight: null,
      logoDark: null,
      subLabel: { en: "Manual", default: "Manual" },
    },
    website: {
      editBaseUrl: "https://github.com/owner/repo/edit/main/docs",
      repoUrl: "https://github.com/owner/repo",
    },
  } satisfies ResolvedDocConfig;
}

function makeChapter(slug = "dashboard", title = "Dashboard"): Chapter {
  return {
    slug,
    title,
    htmlContent: `<h1 id="dashboard-${slug}">${title}</h1><p>Lede paragraph.</p>`,
    headings: [
      { level: 1, text: title, id: `${slug}-${slug}` },
      { level: 2, text: "Auto-Refresh", id: `${slug}-auto-refresh` },
    ],
  } as unknown as Chapter;
}

function makeContext(): WebPageContext {
  const chapter = makeChapter();
  const navGroups: NavGroup[] = [
    {
      category: "Getting Started",
      items: [
        {
          title: "Dashboard",
          path: "dashboard/dashboard.md",
        },
      ],
    },
  ];
  const assets: PageAssets = {
    styles: "styles.abcd.css",
    search: "search.abcd.js",
    favicon: "favicon.ico",
    brandLogoLight: "brand-logo-light.abcd.svg",
    brandLogoDark: "brand-logo-dark.abcd.svg",
    // Phase 4 (FR-2726): buildWebPage requires interactions.js for the
    // Cmd-K palette + theme toggle + drawer. Including it here keeps
    // the test fixture aligned with what real builds produce.
    interactions: "interactions.abcd.js",
  };
  return {
    chapter,
    allChapters: [chapter],
    currentIndex: 0,
    metadata: {
      title: "Backend.AI WebUI User Guide",
      version: "v26.5.0",
      lang: "en",
      availableLanguages: ["en", "ko", "ja", "th"],
    },
    config: makeConfig(),
    navPath: "dashboard/dashboard.md",
    assets,
    peers: [
      { lang: "en", label: "English", href: "../en/dashboard.html", available: true },
      { lang: "ko", label: "한국어", href: "../ko/dashboard.html", available: true },
    ],
    navGroups,
    category: "Getting Started",
  };
}

describe("applyImageAttributes", () => {
  it("injects loading=lazy and decoding=async on bare <img> tags", () => {
    const html = `<img src="./images/foo.png" alt="" />`;
    const out = applyImageAttributes(html, new Map());
    assert.match(out, /loading="lazy"/);
    assert.match(out, /decoding="async"/);
  });

  it("preserves existing loading/decoding attributes", () => {
    const html = `<img src="./images/foo.png" alt="" loading="eager" decoding="sync" />`;
    const out = applyImageAttributes(html, new Map());
    assert.match(out, /loading="eager"/);
    assert.match(out, /decoding="sync"/);
    assert.doesNotMatch(out, /loading="lazy"/);
  });

  it("attaches width/height from the dimensions map when missing", () => {
    const html = `<img src="./images/foo.png" alt="" />`;
    const dims = new Map([["./images/foo.png", { width: 800, height: 600 }]]);
    const out = applyImageAttributes(html, dims);
    assert.match(out, /width="800"/);
    assert.match(out, /height="600"/);
  });
});

describe("buildWebPage — FR-2726 surfaces", () => {
  it("emits the BAI topbar with brand, sub-label, version pill", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /<header class="bai-topbar"/);
    assert.match(html, /class="bai-topbar__brand"/);
    assert.match(html, />Manual</); // sub-label
    assert.match(html, />v26\.5\.0</); // version pill
  });

  it("emits brand logo light/dark sources", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /brand-logo-light\.abcd\.svg/);
    assert.match(html, /brand-logo-dark\.abcd\.svg/);
  });

  it("emits the search input + magnifier-icon fallback in the topbar", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="bai-topbar__search"/);
    assert.match(html, /id="search-input"/);
    assert.match(html, /class="bai-iconbtn bai-topbar__searchicon"/);
  });

  it("emits the language switcher with all configured peers", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="lang-switcher"/);
    assert.match(html, />English</);
    assert.match(html, />한국어</);
  });

  it("emits the GitHub icon link only when website.repoUrl is set", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /aria-label="GitHub"/);
    assert.match(html, /https:\/\/github\.com\/owner\/repo/);

    // And NOT when repoUrl is unset.
    const ctx = makeContext();
    ctx.config = {
      ...ctx.config,
      website: { editBaseUrl: ctx.config.website?.editBaseUrl },
    };
    const html2 = buildWebPage(ctx);
    assert.doesNotMatch(html2, /aria-label="GitHub"/);
  });

  it("emits the right-rail Get help cluster with edit + GitHub links", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="doc-toc__contrib"/);
    assert.match(html, /class="doc-toc__link doc-toc__link--external"[^>]*href="[^"]*\/edit\/main\/docs\/en\/dashboard\/dashboard\.md/);
    assert.match(html, /class="doc-toc__link doc-toc__link--external"[^>]*href="https:\/\/github\.com\/owner\/repo"/);
  });

  it("emits sider category groups with item count pills", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="doc-sidebar-group__count"/);
    assert.match(html, /aria-label="1 pages">1</);
  });
});
