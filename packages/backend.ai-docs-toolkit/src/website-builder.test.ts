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
import vm from "node:vm";
import {
  applyImageAttributes,
  buildHomePage,
  buildIndexPage,
  buildLanguagePickerPage,
  buildRootRedirectIndexPage,
  buildWebPage,
  type WebPageContext,
  type PageAssets,
} from "./website-builder.js";
import type { WebsiteMetadata } from "./website-builder.js";
import { resolveLegacyDocsUrl, type ResolvedDocConfig } from "./config.js";
import { slugFromNavPath, type Chapter } from "./markdown-processor.js";
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
    legacyDocsUrl: null,
  } satisfies ResolvedDocConfig;
}

/**
 * Build a versioned-mode WebPageContext fixture with the `next` label and
 * the current page rendered under minor version `26.4`. Mirrors what the
 * generator produces when `versions:` is declared in
 * `docs-toolkit.config.yaml`.
 */
function makeVersionedContext(): WebPageContext {
  const ctx = makeContext();
  ctx.versionContext = {
    current: "26.4",
    allLabels: ["next", "26.4"],
    latest: "26.4",
    slugAvailability: { next: true, "26.4": true },
    slug: "dashboard",
    rootDepth: 3,
  };
  return ctx;
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
      {
        lang: "en",
        label: "English",
        href: "../en/dashboard.html",
        available: true,
      },
      {
        lang: "ko",
        label: "한국어",
        href: "../ko/dashboard.html",
        available: true,
      },
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

  it("emits a native-select language switcher with all peers as <option>", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="lang-switcher"/);
    assert.match(html, /class="lang-switcher__select"/);
    // Both peers must appear as <option> entries; the current language
    // option is marked `selected`.
    assert.match(
      html,
      /<option[^>]+value="\.\.\/en\/dashboard\.html"[^>]*selected[^>]*>English<\/option>/,
    );
    assert.match(
      html,
      /<option[^>]+value="\.\.\/ko\/dashboard\.html"[^>]*>한국어<\/option>/,
    );
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
    assert.match(
      html,
      /class="doc-toc__link doc-toc__link--external"[^>]*href="[^"]*\/edit\/main\/docs\/en\/dashboard\/dashboard\.md/,
    );
    assert.match(
      html,
      /class="doc-toc__link doc-toc__link--external"[^>]*href="https:\/\/github\.com\/owner\/repo"/,
    );
  });

  it("emits sider category groups with item count pills", () => {
    const html = buildWebPage(makeContext());
    assert.match(html, /class="doc-sidebar-group__count"/);
    assert.match(html, /aria-label="1 pages">1</);
  });
});

describe("buildWebPage — FR-2737 sidebar category icons are language-stable", () => {
  // Same Backend.AI WebUI category structure as the real
  // book.config.yaml (5 groups, identical paths across languages).
  // Only the labels differ. The chosen Lucide-style icon is decided
  // from the group's first-item path (`quickstart.md` →
  // `session_page/...` → `vfolder/...` → `user_settings/...` →
  // `trouble_shooting/...`), so every language MUST emit the SAME
  // sequence of <svg> path payloads in the sidebar headers.
  const navGroupsByLang: Record<string, NavGroup[]> = {
    en: [
      {
        category: "Getting Started",
        items: [{ title: "Quickstart", path: "quickstart.md" }],
      },
      {
        category: "Workloads",
        items: [
          {
            title: "Session Page",
            path: "session_page/session_page.md",
          },
        ],
      },
      {
        category: "Storage & Data",
        items: [{ title: "Vfolder", path: "vfolder/vfolder.md" }],
      },
      {
        category: "Administration",
        items: [
          {
            title: "User Settings",
            path: "user_settings/user_settings.md",
          },
        ],
      },
      {
        category: "Reference",
        items: [
          {
            title: "Trouble Shooting",
            path: "trouble_shooting/trouble_shooting.md",
          },
        ],
      },
    ],
    ko: [
      {
        category: "시작하기",
        items: [{ title: "빠른 시작", path: "quickstart.md" }],
      },
      {
        category: "워크로드",
        items: [
          {
            title: "세션 페이지",
            path: "session_page/session_page.md",
          },
        ],
      },
      {
        category: "스토리지 및 데이터",
        items: [{ title: "스토리지 폴더", path: "vfolder/vfolder.md" }],
      },
      {
        category: "관리",
        items: [
          {
            title: "사용자 설정",
            path: "user_settings/user_settings.md",
          },
        ],
      },
      {
        category: "참고 자료",
        items: [
          {
            title: "FAQ 및 문제 해결",
            path: "trouble_shooting/trouble_shooting.md",
          },
        ],
      },
    ],
    ja: [
      {
        category: "はじめに",
        items: [{ title: "クイックスタート", path: "quickstart.md" }],
      },
      {
        category: "ワークロード",
        items: [
          {
            title: "セッションページ",
            path: "session_page/session_page.md",
          },
        ],
      },
      {
        category: "ストレージとデータ",
        items: [
          {
            title: "ストレージフォルダ",
            path: "vfolder/vfolder.md",
          },
        ],
      },
      {
        category: "管理",
        items: [
          {
            title: "ユーザー設定",
            path: "user_settings/user_settings.md",
          },
        ],
      },
      {
        category: "リファレンス",
        items: [
          {
            title: "FAQ＆トラブルシューティング",
            path: "trouble_shooting/trouble_shooting.md",
          },
        ],
      },
    ],
    th: [
      {
        category: "เริ่มต้นใช้งาน",
        items: [
          {
            title: "เริ่มต้นอย่างรวดเร็ว",
            path: "quickstart.md",
          },
        ],
      },
      {
        category: "เวิร์กโหลด",
        items: [
          {
            title: "หน้าเซสชัน",
            path: "session_page/session_page.md",
          },
        ],
      },
      {
        category: "พื้นที่จัดเก็บและข้อมูล",
        items: [
          {
            title: "โฟลเดอร์จัดเก็บ",
            path: "vfolder/vfolder.md",
          },
        ],
      },
      {
        category: "การดูแลระบบ",
        items: [
          {
            title: "ตั้งค่าผู้ใช้",
            path: "user_settings/user_settings.md",
          },
        ],
      },
      {
        category: "เอกสารอ้างอิง",
        items: [
          {
            title: "FAQ และการแก้ไขปัญหา",
            path: "trouble_shooting/trouble_shooting.md",
          },
        ],
      },
    ],
  };

  /**
   * Capture the sequence of `<svg>` icon HTML emitted inside each
   * `.doc-sidebar-group__icon` span, in document order.
   */
  function extractIconSequence(html: string): string[] {
    const re = /class="doc-sidebar-group__icon"[^>]*>(<svg[^]*?<\/svg>)/g;
    return [...html.matchAll(re)].map((m) => m[1]);
  }

  function makeCtxForLang(lang: string, navGroups: NavGroup[]): WebPageContext {
    // Reuse the standard fixture but swap the lang and navGroups so
    // the sidebar renders the localized labels with the same paths.
    // The active page (`dashboard`) doesn't appear in any of these
    // groups, so no group auto-expands — that's fine for the icon
    // assertion.
    const ctx = makeContext();
    ctx.metadata = { ...ctx.metadata, lang };
    ctx.navGroups = navGroups;
    return ctx;
  }

  it("emits the same icon sequence in every language", () => {
    const sequences = Object.entries(navGroupsByLang).map(([lang, groups]) =>
      extractIconSequence(buildWebPage(makeCtxForLang(lang, groups))),
    );
    // Sanity: 5 categories ⇒ 5 icons per language.
    for (const seq of sequences) assert.equal(seq.length, 5);
    // The English sequence is the reference. Every other language
    // must emit the byte-identical sequence of <svg> bodies.
    const [reference, ...others] = sequences;
    for (const other of others) {
      assert.deepStrictEqual(other, reference);
    }
  });

  it("does NOT fall back to the generic stack icon for any localized language", () => {
    // The stack icon's distinctive d= signature (used by the legacy
    // fallback). With FR-2737 in place none of the localized
    // category headers should resort to it.
    const stackSig = "m12 3 9 5-9 5-9-5 9-5";
    for (const [lang, groups] of Object.entries(navGroupsByLang)) {
      if (lang === "en") continue; // the English path also won't hit fallback; skip for symmetry
      const html = buildWebPage(makeCtxForLang(lang, groups));
      const icons = extractIconSequence(html);
      for (const svg of icons) {
        assert.equal(
          svg.includes(stackSig),
          false,
          `lang=${lang}: localized category icon fell back to ICON_STACK`,
        );
      }
    }
  });
});

