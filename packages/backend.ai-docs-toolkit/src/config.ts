import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";
import type { PdfTheme } from "./theme.js";

export interface DocConfig {
  /** Document title, e.g. "Backend.AI WebUI User Guide" */
  title: string;
  /** Cover page subtitle, e.g. "User Guide" */
  subtitle?: string;
  /** Company name shown on cover page */
  company: string;
  /** Path to SVG logo file, relative to projectRoot */
  logoPath?: string;
  /** Fallback HTML when logo file is not found */
  logoFallbackHtml?: string;

  /** Absolute path to the project root directory */
  projectRoot: string;
  /** Source directory containing markdown content, relative to projectRoot. Default: "src" */
  srcDir?: string;
  /** Output directory for generated files, relative to projectRoot. Default: "dist" */
  distDir?: string;

  /** Path to package.json for version resolution, relative to projectRoot */
  versionSource?: string;
  /** Explicit version string (overrides versionSource) */
  version?: string;

  /** Language labels, e.g. { en: "English", ko: "한국어" } */
  languageLabels?: Record<string, string>;
  /** Localized UI strings per language */
  localizedStrings?: Record<
    string,
    { userGuide?: string; tableOfContents?: string }
  >;
  /** Localized admonition titles per language */
  admonitionTitles?: Record<string, Record<string, string>>;
  /** Localized figure labels per language */
  figureLabels?: Record<string, string>;

  /** PDF filename template. Supports {title}, {version}, {lang} placeholders */
  pdfFilenameTemplate?: string;
  /** PDF document metadata */
  pdfMetadata?: { author?: string; subject?: string; creator?: string };
  /** Additional CJK font search paths */
  cjkFontPaths?: string[];

  /** Non-ASCII path fallbacks for book.config.yaml entries */
  pathFallbacks?: Record<string, string>;
  /** Product name for log messages */
  productName?: string;
  /** PDF theme override */
  theme?: string | PdfTheme;
}

/** Agent template configuration */
export interface AgentConfig {
  projectTitle?: string;
  docsRoot?: string;
  languages?: Array<{ code: string; label: string }>;
  i18nPaths?: Record<string, string>;
  terminologyFile?: string;
  styleGuideFile?: string;
  translationGuideFile?: string;
  screenshotGuideFile?: string;
  app?: {
    baseUrl?: string;
    routes?: Array<{ path: string; name: string }>;
    loginInstructions?: string;
    envVars?: string[];
  };
}

/** Website generation configuration */
export interface WebsiteConfig {
  /** Base URL for 'Edit this page' links, e.g. 'https://github.com/org/repo/edit/main/docs/src' */
  editBaseUrl?: string;
  /** GitHub repository URL for source links */
  repoUrl?: string;
  /** Output subdirectory under distDir. Default: 'web' */
  outDir?: string;
  /** Base path for deployment (e.g., '/docs/'). Default: '/' */
  basePath?: string;
}

// ── SEO / Open Graph schema (F2 / FR-2714) ────────────────────────
//
// `og` is OPTIONAL. When omitted, every per-page SEO tag that does NOT
// require an absolute base URL is still emitted (description, twitter
// card, JSON-LD without canonical URL). Tags that REQUIRE an absolute
// URL (canonical, og:url, sitemap entries with `<loc>`) are silently
// skipped/relativized so that air-gapped builds without a public URL
// do not crash. A warning is printed once per build when `baseUrl` is
// missing. See ARCHITECTURE.md → "SEO & sharing metadata (F2)".
export interface OgConfig {
  /**
   * Override path to the default Open Graph image, relative to the
   * project root (NOT the docs source dir). When set, the file is
   * copied verbatim to `dist/web/assets/og-default.<ext>` and used as
   * the `og:image`. When unset, the toolkit attempts to render
   * `manifest/backend.ai-brand-simple.svg` to a 1200×630 PNG via
   * Playwright at build time.
   */
  imagePath?: string;
  /** `og:site_name` value. Defaults to `config.title`. */
  siteName?: string;
  /**
   * Public deploy URL (e.g. `https://docs.backend.ai`). Used to build
   * absolute URLs in `<link rel="canonical">`, `og:url`, and the
   * `<loc>` entries of `sitemap.xml`. When unset, those tags are
   * omitted (canonical points to the page itself as a relative URL,
   * `og:url` is dropped, `sitemap.xml` uses relative paths).
   */
  baseUrl?: string;
}

