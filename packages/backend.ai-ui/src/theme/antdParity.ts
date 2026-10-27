/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Measured antd parity tables shared by the theme shim and the react app's
 brand-theme builder (to-astryx ticket 10 — moved here from
 react/src/astryx-theme/backendAiTheme.ts so the shim can live in BUI, which
 cannot import from react/src; backendAiTheme.ts re-exports these for its
 own consumers).

 The tables are ticket-02/06 MEASUREMENTS, not styling opinions:
 - ANTD_ALIGN_TOKENS: the known antd<->Astryx token VALUE differences,
   pinned to the antd values so migrated surfaces keep today's metrics.
   Extended by the audit-1 regression catalog (REGRESSION-CATALOG.md §1.3):
   the original 6 pins landed on the LADDER tokens (`--font-size-lg`,
   `--font-size-4xl`, `--radius-element`) but nothing consumed them, because
   the Astryx type/radius SEMANTICS (`--text-heading-N-size`,
   `--radius-container`) point at other rungs. The semantic tokens are pinned
   here too, so a pin actually reaches a rendered heading / card / dialog.
 */

/**
 * antd `boxShadowSecondary` recipes (light / dark measured from
 * `theme.getDesignToken()`), replacing Astryx `--shadow-med` (different
 * recipe: Astryx adds an inset hairline and different offsets).
 *
 * NOT a `[light, dark]` tuple: defineTheme serializes tuples as
 * `light-dark(lightValue, darkValue)`, and `light-dark()` accepts COLORS
 * only — a tuple of multi-shadow recipes emits
 * `light-dark(0 6px 16px 0 rgba(...), ..., ...)` which is invalid CSS and
 * silently kills `box-shadow: var(--shadow-med)` at every use site
 * (measured on the built artifact). Instead this is ONE string with
 * `light-dark()` at each color position — the same shape Astryx uses for its
 * own shadow defaults — so it mode-switches through `color-scheme` exactly
 * like every other token.
 */
const ANTD_BOX_SHADOW_SECONDARY =
  '0 6px 16px 0 light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.016)), ' +
  '0 3px 6px -4px light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.024)), ' +
  '0 9px 28px 8px light-dark(rgba(0,0,0,0.05), rgba(255,255,255,0.01))';

/**
 * The known antd↔Astryx token VALUE differences (ticket 06 "drift" class,
 * extended by audit 1), aligned to the antd values so migrated surfaces keep
 * today's metrics.
 *
 * | antd token          | antd  | Astryx neutral            | override    |
 * |---------------------|-------|---------------------------|-------------|
 * | borderRadiusLG      | 8px   | --radius-element 10       | 8px         |
 * | borderRadiusLG      | 8px   | --radius-container 12     | 8px         |
 * | fontSizeLG          | 16px  | --font-size-lg 17         | 16px        |
 * | fontSizeHeading5    | 16px  | --font-size-lg 17         | (same var)  |
 * | fontSizeHeading2    | 30px  | --font-size-3xl 29        | 30px        |
 * | fontSizeHeading1    | 38px  | --font-size-4xl 35        | 38px        |
 * | fontSizeHeading1..5 | 38/30/24/20/16 | --text-heading-N-size    | remapped    |
 * | lineHeight          | 1.5714| --text-body-leading 1.4286| 1.5714      |
 * | controlHeightSM     | 24px  | --size-element-sm 28      | 24px        |
 * | motionDurationSlow  | .3s   | --duration-slow 700       | 300ms       |
 * | boxShadowSecondary  | —     | --shadow-med              | antd recipe |
 * | boxShadowSecondary  | —     | --shadow-high             | antd recipe |
 *
 * px (not rem) on purpose: antd emitted px, and the goal of this layer is
 * approximating the current appearance exactly.
 *
 * EVERY value here is a PLAIN STRING, never a `[light, dark]` tuple.
 * `defineTheme` serialises a tuple as `light-dark(a, b)`, and CSS
 * `light-dark()` accepts COLOURS only — a tuple on a size / radius /
 * line-height token emits invalid CSS and the declaration silently falls back
 * to the Astryx default (this is exactly how the `--shadow-med` bug shipped
 * once, see the note above). None of these are mode-dependent in antd either:
 * `darkAlgorithm` transforms colours, not the size/radius/duration ladders.
 */
