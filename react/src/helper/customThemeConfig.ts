/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/**
 * The v2 appearance document (FR-3605): `theme` carries what feeds the Astryx
 * pipeline, `branding` the structural metadata no token can express. The same
 * shape is shipped as `resources/theme.json`. Seed values follow Astryx
 * `TokenValue` semantics: a string applies to both schemes, a `[light, dark]`
 * tuple splits them. v1 (antd-shaped) documents are NOT readable — see the
 * migration guide in the FR-3605 release notes.
 */
export type BAIThemeSeedValue = string | [light: string, dark: string];

export type BAIThemeSeeds = {
  /** Brand accent (was antd `colorPrimary`). Also seeds the brand role. */
  accent?: BAIThemeSeedValue;
  /** Link color (was `colorLink`); rendered as `--color-link`. */
  link?: BAIThemeSeedValue;
  /** Info color (was `colorInfo`); also seeds the admin role accent. */
  info?: BAIThemeSeedValue;
  error?: BAIThemeSeedValue;
  /** Success color; also seeds the secondary role accent. */
  success?: BAIThemeSeedValue;
  warning?: BAIThemeSeedValue;
};

export type BAIThemeFamily = {
  seeds?: BAIThemeSeeds;
  /** Header band background (was `components.Layout.headerBg`). */
  headerBg?: BAIThemeSeedValue;
};

export type BAIThemeConfig = {
  fontFamily?: string;
  /** Forces the sider chrome's polarity regardless of the page scheme. */
  siderMode?: 'light' | 'dark';
  /** Selectable families keyed by family id; `default` must exist. */
  families?: Record<string, BAIThemeFamily>;
};

export type LogoConfig = {
  src: string;
  srcCollapsed: string;
  srcDark?: string;
  srcCollapsedDark?: string;
  alt?: string;
  href?: string;
  size?: {
    width?: number;
    height?: number;
  };
  sizeCollapsed?: {
    width?: number;
    height?: number;
  };
  loginLogoSrc?: string;
  loginLogoSrcDark?: string;
  loginLogoSize?: {
    width?: number;
    height?: number;
  };
  aboutLogoSrc?: string;
  aboutLogoSrcDark?: string;
  aboutLogoSize?: {
    width?: number;
    height?: number;
  };
  /** @deprecated Use `aboutLogoSize` instead. */
  aboutModalSize?: {
    width?: number;
    height?: number;
  };
};

export type BAIBrandingConfig = {
  logo?: LogoConfig;
  companyName?: string;
  brandName?: string;
  /** Family selector labels keyed by family id; falls back to the id. */
  familyLabels?: Record<string, string>;
};

export const APPEARANCE_SCHEMA_VERSION = 2;

export type BAIAppearanceConfig = {
  $schema?: string;
  schemaVersion: typeof APPEARANCE_SCHEMA_VERSION;
  theme?: BAIThemeConfig;
  branding?: BAIBrandingConfig;
};

/**
 * Resolve a seed value for one scheme (string = both schemes). A tuple with
 * a missing/non-string dark entry reuses the light one, matching the theme
 * recipe's `seedPairFromValue`, so both consumers render the same color.
 */
export const pickSeed = (
  value: BAIThemeSeedValue | undefined,
  mode: 'light' | 'dark',
): string | undefined => {
  if (_.isString(value)) {
    return value;
  }
  if (_.isArray(value)) {
    const light = _.isString(value[0]) ? value[0] : undefined;
    if (mode === 'light') {
      return light;
    }
    return _.isString(value[1]) ? value[1] : light;
  }
  return undefined;
};

// eslint-disable-next-line no-console -- module-scope diagnostics; no logger exists outside React here
const warn = (message: string) => console.error(`[appearance] ${message}`);

/**
 * Accept only structurally valid v2 documents, and say why when one is not:
 * the operator's next step is the migration guide, never a silently default
 * theme. `default` must exist in `theme.families` (the family the app boots
 * into and falls back to).
 */
