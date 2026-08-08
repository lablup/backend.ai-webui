/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Backend.AI brand theme on Astryx `defineTheme()` (to-astryx ticket 02).

 This module is PURE (no React, no app hooks) so it can be consumed by
 - the app-level providers (`AstryxBrandTheme` / `AstryxAdminTheme` /
   `AstryxSecondaryTheme`),
 - the `astryx theme build` production entry (`built/backendai-default.ts`),
 - standalone probes/harnesses that run without the app shell.

 ## Seeds

 Seeded from `resources/theme.json` (the operator-editable runtime document):
 `colorPrimary` (brand accent), `colorInfo` (admin accent), `colorSuccess`
 (secondary accent + success), `colorError`, `fontFamily`. `colorWarning` is
 not declared there, so the antd default seed applies.

 ## Dark tuples — SETTLED DECISION (2026-08-07, MIGRATION-SPEC §1-③)

 antd's `darkAlgorithm` does not merely swap palettes — it transforms the
 brand seeds themselves (`#DC6B03` declared → `#be5e06` rendered). The current
 dark UI shows the TRANSFORMED values, so to keep today's appearance the
 `[light, dark]` tuples pin the dark side to the MEASURED darkAlgorithm
 outputs (see `ANTD_DARK_ALGORITHM_OUTPUT`), not the raw theme.json seeds.
 Measurements come from `theme.getDesignToken()` A/B captures (ticket 06).

 PILOT-DECISION (ticket 02): for dark seeds NOT in the measured table (an
 operator rebrands via theme.json at runtime), the declared dark seed is used
 verbatim instead of re-implementing antd's dark derivation (~250 LOC vendor).
 A rebranded deployment then gets "seed-direct" dark colors — acceptable per
 the simplicity policy; revisit only if a real deployment reports it.

 ## Theme name numbering (채번 규칙)

 A theme's `name` IS its identity: it becomes the `data-astryx-theme`
 attribute, and two `defineTheme()` calls sharing a name fight over one
 attribute — the FIRST registration silently wins (measured in the pilot).
 With 4 selectable theme families (default/stained/glass/reverie/bliss ×
 light/dark) plus per-role accents (brand/admin/secondary) plus runtime
 theme.json overrides, names are therefore DERIVED, never hardcoded:

     bai-r{REV}-{family}-{role}-{hash}

 - `REV` (`THEME_NAME_REV`): bumped whenever the static recipe in this file
   changes (align tokens, muted formula, …), so a recipe change can never be
   masked by a stale registration or stale built CSS.
 - `family`: theme-family key (`default`, `stained`, …) — readability only.
 - `role`: `brand` | `admin` | `secondary` — readability only.
 - `hash`: djb2 over every CSS-affecting seed. This is the correctness part:
   any seed change (even a single status color) yields a new name, so a
   runtime override can never silently no-op against a same-named
   registration, and identical seed sets share one registration via the
   build cache below.
 */
