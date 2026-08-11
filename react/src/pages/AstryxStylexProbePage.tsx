/**
 * Astryx / StyleX authoring probe (to-astryx ticket 01).
 *
 * Proves the foundation wiring end to end on a real app route:
 *  - `stylex.create()` + Astryx's `xstyle` prop compile through the repo's
 *    Vite 6 plugin chain (StyleX unplugin -> @vitejs/plugin-react with
 *    babel-plugin-react-compiler + babel-plugin-relay),
 *  - the compiled (unlayered) output beats Astryx's `@layer astryx-base`
 *    component defaults (compare `#astryx-btn-override` vs
 *    `#astryx-btn-baseline`: 32px vs 8px padding-top),
 *  - Astryx theme tokens resolve both as raw `var(--…)` strings and through
 *    the typed `tokens.stylex` maps,
 *  - `stylex.props()` works on plain (non-Astryx) elements.
 *
 * The `sentinel` style carries a unique z-index literal that
 * scripts/verify.sh greps for in the built entry stylesheet to assert the
 * StyleX plugin's `cssInjectionTarget` still points at the entry CSS asset
 * (see check_stylex_injection there). Keep the value in sync with verify.sh.
 *
 * Not a product surface — remove once real Astryx pages exist and carry
 * their own authored styles.
 */
import AstryxAdminTheme from '../astryx-theme/AstryxAdminTheme';
import AstryxBrandTheme from '../astryx-theme/AstryxBrandTheme';
import AstryxSecondaryTheme from '../astryx-theme/AstryxSecondaryTheme';
import { Button as AstryxButton } from '@astryxdesign/core/Button';
import { Card as AstryxCard } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { BAICard } from 'backend.ai-ui';
import { useState } from 'react';

const styles = stylex.create({
  // cssInjectionTarget sentinel — value must match STYLEX_SENTINEL in
  // scripts/verify.sh. Harmless on this stacking context (probe page only).
  sentinel: {
    zIndex: 2147480001,
  },
  // (a) plain overrides + (c) Astryx token via CSS custom property
  cardOverride: {
    outline: '3px dashed var(--color-accent)',
    borderRadius: '24px',
    backgroundColor: 'var(--color-background-muted)',
  },
  // (c2) same, through the imported precompiled token maps
  cardTokenOverride: {
    outline: `3px dotted ${colorVars['--color-accent']}`,
    marginTop: spacingVars['--spacing-4'],
  },
  // (e) must beat Astryx Button's own padding from `@layer astryx-base`
  //     + (b) a `:hover` pseudo-class
  buttonOverride: {
    paddingTop: '32px',
    paddingBottom: '32px',
    paddingInlineStart: '48px',
    paddingInlineEnd: '48px',
    backgroundColor: {
      default: 'var(--color-accent)',
      ':hover': 'rgb(255, 0, 128)',
    },
  },
  // Brand-theme probe (ticket 02): swatches that paint the ACTIVE theme's
  // accent tokens — the assertion surface for computed-style checks.
  accentSwatch: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-element)',
    fontSize: 'var(--font-size-lg)',
  },
  // (d) non-Astryx authoring: stylex.props() on a plain element
  plainBox: {
    padding: '12px',
    color: {
      default: 'rgb(0, 128, 0)',
      ':hover': 'rgb(200, 0, 0)',
    },
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    fontWeight: 700,
  },
});

/**
 * Backend.AI brand theme probe (ticket 02). Wraps its content in the real
 * app-level providers so what renders here is exactly what the migration
 * will ship: brand accent from theme.json (prebuilt for the shipped
 * defaults), nested admin/secondary themes with explicit mode inheritance.
 * The local light/dark toggle overrides the app mode so both dark tuples
 * ([#FF7A00 → #be5e06] etc.) can be inspected without leaving the page.
 */
const BrandThemeProbe: React.FC = () => {
  'use memo';
  const [probeMode, setProbeMode] = useState<'light' | 'dark' | undefined>(
    undefined,
  );
  return (
    <AstryxBrandTheme mode={probeMode}>
      <VStack gap={3}>
        <AstryxButton
          id="probe-mode-toggle"
          label={`theme mode: ${probeMode ?? 'app'} — toggle`}
          variant="secondary"
          onClick={() =>
            setProbeMode((m) => (m === 'light' ? 'dark' : 'light'))
          }
        />
        <AstryxButton
          id="probe-brand-btn"
          label="brand primary (accent)"
          variant="primary"
        />
        <div id="probe-brand-swatch" {...stylex.props(styles.accentSwatch)}>
          brand --color-accent (expect #FF7A00 light / #be5e06 dark)
        </div>
        <AstryxAdminTheme>
          <VStack gap={3}>
            <AstryxButton
              id="probe-admin-btn"
              label="admin primary (nested theme)"
              variant="primary"
            />
            <div id="probe-admin-swatch" {...stylex.props(styles.accentSwatch)}>
              admin --color-accent (expect #028DF2 light / #0387bf dark,
              following the parent mode)
            </div>
          </VStack>
        </AstryxAdminTheme>
        <div id="probe-sibling-swatch" {...stylex.props(styles.accentSwatch)}>
          sibling AFTER the admin region (must stay brand orange — no leak)
        </div>
        <AstryxSecondaryTheme>
          <div
            id="probe-secondary-swatch"
            {...stylex.props(styles.accentSwatch)}
          >
            secondary --color-accent (expect #00BD9B light / #068e76 dark)
          </div>
        </AstryxSecondaryTheme>
      </VStack>
    </AstryxBrandTheme>
  );
};

const AstryxStylexProbePage: React.FC = () => {
  'use memo';
  return (
    <BAICard
      title="Astryx / StyleX authoring probe"
      styles={{ body: { paddingTop: 0 } }}
    >
      <VStack gap={4} xstyle={styles.sentinel}>
        <BrandThemeProbe />
        <div id="plain-box" {...stylex.props(styles.plainBox)}>
          plain element via stylex.props()
        </div>

        <AstryxCard id="astryx-card" xstyle={styles.cardOverride}>
          <Text>Astryx Card with xstyle override</Text>
        </AstryxCard>

        <AstryxCard id="astryx-card-token" xstyle={styles.cardTokenOverride}>
          <Text>Astryx Card styled through imported token vars</Text>
        </AstryxCard>

        <AstryxButton
          id="astryx-btn-override"
          label="Astryx Button + xstyle padding override"
          variant="primary"
          xstyle={styles.buttonOverride}
        />

        <AstryxButton
          id="astryx-btn-baseline"
          label="Astryx Button baseline (no xstyle)"
          variant="primary"
        />

        {/* The `#antd-btn` side-by-side reference button is gone. It existed
            only to eyeball Astryx against antd while both stacks shipped; the
            probe's actual assertions (StyleX beating `@layer astryx-base`,
            token resolution, `cssInjectionTarget`) never referenced it, and
            neither does `scripts/verify.sh` or any e2e locator. */}
      </VStack>
    </BAICard>
  );
};

export default AstryxStylexProbePage;