// ── Versioned-docs schema (F6 / FR-2718) ──────────────────────────
//
// `versions` is OPTIONAL and OPT-IN. When omitted, the existing flat
// output layout (`dist/web/<lang>/...`) is preserved exactly. When
// declared, each entry produces a self-contained per-minor site under
// `dist/web/<label>/<lang>/...`, and the version selector is rendered in
// every page header. See ARCHITECTURE.md → "Versioned docs (F6)".
//
// Source kinds:
//   - `workspace`     — build from the current checkout (used for the
//                       `latest` entry in normal day-to-day deploys).
//   - `archive-branch`— build by checking out a static, pre-built tree
//                       from a `docs-archive/<minor>` orphan branch.
//                       The toolkit-of-its-day produced those artifacts;
//                       we never re-run the current toolkit against past
//                       minors. If the branch does not exist locally,
//                       the version is skipped with a clear warning.

export type VersionSource =
  | { kind: "workspace" }
  | { kind: "archive-branch"; ref: string };

export interface VersionEntry {
  /** Display label for the selector, e.g. "25.16". Must be the minor portion, never a full patch. */
  label: string;
  /** How to source this version's built site. */
  source: VersionSource;
  /** Exactly one entry across `versions[]` must carry `latest: true`. */
  latest?: boolean;
  /**
   * Optional release tag used to build the per-version PDF download URL
   * (FR-2731). Must match `^v\d+\.\d+\.\d+$` (e.g., `"v26.4.7"`) — the
   * format the GitHub Releases CDN expects under
   * `https://github.com/<org>/<repo>/releases/download/<pdfTag>/<asset>`.
   *
   * The toolkit owns this schema; consumers only pass a value through.
   * When omitted, downstream renderers must treat the version as "no PDF
   * card" (no defaults, no synthesized URL). Rendering is implemented in
   * a follow-up sub-task — this field is wired through the pipeline but
   * does not yet drive any UI.
   */
  pdfTag?: string;
}

/**
 * Branding config (FR-2726 — production-quality docs site).
 *
 * Exposes the consumer-tunable surface of the BAI-themed site: brand
 * primary color, light/dark logos, and the small sub-label rendered next
 * to the logo in the topbar (e.g. "Manual" / "매뉴얼"). All fields are
 * optional; when omitted the toolkit falls back to Backend.AI defaults so
 * an unconfigured consumer still ships a coherent palette.
 *
 * Logos are resolved relative to `projectRoot` and copied into the site
 * `assets/` directory at build time (Phase 2 of FR-2726). The sub-label
 * is either a single string or a per-language map keyed by language code;
 * use the `default` key as a fallback for unmapped languages.
 */
export interface BrandingConfig {
  /**
   * Override the base primary brand color token (`--bai-primary`).
   * Must be a valid CSS color string (hex, rgb, hsl, or color name).
   * Default: `#FF7A00` (Backend.AI Orange).
   *
   * `primaryColorHover` / `primaryColorActive` / `primaryColorSoft` are
   * NOT auto-derived from this value — they fall back to the Backend.AI
   * orange variants when omitted. To keep an alternate brand consistent
   * across hover/active/soft surfaces, supply all four fields together.
   */
  primaryColor?: string;
  /**
   * Override the hover variant of the primary color (`--bai-primary-hover`).
   * Defaults to Backend.AI orange hover when omitted.
   */
  primaryColorHover?: string;
  /**
   * Override the active/pressed variant (`--bai-primary-active`).
   * Defaults to Backend.AI orange active when omitted.
   */
  primaryColorActive?: string;
  /**
   * Override the soft tinted fill used for active sider items, link
   * hovers, and similar low-emphasis surfaces (`--bai-primary-soft`).
   * In dark mode the soft fill falls back to a translucent variant of
   * the resolved primary so it reads on dark backgrounds.
   */
  primaryColorSoft?: string;
  /** Path to light-theme logo SVG, relative to `projectRoot`. */
  logoLight?: string;
  /** Path to dark-theme logo SVG, relative to `projectRoot`. Falls back to `logoLight` when omitted. */
  logoDark?: string;
  /**
   * Sub-label rendered next to the logo. Either a single string (used for
   * every language) or a per-language map keyed by language code (e.g.
   * `{ en: "Manual", ko: "매뉴얼" }`). When using the map form, the
   * `default` key is the fallback for unmapped languages.
   */
  subLabel?: string | Record<string, string>;
}

/**
 * Code-block presentation config (F4 — reading UX).
 *
 * `lightTheme` controls Shiki's light syntax theme used during build-time
 * highlighting in the web pipeline. Any theme bundled with `shiki` is
 * accepted (e.g. `github-light`, `vitesse-light`, `light-plus`). Unknown
 * themes fall back to `github-light` with a warning.
 *
 * Reserved namespace — do not wire yet:
 *   - `darkTheme`: a future dark-mode bucket will introduce this and pair
 *     it with Shiki's dual-theme (`themes: { light, dark }`) rendering.
 *     Adding the key here now would commit us to an output format before
 *     that work has chosen one. Keep the slot reserved at the type level
 *     only via this comment.
 */