import { defineTheme, type DefinedTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';
import { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from 'backend.ai-ui';

// The measured parity tables moved into BUI's theme-shim with the shim itself
// (ticket 10 — BUI cannot import from react/src). Re-exported here so this
// module keeps its ticket-02 public API.
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT };

/** Bump when the static recipe (align tokens, formulas) changes. */
export const THEME_NAME_REV = 6;

/**
 * NEUTRAL BACKGROUND FAMILY — pinned to the measured legacy antd values.
 *
 * ## The defect
 *
 * Users reported that everything from the boot curtain to the post-login
 * screens had gone warm/yellowish ("누리끼리") against the legacy app's cool
 * neutral greys. Measured on `to-astryx` before this change:
 *
 *   body      light rgb(250,239,233) = #FAEFE9   dark rgb(24,15,8)  = #180F08
 *   surface   light rgb(255,251,248) = #FFFBF8   dark rgb(33,26,22) = #211A16
 *
 * ## Root cause
 *
 * `defineTheme({ color: { accent } })` runs Astryx's HCT generator over the
 * accent seed, and that generator derives the ENTIRE neutral ramp —
 * backgrounds, surfaces, text, borders — as low-chroma tints of the accent
 * hue. Astryx's own default theme is blue-accented, which is why its stock
 * neutrals are cool (`--color-background-body: #F1F4F7`). Seed the same
 * generator with Backend.AI's brand orange and the identical machinery emits
 * brown-tinted neutrals. Nothing was "wrong"; the tint is the accent, working
 * as designed.
 *
 * The canonical knob for this is `color.neutralStyle` (`warm|cool|neutral`),
 * and it was tried first (probe, `astryx theme build` on all three values):
 * `cool` emitted byte-identical output to the default, and `neutral` only
 * moved `#FAEFE9 -> #F6EFEC` — the accent hue still dominates. Dropping
 * `color.accent` entirely does neutralise the ramp (`#F0F0F6`) but also
 * collapses the derived accent ramp to grey, which the ticket-02 pilot
 * measured as load-bearing. So the background family is pinned explicitly
 * instead; `defineTheme` documents token overrides as taking precedence over
 * scale-generated values, and this is the same mechanism `ANTD_ALIGN_TOKENS`
 * already uses.
 *
 * ## The legacy targets (measured, not guessed)
 *
 * `theme.getDesignToken()` run over the shipped `resources/theme.json` seeds
 * for the default family, light + `darkAlgorithm`
 * (`.scratch/astryx-migration/antd-neutral-tokens.mjs`):
 *
 *   colorBgLayout     #f5f5f5              / #000000
 *   colorBgContainer  #ffffff              / #141414
 *   colorBgElevated   #ffffff              / #1f1f1f
 *   colorFillTertiary rgba(0,0,0,0.04)     / rgba(255,255,255,0.08)
 *   colorFillSecondary rgba(0,0,0,0.06)    / #262626
 *
 * The PAGE BACKDROP is the one value that is not simply `colorBgLayout`:
 * legacy `MainLayout` painted its `Layout` `transparent`, so what the user
 * actually saw was `<body>`, which `resources/webui.css` set to `#F7F7F6`
 * (light) and `#191919` (`body.dark-theme`). Those are the values pinned
 * here — they are what the legacy build rendered, and they also keep the boot
 * curtain (`index.html`, which reads `--color-background-body`) identical to
 * legacy.
 *
 * Cross-check that this is the right mapping: `resources/theme.json` sets
 * `Layout.lightSiderBg: #FFF` / `siderBg: #141414`, and the sider is painted
 * from `--color-background-surface` (see `SIDE_NAV_DENSITY`) — so pinning
 * surface to #FFFFFF/#141414 reproduces the legacy rail exactly.
 *
 * ## Scope — the NEUTRAL BACKGROUND family only
 *
 * Deliberately NOT touched, so brand-accent surfaces survive: `--color-accent`
 * and its ramp, every `--color-{status}`, the `--color-background-{hue}`
 * chips, and the accent-tinted TEXT/BORDER/ICON tokens (`--color-text-primary`
 * `#211A16`, `--color-border` at 10% alpha, `--color-track`). Those are either
 * intentionally brand-tinted or so low-alpha that the hue is not perceptible;
 * re-deriving them is a separate, larger decision.
 * `--color-background-inverted` is also left alone: antd's counterpart
 * (`colorBgSpotlight`) is `rgba(0,0,0,0.85)`/`#424242`, i.e. NOT an inversion
 * in dark mode, so adopting it would break the Astryx semantic.
 */
const ANTD_NEUTRAL_SURFACES = {
  // The page backdrop. Legacy `<body>` (webui.css) — the visible surface,
  // since legacy `Layout` was transparent. antd's `colorBgLayout` (#f5f5f5 /
  // #000000) is the same role and within a hair of the light value.
  '--color-background-body': ['#F7F7F6', '#191919'] as [string, string],
  // antd `colorBgContainer` — cards, tables, the sider rail, popovers' base.
  '--color-background-surface': ['#FFFFFF', '#141414'] as [string, string],
  '--color-background-card': ['#FFFFFF', '#141414'] as [string, string],
  // antd `colorBgElevated` — dropdowns, popovers, modals.
  '--color-background-popover': ['#FFFFFF', '#1F1F1F'] as [string, string],
  // antd `colorFillTertiary` — the subtle "muted surface" fill.
  '--color-background-muted': [
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.08)',
  ] as [string, string],
  // antd `colorFillSecondary` (theme.json declares the dark value directly) —
  // the neutral component fill: secondary buttons, chips, selected nav rows.
  '--color-neutral': ['rgba(0,0,0,0.06)', '#262626'] as [string, string],
  // antd `colorBgMask` — the modal/drawer scrim. Same value in both modes.
  '--color-overlay': ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)'] as [
    string,
    string,
  ],
  // antd `colorFill` — the Skeleton bar. In scope because the loading
  // skeletons are the FIRST thing after the boot curtain on every route, so
  // a warm skeleton is squarely inside the reported symptom ("everything from
  // the loading curtain to the post-login screens"). Astryx's default was an
  // opaque `#B8A89F`/`#51443C`; antd's was this alpha over the surface.
  '--color-skeleton': ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.18)'] as [
    string,
    string,
  ],
};