export const ANTD_ALIGN_TOKENS = {
  // --- radius: antd `borderRadiusLG` feeds BOTH Astryx radius semantics.
  // `--radius-element` alone reaches inputs/buttons; Card, Dialog, Banner,
  // Tooltip and DropdownMenu all read `--radius-container`, which stayed at
  // Astryx's 12px until audit 1 measured it (catalog G-5 / O-3 / T-4 / F-4).
  '--radius-element': '8px',
  '--radius-container': '8px',
  // --- type ladder rungs the headings below point at.
  '--font-size-lg': '16px',
  '--font-size-3xl': '30px',
  '--font-size-4xl': '38px',
  // --- type SEMANTICS. Pinning the ladder above never reached a heading:
  // Astryx's heading scale starts three rungs lower than antd's, so
  // `Typography.Title` 1..5 (38/30/24/20/16) rendered as 24/20/16/14/12 —
  // a modal title (Heading level 2) came out 20px against antd's 16px, and
  // the route-error headline (level 4) came out smaller than body text
  // (catalog G-3, O-2, R-5, 57 sites).
  //
  // ✅ FALLOUT RESOLVED (approved-1b) — the call-site pass landed.
  // These five lines restore the antd SCALE, but a large share of this repo's
  // `<Heading level={N}>` call sites had been chosen against the OLD Astryx
  // scale, i.e. by rendered size rather than by document level. Several carried
  // a PILOT-DECISION comment saying so outright — e.g.
  // `MyResourceWithinResourceGroup.tsx` converted an antd `Typography.Text` at
  // `fontSizeHeading5` (16px) to `Heading level={3}` "visual values follow
  // Astryx defaults", which was 16px then and 24px after the pin.
  //
  // approved-1b censused every `<Heading level={N}>` site in `react/src` and
  // `packages/backend.ai-ui/src` and re-levelled the ones whose LEGACY rendered
  // size no longer matched their level (16px -> 5, 20px -> 4, 24px -> 3):
  //
  //   BAICard / BAICardAstryx string title      level 3 -> 5   (16px)
  //   BAIBoardItemTitle (dashboard widgets x9)  level 3 -> 5   (16px)
  //   AgentDetailModal x5, AgentStats,
  //     My/TotalResourceWithinResourceGroup,
  //     ChatPage x2, ContainerLogModal          level 3|4 -> 5 (16px)
  //   AllocationHistoryStatistics GraphCard     level 4 -> 5   (14px legacy;
  //     the antd ramp has no 14px rung and heading-4 is now 20px, which
  //     inverted this inner card against its outer card)
  //   FairShareList section title               level 2 -> 4   (20px)
  //   RouteErrorContent headline                level 4 -> 3   (24px; legacy
  //     overrode antd h4 with `fontSizeHeading3`)
  //
  // Sites whose legacy target already matches the restored ramp were LEFT
  // ALONE: every `level={5}` site (antd `Title level={5}` / modal / drawer
  // titles, all 16px — these are the ones the pin fixed), and the `level={3}`
  // page/section titles that came from an antd `Title level={3}` (24px):
  // VFolderNameTitle, EditableVFolderName(V2) + FolderExplorerHeader(V2),
  // LoginFormPanel, StorageHostDetailDrawerContent, DeploymentDetailPage,
  // AdminDeploymentPresetSettingPage, ReservoirArtifactDetailPage,
  // SessionDetailContent, and SessionLauncherPage's `level={4}` (antd h4 20px).
  //
  // The one thing NO call site could fix is Astryx `DialogHeader`, which
  // hard-codes `Heading level={2}` (20px before the pin, 30px after) against
  // antd's 16px `.ant-modal-title`. That is pinned in the THEME instead —
  // `ANTD_DIALOG_SURFACE` in `react/src/astryx-theme/backendAiTheme.ts`
  // redeclares `--text-heading-2-size`/`-leading` on `.astryx-dialog`, which
  // also keeps `DialogHeader`'s optical-centring calc honest. Catalog O-2's
  // "closed by G-3" was wrong in BOTH directions; this closes it properly.
  //
  // If these five lines are ever dropped (plus the `--font-size-3xl` rung
  // above), the re-levelled call sites above and that dialog pin must be
  // reverted with them — they are now written against the antd ramp.
  '--text-heading-1-size': 'var(--font-size-4xl)', // antd fontSizeHeading1 38
  '--text-heading-2-size': 'var(--font-size-3xl)', // antd fontSizeHeading2 30
  '--text-heading-3-size': 'var(--font-size-2xl)', // antd fontSizeHeading3 24
  '--text-heading-4-size': 'var(--font-size-xl)', //  antd fontSizeHeading4 20
  '--text-heading-5-size': 'var(--font-size-lg)', //  antd fontSizeHeading5 16
  // --- line rhythm. antd `lineHeight` 1.5714 → 22px at 14px; Astryx's 1.4286
  // → 20px. The breadcrumb is still antd-rendered, so before this pin the two
  // engines disagreed by 2px inside a single screen (catalog G-2 / G-11).
  '--text-body-leading': '1.5714',
  '--text-label-leading': '1.5714',
  '--text-code-leading': '1.5714',
  // --- control height. antd `controlHeightSM` 24; every `size="small"`
  // button/select/input was 4px too tall (catalog G-8 / F-6).
  '--size-element-sm': '24px',
  '--duration-slow': '300ms',
  // --- elevation. antd had ONE elevated-surface recipe (`boxShadowSecondary`)
  // for dialogs, popovers, dropdowns and notifications alike; Astryx splits
  // them across `--shadow-med` / `--shadow-high`, and the Dialog/Banner read
  // the harder `high` step (catalog G-6 / O-4 / O-9).
  '--shadow-med': ANTD_BOX_SHADOW_SECONDARY,
  '--shadow-high': ANTD_BOX_SHADOW_SECONDARY,
} as const;