export const pickValidAppearanceConfig = (
  input: unknown,
  source: string,
): BAIAppearanceConfig | undefined => {
  if (!_.isPlainObject(input)) {
    warn(`${source} is not a JSON object; using the built-in defaults.`);
    return undefined;
  }
  const doc = input as Record<string, unknown>;
  if (doc.schemaVersion !== APPEARANCE_SCHEMA_VERSION) {
    if (_.isPlainObject(doc.light) || _.isPlainObject(doc.dark)) {
      warn(
        `${source} carries a v1 (antd-shaped) theme document; ` +
          'v2 is required since FR-3605 — see the theme migration guide.',
      );
    } else {
      warn(
        `${source} has no "schemaVersion": ${APPEARANCE_SCHEMA_VERSION} ` +
          `(got ${JSON.stringify(doc.schemaVersion)}); using the built-in defaults.`,
      );
    }
    return undefined;
  }
  const families = (doc.theme as Record<string, unknown> | undefined)?.families;
  if (
    _.isPlainObject(families) &&
    !_.isPlainObject((families as Record<string, unknown>).default)
  ) {
    warn(
      `${source} declares theme.families without a "default" entry; ` +
        'the default family falls back to the built-in seeds.',
    );
  }
  return doc as BAIAppearanceConfig;
};

type AppearanceStore = {
  /** The shipped/operator `resources/theme.json` (v2), untouched. */
  staticDoc?: BAIAppearanceConfig;
  /** `staticDoc` with the dev-server header color applied — what the providers render. */
  appliedDoc?: BAIAppearanceConfig;
};

const store: AppearanceStore = {};

/** The applied document. */
export const getCustomTheme = (): BAIAppearanceConfig | undefined =>
  store.appliedDoc;

/** The pristine shipped document (Branding editor seed/reset source). */
export const getStaticAppearanceConfig = (): BAIAppearanceConfig | undefined =>
  store.staticDoc;

const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
]);

function parseFontFamilies(fontFamily: string): string[] {
  return fontFamily
    .split(',')
    .map((f) => f.trim().replace(/^['"]|['"]$/g, ''))
    .filter((f) => f.length > 0)
    .filter((f) => !GENERIC_FAMILIES.has(f.toLowerCase()))
    .filter((f) => !f.startsWith('-'));
}

function normalizeFontName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function injectFontCSS(fontFamilies: string[]) {
  const seen = new Set<string>();
  for (const family of fontFamilies) {
    const normalized = normalizeFontName(family);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const href = `resources/fonts/${normalized}/${normalized}.css`;
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

const fetchStaticDoc = async (): Promise<BAIAppearanceConfig | undefined> => {
  let response: Response;
  try {
    response = await fetch('resources/theme.json');
  } catch (error) {
    warn(`theme.json could not be fetched (${String(error)}).`);
    return undefined;
  }
  if (!response.ok) {
    warn(`theme.json responded HTTP ${response.status}.`);
    return undefined;
  }
  try {
    return pickValidAppearanceConfig(await response.json(), 'theme.json');
  } catch (error) {
    warn(`theme.json is not valid JSON (${String(error)}).`);
    return undefined;
  }
};

/** The dev-server header color, applied to a copy so the shipped doc stays pristine. */
const applyDevServerHeaderColorOverride = (
  doc: BAIAppearanceConfig | undefined,
): BAIAppearanceConfig | undefined => {
  const headerColor = import.meta.env.DEV
    ? import.meta.env.VITE_THEME_HEADER_COLOR
    : undefined;
  if (!doc || !headerColor) {
    return doc;
  }
  const applied = _.cloneDeep(doc);
  for (const family of Object.values(applied.theme?.families ?? {})) {
    if (_.isPlainObject(family)) {
      family.headerBg = headerColor;
    }
  }
  return applied;
};

/**
 * One-shot appearance bootstrap: theme.json is fetched and a single
 * `custom-theme-loaded` event fires once it has settled — including when
 * the document is unusable, so listeners never wait forever.
 */
export const loadCustomThemeConfig = () => {
  fetchStaticDoc()
    .then((staticDoc) => {
      store.staticDoc = staticDoc;
      store.appliedDoc = applyDevServerHeaderColorOverride(staticDoc);

      const fontFamily = store.appliedDoc?.theme?.fontFamily;
      if (_.isString(fontFamily) && fontFamily) {
        injectFontCSS(parseFontFamilies(fontFamily));
      }
    })
    .catch((error) => {
      warn(`appearance bootstrap failed (${String(error)}).`);
    })
    .finally(() => {
      document.dispatchEvent(new CustomEvent('custom-theme-loaded'));
    });
};