/**
 * NEUTRAL BORDER FAMILY — the second half of the same defect, pinned to the
 * measured legacy antd values.
 *
 * ## The defect
 *
 * A user reported that the breadcrumb bar's bottom rule reads noticeably
 * darker and warmer than legacy. Measured on `to-astryx` before this change,
 * on `[data-testid="webui-breadcrumb"]`:
 *
 *   border-bottom-color  rgb(157,142,133) = #9D8E85   (legacy: #d9d9d9)
 *
 * ## Root cause — the same generator, one family further out
 *
 * `WebUIBreadcrumb` asks for `token.colorBorder`, and the theme-shim maps
 * `colorBorder -> --color-border-emphasized` (`theme-shim/mapping.ts`). That
 * mapping is CORRECT — antd's two-step border ramp is
 * `colorBorder` (#d9d9d9, the stronger rule) over `colorBorderSecondary`
 * (#f0f0f0, the hairline), which is exactly Astryx's
 * `--color-border-emphasized` over `--color-border`. What was wrong is the
 * VALUE: like the background family above, both border tokens are derived by
 * Astryx's HCT generator from the brand accent, so seeding it with
 * Backend.AI orange yields warm greys (`#9D8E85`, `#74655D`).
 *
 * `ANTD_NEUTRAL_SURFACES` deliberately left the border tokens alone, on the
 * reasoning that they are "so low-alpha that the hue is not perceptible".
 * That holds for `--color-border` (10% alpha) but NOT for
 * `--color-border-emphasized`, which is a fully opaque mid-grey — the user
 * saw it immediately. Both are pinned here so the ramp stays internally
 * consistent (a hairline lighter than the rule) rather than mixing one
 * generated and one legacy value.
 *
 * ## The legacy targets (measured, not guessed)
 *
 * `theme.getDesignToken()` over the shipped `resources/theme.json` seeds,
 * light + `darkAlgorithm` — both are neutral constants in antd, independent
 * of the brand seed:
 *
 *   colorBorder           #d9d9d9  /  #424242
 *   colorBorderSecondary  #f0f0f0  /  #303030
 *
 * `colorSplit` also maps to `--color-border`; antd's own `colorSplit` is
 * `rgba(5,5,5,0.06)` over the container, which resolves to #f0f0f0 on white
 * — the same value, so one pin serves both use sites.
 */
const ANTD_NEUTRAL_BORDERS = {
  // antd `colorBorderSecondary` / `colorSplit` — card outlines, table row
  // rules, dividers. The hairline step.
  '--color-border': ['#F0F0F0', '#303030'] as [string, string],
  // antd `colorBorder` — input outlines, the breadcrumb rule, any border the
  // user is meant to read as a real edge. The emphasized step.
  '--color-border-emphasized': ['#D9D9D9', '#424242'] as [string, string],
};

/**
 * STATUS (SEMANTIC) COLOR FAMILY — pinned to the legacy antd values.
 *
 * The status HUES themselves already come from `resources/theme.json` through
 * `BAI_DEFAULT_SEEDS` (`--color-error`/`--color-success`/`--color-warning`
 * below, plus their `-muted` steps), so those needed no change. What was
 * NOT pinned is the ON-colour — the text/icon that sits on a solid status
 * fill — which `neutralTheme` derives for contrast and therefore FLIPS with
 * the mode:
 *
 *   --color-on-error    light #ffffff / dark #171717   (measured)
 *   --color-on-success  light #ffffff / dark #171717   (measured)
 *
 * antd had exactly one token for this, `colorTextLightSolid`, and it is
 * `#fff` in BOTH light and dark (measured; it is the same constant under
 * `darkAlgorithm`). So legacy error/success chips carried white text in both
 * modes, while today's dark mode inverts them to near-black — a mode-blind
 * inconsistency of the same class this migration keeps removing. Pinned to
 * white, which also matches `--color-on-accent` (already `#ffffff` in both
 * modes for the same reason).
 *
 * `--color-on-warning` is deliberately NOT pinned. antd never painted text
 * on a SOLID warning fill — its warning surfaces are `colorWarningBg` +
 * `colorText` (Alert) or `colorWarningBg` + `colorWarning` (Tag) — so there
 * is no legacy value to match, and Astryx's `#171717` is the legible choice
 * on `#FAAD14` (white on that yellow is ~1.9:1). Leaving the Astryx default
 * is the visual-values policy working as intended.
 */