/**
 * The neutral hover/pressed washes for the header band, which is a REVERSED
 * surface: its content polarity follows the app mode (FR-3502), so the wash
 * must too — TRANSLUCENT WHITE over the brand orange in light, TRANSLUCENT
 * BLACK in dark. Both stay translucent so the orange shows through; the
 * app-wide `--color-overlay-hover` cannot be used here because its dark half
 * is a translucent WHITE wash (`rgba(255,255,255,0.08)`, `ANTD_NEUTRAL_SURFACES`)
 * — right for a page-polarity surface, wrong POLARITY for a band that inverts
 * with the app mode, where dark needs black. (Before FR-3557 that dark half was
 * the opaque `#262626`, so the reason was opacity rather than polarity; the
 * override is still required either way.)
 *
 * `light-dark()` is not usable and this must be indexed in JS by the caller: a
 * custom property holding `light-dark(a, b)` is substituted at USE time, and
 * consumers sit inside the band's `MediaTheme`, so the forced scheme picks the
 * slot instead of the app scheme (measured).
 *
 * `rgba(255,255,255,0.16)` is the same wash `ANTD_HOVER_PARITY` applies to
 * filled buttons (`backendAiTheme.ts`) — no new number. FR-3501.
 */
export const ANTD_REVERSED_BAND_OVERLAYS = {
  light: {
    '--color-overlay-hover': 'rgba(255,255,255,0.16)',
    '--color-overlay-pressed': 'rgba(255,255,255,0.18)',
  },
  dark: {
    '--color-overlay-hover': 'rgba(0,0,0,0.06)',
    '--color-overlay-pressed': 'rgba(0,0,0,0.15)',
  },
} as const;
