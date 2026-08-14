/**
 * Backend.AI brand Astryx theme for Storybook (to-astryx ticket 32).
 *
 * Before this file, no `<Theme>` from `@astryxdesign/core/theme` was ever
 * mounted in the preview — Astryx-native components (`BAITable`,
 * `BAIComplexSelect`, PowerSearch, …) fell back to `@astryxdesign/theme-
 * neutral`'s default palette (imported globally in `astryx.css`), not the
 * Backend.AI brand. `ThemeShimProvider` (ticket 10) only feeds antd-shaped
 * seed tokens to the LEGACY antd-consuming BUI surfaces; it does not mount
 * an Astryx `<Theme>`, so it never themed the Astryx-native ones.
 *
 * Storybook's Vite build lives in a different workspace package than
 * `react/`, so it cannot import the app's real theme builder
 * (`react/src/astryx-theme/backendAiTheme.ts`) — that file is "pure" (no
 * React, no app hooks) but still lives under `react/src`. This mirrors its
 * brand-role recipe (ticket 02: `buildBackendAiTheme({ role: 'brand' })`)
 * using the SAME measured parity tables — re-exported by BUI's own
 * `theme-shim` (ticket 10), so they cannot drift between the app and this
 * file — and the SAME seeds as `resources/theme.json` (mirrored locally as
 * `./theme.json`, already consumed by `themeConfig.ts` for the antd side).
 *
 * KEEP IN SYNC (seed values only, not the glue code) with
 * `react/src/astryx-theme/backendAiTheme.ts` `BAI_DEFAULT_SEEDS` /
 * `buildBackendAiTheme({ role: 'brand' })`.
 */
import { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from '../src/theme-shim';
import webuiThemeJson from './theme.json';
import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/** Map a declared dark seed to antd darkAlgorithm's measured output for it. */
const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ?? seed;

const toTuple = (light: string, dark: string): [string, string] => [
  light,
  resolveDarkSeed(dark),
];

/** Astryx muted status surfaces = the status color at ~20%/25% alpha. */
const toMutedTuple = (
  tuple: [string, string],
): [string, string] | undefined =>
  /^#[0-9a-fA-F]{6}$/.test(tuple[0]) && /^#[0-9a-fA-F]{6}$/.test(tuple[1])
    ? [`${tuple[0]}33`, `${tuple[1]}3F`]
    : undefined;

const light = webuiThemeJson.light.token;
const dark = webuiThemeJson.dark.token;

const accent = toTuple(light.colorPrimary, dark.colorPrimary);
const error = toTuple(light.colorError, dark.colorError);
const success = toTuple(light.colorSuccess, dark.colorSuccess);
// theme.json declares no colorWarning — antd's own default seed (ticket 02).
const warning = toTuple('#FAAD14', '#FAAD14');
const fontFamily = light.fontFamily;

const errorMuted = toMutedTuple(error);
const successMuted = toMutedTuple(success);
const warningMuted = toMutedTuple(warning);

/**
 * Backend.AI brand Astryx theme — Storybook's build of `backendAiBrandTheme`
 * (ticket 02). Mounted unconditionally in `decorators.tsx` so every story
 * (legacy and Astryx-native alike) renders against the real brand palette in
 * both light and dark, independent of the "Theme Style" (antd-only) toolbar.
 */
export const astryxBrandTheme = defineTheme({
  name: 'storybook-bai-brand',
  extends: neutralTheme,
  color: { accent: light.colorPrimary },
  tokens: {
    '--color-accent': accent,
    '--color-text-accent': accent,
    '--color-icon-accent': accent,
    '--color-on-accent': ['#ffffff', '#ffffff'],
    '--color-error': error,
    '--color-success': success,
    '--color-warning': warning,
    ...(errorMuted ? { '--color-error-muted': errorMuted } : {}),
    ...(successMuted ? { '--color-success-muted': successMuted } : {}),
    ...(warningMuted ? { '--color-warning-muted': warningMuted } : {}),
    '--font-family-body': fontFamily,
    '--font-family-heading': fontFamily,
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
    '--color-overlay-hover': ['rgba(0,0,0,0.06)', '#262626'] as [string, string],
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