const ANTD_STATUS_ON_COLORS = {
  // antd `colorTextLightSolid` — #fff in both algorithms.
  '--color-on-error': ['#ffffff', '#ffffff'] as [string, string],
  '--color-on-success': ['#ffffff', '#ffffff'] as [string, string],
};

/**
 * Sidebar navigation density — THEME DEFAULTS, not per-component CSS.
 *
 * antd expressed this as `ConfigProvider theme.components.Menu` tokens in
 * `BAIMenu` (`itemHeight: 40`, `itemBorderRadius: 20`, `fontSize:
 * fontSizeLG`, item `padding-inline: token.padding`) plus a `createStyles`
 * block for the group headers. Ticket 24 dropped that block on the reasoning
 * that "Astryx's nav-item styling is theme-owned and its enums are closed" —
 * correct about the enums, but the conclusion skipped the part that IS open:
 * `defineTheme({components})` targets Astryx's semantic component keys
 * (`side-nav-item`, `side-nav-heading`) and emits `@layer astryx-theme` CSS,
 * which outranks the components' own `@layer astryx-base` StyleX output.
 * So the density lands here, in the theme, exactly once — no CSS sprinkled on
 * `BAISider`/`BAIMenu`, and every deployment/theme family inherits it.
 *
 * Values are the legacy antd numbers, converted where the box model differs:
 *
 *   antd token                      | Astryx declaration
 *   --------------------------------|-------------------------------------
 *   Menu.itemHeight: 40             | height: 40px   (was --size-element-md, 32px)
 *   Menu.itemMarginBlock: 4 (antd   | marginBlock: 2px — antd's items are in
 *     default; adjacent margins     |   normal flow so 4+4 collapsed to a
 *     collapse -> 44px pitch)       |   44px pitch; SideNav's column is FLEX,
 *                                   |   where margins do NOT collapse, so 2px
 *                                   |   each side reproduces the same pitch.
 *   Menu.itemBorderRadius: 20       | borderRadius: 20px (pill; Astryx
 *                                   |   default is --radius-element = 8px)
 *   Menu.fontSize: fontSizeLG (16)  | fontSize: 16px (Astryx default 14px)
 *   item padding-inline: padding    | paddingInline: 24px — legacy put the row
 *     (16) + itemMarginInline (16)  |   content 32px from the rail edge;
 *                                   |   SideNav's scroll column already
 *                                   |   contributes 8px, so 24px here lands on
 *                                   |   the same 32px.
 *   group title padding-top:        | side-nav-section paddingBlockStart: 16px
 *     paddingMD (20)                |   — `SideNavSection`'s own header adds
 *                                   |   `--spacing-1` (4px) on top, so 16
 *                                   |   here lands on the legacy 20px gap.
 *                                   |   (Astryx default is --spacing-1, 4px)
 *
 * STILL not portable, and now overridden elsewhere: the group title's
 * `padding-left: paddingXL` and `font-weight: 500`. `SideNavSection` renders
 * its title as a bare `<span>` inside a bare `<div>` header, neither carrying
 * an `astryx-*` class, and `defineTheme({components})` can only emit
 * `.astryx-<name><variant-classes>` — style keys become CLASS SUFFIXES on the
 * element that owns the class (see the CLI's `parseStyleKey`), never
 * descendant combinators. Ticket 24 deferred those two values on the
 * visual-values policy; the user has since asked for the legacy metrics, so
 * they live in `react/src/components/BAISider.css`, scoped to `.bai-sider` and
 * expressed in Astryx tokens. That file carries the justification. `color` is
 * still NOT overridden anywhere — antd's `groupTitleColor`
 * (`colorTextDescription`) and Astryx's `--color-text-secondary` are the same
 * role, so the Astryx default stands.
 */
