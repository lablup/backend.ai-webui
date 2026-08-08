/**
 * Measure the LEGACY antd neutral background/surface tokens for the shipped
 * `resources/theme.json` seeds (default family). Used to derive the Astryx
 * neutral background family in `react/src/astryx-theme/backendAiTheme.ts`.
 *
 *   node .scratch/astryx-migration/antd-neutral-tokens.mjs
 */
import { theme } from 'antd';

const seedLight = {
  colorPrimary: '#FF7A00',
  colorLink: '#FF7A00',
  colorText: '#141414',
  colorInfo: '#028DF2',
  colorError: '#FF4D4F',
  colorSuccess: '#00BD9B',
};
const seedDark = {
  colorPrimary: '#DC6B03',
  colorLink: '#DC6B03',
  colorText: '#FFF',
  colorInfo: '#009BDD',
  colorError: '#DC4446',
  colorSuccess: '#03A487',
  colorFillSecondary: '#262626',
};

const L = theme.getDesignToken({ token: seedLight });
const D = theme.getDesignToken({
  token: seedDark,
  algorithm: theme.darkAlgorithm,
});

const keys = [
  'colorBgBase',
  'colorBgLayout',
  'colorBgContainer',
  'colorBgElevated',
  'colorBgSpotlight',
  'colorBgMask',
  'colorFillAlter',
  'colorFillQuaternary',
  'colorFillTertiary',
  'colorFillSecondary',
  'colorFill',
  'colorBorder',
  'colorBorderSecondary',
  'colorText',
  'colorTextSecondary',
  'colorTextTertiary',
  'colorTextQuaternary',
  'colorTextDescription',
];

for (const k of keys) {
  console.log(k.padEnd(22), String(L[k]).padEnd(28), String(D[k]));
}