export interface CodeConfig {
  /** Shiki light theme name. Default: `'github-light'`. */
  lightTheme?: string;
}

/** Full toolkit config file shape (docs-toolkit.config.yaml) */
export interface ToolkitConfig extends DocConfig {
  agents?: AgentConfig;
  website?: WebsiteConfig;
  /**
   * Optional minor-grained version list. When omitted, the build emits
   * the legacy single-version flat layout. See `versions.ts` for the
   * normalized runtime shape and validation rules.
   */
  versions?: VersionEntry[];
  /**
   * Optional URL of an external "previous versions" docs site (FR-2733).
   *
   * When set, the header version selector renders a "Previous versions"
   * entry at the bottom of the dropdown that opens this URL in a new tab.
   * When unset (or set to an empty string), the entry is fully hidden —
   * no empty option, no separator, no extra DOM nodes.
   *
   * In production, this value is supplied at build time via the Amplify
   * environment variable `LEGACY_DOCS_URL`. Must be a well-formed
   * `https://…` (or `http://…`) URL when present.
   *
   * Typed as `string | null` because YAML loaders (and explicit overrides)
   * can produce a literal `null` for an unset entry; the resolver
   * normalizes both `null` and absent to the same end state.
   */
  legacyDocsUrl?: string | null;
  /**
   * Optional Open Graph / SEO config. Controls per-page `<meta>`
   * tags (description, og:*, twitter card, canonical, JSON-LD) plus
   * `sitemap.xml` and `robots.txt` generation. See `OgConfig`.
   */
  og?: OgConfig;
  /** Code-block presentation (Shiki theme, F4). */
  code?: CodeConfig;
  /**
   * Optional branding overrides for the web build (FR-2726).
   * Lets consumers tune the topbar logo, sub-label, and primary color
   * without forking the toolkit. See `BrandingConfig`.
   */
  branding?: BrandingConfig;
}

// ── Defaults ──────────────────────────────────────────────────

const DEFAULT_LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  th: "ภาษาไทย",
};

const DEFAULT_LOCALIZED_STRINGS: Record<
  string,
  { userGuide: string; tableOfContents: string }
> = {
  en: { userGuide: "User Guide", tableOfContents: "Table of Contents" },
  ko: { userGuide: "사용자 가이드", tableOfContents: "목차" },
  ja: { userGuide: "ユーザーガイド", tableOfContents: "目次" },
  th: { userGuide: "คู่มือผู้ใช้", tableOfContents: "สารบัญ" },
};

const DEFAULT_ADMONITION_TITLES: Record<string, Record<string, string>> = {
  en: {
    note: "NOTE",
    tip: "TIP",
    info: "INFO",
    warning: "WARNING",
    caution: "CAUTION",
    danger: "DANGER",
  },
  ko: {
    note: "참고",
    tip: "팁",
    info: "정보",
    warning: "주의",
    caution: "주의",
    danger: "위험",
  },
  ja: {
    note: "注記",
    tip: "ヒント",
    info: "情報",
    warning: "警告",
    caution: "注意",
    danger: "危険",
  },
  th: {
    note: "หมายเหตุ",
    tip: "เคล็ดลับ",
    info: "ข้อมูล",
    warning: "คำเตือน",
    caution: "ข้อควรระวัง",
    danger: "อันตราย",
  },
};

const DEFAULT_FIGURE_LABELS: Record<string, string> = {
  en: "Figure",
  ko: "그림",
  ja: "図",
  th: "รูปที่",
};

/** Localized labels for website navigation and metadata.
 *
 * Version-mismatch UX keys (FR-2723 originally; redesigned in FR-2733):
 *   - `bannerOutdatedTitle`  — title of the "outdated" banner shown on a
 *                              non-latest, non-`next` version page. Includes
 *                              the `{version}` placeholder for the current
 *                              minor (substituted at render time, not
 *                              client-side).
 *   - `bannerOutdatedBody`   — body text for the outdated variant. Includes
 *                              a `{link}` placeholder where the inline
 *                              "View the latest version" anchor is spliced.
 *   - `bannerPreviewTitle`   — title of the "preview" banner shown when the
 *                              current channel is `next` (unreleased docs).
 *   - `bannerPreviewBody`    — body text for the preview variant. Same
 *                              `{link}` placeholder convention.
 *   - `bannerViewLatestLink` — anchor text spliced into both banner bodies
 *                              via `{link}`. Includes `{latestVersion}`.
 *   - `bannerDismiss`        — aria-label / tooltip for the dismiss "×" button
 *                              on both the banner and the notice.
 *   - `noticeNotInVersion`   — body text shown when the version switcher
 *                              fell back to the version index because the
 *                              same slug doesn't exist there. Includes a
 *                              `{version}` placeholder for the target minor.
 *
 * The placeholder syntax is plain `{name}` (NOT i18next `{{name}}`) because
 * the substitution happens at build time inside `buildVersionBanner` (and
 * for the `noticeNotInVersion` slot, in our ~1 KB inline JS). See
 * `templates/assets/version-banner.js`.
 */