/**
 * STATUS TEXT COLORS — `Typography.Text type="danger|warning|success"` as
 * THEME-DEFINED custom `Text`/`Heading` colors (to-astryx phase 3, ticket A).
 *
 * antd's `Typography.Text` carried four semantic `type`s; Astryx's `TextColor`
 * ships `primary | secondary | disabled | placeholder | accent | inherit` and
 * has NO danger/warning/success (MAPPING §3.4 calls this out as "a design
 * decision, 12 times" — measured 14 live call sites in this repo:
 * `type="danger"` ×8, `type="success"` ×3, `type="warning"` ×3).
 *
 * The escape hatch Astryx documents for exactly this is a THEME-defined custom
 * color, not per-site inline CSS: `Text` resolves an unknown `color` to the
 * `primary` StyleX baseline and then takes its actual colour from theme CSS
 * (`.astryx-text.<color>` / `.astryx-heading.<color>`), and
 * `astryx theme build` emits the matching `TextColorMap` module augmentation
 * so `color="danger"` type-checks. That keeps the decision in ONE place and
 * lets every theme family/role inherit it, which is what the per-component-CSS
 * policy asks for.
 *
 * Values are the antd originals by construction: antd painted
 * `type="danger"` with `colorError`, `warning` with `colorWarning` and
 * `success` with `colorSuccess`, and those three seeds are the same
 * `resources/theme.json` values this recipe already pins to
 * `--color-error` / `--color-warning` / `--color-success` above. So the
 * rendered hue is legacy-identical in both modes, with no new literal.
 *
 * `heading` carries the same three so a `Heading` never falls back to
 * `primary` if a future surface needs a danger title.
 */
const STATUS_TEXT_COLORS = {
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
};

const SIDE_NAV_DENSITY = {
  // `SideNav`'s own StyleX sets `background-color: inherit` on the root AND on
  // its sticky top/bottom bands — it assumes an `AppShell` ancestor paints the
  // rail. Without one, `inherit` bottoms out at the page backdrop, so the rail
  // had NO surface of its own (antd's `Layout.Sider` painted
  // `colorBgContainer`) and, worse, the sticky footer band was see-through:
  // scrolled menu items visibly ran underneath the terms/version block on the
  // admin sider. Naming the surface here fixes both, for every theme family.
  'side-nav': {
    base: {
      backgroundColor: 'var(--color-background-surface)',
      // antd `Layout.Sider width={240}` (legacy `SIDER_WIDTH`). Ticket 24 took
      // `SideNav`'s own 260px under the visual-values policy, but the rail
      // width is not a component look — it is a page-layout metric the app
      // owns, and users read the 20px difference immediately. `SideNav` has no
      // `width` prop (its width is StyleX, `.x1hfn5x7 { width: 260px }`), so
      // the theme layer is the only knob; `@layer astryx-theme` outranks
      // `astryx-base`, where that StyleX lives.
      //
      // This is the EXPANDED width only. StyleX swaps in a different class for
      // the collapsed rail (`width: var(--spacing-12)` = 48px), but both land
      // on the same `.astryx-side-nav` element, so a theme rule would clobber
      // the collapsed state too — legacy `COLLAPSED_SIDER_WIDTH` is 74px, and
      // that value lives on `.bai-sider--collapsed` in `BAISider.css`
      // (the same mechanism the collapsed nav-item padding already uses).
      width: '240px',
    },
  },
  'side-nav-item': {
    base: {
      height: '40px',
      marginBlock: '2px',
      paddingInline: '24px',
      borderRadius: '20px',
      fontSize: '16px',
    },
  },
  'side-nav-section': {
    base: {
      paddingBlockStart: '16px',
    },
  },
};

export interface BrandSeedPair {
  /** Light-scheme seed, as declared in theme.json. */
  light: string;
  /** Dark-scheme seed AS DECLARED (pre-darkAlgorithm) in theme.json. */
  dark: string;
}

/**
 * Map a declared dark seed to the value antd's darkAlgorithm rendered for it.
 * Unknown seeds pass through verbatim (see PILOT-DECISION in the header).
 */
export const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ?? seed;

/** Default seeds — verbatim from resources/theme.json (+ antd defaults). */
export const BAI_DEFAULT_SEEDS = {
  /** colorPrimary / colorLink */
  accent: { light: '#FF7A00', dark: '#DC6B03' } as BrandSeedPair,
  /** colorInfo — what `usePrimaryColors().admin` resolves to */
  admin: { light: '#028DF2', dark: '#009BDD' } as BrandSeedPair,
  /** colorSuccess — what `usePrimaryColors().secondary` resolves to */
  secondary: { light: '#00BD9B', dark: '#03A487' } as BrandSeedPair,
  error: { light: '#FF4D4F', dark: '#DC4446' } as BrandSeedPair,
  success: { light: '#00BD9B', dark: '#03A487' } as BrandSeedPair,
  /** theme.json declares no colorWarning — antd default seed. */
  warning: { light: '#FAAD14', dark: '#FAAD14' } as BrandSeedPair,
  /**
   * colorInfo — the INFORMATIONAL status hue. Same declared pair as `admin`
   * because antd overloads one seed for both roles (`colorInfo` is the admin
   * accent AND the info-status colour); they are named separately so the two
   * roles can diverge in theme.json without one silently dragging the other.
   */
  info: { light: '#028DF2', dark: '#009BDD' } as BrandSeedPair,
  /** theme.json `fontFamily` */
  fontFamily: "'Ubuntu', Roboto, sans-serif",
};

