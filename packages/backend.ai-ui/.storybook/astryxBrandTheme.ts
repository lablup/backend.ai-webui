/**
 * Backend.AI brand Astryx theme for Storybook (to-astryx ticket 32).
 *
 * Storybook's Vite build lives in a different workspace package than
 * `react/`, so it cannot import the app's theme builder
 * (`react/src/astryx-theme/backendAiTheme.ts`). This mirrors its brand-role
 * recipe over the SAME inputs: BUI's parity tables and `--bai-*` builder
 * (`src/theme`), and a copy of `resources/theme.json` (`./theme.json`, v2).
 * Like the app, it holds no brand values of its own: a seed the document
 * leaves out is not pinned, so Astryx's default applies.
 *
 * KEEP IN SYNC (pinned token values, not the glue code) with
 * `buildBackendAiTheme({ role: 'brand' })`.
 */
import {
  ANTD_ALIGN_TOKENS,
  buildBaiCustomTokens,
  toSeedTuple,
  type BrandSeedPair,
} from '../src/theme';
import webuiThemeJson from './theme.json';
import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/** v2 seed value -> declared pair (string = both schemes, tuple = split). */
const toPair = (
  value: string | string[] | undefined,
): BrandSeedPair | undefined => {
  if (typeof value === 'string') return { light: value, dark: value };
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return { light: value[0], dark: value[1] ?? value[0] };
  }
  return undefined;
};

/** Astryx muted status surfaces = the status color at ~20%/25% alpha. */
const toMutedTuple = (
  tuple: [string, string] | undefined,
): [string, string] | undefined =>
  tuple &&
  /^#[0-9a-fA-F]{6}$/.test(tuple[0]) &&
  /^#[0-9a-fA-F]{6}$/.test(tuple[1])
    ? [`${tuple[0]}33`, `${tuple[1]}3F`]
    : undefined;

const family = webuiThemeJson.theme.families.default;
const familySeeds = family.seeds as Record<string, string | string[] | undefined>;
const seeds = {
  accent: toPair(familySeeds.accent),
  link: toPair(familySeeds.link),
  info: toPair(familySeeds.info),
  error: toPair(familySeeds.error),
  success: toPair(familySeeds.success),
  warning: toPair(familySeeds.warning),
  headerBg: toPair(family.headerBg),
};

const accent = seeds.accent && toSeedTuple(seeds.accent);
const error = seeds.error && toSeedTuple(seeds.error);
const success = seeds.success && toSeedTuple(seeds.success);
const warning = seeds.warning && toSeedTuple(seeds.warning);
const fontFamily: string | undefined = webuiThemeJson.theme.fontFamily;

const errorMuted = toMutedTuple(error);
const successMuted = toMutedTuple(success);
const warningMuted = toMutedTuple(warning);

/**
 * Backend.AI brand Astryx theme — Storybook's build of the app's brand theme
 * (ticket 02), and the `webui` half of the "Theme" toolbar (themeConfig.ts).
 * The `astryx` half mounts `neutralTheme` instead, so a story can be checked
 * against a brand-less baseline.
 */
