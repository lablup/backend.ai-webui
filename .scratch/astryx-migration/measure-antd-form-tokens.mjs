/**
 * Measures antd's design tokens for the seeds this repo ships, light vs dark,
 * so the form engine can pin the CORRECT per-role token instead of collapsing
 * every error surface onto one value. Run from `react/`:
 *   node ../.scratch/astryx-migration/measure-antd-form-tokens.mjs
 */
import { createRequire } from 'node:module';

// Resolve antd from the react workspace (this script lives outside it).
const require = createRequire(
  new URL('../../react/package.json', import.meta.url),
);
const { theme } = require('antd');

const LIGHT_SEEDS = {
  colorPrimary: '#FF7A45',
  colorError: '#FF4D4F',
  colorWarning: '#FAAD14',
  colorSuccess: '#52C41A',
};
const DARK_SEEDS = {
  colorPrimary: '#DC6B03',
  colorError: '#DC4446',
  colorWarning: '#FAAD14',
  colorSuccess: '#03A487',
  colorInfo: '#009BDD',
};

const light = theme.getDesignToken({ token: LIGHT_SEEDS });
const dark = theme.getDesignToken({
  algorithm: theme.darkAlgorithm,
  token: DARK_SEEDS,
});

const INTERESTING = (k) =>
  /^color(Error|Warning|Success|Text|Border|Split|Icon)/.test(k) ||
  [
    'lineHeight',
    'lineHeightSM',
    'fontSize',
    'fontSizeSM',
    'controlHeight',
    'controlHeightSM',
    'marginXXS',
    'marginXS',
    'marginSM',
    'margin',
    'marginLG',
    'paddingXS',
    'padding',
    'motionDurationMid',
    'motionDurationSlow',
    'colorBgContainerDisabled',
  ].includes(k);

const out = {};
for (const k of Object.keys(light).filter(INTERESTING)) {
  out[k] = { light: light[k], dark: dark[k] };
}
console.log(JSON.stringify(out, null, 1));
