import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import type { PdfTheme } from './theme.js';

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
  localizedStrings?: Record<string, { userGuide?: string; tableOfContents?: string }>;
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

/** Full toolkit config file shape (docs-toolkit.config.yaml) */
export interface ToolkitConfig extends DocConfig {
  agents?: AgentConfig;
  website?: WebsiteConfig;
}

// ── Defaults ──────────────────────────────────────────────────

const DEFAULT_LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  th: 'ภาษาไทย',
};

const DEFAULT_LOCALIZED_STRINGS: Record<string, { userGuide: string; tableOfContents: string }> = {
  en: { userGuide: 'User Guide', tableOfContents: 'Table of Contents' },
  ko: { userGuide: '사용자 가이드', tableOfContents: '목차' },
  ja: { userGuide: 'ユーザーガイド', tableOfContents: '目次' },
  th: { userGuide: 'คู่มือผู้ใช้', tableOfContents: 'สารบัญ' },
};

const DEFAULT_ADMONITION_TITLES: Record<string, Record<string, string>> = {
  en: { note: 'NOTE', tip: 'TIP', info: 'INFO', warning: 'WARNING', caution: 'CAUTION', danger: 'DANGER' },
  ko: { note: '참고', tip: '팁', info: '정보', warning: '주의', caution: '주의', danger: '위험' },
  ja: { note: '注記', tip: 'ヒント', info: '情報', warning: '警告', caution: '注意', danger: '危険' },
  th: { note: 'หมายเหตุ', tip: 'เคล็ดลับ', info: 'ข้อมูล', warning: 'คำเตือน', caution: 'ข้อควรระวัง', danger: 'อันตราย' },
};

const DEFAULT_FIGURE_LABELS: Record<string, string> = {
  en: 'Figure',
  ko: '그림',
  ja: '図',
  th: 'รูปที่',
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
  localizedStrings: Record<string, { userGuide: string; tableOfContents: string }>;
  admonitionTitles: Record<string, Record<string, string>>;
  figureLabels: Record<string, string>;

  pdfFilenameTemplate: string;
  pdfMetadata: { author: string; subject: string; creator: string };
  cjkFontPaths: string[];

  pathFallbacks: Record<string, string>;
  productName: string;

  agents?: AgentConfig;
  website?: WebsiteConfig;
}

export function resolveConfig(config: ToolkitConfig): ResolvedDocConfig {
  const projectRoot = config.projectRoot;
  return {
    title: config.title,
    subtitle: config.subtitle ?? 'User Guide',
    company: config.company,
    logoPath: config.logoPath ? path.resolve(projectRoot, config.logoPath) : null,
    logoFallbackHtml: config.logoFallbackHtml ?? `<div style="font-size:48px;color:#ff9d00;font-weight:bold;">${config.title}</div>`,

    projectRoot,
    srcDir: path.resolve(projectRoot, config.srcDir ?? 'src'),
    distDir: path.resolve(projectRoot, config.distDir ?? 'dist'),

    versionSource: path.resolve(projectRoot, config.versionSource ?? 'package.json'),
    version: config.version ?? null,

    languageLabels: { ...DEFAULT_LANGUAGE_LABELS, ...config.languageLabels },
    localizedStrings: mergeLocalizedStrings(DEFAULT_LOCALIZED_STRINGS, config.localizedStrings),
    admonitionTitles: mergeNestedRecord(DEFAULT_ADMONITION_TITLES, config.admonitionTitles),
    figureLabels: { ...DEFAULT_FIGURE_LABELS, ...config.figureLabels },

    pdfFilenameTemplate: config.pdfFilenameTemplate ?? '{title}_{version}_{lang}.pdf',
    pdfMetadata: {
      author: config.pdfMetadata?.author ?? config.company,
      subject: config.pdfMetadata?.subject ?? `${config.title}`,
      creator: config.pdfMetadata?.creator ?? 'docs-toolkit PDF Generator',
    },
    cjkFontPaths: config.cjkFontPaths ?? [],

    pathFallbacks: config.pathFallbacks ?? {},
    productName: config.productName ?? config.title,

    agents: config.agents,
    website: config.website,
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
      userGuide: strings.userGuide ?? defaults[lang]?.userGuide ?? defaults.en.userGuide,
      tableOfContents: strings.tableOfContents ?? defaults[lang]?.tableOfContents ?? defaults.en.tableOfContents,
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
  for (const key of new Set([...Object.keys(defaults), ...Object.keys(overrides)])) {
    result[key] = { ...defaults[key], ...overrides[key] };
  }
  return result;
}

// ── Config file loader ────────────────────────────────────────

const CONFIG_FILENAME = 'docs-toolkit.config.yaml';

export function loadToolkitConfig(projectRoot: string): ToolkitConfig {
  const configPath = path.resolve(projectRoot, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config file not found: ${configPath}\n` +
      `Run "docs-toolkit init" to create one, or create ${CONFIG_FILENAME} manually.`,
    );
  }
  const raw = parseYaml(fs.readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
  return { ...raw, projectRoot } as ToolkitConfig;
}