export const WEBSITE_LABELS: Record<string, Record<string, string>> = {
  en: {
    previous: "Previous",
    next: "Next",
    editThisPage: "Edit this page",
    lastUpdated: "Last updated on",
    searchPlaceholder: "Search docs...",
    noResults: "No results found",
    home: "Home",
    onThisPage: "On this page",
    tocToggle: "On this page",
    copy: "Copy",
    copied: "Copied!",
    copyFailed: "Copy failed",
    bannerOutdatedTitle: "You are viewing an older version ({version}).",
    bannerOutdatedBody: "For up-to-date documentation, see the {link}.",
    bannerPreviewTitle:
      "This is unreleased documentation for WebUI Next version.",
    bannerPreviewBody: "For up-to-date documentation, see the {link}.",
    bannerViewLatestLink: "latest version ({latestVersion})",
    bannerDismiss: "Dismiss",
    noticeNotInVersion:
      "This page is not available in version {version}. You are viewing the version index instead.",
    previousVersions: "Previous versions",
    versionLabel: "Version",
    // FR-2732: per-version PDF download card on the per-language landing
    // page. Rendered ONLY when `versions[].pdfTag` is set; absent versions
    // (e.g., `next`) emit no card markup at all.
    downloadPdfThisVersion: "Download PDF (this version)",
    homeWelcome: "Welcome to the Backend.AI WebUI User Guide",
    homeIntro:
      "Backend.AI WebUI is the official browser-based control plane for Backend.AI — Lablup's distributed compute platform for AI and ML workloads. This guide walks you through every screen and every workflow, from your first compute session to administering a multi-tenant deployment.",
    homeAboutWebUI: "About Backend.AI WebUI",
    homeAboutWebUIBody:
      "Connect to your Backend.AI cluster, launch interactive or batch sessions on CPUs and GPUs, share storage folders with your team, and serve trained models as inference endpoints — all without leaving the browser.",
    homeAboutDocs: "About this manual",
    homeAboutDocsBody:
      "Each chapter is grouped by topic in the left sidebar. Use the search bar at the top to jump directly to a feature, or pick a different release from the version selector. The full manual is also available as a downloadable PDF.",
    homeBrowse: "Browse the manual",
    homeQuickstartCta: "Get started",
    homeQuickstartHint:
      "First time here? Start with the Quickstart chapter to set up your first session.",
    homeViewOnGitHub: "View source on GitHub",
    homePagesSuffix: "pages",
  },
  ko: {
    previous: "이전",
    next: "다음",
    editThisPage: "이 페이지 편집",
    lastUpdated: "마지막 업데이트",
    searchPlaceholder: "문서 검색...",
    noResults: "검색 결과가 없습니다",
    home: "홈",
    onThisPage: "이 페이지의 목차",
    tocToggle: "이 페이지의 목차",
    copy: "복사",
    copied: "복사됨!",
    copyFailed: "복사 실패",
    bannerOutdatedTitle: "이전 버전({version})을 보고 있습니다.",
    bannerOutdatedBody: "최신 문서는 {link}에서 확인하세요.",
    bannerPreviewTitle: "WebUI 다음 버전(Next)의 미발행 문서입니다.",
    bannerPreviewBody: "최신 문서는 {link}에서 확인하세요.",
    bannerViewLatestLink: "최신 버전({latestVersion})",
    bannerDismiss: "닫기",
    noticeNotInVersion:
      "이 페이지는 버전 {version}에 존재하지 않습니다. 해당 버전의 인덱스 페이지로 이동했습니다.",
    previousVersions: "이전 버전",
    versionLabel: "버전",
    downloadPdfThisVersion: "PDF 다운로드 (이 버전)",
    homeWelcome: "Backend.AI WebUI 사용자 매뉴얼에 오신 것을 환영합니다",
    homeIntro:
      "Backend.AI WebUI는 Lablup의 분산 AI/ML 컴퓨팅 플랫폼인 Backend.AI를 위한 공식 브라우저 기반 관리 콘솔입니다. 이 매뉴얼은 첫 연산 세션 생성부터 멀티 테넌트 운영까지, 모든 화면과 워크플로우를 단계별로 안내합니다.",
    homeAboutWebUI: "Backend.AI WebUI 소개",
    homeAboutWebUIBody:
      "Backend.AI 클러스터에 접속해 CPU·GPU 위에서 대화형 또는 배치 세션을 실행하고, 팀과 스토리지 폴더를 공유하며, 학습된 모델을 추론 엔드포인트로 서빙하세요. 모든 작업을 브라우저에서 수행할 수 있습니다.",
    homeAboutDocs: "이 매뉴얼에 대해",
    homeAboutDocsBody:
      "왼쪽 사이드바에서 주제별로 정리된 챕터를 확인할 수 있습니다. 상단 검색창으로 원하는 기능에 바로 이동하거나, 버전 선택기에서 다른 릴리스 문서를 볼 수 있습니다. 전체 매뉴얼은 PDF로도 내려받을 수 있습니다.",
    homeBrowse: "매뉴얼 둘러보기",
    homeQuickstartCta: "시작하기",
    homeQuickstartHint:
      "처음 방문하셨다면 빠른 시작 챕터에서 첫 세션을 만들어 보세요.",
    homeViewOnGitHub: "GitHub에서 소스 보기",
    homePagesSuffix: "개 페이지",
  },
  ja: {
    previous: "前へ",
    next: "次へ",
    editThisPage: "このページを編集",
    lastUpdated: "最終更新日",
    searchPlaceholder: "ドキュメント検索...",
    noResults: "結果が見つかりません",
    home: "ホーム",
    onThisPage: "このページの目次",
    tocToggle: "このページの目次",
    copy: "コピー",
    copied: "コピーしました!",
    copyFailed: "コピーに失敗しました",
    bannerOutdatedTitle: "古いバージョン({version})を表示しています。",
    bannerOutdatedBody: "最新のドキュメントは{link}をご覧ください。",
    bannerPreviewTitle:
      "WebUI 次期バージョン (Next) の未公開ドキュメントです。",
    bannerPreviewBody: "最新のドキュメントは{link}をご覧ください。",
    bannerViewLatestLink: "最新バージョン({latestVersion})",
    bannerDismiss: "閉じる",
    noticeNotInVersion:
      "このページはバージョン {version} には存在しません。代わりにバージョンのインデックスを表示しています。",
    previousVersions: "以前のバージョン",
    versionLabel: "バージョン",
    downloadPdfThisVersion: "PDFダウンロード（このバージョン）",
    homeWelcome: "Backend.AI WebUI ユーザーガイドへようこそ",
    homeIntro:
      "Backend.AI WebUI は、Lablup の分散 AI／ML コンピューティング基盤 Backend.AI 向けの公式ブラウザインターフェイスです。本マニュアルは、初回のコンピュートセッション作成からマルチテナント運用に至るまで、すべての画面とワークフローを順を追って解説します。",
    homeAboutWebUI: "Backend.AI WebUI について",
    homeAboutWebUIBody:
      "Backend.AI クラスターに接続し、CPU や GPU 上でインタラクティブ／バッチセッションを起動し、ストレージフォルダをチームと共有し、学習済みモデルを推論エンドポイントとして提供できます。すべての操作をブラウザだけで完結できます。",
    homeAboutDocs: "このマニュアルについて",
    homeAboutDocsBody:
      "左サイドバーには各章がトピックごとにまとめられています。上部の検索バーから機能に直接ジャンプしたり、バージョンセレクタから別リリースの文書を参照したりできます。マニュアル全文は PDF でもダウンロード可能です。",
    homeBrowse: "マニュアルを見る",
    homeQuickstartCta: "はじめる",
    homeQuickstartHint:
      "はじめてご利用の方は、クイックスタートから読み始めてください。",
    homeViewOnGitHub: "ソースを GitHub で表示",
    homePagesSuffix: "ページ",
  },
  th: {
    previous: "ก่อนหน้า",
    next: "ถัดไป",
    editThisPage: "แก้ไขหน้านี้",
    lastUpdated: "อัปเดตล่าสุด",
    searchPlaceholder: "ค้นหาเอกสาร...",
    noResults: "ไม่พบผลลัพธ์",
    home: "หน้าแรก",
    onThisPage: "หัวข้อในหน้านี้",
    tocToggle: "หัวข้อในหน้านี้",
    copy: "คัดลอก",
    copied: "คัดลอกแล้ว!",
    copyFailed: "คัดลอกไม่สำเร็จ",
    bannerOutdatedTitle: "คุณกำลังดูเวอร์ชันเก่า ({version})",
    bannerOutdatedBody: "ดูเอกสารฉบับล่าสุดได้ที่ {link}",
    bannerPreviewTitle:
      "นี่คือเอกสารที่ยังไม่เผยแพร่สำหรับ WebUI เวอร์ชัน Next",
    bannerPreviewBody: "ดูเอกสารฉบับล่าสุดได้ที่ {link}",
    bannerViewLatestLink: "เวอร์ชันล่าสุด ({latestVersion})",
    bannerDismiss: "ปิด",
    noticeNotInVersion:
      "หน้านี้ไม่มีในเวอร์ชัน {version} กำลังแสดงหน้าดัชนีของเวอร์ชันแทน",
    previousVersions: "เวอร์ชันก่อนหน้า",
    versionLabel: "เวอร์ชัน",
    downloadPdfThisVersion: "ดาวน์โหลด PDF (เวอร์ชันนี้)",
    homeWelcome: "ยินดีต้อนรับสู่คู่มือผู้ใช้ Backend.AI WebUI",
    homeIntro:
      "Backend.AI WebUI คืออินเทอร์เฟซเว็บอย่างเป็นทางการสำหรับ Backend.AI — แพลตฟอร์มการประมวลผลแบบกระจายของ Lablup สำหรับงาน AI และ ML คู่มือนี้จะพาคุณรู้จักทุกหน้าจอและทุกขั้นตอนการทำงาน ตั้งแต่การสร้างเซสชันการคำนวณครั้งแรก จนถึงการดูแลระบบแบบหลายผู้เช่า",
    homeAboutWebUI: "เกี่ยวกับ Backend.AI WebUI",
    homeAboutWebUIBody:
      "เชื่อมต่อกับคลัสเตอร์ Backend.AI ของคุณ เริ่มเซสชันแบบ interactive หรือ batch บน CPU และ GPU แชร์โฟลเดอร์จัดเก็บกับทีม และให้บริการโมเดลที่ฝึกแล้วเป็น inference endpoint — ทั้งหมดทำได้บนเบราว์เซอร์",
    homeAboutDocs: "เกี่ยวกับคู่มือนี้",
    homeAboutDocsBody:
      "แต่ละบทถูกจัดกลุ่มตามหัวข้อในแถบด้านซ้าย ใช้ช่องค้นหาด้านบนเพื่อข้ามไปยังคุณสมบัติที่ต้องการ หรือเลือกรุ่นอื่นจากตัวเลือกเวอร์ชัน คู่มือฉบับเต็มยังสามารถดาวน์โหลดเป็น PDF ได้",
    homeBrowse: "ดูคู่มือ",
    homeQuickstartCta: "เริ่มต้นใช้งาน",
    homeQuickstartHint:
      "หากเข้ามาครั้งแรก ขอแนะนำให้เริ่มจากบท เริ่มต้นอย่างรวดเร็ว เพื่อสร้างเซสชันแรกของคุณ",
    homeViewOnGitHub: "ดูซอร์สโค้ดบน GitHub",
    homePagesSuffix: "หน้า",
  },
};

