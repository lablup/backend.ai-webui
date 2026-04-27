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
  buildIndexPage,
  buildWebPage,
  type WebPageContext,
  type PageAssets,
} from "./website-builder.js";
import type { WebsiteMetadata } from "./website-builder.js";
import { resolveLegacyDocsUrl, type ResolvedDocConfig } from "./config.js";
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
    // Dismiss button preserved for backward-compat with version-banner.js.
    assert.match(html, /class="docs-banner__dismiss"/);
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
    assert.match(html, /<meta http-equiv="refresh" content="0; url=\.\/dashboard\.html"/);
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