describe("buildWebPage — FR-2733 sidebar version block placement", () => {
  it("renders the version <select> inside .doc-sidebar-version, before the nav groups", () => {
    const html = buildWebPage(makeVersionedContext());
    assert.match(html, /id="version-switcher"/);
    assert.match(html, /class="doc-sidebar-version"/);
    // The wrapper is INSIDE the .doc-sidebar aside.
    const sidebarMatch = html.match(
      /<aside class="doc-sidebar">[\s\S]*?<\/aside>/,
    );
    assert.ok(sidebarMatch, ".doc-sidebar aside not found");
    const sidebarHtml = sidebarMatch[0];
    assert.match(sidebarHtml, /class="doc-sidebar-version"/);
    assert.match(sidebarHtml, /id="version-switcher"/);
    // It precedes the .doc-sidebar-groups <nav> inside the aside.
    const versionIdx = sidebarHtml.indexOf("doc-sidebar-version");
    const navIdx = sidebarHtml.indexOf("doc-sidebar-groups");
    assert.ok(
      versionIdx >= 0 && navIdx > versionIdx,
      ".doc-sidebar-version must appear before .doc-sidebar-groups inside the aside",
    );
  });

  it("emits a localized uppercase VERSION label inside the sidebar block", () => {
    // English fixture renders "Version" (the uppercase styling is CSS,
    // not content — the source label stays as 'Version').
    const enHtml = buildWebPage(makeVersionedContext());
    assert.match(
      enHtml,
      /<span class="doc-sidebar-version__label">Version<\/span>/,
    );

    // Korean variant.
    const koCtx = makeVersionedContext();
    koCtx.metadata = { ...koCtx.metadata, lang: "ko" };
    const koHtml = buildWebPage(koCtx);
    assert.match(
      koHtml,
      /<span class="doc-sidebar-version__label">버전<\/span>/,
    );

    // Japanese variant.
    const jaCtx = makeVersionedContext();
    jaCtx.metadata = { ...jaCtx.metadata, lang: "ja" };
    const jaHtml = buildWebPage(jaCtx);
    assert.match(
      jaHtml,
      /<span class="doc-sidebar-version__label">バージョン<\/span>/,
    );

    // Thai variant.
    const thCtx = makeVersionedContext();
    thCtx.metadata = { ...thCtx.metadata, lang: "th" };
    const thHtml = buildWebPage(thCtx);
    assert.match(
      thHtml,
      /<span class="doc-sidebar-version__label">เวอร์ชัน<\/span>/,
    );
  });

  it("does NOT render the version <select> inside the BAI topbar", () => {
    const html = buildWebPage(makeVersionedContext());
    // The topbar is from <header class="bai-topbar"> to its closing </header>.
    const topbarMatch = html.match(
      /<header class="bai-topbar"[\s\S]*?<\/header>/,
    );
    assert.ok(topbarMatch, ".bai-topbar header not found");
    const topbarHtml = topbarMatch[0];
    assert.doesNotMatch(topbarHtml, /id="version-switcher"/);
    assert.doesNotMatch(topbarHtml, /class="version-switcher"/);
  });

  it("drops the legacy `<label class='version-switcher-label'>` markup", () => {
    const html = buildWebPage(makeVersionedContext());
    // The new uppercase .doc-sidebar-version__label replaces the old
    // inline label. The old class must not appear anywhere.
    assert.doesNotMatch(html, /class="version-switcher-label"/);
  });

  it("renders no .doc-sidebar-version block in non-versioned builds", () => {
    const ctx = makeContext();
    // Non-versioned: versionContext is undefined.
    assert.equal(ctx.versionContext, undefined);
    const html = buildWebPage(ctx);
    assert.doesNotMatch(html, /class="doc-sidebar-version"/);
    assert.doesNotMatch(html, /id="version-switcher"/);
  });
});