export type BrandThemeRole = 'brand' | 'admin' | 'secondary';

export interface BuildBackendAiThemeOptions {
  /** Theme-family key (`default`, `stained`, `glass`, `reverie`, `bliss`). */
  family?: string;
  /** Which accent this theme carries. Readability segment of the name. */
  role?: BrandThemeRole;
  /** Accent seed pair (declared values; dark is mapped through the table). */
  accent?: BrandSeedPair;
  error?: BrandSeedPair;
  success?: BrandSeedPair;
  warning?: BrandSeedPair;
  info?: BrandSeedPair;
  fontFamily?: string;
}

/** Resolve tuple = [light seed, measured darkAlgorithm output of dark seed]. */
const toTuple = (pair: BrandSeedPair): [string, string] => [
  pair.light,
  resolveDarkSeed(pair.dark),
];

/**
 * Astryx muted status surfaces are the status color at ~20%/25% alpha
 * (e.g. neutral `--color-error-muted: #E3193B33 / #F5394F3F`). Reproduce the
 * same formula over our seeds. Only 6-digit hex seeds get a muted override;
 * anything else keeps the neutral default (no silent invalid CSS).
 */
const toMutedTuple = (tuple: [string, string]): [string, string] | undefined =>
  /^#[0-9a-fA-F]{6}$/.test(tuple[0]) && /^#[0-9a-fA-F]{6}$/.test(tuple[1])
    ? [`${tuple[0]}33`, `${tuple[1]}3F`]
    : undefined;

/** djb2 — tiny, stable, DOM-attribute-safe (base36). */
const hashSeeds = (input: string): string => {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
};

const sanitizeNameSegment = (segment: string): string =>
  segment.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

interface ResolvedSeeds {
  family: string;
  role: BrandThemeRole;
  accent: BrandSeedPair;
  error: BrandSeedPair;
  success: BrandSeedPair;
  warning: BrandSeedPair;
  info: BrandSeedPair;
  fontFamily: string;
}

const resolveSeeds = (
  options: BuildBackendAiThemeOptions = {},
): ResolvedSeeds => ({
  family: options.family ?? 'default',
  role: options.role ?? 'brand',
  accent: options.accent ?? BAI_DEFAULT_SEEDS.accent,
  error: options.error ?? BAI_DEFAULT_SEEDS.error,
  success: options.success ?? BAI_DEFAULT_SEEDS.success,
  warning: options.warning ?? BAI_DEFAULT_SEEDS.warning,
  info: options.info ?? BAI_DEFAULT_SEEDS.info,
  fontFamily: options.fontFamily ?? BAI_DEFAULT_SEEDS.fontFamily,
});

/**
 * The theme name for a given option set — see "Theme name numbering" in the
 * module header. Exported separately so callers can compare against a built
 * theme's name WITHOUT calling `defineTheme()` (constructing a same-named
 * runtime theme would register a competing entry for the identical CSS).
 */
export const computeThemeName = (
  options: BuildBackendAiThemeOptions = {},
): string => {
  const seeds = resolveSeeds(options);
  const hash = hashSeeds(
    JSON.stringify([
      seeds.accent,
      seeds.error,
      seeds.success,
      seeds.warning,
      seeds.info,
      seeds.fontFamily,
      ANTD_ALIGN_TOKENS,
      ANTD_NEUTRAL_SURFACES,
      ANTD_NEUTRAL_BORDERS,
      ANTD_STATUS_ON_COLORS,
    ]),
  );
  // `h` prefix: every name segment must start with a letter — `astryx theme
  // build` camelizes the name into a JS export identifier, and a segment
  // starting with a digit yields an invalid identifier (measured: hash
  // `1em9oeh` produced `baiR1DefaultBrand-1em9oehTheme`, a syntax error).
  return sanitizeNameSegment(
    `bai-r${THEME_NAME_REV}-${seeds.family}-${seeds.role}-h${hash}`,
  );
};