// ── Resolved config (all defaults applied) ────────────────────

export interface ResolvedDocConfig {
  title: string;
  subtitle: string;
  company: string;
  logoPath: string | null;
  logoFallbackHtml: string;

  projectRoot: string;
  srcDir: string;
  distDir: string;

  versionSource: string;
  version: string | null;

  languageLabels: Record<string, string>;
  localizedStrings: Record<
    string,
    { userGuide: string; tableOfContents: string }
  >;
  admonitionTitles: Record<string, Record<string, string>>;
  figureLabels: Record<string, string>;

  pdfFilenameTemplate: string;
  pdfMetadata: { author: string; subject: string; creator: string };
  cjkFontPaths: string[];

  pathFallbacks: Record<string, string>;
  productName: string;

  agents?: AgentConfig;
  website?: WebsiteConfig;
  /**
   * Raw `versions` from `docs-toolkit.config.yaml`. Left unnormalized
   * here so the website generator can apply F6's eligibility rules
   * (see `versions.ts`). When undefined, single-version compatibility
   * mode applies.
   */
  versions?: VersionEntry[];
  /**
   * Resolved external "previous versions" docs URL (FR-2733). `null`
   * when unset or when the raw value was an empty/whitespace-only
   * string. When non-null, the value is guaranteed to be a well-formed
   * `http(s)://…` URL (validated at config-load time). Consumed by the
   * version-selector renderer in `website-builder.ts`.
   */
  legacyDocsUrl: string | null;
  /**
   * Raw `og` block from `docs-toolkit.config.yaml`. Consumed by F2's
   * SEO tag emitter, sitemap, and OG image renderer.
   */
  og?: OgConfig;
  /**
   * Resolved code-block presentation. Always populated (defaults applied)
   * so downstream consumers don't have to null-check.
   */
  code: ResolvedCodeConfig;
  /**
   * Resolved branding (FR-2726). Always populated (defaults applied) so
   * the website generator and stylesheet can read it directly.
   */
  branding: ResolvedBrandingConfig;
}