describe("buildWebPage / buildHomePage — FR-2758 sidebar 'Introduction' entry", () => {
  it("renders an Introduction anchor at the top of the sidebar linking to ./index.html", () => {
    const html = buildWebPage(makeContext());

    const sidebarMatch = html.match(/<aside class="doc-sidebar">[\s\S]*?<\/aside>/);
    assert.ok(sidebarMatch, ".doc-sidebar aside not found");
    const sidebarHtml = sidebarMatch[0];

    // Anchor exists and points to the per-language home page.
    assert.match(
      sidebarHtml,
      /<a class="doc-sidebar-intro[^"]*"[^>]*href="\.\/index\.html"/,
    );

    // Appears before the nav groups so the user always has a one-click
    // path back to the welcome screen at the very top of navigation.
    const introIdx = sidebarHtml.indexOf("doc-sidebar-intro");
    const groupsIdx = sidebarHtml.indexOf("doc-sidebar-groups");
    assert.ok(
      introIdx >= 0 && groupsIdx > introIdx,
      ".doc-sidebar-intro must appear before .doc-sidebar-groups inside the aside",
    );
  });

  it("does NOT mark the Introduction entry active on a chapter page", () => {
    // makeContext() positions the user on a real chapter (currentIndex !== -1),
    // so the synthetic home entry must stay inactive.
    const html = buildWebPage(makeContext());
    assert.match(html, /<a class="doc-sidebar-intro" href="\.\/index\.html"/);
    assert.doesNotMatch(html, /class="doc-sidebar-intro active"/);
    // No aria-current on a non-home chapter page.
    assert.doesNotMatch(
      html,
      /<a class="doc-sidebar-intro[^"]*"[^>]*aria-current="page"/,
    );
  });

  it("marks the Introduction entry active + aria-current on the home page", () => {
    const ctx = makeContext();
    const html = buildHomePage({
      metadata: ctx.metadata,
      config: ctx.config,
      navGroups: ctx.navGroups,
      allChapters: ctx.allChapters,
      assets: ctx.assets,
      peers: ctx.peers,
      seo: ctx.seo,
    });

    // Active class + aria-current=page so screen readers and styles both
    // mark the intro as the user's current location.
    assert.match(
      html,
      /<a class="doc-sidebar-intro active"[^>]*aria-current="page"[^>]*href="\.\/index\.html"/,
    );
  });

  it("uses the localized sidebarIntroduction label per language", () => {
    // English fallback.
    const enHtml = buildWebPage(makeContext());
    assert.match(
      enHtml,
      /<span class="doc-sidebar-intro__label">Introduction<\/span>/,
    );

    const koCtx = makeContext();
    koCtx.metadata = { ...koCtx.metadata, lang: "ko" };
    const koHtml = buildWebPage(koCtx);
    assert.match(
      koHtml,
      /<span class="doc-sidebar-intro__label">소개<\/span>/,
    );

    const jaCtx = makeContext();
    jaCtx.metadata = { ...jaCtx.metadata, lang: "ja" };
    const jaHtml = buildWebPage(jaCtx);
    assert.match(
      jaHtml,
      /<span class="doc-sidebar-intro__label">はじめに<\/span>/,
    );

    const thCtx = makeContext();
    thCtx.metadata = { ...thCtx.metadata, lang: "th" };
    const thHtml = buildWebPage(thCtx);
    assert.match(
      thHtml,
      /<span class="doc-sidebar-intro__label">บทนำ<\/span>/,
    );
  });
});