/**
 * `defineTheme()` registers by name and the first registration silently wins,
 * so building the same seed set twice must return the SAME object rather than
 * registering a doomed duplicate. Keyed by the derived name (= content).
 */
const themeCache = new Map<string, DefinedTheme>();

/**
 * Build a Backend.AI theme. Called with no arguments this yields the default
 * brand theme; role/seed overrides yield the admin/secondary/runtime themes.
 */
export function buildBackendAiTheme(
  options: BuildBackendAiThemeOptions = {},
): DefinedTheme {
  const name = computeThemeName(options);
  const cached = themeCache.get(name);
  if (cached) {
    return cached;
  }

  const seeds = resolveSeeds(options);
  const accent = toTuple(seeds.accent);
  const error = toTuple(seeds.error);
  const success = toTuple(seeds.success);
  const warning = toTuple(seeds.warning);
  const errorMuted = toMutedTuple(error);
  const successMuted = toMutedTuple(success);
  const warningMuted = toMutedTuple(warning);

  const theme = defineTheme({
    name,
    // Start from neutral: only the brand-owned families + the 6 antd value
    // alignments are overridden; everything else keeps Astryx defaults
    // (visual-value policy: component-level look stays Astryx).
    extends: neutralTheme,
    // Runs the HCT generator over the light seed so the DERIVED accent ramp
    // (hover/active/surface steps) follows the brand — measured in the pilot
    // to recompute correctly on accent swap.
    color: { accent: seeds.accent.light },
    tokens: {
      // The generator takes ONE accent; the light/dark pair is expressed as
      // explicit [light, dark] tuple overrides, which win over generated
      // values. Dark side = measured antd darkAlgorithm output (header note).
      '--color-accent': accent,
      '--color-text-accent': accent,
      '--color-icon-accent': accent,
      // Text/icons ON the accent fill. All shipped accents (orange, admin
      // blue, secondary teal) are dark enough for white at both ends — and
      // white-on-primary is what antd rendered.
      '--color-on-accent': ['#ffffff', '#ffffff'],
      // Status colors, brand-owned via theme.json (antd colorError /
      // colorSuccess / colorWarning), so the semantic hues equal the legacy
      // applied values by construction.
      //
      // INFO — the fourth status role — has no Astryx token to pin. Astryx
      // ships no `--color-info*` family at all: `CoreTokenName` (see
      // `@astryxdesign/core/theme/defineTheme.d.ts` + `tokens.stylex.js`)
      // enumerates error / success / warning and nothing else, and the
      // `--color-info-*` variables visible in the page are StyleX-hashed
      // component-private vars, not theme surface. The informational blue in
      // this app is therefore rendered by the antd engine (`Alert type="info"`,
      // `message.info`), which takes its ramp from `colorInfo` — resolved by
      // the theme-shim from the SAME seed declared here (`seeds.info`, i.e.
      // resources/theme.json `#028DF2` / `#009BDD`→`#0387bf`). That makes the
      // blue an intentional, theme-declared legacy value rather than an
      // accident of the shim's fallback table: SWEEP-1 row 5 is sanctioned,
      // not outstanding. The seed participates in the theme-name hash below,
      // so a deployment that rebrands `colorInfo` still forces a fresh
      // registration.
      '--color-error': error,
      '--color-success': success,
      '--color-warning': warning,
      ...(errorMuted ? { '--color-error-muted': errorMuted } : {}),
      ...(successMuted ? { '--color-success-muted': successMuted } : {}),
      ...(warningMuted ? { '--color-warning-muted': warningMuted } : {}),
      // Text/icons ON a solid status fill — antd `colorTextLightSolid`.
      // See ANTD_STATUS_ON_COLORS.
      ...ANTD_STATUS_ON_COLORS,
      // theme.json fontFamily (Ubuntu stack). Token-level override rather
      // than `typography` config: a partial `typography` block REPLACES the
      // base scale config wholesale (docs: "child config replaces base
      // entirely"), which would silently regenerate the type ramp.
      '--font-family-body': seeds.fontFamily,
      '--font-family-heading': seeds.fontFamily,
      // The 6 antd↔Astryx value differences, pinned to antd values.
      ...ANTD_ALIGN_TOKENS,
      // The neutral background family, pinned to the measured legacy antd
      // neutrals so the accent-derived warm tint does not reach the page,
      // surfaces or scrims. See ANTD_NEUTRAL_SURFACES above.
      ...ANTD_NEUTRAL_SURFACES,
      // Same generator, same fix, one family further out: the two-step border
      // ramp. See ANTD_NEUTRAL_BORDERS above.
      ...ANTD_NEUTRAL_BORDERS,
    },
    // Component-level theme defaults (see SIDE_NAV_DENSITY above). This is
    // the sanctioned place for "our look differs from the Astryx default" —
    // it deep-merges over `neutralTheme`'s own component rules and applies to
    // every role/family theme built from this recipe.
    components: { ...SIDE_NAV_DENSITY, ...STATUS_TEXT_COLORS },
  });

  themeCache.set(name, theme);
  return theme;
}

