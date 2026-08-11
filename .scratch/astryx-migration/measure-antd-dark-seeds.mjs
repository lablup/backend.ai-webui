/**
 * Checks whether the repo's DECLARED dark seeds are themselves already the
 * darkAlgorithm output of the light seeds — i.e. whether feeding them back
 * through darkAlgorithm double-darkens them.
 */
import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../../react/package.json', import.meta.url),
);
const { theme } = require('antd');

const PAIRS = [
  ['colorPrimary', '#FF7A45', '#DC6B03'],
  ['colorError', '#FF4D4F', '#DC4446'],
  ['colorSuccess', '#00BD9B', '#03A487'],
  ['colorInfo', '#00B3E6', '#009BDD'],
  ['colorWarning', '#FAAD14', '#FAAD14'],
];

const rows = [];
for (const [key, lightSeed, declaredDark] of PAIRS) {
  const fromLight = theme.getDesignToken({
    algorithm: theme.darkAlgorithm,
    token: { [key]: lightSeed },
  })[key];
  const fromDark = theme.getDesignToken({
    algorithm: theme.darkAlgorithm,
    token: { [key]: declaredDark },
  })[key];
  rows.push({
    key,
    lightSeed,
    declaredDark,
    darkAlgoOfLightSeed: fromLight,
    darkAlgoOfDeclaredDark: fromDark,
    declaredDarkIsAlreadyDarkAlgoOutput:
      fromLight.toLowerCase() === declaredDark.toLowerCase(),
  });
}
console.log(JSON.stringify(rows, null, 1));