/** Resolved branding — defaults applied. */
export interface ResolvedBrandingConfig {
  /** Primary brand color in CSS color syntax. */
  primaryColor: string;
  /** Hover variant of the primary color. */
  primaryColorHover: string;
  /** Active/pressed variant of the primary color. */
  primaryColorActive: string;
  /** Soft tinted fill (used for active sider items, hovered links, etc.). */
  primaryColorSoft: string;
  /** Absolute path to light-theme logo SVG, or `null` when not configured. */
  logoLight: string | null;
  /** Absolute path to dark-theme logo SVG, or `null` when not configured. */
  logoDark: string | null;
  /** Per-language sub-label map. `default` key is the fallback. */
  subLabel: Record<string, string>;
}

/** Default Backend.AI brand palette (orange family). */
export const DEFAULT_PRIMARY_COLOR = "#FF7A00";
export const DEFAULT_PRIMARY_COLOR_HOVER = "#FF9729";
export const DEFAULT_PRIMARY_COLOR_ACTIVE = "#E65C00";
export const DEFAULT_PRIMARY_COLOR_SOFT = "#FFF4E5";

/**
 * Validate a CSS color string before interpolating into the generated
 * stylesheet (FR-2726). The grammar is intentionally narrow — it accepts
 * the four common authoring forms (hex, rgb/rgba, hsl/hsla, color-name)
 * and rejects anything containing newline / `;` / `}` / `<` / `*` so a
 * misconfigured `primaryColor` value cannot terminate the surrounding
 * declaration block and inject extra CSS rules.
 *
 * Returns the trimmed value when valid; throws when not.
 */
