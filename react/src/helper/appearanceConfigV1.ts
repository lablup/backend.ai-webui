/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  APPEARANCE_SCHEMA_VERSION,
  type BAIAppearanceConfig,
  type BAIBrandingConfig,
  type BAIThemeConfig,
  type BAIThemeFamily,
  type BAIThemeSeedValue,
  type BAIThemeSeeds,
  type LogoConfig,
} from './customThemeConfig';
import * as _ from 'lodash-es';

/**
 * The v1 (antd-shaped) appearance document, as far as v2 reads it. The loader
 * has not accepted this shape since FR-3605; the Branding page converts it on
 * import so an operator's existing `theme.json` has a path forward.
 */
type V1Scheme = {
  token?: Record<string, unknown>;
  components?: Record<string, Record<string, unknown> | undefined>;
};

type V1Family = {
  light?: V1Scheme;
  dark?: V1Scheme;
  label?: unknown;
};

type V1AppearanceConfig = {
  $schema?: unknown;
  fontFamily?: unknown;
  light?: V1Scheme;
  dark?: V1Scheme;
  families?: Record<string, V1Family | undefined>;
  logo?: Record<string, unknown>;
  sider?: { theme?: unknown };
  branding?: { companyName?: unknown; brandName?: unknown };
};

/** antd token name → v2 seed name (the FR-3605 v1 → v2 field map). */
const SEED_BY_TOKEN = {
  colorPrimary: 'accent',
  colorLink: 'link',
  colorInfo: 'info',
  colorError: 'error',
  colorSuccess: 'success',
  colorWarning: 'warning',
} as const satisfies Record<string, keyof BAIThemeSeeds>;

/** v1 and v2 spell the logo block identically; anything else is dropped. */
const LOGO_KEYS = [
  'src',
  'srcCollapsed',
  'srcDark',
  'srcCollapsedDark',
  'alt',
  'href',
  'size',
  'sizeCollapsed',
  'loginLogoSrc',
  'loginLogoSrcDark',
  'loginLogoSize',
  'aboutLogoSrc',
  'aboutLogoSrcDark',
  'aboutLogoSize',
  'aboutModalSize',
] as const satisfies ReadonlyArray<keyof LogoConfig>;

/** Seeds are 6-digit hex only; a 3-digit v1 value expands, anything else drops. */
const normalizeHex = (value: unknown): string | undefined => {
  if (!_.isString(value)) {
    return undefined;
  }
  const hex = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return hex;
  }
  const short = /^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/.exec(hex);
  return short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : undefined;
};

const trimmedString = (value: unknown): string | undefined =>
  _.isString(value) && value.trim().length > 0 ? value.trim() : undefined;

const firstString = (...values: Array<unknown>): string | undefined =>
  _.find(values.map(trimmedString), (value) => !_.isNil(value));

/** A value equal in both schemes stays a string, as the document skeleton has it. */
const pairOf = (
  light: string | undefined,
  dark: string | undefined,
): BAIThemeSeedValue | undefined => {
  if (light && dark) {
    return light === dark ? light : [light, dark];
  }
  return light ?? dark;
};

const familyFrom = (light?: V1Scheme, dark?: V1Scheme): BAIThemeFamily => {
  const seeds: BAIThemeSeeds = {};
  _.forEach(SEED_BY_TOKEN, (seedKey, tokenKey) => {
    const seed = pairOf(
      normalizeHex(light?.token?.[tokenKey]),
      normalizeHex(dark?.token?.[tokenKey]),
    );
    if (seed) {
      seeds[seedKey] = seed;
    }
  });
  // headerBg is applied verbatim as CSS, so any color notation survives.
  const headerBg = pairOf(
    trimmedString(light?.components?.Layout?.headerBg),
    trimmedString(dark?.components?.Layout?.headerBg),
  );
  return {
    ...(_.isEmpty(seeds) ? {} : { seeds }),
    ...(headerBg ? { headerBg } : {}),
  };
};

/**
 * A document is v1 when it is not a v2 one and still carries a v1-only block.
 * A v2 document missing its `schemaVersion` keeps its `theme` block, so it is
 * left alone rather than run through a conversion that would empty it.
 */
export const isV1AppearanceConfig = (input: unknown): boolean => {
  if (!_.isPlainObject(input)) {
    return false;
  }
  const doc = input as Record<string, unknown>;
  if (
    doc.schemaVersion === APPEARANCE_SCHEMA_VERSION ||
    _.isPlainObject(doc.theme)
  ) {
    return false;
  }
  return _.some(['light', 'dark', 'sider', 'logo'], (key) =>
    _.isPlainObject(doc[key]),
  );
};

/**
 * Convert a v1 document to the v2 structure, dropping every v1 key no v2
 * consumer reads. Dark values are carried over as declared — antd's
 * `darkAlgorithm` used to re-map them, v2 pins them verbatim.
 */
export const migrateV1AppearanceConfig = (
  input: unknown,
): BAIAppearanceConfig | undefined => {
  if (!isV1AppearanceConfig(input)) {
    return undefined;
  }
  const doc = input as V1AppearanceConfig;

  const families: Record<string, BAIThemeFamily> = {
    default: familyFrom(doc.light, doc.dark),
  };
  const familyLabels: Record<string, string> = {};
  _.forEach(doc.families, (family, id) => {
    // v1 synthesized `default` from the top-level light/dark and ignored a
    // `default` entry here; that precedence is kept.
    if (id === 'default' || !_.isPlainObject(family)) {
      return;
    }
    families[id] = familyFrom(family?.light, family?.dark);
    const label = trimmedString(family?.label);
    if (label) {
      familyLabels[id] = label;
    }
  });

  const fontFamily = firstString(
    doc.fontFamily,
    doc.light?.token?.fontFamily,
    doc.dark?.token?.fontFamily,
  );
  const siderTheme = doc.sider?.theme;
  const siderMode =
    siderTheme === 'dark' || siderTheme === 'light' ? siderTheme : undefined;
  const theme: BAIThemeConfig = {
    ...(fontFamily ? { fontFamily } : {}),
    ...(siderMode ? { siderMode } : {}),
    families,
  };

  const logo = _.pick(doc.logo ?? {}, LOGO_KEYS);
  const companyName = trimmedString(doc.branding?.companyName);
  const brandName = trimmedString(doc.branding?.brandName);
  const branding: BAIBrandingConfig = {
    ...(_.isEmpty(logo) ? {} : { logo: logo as LogoConfig }),
    ...(companyName ? { companyName } : {}),
    ...(brandName ? { brandName } : {}),
    ...(_.isEmpty(familyLabels) ? {} : { familyLabels }),
  };

  return {
    ...(trimmedString(doc.$schema) ? { $schema: doc.$schema as string } : {}),
    schemaVersion: APPEARANCE_SCHEMA_VERSION,
    theme,
    ...(_.isEmpty(branding) ? {} : { branding }),
  };
};