/* -------------------------------------------------------------------------
 * theme.json runtime override path
 * ---------------------------------------------------------------------- */

/**
 * Minimal structural view of an antd `ThemeConfig` — declared here so this
 * module stays antd-import-free (it must outlive antd removal).
 */
export interface AntdishThemeConfig {
  token?: {
    colorPrimary?: string;
    colorInfo?: string;
    colorSuccess?: string;
    colorError?: string;
    colorWarning?: string;
  };
}

export interface AntdishCustomThemeConfig {
  fontFamily?: string;
  light?: AntdishThemeConfig;
  dark?: AntdishThemeConfig;
}

const seedPairFromConfig = (
  config: AntdishCustomThemeConfig,
  key:
    | 'colorPrimary'
    | 'colorInfo'
    | 'colorSuccess'
    | 'colorError'
    | 'colorWarning',
  fallback: BrandSeedPair,
): BrandSeedPair => {
  const light = config.light?.token?.[key];
  const dark = config.dark?.token?.[key];
  return {
    light: typeof light === 'string' ? light : fallback.light,
    dark:
      typeof dark === 'string'
        ? dark
        : // A config that declares only a light seed reuses it for dark
          // (antd behaved the same way: dark derived from whatever seed the
          // dark ThemeConfig carried, falling back to light's).
          typeof light === 'string'
          ? light
          : fallback.dark,
  };
};

/**
 * Derive the full option set for one role from a runtime theme.json document
 * (the operator-editable override path). Role→accent mapping mirrors
 * `usePrimaryColors`: brand=colorPrimary, admin=colorInfo,
 * secondary=colorSuccess.
 */
export const themeOptionsFromConfig = (
  config: AntdishCustomThemeConfig,
  role: BrandThemeRole = 'brand',
  family = 'default',
): BuildBackendAiThemeOptions => {
  const accentKey =
    role === 'admin'
      ? 'colorInfo'
      : role === 'secondary'
        ? 'colorSuccess'
        : 'colorPrimary';
  const accentFallback =
    role === 'admin'
      ? BAI_DEFAULT_SEEDS.admin
      : role === 'secondary'
        ? BAI_DEFAULT_SEEDS.secondary
        : BAI_DEFAULT_SEEDS.accent;
  return {
    family,
    role,
    accent: seedPairFromConfig(config, accentKey, accentFallback),
    error: seedPairFromConfig(config, 'colorError', BAI_DEFAULT_SEEDS.error),
    success: seedPairFromConfig(
      config,
      'colorSuccess',
      BAI_DEFAULT_SEEDS.success,
    ),
    warning: seedPairFromConfig(
      config,
      'colorWarning',
      BAI_DEFAULT_SEEDS.warning,
    ),
    // The info STATUS hue. Read from the same theme.json key the admin ACCENT
    // uses, but kept as its own seed — a deployment that rebrands `colorInfo`
    // moves both, and the hash must see it either way.
    info: seedPairFromConfig(config, 'colorInfo', BAI_DEFAULT_SEEDS.info),
    fontFamily: config.fontFamily ?? BAI_DEFAULT_SEEDS.fontFamily,
  };
};

/* -------------------------------------------------------------------------
 * Default singletons (the shipped theme.json values)
 * ---------------------------------------------------------------------- */

/** Backend.AI brand (orange) — the app-wide default. */
export const backendAiBrandTheme = buildBackendAiTheme({ role: 'brand' });

/** Admin sections (colorInfo blue) — `ThemeAdminProvider` counterpart. */
export const backendAiAdminTheme = buildBackendAiTheme({
  role: 'admin',
  accent: BAI_DEFAULT_SEEDS.admin,
});

/** Secondary sections (colorSuccess teal) — `ThemeSecondaryProvider` counterpart. */
export const backendAiSecondaryTheme = buildBackendAiTheme({
  role: 'secondary',
  accent: BAI_DEFAULT_SEEDS.secondary,
});