export function validateCssColor(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field}: empty CSS color value`);
  }
  // Block obvious CSS-injection vectors before fine-grained format checks.
  if (/[;{}<>\n\r\*\\]/.test(trimmed)) {
    throw new Error(
      `${field}: invalid CSS color "${value}" (contains forbidden characters)`,
    );
  }
  const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  // Linear pattern: `[^()]*` matches anything except parentheses, so the
  // engine never has to choose between overlapping `\s*` and `[\s…]+`
  // matches (which CodeQL flagged as polynomial-time backtracking on
  // pathological inputs like "rgb(\t\t\t…"). The forbidden-character
  // pre-check above already rejects `;`, `{`, `<`, etc., so loosening
  // the body grammar here doesn't widen the injection surface.
  const FUNC =
    /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^()]*\)$/i;
  const NAME = /^[a-zA-Z]+$/;
  if (!HEX.test(trimmed) && !FUNC.test(trimmed) && !NAME.test(trimmed)) {
    throw new Error(
      `${field}: invalid CSS color "${value}" (expected hex, rgb/rgba, hsl/hsla, color-name)`,
    );
  }
  return trimmed;
}

/** Resolved code-block config — all defaults applied. */
export interface ResolvedCodeConfig {
  lightTheme: string;
}

/** Default Shiki light theme — readable, neutral, ships with shiki/themes. */
export const DEFAULT_CODE_LIGHT_THEME = "github-light";

/**
 * Validate and normalize the optional `legacyDocsUrl` config field
 * (FR-2733). Returns the trimmed URL string when valid, or `null` when
 * the value is absent / empty / whitespace-only (the two are treated
 * identically — both mean "no legacy docs link, hide the selector entry").
 *
 * Throws when the value is a non-empty string that is not a well-formed
 * `http(s)://…` URL. The narrow protocol whitelist prevents `javascript:`
 * or other surprising schemes from sneaking into the rendered anchor.
 */
export function resolveLegacyDocsUrl(
  raw: string | null | undefined,
): string | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `legacyDocsUrl: invalid URL "${raw}" (expected absolute http:// or https:// URL)`,
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `legacyDocsUrl: unsupported protocol "${parsed.protocol}" (only http:// and https:// are allowed)`,
    );
  }
  return trimmed;
}

