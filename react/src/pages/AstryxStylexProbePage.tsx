/**
 * SPIKE 14 — StyleX authoring probe on a REAL app route.
 *
 * Proves that `stylex.create()` + Astryx's `xstyle` prop compile through the
 * repo's actual Vite 6 plugin chain (StyleX unplugin -> @vitejs/plugin-react
 * with babel-plugin-react-compiler + babel-plugin-relay).
 *
 * Not part of the product. Delete with the spike.
 */
import { Button as AstryxButton } from '@astryxdesign/core/Button';
import { Card as AstryxCard } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { Button as AntdButton } from 'antd';
import { BAICard } from 'backend.ai-ui';

const styles = stylex.create({
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

const AstryxStylexProbePage: React.FC = () => {
  'use memo';
  return (
    <BAICard
      title="StyleX authoring probe (spike)"
      styles={{ body: { paddingTop: 0 } }}
    >
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

        <AntdButton id="antd-btn" type="primary">
          antd primary
        </AntdButton>
      </VStack>
    </BAICard>
  );
};

export default AstryxStylexProbePage;