describe("buildWebPage — FR-2733 'Previous versions' selector entry", () => {
  it("renders a 'Previous versions' option at the bottom when legacyDocsUrl is set", () => {
    const ctx = makeVersionedContext();
    ctx.config = {
      ...ctx.config,
      legacyDocsUrl: "https://example.test/legacy",
    };
    const html = buildWebPage(ctx);

    // The version <select> exists.
    assert.match(html, /id="version-switcher"/);
    // The "Previous versions" option is present and uses the sentinel value.
    // Fixture lang is `en`, so the WEBSITE_LABELS.en.previousVersions copy
    // ("Previous versions") is what's rendered. The position assertion
    // below relies on the sentinel `__legacy__` so it stays locale-agnostic.
    assert.match(
      html,
      /<option value="__legacy__">Previous versions<\/option>/,
    );
    // It is the LAST option inside the version selector — i.e. it appears
    // after every declared version label.
    const selectMatch = html.match(
      /<select[^>]*id="version-switcher"[\s\S]*?<\/select>/,
    );
    assert.ok(selectMatch, "version-switcher <select> not found");
    const selectHtml = selectMatch[0];
    const lastOptionIndex = selectHtml.lastIndexOf("<option");
    const legacyOptionIndex = selectHtml.indexOf('value="__legacy__"');
    assert.equal(
      lastOptionIndex,
      selectHtml.lastIndexOf("<option", legacyOptionIndex),
      "'Previous versions' option must be the last <option> in the dropdown",
    );

    // The legacy URL is exposed via a data attribute the inline handler reads.
    assert.match(html, /data-legacy-url="https:\/\/example\.test\/legacy"/);
    // The inline handler opens it in a new tab with the correct rel keywords.
    assert.match(
      html,
      /window\.open\(legacy, '_blank', 'noopener,noreferrer'\)/,
    );
  });

  it("hides the entry entirely when legacyDocsUrl is unset", () => {
    const ctx = makeVersionedContext();
    // legacyDocsUrl already null in fixture; assert behaviour explicitly.
    assert.equal(ctx.config.legacyDocsUrl, null);
    const html = buildWebPage(ctx);

    // The version <select> still renders normally.
    assert.match(html, /id="version-switcher"/);
    // No "Previous versions" entry.
    assert.doesNotMatch(html, /Previous versions/);
    assert.doesNotMatch(html, /value="__legacy__"/);
    // No data-legacy-url attribute.
    assert.doesNotMatch(html, /data-legacy-url/);
    // No empty option, no separator — declared version labels are the
    // only options inside the <select>.
    const selectMatch = html.match(
      /<select[^>]*id="version-switcher"[\s\S]*?<\/select>/,
    );
    assert.ok(selectMatch, "version-switcher <select> not found");
    const optionCount = (selectMatch[0].match(/<option\b/g) ?? []).length;
    assert.equal(
      optionCount,
      2,
      "selector should have exactly the two declared version options",
    );
  });

  it("treats an empty-string legacyDocsUrl the same as unset (rendered identical to baseline)", () => {
    const baseCtx = makeVersionedContext();
    const baseHtml = buildWebPage(baseCtx);

    const emptyCtx = makeVersionedContext();
    // Pipe an empty-string raw value through the actual resolver so this
    // test exercises the empty → null normalization path end-to-end
    // (rather than tautologically pre-setting the resolved field to null).
    const resolvedFromEmpty = resolveLegacyDocsUrl("");
    emptyCtx.config = {
      ...emptyCtx.config,
      legacyDocsUrl: resolvedFromEmpty,
    };
    const emptyHtml = buildWebPage(emptyCtx);

    assert.equal(baseHtml, emptyHtml);
  });
});

/**
 * Build a versioned-mode WebPageContext fixture where the current minor
 * is an OLDER release (`25.16`) and `26.4` is the latest. Mirrors the
 * `outdated` banner variant scenario.
 */
function makeOutdatedVersionedContext(): WebPageContext {
  const ctx = makeContext();
  ctx.versionContext = {
    current: "25.16",
    allLabels: ["next", "26.4", "25.16"],
    latest: "26.4",
    slugAvailability: { next: true, "26.4": true, "25.16": true },
    slug: "dashboard",
    rootDepth: 3,
  };
  return ctx;
}

/**
 * Build a versioned-mode WebPageContext fixture where the current page
 * is rendered under the `next` (unreleased preview) channel. Mirrors the
 * `preview` banner variant scenario.
 */
function makePreviewVersionedContext(): WebPageContext {
  const ctx = makeContext();
  ctx.versionContext = {
    current: "next",
    allLabels: ["next", "26.4"],
    latest: "26.4",
    slugAvailability: { next: true, "26.4": true },
    slug: "dashboard",
    rootDepth: 3,
  };
  return ctx;
}

describe("buildWebPage — FR-2733 version-banner variants", () => {
  it("renders the preview variant on the `next` channel with the verbatim user copy", () => {
    const html = buildWebPage(makePreviewVersionedContext());

    // Backward-compat dismiss class is still on the banner.
    assert.match(html, /class="docs-banner docs-banner--view-latest[^"]*"/);
    // Preview variant modifier present.
    assert.match(html, /docs-banner--preview/);
    // Outdated variant modifier NOT present on a preview page.
    assert.doesNotMatch(html, /docs-banner--outdated/);

    // Verbatim user-specified preview title (English fixture).
    assert.match(
      html,
      /<span class="docs-banner__title">This is unreleased documentation for WebUI Next version\.<\/span>/,
    );
    // Body uses the latest-version anchor with the localized label.
    assert.match(
      html,
      /<a class="docs-banner__link" href="[^"]+">latest version \(26\.4\)<\/a>/,
    );
    // Triangle warn icon (preview) — same warning glyph as outdated, just
    // tinted with BAI primary instead of yellow. Match the distinctive
    // triangle path.
    assert.match(html, /M12 3 2 21h20L12 3Z/);
    // FR-2758: the banner is now non-dismissible — the dismiss button must
    // not appear in the rendered markup. The reader should not be able to
    // silence a notice that affects every page they visit.
    assert.doesNotMatch(html, /class="docs-banner__dismiss"/);
  });

  it("renders the outdated variant on an older release minor with {version} substituted", () => {
    const html = buildWebPage(makeOutdatedVersionedContext());

    // Backward-compat dismiss class is still on the banner.
    assert.match(html, /class="docs-banner docs-banner--view-latest[^"]*"/);
    // Outdated variant modifier present.
    assert.match(html, /docs-banner--outdated/);
    // Preview variant modifier NOT present on an older release page.
    assert.doesNotMatch(html, /docs-banner--preview/);

    // Title interpolates the current minor.
    assert.match(
      html,
      /<span class="docs-banner__title">You are viewing an older version \(25\.16\)\.<\/span>/,
    );
    // Body wraps the latest-version anchor between the localized prose
    // ("For up-to-date documentation, see the …").
    assert.match(
      html,
      /For up-to-date documentation, see the <a class="docs-banner__link" href="[^"]+">latest version \(26\.4\)<\/a>\./,
    );
    // Triangle-alert icon (outdated) — match the distinctive first path.
    assert.match(html, /m21\.73 18-8-14a2 2 0 0 0-3\.48 0/);
  });

  it("renders no banner when the current page IS the latest version", () => {
    // The default versioned fixture has current === latest === "26.4".
    const html = buildWebPage(makeVersionedContext());
    assert.doesNotMatch(html, /class="docs-banner/);
  });
});

