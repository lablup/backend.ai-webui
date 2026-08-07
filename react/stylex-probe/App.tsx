/**
 * SPIKE 14 — StyleX AUTHORING probe on Vite 6.
 *
 * Exercises every authoring surface the spike must answer for:
 *   (a) plain property overrides through Astryx's `xstyle` prop
 *   (b) a `:hover` pseudo-class inside `stylex.create()`
 *   (c) an Astryx design token referenced as a CSS custom property
 *   (d) `stylex.props()` on a plain (non-Astryx) element — how our own
 *       components would author styles
 *   (e) an override that must WIN over an Astryx component's own base style
 *       (padding on Button), which is the entire point of `xstyle`
 */
import { Button as AstryxButton } from '@astryxdesign/core/Button';
import { Card as AstryxCard } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
// (c2) the *typed* token path — Astryx's precompiled `*.stylex.js` var maps.
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { Button as AntdButton, Card as AntdCard, ConfigProvider } from 'antd';
import './probe.css';

const styles = stylex.create({
  // (a) plain overrides + (c) Astryx token via CSS var reference
  cardOverride: {
    outline: '3px dashed var(--color-accent)',
    borderRadius: '24px',
    backgroundColor: 'var(--color-background-muted)',
  },
  // (c2) same idea, but through the imported token maps rather than a
  //      hand-written `var(--...)` string.
  cardTokenOverride: {
    outline: `3px dotted ${colorVars['--color-accent']}`,
    marginTop: spacingVars['--spacing-4'],
  },
  // (e) must beat Astryx Button's own `padding` from @layer astryx-base
  //     + (b) a :hover pseudo-class
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
  // (d) non-Astryx usage: stylex.props() on a plain element
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

export default function App() {
  'use memo';
  return (
    <ConfigProvider>
      <VStack gap={4}>
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

        {/* antd coexistence sanity check */}
        <AntdCard title="antd Card" size="small">
          <AntdButton id="antd-btn" type="primary">
            antd primary
          </AntdButton>
        </AntdCard>
      </VStack>
    </ConfigProvider>
  );
}