export function resolveConfig(config: ToolkitConfig): ResolvedDocConfig {
  const projectRoot = config.projectRoot;
  return {
    title: config.title,
    subtitle: config.subtitle ?? "User Guide",
    company: config.company,
    logoPath: config.logoPath
      ? path.resolve(projectRoot, config.logoPath)
      : null,
    logoFallbackHtml:
      config.logoFallbackHtml ??
      `<div style="font-size:48px;color:#ff9d00;font-weight:bold;">${config.title}</div>`,

    projectRoot,
    srcDir: path.resolve(projectRoot, config.srcDir ?? "src"),
    distDir: path.resolve(projectRoot, config.distDir ?? "dist"),

    versionSource: path.resolve(
      projectRoot,
      config.versionSource ?? "package.json",
    ),
    version: config.version ?? null,

    languageLabels: { ...DEFAULT_LANGUAGE_LABELS, ...config.languageLabels },
    localizedStrings: mergeLocalizedStrings(
      DEFAULT_LOCALIZED_STRINGS,
      config.localizedStrings,
    ),
    admonitionTitles: mergeNestedRecord(
      DEFAULT_ADMONITION_TITLES,
      config.admonitionTitles,
    ),
    figureLabels: { ...DEFAULT_FIGURE_LABELS, ...config.figureLabels },

    pdfFilenameTemplate:
      config.pdfFilenameTemplate ?? "{title}_{version}_{lang}.pdf",
    pdfMetadata: {
      author: config.pdfMetadata?.author ?? config.company,
      subject: config.pdfMetadata?.subject ?? `${config.title}`,
      creator: config.pdfMetadata?.creator ?? "docs-toolkit PDF Generator",
    },
    cjkFontPaths: config.cjkFontPaths ?? [],

    pathFallbacks: config.pathFallbacks ?? {},
    productName: config.productName ?? config.title,

    agents: config.agents,
    website: config.website,
    versions: config.versions,
    legacyDocsUrl: resolveLegacyDocsUrl(config.legacyDocsUrl),
    og: config.og,
    code: {
      lightTheme: config.code?.lightTheme ?? DEFAULT_CODE_LIGHT_THEME,
    },
    branding: resolveBranding(config.branding, projectRoot),
  };
}

export function resolveBranding(
  raw: BrandingConfig | undefined,
  projectRoot: string,
): ResolvedBrandingConfig {
  const resolveLogo = (p: string | undefined): string | null =>
    p ? path.resolve(projectRoot, p) : null;

  const logoLight = resolveLogo(raw?.logoLight);
  const logoDark = resolveLogo(raw?.logoDark) ?? logoLight;

  const subLabel: Record<string, string> = {};
  if (typeof raw?.subLabel === "string") {
    subLabel.default = raw.subLabel;
  } else if (raw?.subLabel && typeof raw.subLabel === "object") {
    Object.assign(subLabel, raw.subLabel);
  }

  // Each branding color goes through validateCssColor so a bad value
  // surfaces as a clear error instead of silently injecting CSS into the
  // generated stylesheet (FR-2726 review feedback).
  const resolveColor = (
    value: string | undefined,
    field: string,
    fallback: string,
  ): string =>
    value ? validateCssColor(value, `branding.${field}`) : fallback;

  return {
    primaryColor: resolveColor(
      raw?.primaryColor,
      "primaryColor",
      DEFAULT_PRIMARY_COLOR,
    ),
    primaryColorHover: resolveColor(
      raw?.primaryColorHover,
      "primaryColorHover",
      DEFAULT_PRIMARY_COLOR_HOVER,
    ),
    primaryColorActive: resolveColor(
      raw?.primaryColorActive,
      "primaryColorActive",
      DEFAULT_PRIMARY_COLOR_ACTIVE,
    ),
    primaryColorSoft: resolveColor(
      raw?.primaryColorSoft,
      "primaryColorSoft",
      DEFAULT_PRIMARY_COLOR_SOFT,
    ),
    logoLight,
    logoDark,
    subLabel,
  };
}

function mergeLocalizedStrings(
  defaults: Record<string, { userGuide: string; tableOfContents: string }>,
  overrides?: Record<string, { userGuide?: string; tableOfContents?: string }>,
): Record<string, { userGuide: string; tableOfContents: string }> {
  if (!overrides) return { ...defaults };
  const result = { ...defaults };
  for (const [lang, strings] of Object.entries(overrides)) {
    result[lang] = {
      userGuide:
        strings.userGuide ?? defaults[lang]?.userGuide ?? defaults.en.userGuide,
      tableOfContents:
        strings.tableOfContents ??
        defaults[lang]?.tableOfContents ??
        defaults.en.tableOfContents,
    };
  }
  return result;
}

function mergeNestedRecord(
  defaults: Record<string, Record<string, string>>,
  overrides?: Record<string, Record<string, string>>,
): Record<string, Record<string, string>> {
  if (!overrides) return { ...defaults };
  const result: Record<string, Record<string, string>> = {};
  for (const key of new Set([
    ...Object.keys(defaults),
    ...Object.keys(overrides),
  ])) {
    result[key] = { ...defaults[key], ...overrides[key] };
  }
  return result;
}

// ── Config file loader ────────────────────────────────────────

const CONFIG_FILENAME = "docs-toolkit.config.yaml";

export function loadToolkitConfig(projectRoot: string): ToolkitConfig {
  const configPath = path.resolve(projectRoot, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config file not found: ${configPath}\n` +
        `Run "docs-toolkit init" to create one, or create ${CONFIG_FILENAME} manually.`,
    );
  }
  const raw = parseYaml(fs.readFileSync(configPath, "utf-8")) as Record<
    string,
    unknown
  >;
  return { ...raw, projectRoot } as ToolkitConfig;
}