// ── FR-2732: per-version PDF download card on landing page ────────────
//
// Two output shapes for `<version>/<lang>/index.html`:
//   1. No `pdfTag` → byte-equivalent legacy meta-refresh stub.
//   2. `pdfTag` set → richer landing with the deterministic PDF anchor.
//
// The landing page is the ONLY surface that renders the card. Inner
// chapter pages (rendered via `buildWebPage`) MUST NOT contain the
// card — verified by an additional negative assertion below.

function makeIndexMetadata(lang: string): WebsiteMetadata {
  return {
    title: "Backend.AI WebUI User Guide",
    version: "v26.4.7",
    lang,
    availableLanguages: ["en", "ko", "ja", "th"],
  };
}

const indexChapters = [
  {
    slug: "dashboard",
    title: "Dashboard",
    htmlContent: "<p>...</p>",
    headings: [],
  } as unknown as import("./markdown-processor.js").Chapter,
];

describe("buildIndexPage — FR-2732 PDF download card", () => {
  it("emits the byte-equivalent legacy redirect stub when pdfTag is unset", () => {
    const html = buildIndexPage(indexChapters, makeIndexMetadata("en"));
    // Redirect stub MUST stay byte-equivalent to the pre-FR-2732
    // baseline so versions like `next` keep an identical output.
    assert.match(
      html,
      /<meta http-equiv="refresh" content="0; url=\.\/dashboard\.html"/,
    );
    // No PDF surfaces of any kind.
    assert.doesNotMatch(html, /releases\/download/);
    assert.doesNotMatch(html, /Download PDF/);
    assert.doesNotMatch(html, /pdf-download-card/);
    assert.doesNotMatch(html, /pdfTag/i);
  });

  it("emits the same redirect stub for `next`-style versions (no pdfTag)", () => {
    // Spec acceptance: `/next/<lang>/index.html` contains no occurrence
    // of `releases/download`, no "Download PDF" string, no localized
    // card label in any of the four shipped languages.
    for (const lang of ["en", "ko", "ja", "th"]) {
      const html = buildIndexPage(indexChapters, makeIndexMetadata(lang));
      assert.doesNotMatch(html, /releases\/download/, `lang=${lang}`);
      assert.doesNotMatch(html, /Download PDF/, `lang=${lang}`);
      assert.doesNotMatch(html, /PDF 다운로드/, `lang=${lang}`);
      assert.doesNotMatch(html, /PDFダウンロード/, `lang=${lang}`);
      assert.doesNotMatch(html, /ดาวน์โหลด PDF/, `lang=${lang}`);
    }
  });

  it("emits the deterministic GitHub Release URL for each language when pdfTag is set", () => {
    // The href shape MUST exactly equal the spec — string match,
    // no regex slop. Any deviation (different filename, missing
    // patch component, query string) would 404 against the GitHub
    // Releases CDN.
    const cases: Array<{ lang: string; expected: string }> = [
      {
        lang: "en",
        expected:
          "https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_en.pdf",
      },
      {
        lang: "ko",
        expected:
          "https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_ko.pdf",
      },
      {
        lang: "ja",
        expected:
          "https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_ja.pdf",
      },
      {
        lang: "th",
        expected:
          "https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_th.pdf",
      },
    ];
    for (const { lang, expected } of cases) {
      const html = buildIndexPage(indexChapters, makeIndexMetadata(lang), {
        pdfTag: "v26.4.7",
      });
      // String-match the full href to catch any future template drift.
      assert.ok(
        html.includes(`href="${expected}"`),
        `expected href="${expected}" in ${lang} landing, got:\n${html}`,
      );
      // The `download` attribute is present so single-click downloads
      // get the canonical filename even if a future GitHub change
      // drops `Content-Disposition: attachment`.
      assert.ok(
        html.includes(
          `download="Backend.AI_WebUI_User_Guide_v26.4.7_${lang}.pdf"`,
        ),
        `expected download attr in ${lang} landing`,
      );
      // No `target="_blank"` on the download link — direct download
      // is intentional per the spec.
      assert.doesNotMatch(html, /target="_blank"/);
    }
  });

  it("renders the localized 'Download PDF (this version)' label per language", () => {
    const cases: Array<{ lang: string; label: string }> = [
      { lang: "en", label: "Download PDF (this version)" },
      { lang: "ko", label: "PDF 다운로드 (이 버전)" },
      { lang: "ja", label: "PDFダウンロード（このバージョン）" },
      { lang: "th", label: "ดาวน์โหลด PDF (เวอร์ชันนี้)" },
    ];
    for (const { lang, label } of cases) {
      const html = buildIndexPage(indexChapters, makeIndexMetadata(lang), {
        pdfTag: "v26.4.7",
      });
      assert.ok(
        html.includes(label),
        `expected label "${label}" in ${lang} landing`,
      );
    }
  });

  it("drops the meta-refresh when the PDF card is rendered", () => {
    // When the card is shown the user needs time to click it; an
    // immediate redirect would defeat the entire purpose.
    const html = buildIndexPage(indexChapters, makeIndexMetadata("en"), {
      pdfTag: "v26.4.7",
    });
    assert.doesNotMatch(html, /<meta http-equiv="refresh"/);
    // But the manual "continue" link to the first chapter MUST still
    // be present — users without a PDF need an escape hatch.
    assert.match(html, /href="\.\/dashboard\.html"/);
  });

  it("does NOT render the card on inner chapter pages (buildWebPage)", () => {
    // The card is landing-only. Inner pages are produced by
    // buildWebPage and must remain card-free regardless of the
    // version's pdfTag — the card targets the user who *just* arrived
    // at the version's home, not a reader deep in chapter content.
    const html = buildWebPage(makeContext());
    assert.doesNotMatch(html, /class="pdf-download-card"/);
    assert.doesNotMatch(html, /releases\/download\/v\d+\.\d+\.\d+\//);
    // Iterate every shipped localized label so a future translation
    // drift can't silently leak the card into inner pages.
    for (const label of [
      "Download PDF (this version)",
      "PDF 다운로드 (이 버전)",
      "PDFダウンロード（このバージョン）",
      "ดาวน์โหลด PDF (เวอร์ชันนี้)",
    ]) {
      assert.ok(
        !html.includes(label),
        `inner page must not contain "${label}"`,
      );
    }
  });
});

describe("slugFromNavPath — FR-2737 language-stable slugs", () => {
  it("derives the slug from the basename, lowercased", () => {
    assert.equal(slugFromNavPath("quickstart.md"), "quickstart");
    assert.equal(slugFromNavPath("Quickstart.md"), "quickstart");
  });

  it("uses only the leaf segment of nested paths", () => {
    assert.equal(
      slugFromNavPath("model_serving/model_serving.md"),
      "model_serving",
    );
    assert.equal(slugFromNavPath("a/b/c/dashboard.md"), "dashboard");
  });

  it("preserves underscores so on-disk filenames survive into URLs", () => {
    assert.equal(slugFromNavPath("admin_menu/admin_menu.md"), "admin_menu");
    assert.equal(
      slugFromNavPath("trouble_shooting/trouble_shooting.md"),
      "trouble_shooting",
    );
  });

  it("produces a deterministic, language-independent slug from the path", () => {
    // The path is identical across languages; only the localized title
    // differs in book.config.yaml. The slug must therefore depend
    // *only* on the path — that is the whole point of FR-2737. The
    // earlier `assert.equal(f(p), f(p))` shape was a tautology that
    // could never fail; assert against a known expected value instead
    // so a regression to title-derived slugs would be caught.
    assert.equal(
      slugFromNavPath("model_serving/model_serving.md"),
      "model_serving",
    );
    // And for completeness, also verify the call is idempotent
    // (same input → same output every time, no hidden state).
    const first = slugFromNavPath("session_page/session_page.md");
    const second = slugFromNavPath("session_page/session_page.md");
    assert.equal(first, "session_page");
    assert.equal(second, first);
  });

  it("collapses runs of disallowed characters into a single dash", () => {
    // The single-pass sanitizer must collapse `foo  bar.md` into
    // `foo-bar`, not `foo--bar`. Guards against quantifier drift in
    // the linear-time replacement loop.
    assert.equal(slugFromNavPath("foo  bar.md"), "foo-bar");
    assert.equal(slugFromNavPath("foo!!!bar.md"), "foo-bar");
  });

  it("trims trailing dash / underscore boundary characters", () => {
    assert.equal(slugFromNavPath("foo--.md"), "foo");
    assert.equal(slugFromNavPath("foo__.md"), "foo");
  });

  it("throws when the path basename has no allowlisted characters", () => {
    // Earlier code returned the raw basename here, which could leak
    // unsafe characters (spaces, non-ASCII) into the URL. The
    // post-feedback contract is to refuse the input and surface a
    // config-error instead, so the operator fixes book.config.yaml
    // before the build emits a broken slug.
    assert.throws(() => slugFromNavPath("   .md"), /Cannot derive a slug/);
    assert.throws(() => slugFromNavPath("***.md"), /Cannot derive a slug/);
  });
});

describe("buildHomePage — FR-2737 home page", () => {
  function makeHomeContext() {
    const config = makeConfig();
    const navGroups: NavGroup[] = [
      {
        category: "Getting Started",
        items: [
          { title: "Quickstart", path: "quickstart.md" },
          { title: "Overview", path: "overview/overview.md" },
        ],
      },
      {
        category: "Workloads",
        items: [
          {
            title: "Session Page",
            path: "session_page/session_page.md",
          },
        ],
      },
    ];
    const allChapters: Chapter[] = [
      {
        title: "Quickstart",
        slug: "quickstart",
        htmlContent: "<p>start</p>",
        headings: [],
      },
      {
        title: "Overview",
        slug: "overview",
        htmlContent: "<p>overview</p>",
        headings: [],
      },
      {
        title: "Session Page",
        slug: "session_page",
        htmlContent: "<p>session</p>",
        headings: [],
      },
    ];
    const assets: PageAssets = {
      styles: "styles.abcd.css",
      search: "search.abcd.js",
      favicon: "favicon.ico",
      brandLogoLight: "brand-logo-light.abcd.svg",
      brandLogoDark: "brand-logo-dark.abcd.svg",
      interactions: "interactions.abcd.js",
    };
    return {
      metadata: {
        title: "Backend.AI WebUI User Guide",
        version: "v26.5.0",
        lang: "ko",
        availableLanguages: ["en", "ko", "ja", "th"],
      },
      config,
      navGroups,
      allChapters,
      assets,
      peers: [
        {
          lang: "en",
          label: "English",
          href: "../en/index.html",
          available: true,
        },
        {
          lang: "ko",
          label: "한국어",
          href: "../ko/index.html",
          available: true,
        },
        {
          lang: "ja",
          label: "日本語",
          href: "../ja/index.html",
          available: true,
        },
        {
          lang: "th",
          label: "ภาษาไทย",
          href: "../th/index.html",
          available: true,
        },
      ],
    };
  }

  it("emits hero, intro sections, and a category-card grid", () => {
    const html = buildHomePage(makeHomeContext());
    assert.match(html, /class="home-hero"/);
    assert.match(html, /class="home-hero__title"/);
    assert.match(html, /home-section--intro/);
    assert.match(html, /class="home-browse__grid"/);
    // Two non-empty categories ⇒ two cards.
    const cardMatches = html.match(/class="home-card"/g) ?? [];
    assert.equal(cardMatches.length, 2);
  });

  it("points each category card at the first chapter inside that group", () => {
    const html = buildHomePage(makeHomeContext());
    // Getting Started → quickstart.md → quickstart.html
    assert.match(html, /<a class="home-card" href="\.\/quickstart\.html">/);
    // Workloads → session_page/session_page.md → session_page.html
    assert.match(html, /<a class="home-card" href="\.\/session_page\.html">/);
  });

  it("uses localized strings for the current language", () => {
    const html = buildHomePage(makeHomeContext());
    // Korean fixture above ⇒ Korean welcome line.
    assert.match(
      html,
      /Backend\.AI WebUI 사용자 매뉴얼에 오신 것을 환영합니다/,
    );
    // The hint copy mentions "빠른 시작" (the Korean Quickstart label).
    assert.match(html, /빠른 시작/);
  });

  it("links the primary CTA at the first chapter slug", () => {
    const html = buildHomePage(makeHomeContext());
    assert.match(
      html,
      /<a class="home-cta home-cta--primary" href="\.\/quickstart\.html">/,
    );
  });

  it("reuses the topbar (logo, search, lang switcher) and the sidebar", () => {
    const html = buildHomePage(makeHomeContext());
    assert.match(html, /<header class="bai-topbar"/);
    assert.match(html, /class="bai-topbar__brand"[^>]*href="\.\/index\.html"/);
    assert.match(html, /class="lang-switcher__icon"/); // FR-2737 icon
    assert.match(html, /class="doc-sidebar"/);
  });

  it("does NOT emit a breadcrumb (the home page IS the home destination)", () => {
    const html = buildHomePage(makeHomeContext());
    assert.doesNotMatch(html, /class="breadcrumb"/);
  });

  it("does NOT emit pagination (no prev/next on the home page)", () => {
    const html = buildHomePage(makeHomeContext());
    assert.doesNotMatch(html, /class="pagination-nav"/);
  });

  it("renders a GitHub CTA only when website.repoUrl is set", () => {
    const html = buildHomePage(makeHomeContext());
    assert.match(html, /class="home-cta home-cta--secondary"/);

    const ctxNoRepo = makeHomeContext();
    ctxNoRepo.config = {
      ...ctxNoRepo.config,
      website: { editBaseUrl: ctxNoRepo.config.website?.editBaseUrl },
    };
    const html2 = buildHomePage(ctxNoRepo);
    assert.doesNotMatch(html2, /class="home-cta home-cta--secondary"/);
  });
});

describe("buildRootRedirectIndexPage — FR-2753 root redirect index", () => {
  const baseLanguages = [
    { lang: "en", label: "English" },
    { lang: "ko", label: "한국어" },
    { lang: "ja", label: "日本語" },
    { lang: "th", label: "ภาษาไทย" },
  ];

  /**
   * Run the inline redirect script under a stubbed DOM and return the
   * argument passed to `location.replace` (or `null` if the script
   * bailed out). This is what the script actually does at runtime, so
   * tests written against this helper survive harmless source-shape
   * refactors of the embedded script body.
   */
  function runRedirectScript(args: {
    html: string;
    pathname: string;
    storedLang?: string;
    navigatorLanguages?: string[];
  }): string | null {
    // Case-insensitive match: although our builder only emits lowercase
    // <script> tags, CodeQL flags any HTML-stripping regex that doesn't
    // tolerate uppercase variants. Adding the `i` flag is correct in
    // general and silences the analyzer at zero behavioral cost.
    const m = args.html.match(/<script>([\s\S]*?)<\/script>/i);
    if (!m) throw new Error("redirect script not found in head");
    let replaceTarget: string | null = null;
    const stored = args.storedLang ?? null;
    const sandbox: Record<string, unknown> = {
      window: {
        localStorage: {
          getItem: (k: string) => (k === "lang" ? stored : null),
        },
        location: {
          pathname: args.pathname,
          replace: (target: string) => {
            replaceTarget = target;
          },
        },
      },
      navigator: {
        languages: args.navigatorLanguages ?? [],
        language: args.navigatorLanguages?.[0],
      },
      Object,
      String,
    };
    // Mirror window.* onto the global so the script's bare references
    // (window.localStorage / window.location) and bare references
    // (navigator) all resolve.
    (sandbox as { window: { location: unknown } }).window;
    Object.assign(sandbox, {
      localStorage: (sandbox.window as { localStorage: unknown }).localStorage,
      location: (sandbox.window as { location: unknown }).location,
    });
    vm.runInNewContext(m[1], sandbox, { timeout: 100 });
    return replaceTarget;
  }

  it("emits relative `./<lang>/index.html` hrefs in flat mode (no version prefix)", () => {
    const html = buildRootRedirectIndexPage({
      title: "Backend.AI WebUI User Guide",
      productName: "Backend.AI WebUI",
      languages: baseLanguages,
      fallback: "en",
    });
    assert.match(html, /href="\.\/en\/index\.html"/);
    assert.match(html, /href="\.\/ko\/index\.html"/);
    assert.match(html, /href="\.\/ja\/index\.html"/);
    assert.match(html, /href="\.\/th\/index\.html"/);
    // No version segment must leak into the redirect script's prefix.
    assert.match(html, /var VERSION_PREFIX="";/);
  });

  it("emits version-prefixed `./<latestVersion>/<lang>/index.html` hrefs in versioned mode (FR-2753)", () => {
    const html = buildRootRedirectIndexPage({
      title: "Backend.AI WebUI User Guide",
      productName: "Backend.AI WebUI",
      languages: baseLanguages,
      fallback: "en",
      latestVersion: "26.4",
    });
    assert.match(html, /href="\.\/26\.4\/en\/index\.html"/);
    assert.match(html, /href="\.\/26\.4\/ko\/index\.html"/);
    assert.match(html, /href="\.\/26\.4\/ja\/index\.html"/);
    assert.match(html, /href="\.\/26\.4\/th\/index\.html"/);
    // VERSION_PREFIX gets baked into the redirect script so
    // location.replace builds `./26.4/<picked>/index.html` at runtime.
    assert.match(html, /var VERSION_PREFIX="26\.4\/";/);
    // Flat-mode hrefs MUST NOT appear — that was the FR-2753 prod bug.
    assert.doesNotMatch(html, /href="\.\/en\/index\.html"/);
  });

  it("places the redirect script in <head> so it runs before <body> paints", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
    });
    const headStart = html.indexOf("<head>");
    const headEnd = html.indexOf("</head>");
    const scriptIdx = html.indexOf("<script>");
    assert.ok(headStart >= 0 && headEnd > headStart, "head bounds");
    assert.ok(
      scriptIdx > headStart && scriptIdx < headEnd,
      "redirect script must live inside <head>",
    );
  });

  it("ships a <noscript> fallback list (no visible picker UI in the default body)", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
    });
    const noscriptStart = html.indexOf("<noscript>");
    const noscriptEnd = html.indexOf("</noscript>");
    assert.ok(noscriptStart >= 0 && noscriptEnd > noscriptStart);
    const noscriptBody = html.slice(noscriptStart, noscriptEnd);
    for (const l of baseLanguages) {
      assert.ok(
        noscriptBody.includes(`href="./${l.lang}/index.html"`),
        `<noscript> must link to ${l.lang}`,
      );
    }
    // The legacy visible picker classes must not be present anywhere
    // outside <noscript>; the redirect-only design replaced them.
    const beforeNoscript = html.slice(0, noscriptStart);
    const afterNoscript = html.slice(noscriptEnd);
    assert.doesNotMatch(beforeNoscript, /class="lp-card"/);
    assert.doesNotMatch(afterNoscript, /class="lp-card"/);
    assert.doesNotMatch(beforeNoscript, /class="lang-pick"/);
    assert.doesNotMatch(afterNoscript, /class="lang-pick"/);
  });

  it("redirects to the localStorage choice when set (sticky preference, behavioral test)", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
      latestVersion: "26.4",
    });
    // localStorage says "ko" — must win over navigator preferring "ja".
    const target = runRedirectScript({
      html,
      pathname: "/",
      storedLang: "ko",
      navigatorLanguages: ["ja-JP", "ja"],
    });
    assert.equal(target, "./26.4/ko/index.html");
  });

  it("falls back to navigator.languages when localStorage is empty", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
    });
    const target = runRedirectScript({
      html,
      pathname: "/",
      navigatorLanguages: ["ja-JP", "ja"],
    });
    assert.equal(target, "./ja/index.html");
  });

  it("matches navigator.language case-insensitively against config codes (Copilot review)", () => {
    // Operator may write canonical BCP-47 casing in book.config.yaml
    // (e.g. `zh-CN`). The script lowercases the user agent's
    // navigator.language before comparing, so SUPPORTED must also be
    // lowercased for the match — but the URL must use the configured
    // (mixed-case) directory name.
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: [
        { lang: "en", label: "English" },
        { lang: "zh-CN", label: "简体中文" },
      ],
      fallback: "en",
    });
    const target = runRedirectScript({
      html,
      pathname: "/",
      navigatorLanguages: ["zh-CN"],
    });
    assert.equal(target, "./zh-CN/index.html");
    // Also via lowercased localStorage — same casing should resolve.
    const target2 = runRedirectScript({
      html,
      pathname: "/",
      storedLang: "zh-cn",
    });
    assert.equal(target2, "./zh-CN/index.html");
  });

  it("falls back to `fallback` when no signal matches a supported language", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
      latestVersion: "26.4",
    });
    const target = runRedirectScript({
      html,
      pathname: "/",
      navigatorLanguages: ["fr-FR"],
    });
    assert.equal(target, "./26.4/en/index.html");
  });

  it("does NOT redirect from a non-root path (loop-safety, e.g. older /26.3/ served via 404 fallback)", () => {
    // This was the latent bug flagged by code-reviewer: relative
    // `./` resolution against a 404'd `/26.3/` URL would have built
    // `/26.3/26.4/en/index.html`. The fix is to bail out when the
    // script ever runs anywhere other than the actual site root.
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
      latestVersion: "26.4",
    });
    for (const pathname of [
      "/26.3/",
      "/26.3/index.html",
      "/26.4/en/",
      "/26.4/en/index.html",
      "/foo/bar",
    ]) {
      const target = runRedirectScript({ html, pathname });
      assert.equal(
        target,
        null,
        `script must NOT fire from ${pathname}; got ${target}`,
      );
    }
  });

  it("DOES redirect from `/` and `/index.html` (true site root)", () => {
    const html = buildRootRedirectIndexPage({
      title: "Docs",
      productName: "Docs",
      languages: baseLanguages,
      fallback: "en",
      latestVersion: "26.4",
    });
    assert.equal(
      runRedirectScript({ html, pathname: "/" }),
      "./26.4/en/index.html",
    );
    assert.equal(
      runRedirectScript({ html, pathname: "/index.html" }),
      "./26.4/en/index.html",
    );
  });

  it("rejects a latestVersion containing shell, path-breakout, or leading-dot characters", () => {
    for (const bad of ["../etc", "26.4/26.5", "..", ".", ".cache", "-foo"]) {
      assert.throws(
        () =>
          buildRootRedirectIndexPage({
            title: "Docs",
            productName: "Docs",
            languages: baseLanguages,
            fallback: "en",
            latestVersion: bad,
          }),
        /invalid latestVersion/,
        `expected ${JSON.stringify(bad)} to be rejected`,
      );
    }
  });

  it("throws when `languages` is empty (defense-in-depth for direct callers)", () => {
    assert.throws(
      () =>
        buildRootRedirectIndexPage({
          title: "Docs",
          productName: "Docs",
          languages: [],
          fallback: "en",
        }),
      /must contain at least one entry/,
    );
  });

  it("preserves the deprecated `buildLanguagePickerPage` alias for one release", () => {
    // The old name is re-exported as an alias so external callers do
    // not break in the same release that introduces the rename.
    assert.equal(buildLanguagePickerPage, buildRootRedirectIndexPage);
  });
});