export const astryxBrandTheme = defineTheme({
  name: 'storybook-bai-brand',
  extends: neutralTheme,
  ...(seeds.accent ? { color: { accent: seeds.accent.light } } : {}),
  tokens: {
    ...(accent
      ? {
          '--color-accent': accent,
          '--color-text-accent': accent,
          '--color-icon-accent': accent,
          '--color-on-accent': ['#ffffff', '#ffffff'] as [string, string],
        }
      : {}),
    ...(error ? { '--color-error': error } : {}),
    ...(success ? { '--color-success': success } : {}),
    ...(warning ? { '--color-warning': warning } : {}),
    ...(errorMuted ? { '--color-error-muted': errorMuted } : {}),
    ...(successMuted ? { '--color-success-muted': successMuted } : {}),
    ...(warningMuted ? { '--color-warning-muted': warningMuted } : {}),
    ...(fontFamily
      ? {
          '--font-family-body': fontFamily,
          '--font-family-heading': fontFamily,
        }
      : {}),
    ...buildBaiCustomTokens(seeds),
    ...ANTD_ALIGN_TOKENS,
    // KEEP IN SYNC with `ANTD_NEUTRAL_TEXT`, `ANTD_NEUTRAL_SURFACES` and
    // `ANTD_NEUTRAL_BORDERS` in `react/src/astryx-theme/backendAiTheme.ts`.
    // All three neutral families are mirrored: unpinned, Astryx derives them
    // from the accent and stories render on a warm pink-beige canvas the app
    // never shows (FR-3500 review, 2026-08-12).
    '--color-text-primary': ['#141414', '#FFFFFF'] as [string, string],
    '--color-text-secondary': ['rgba(0,0,0,0.65)', 'rgba(255,255,255,0.65)'] as [
      string,
      string,
    ],
    '--color-text-disabled': ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'] as [
      string,
      string,
    ],
    '--color-icon-primary': ['#141414', '#FFFFFF'] as [string, string],
    '--color-icon-secondary': ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'] as [
      string,
      string,
    ],
    '--color-icon-disabled': ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'] as [
      string,
      string,
    ],
    '--color-background-body': ['#F7F7F6', '#191919'] as [string, string],
    '--color-background-surface': ['#FFFFFF', '#141414'] as [string, string],
    '--color-background-card': ['#FFFFFF', '#141414'] as [string, string],
    '--color-background-popover': ['#FFFFFF', '#1F1F1F'] as [string, string],
    '--color-background-muted': [
      'rgba(0,0,0,0.04)',
      'rgba(255,255,255,0.08)',
    ] as [string, string],
    '--color-neutral': ['rgba(0,0,0,0.06)', '#262626'] as [string, string],
    '--color-overlay': ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)'] as [
      string,
      string,
    ],
    '--color-skeleton': ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.18)'] as [
      string,
      string,
    ],
    '--color-border': ['#F0F0F0', '#303030'] as [string, string],
    '--color-border-emphasized': ['#D9D9D9', '#424242'] as [string, string],
    // KEEP IN SYNC with the interaction fills in `ANTD_NEUTRAL_SURFACES`
    // (catalog G-4) — without them dark-mode stories have no hover state.
    '--color-overlay-hover': ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)'] as [
      string,
      string,
    ],
    '--color-overlay-pressed': [
      'rgba(0,0,0,0.15)',
      'rgba(255,255,255,0.18)',
    ] as [string, string],
  },
  // KEEP IN SYNC with `STATUS_TEXT_COLORS` in
  // `react/src/astryx-theme/backendAiTheme.ts` (to-astryx phase 3, ticket A).
  // `BAIText type="danger|warning|success"` renders `Text color="danger|…"`,
  // which Astryx resolves to the `primary` StyleX baseline plus theme CSS —
  // without these three keys the semantic types render as plain body text in
  // Storybook while looking correct in the app, which is exactly the kind of
  // silent divergence this mirror file exists to prevent.
  components: {
    // KEEP IN SYNC with `ANTD_HOVER_PARITY.button` in
    // `react/src/astryx-theme/backendAiTheme.ts` — without it Storybook keeps
    // rendering the FR-3555 defect the app no longer has.
    button: {
      'variant:primary': {
        '--color-accent': 'var(--color-text-accent)',
      },
    },
    text: {
      'color:danger': { color: 'var(--color-error)' },
      'color:warning': { color: 'var(--color-warning)' },
      'color:success': { color: 'var(--color-success)' },
    },
    heading: {
      'color:danger': { color: 'var(--color-error)' },
      'color:warning': { color: 'var(--color-warning)' },
      'color:success': { color: 'var(--color-success)' },
    },
    // KEEP IN SYNC with `ANTD_DIALOG_SURFACE` in
    // `react/src/astryx-theme/backendAiTheme.ts` (audit 1, catalog O-1/O-10;
    // the heading-2 pin is approved-1b — `DialogHeader` hard-codes
    // `Heading level={2}`, and antd's `.ant-modal-title` was 16px/1.5).
    dialog: {
      base: {
        padding: '16px 24px',
        backgroundColor: 'var(--color-background-popover)',
        '--text-heading-2-size': '16px',
        '--text-heading-2-leading': '1.5',
      },
    },
  },
});
