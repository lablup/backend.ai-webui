/**
 @license
 Vendored from `@ant-design/colors@7.2.1` (MIT, (c) ant-design) and the minimal
 HSV/mix internals of its dependency `@ant-design/fast-color@2.0.6` (MIT).

 Why vendored (to-astryx ticket 03): `@ant-design/*` packages are inside the
 antd removal scope, but the theme shim (`../index.tsx`) keeps antd's own
 palette derivation for the 17 state-family tokens Astryx has no ramp for
 (`colorPrimaryHover`, `colorErrorBg`, …). This file makes that derivation
 self-contained so the shim survives `@ant-design/colors` removal.

 Parity contract: output is bit-identical to `@ant-design/colors` — the same
 stepping constants, the same rounding points, the same hex formatting. This
 is asserted against the still-installed package in `../antdColors.test.ts`;
 keep that test green until the npm package is dropped, then the test flips to
 fixed expected values.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}

const round = Math.round;

/**
 * Parse `#rgb` / `#rrggbb` / `rgb()` / `rgba()` into rgb components.
 * (FastColor also parses hsl/hsv/named colors — the shim only ever feeds
 * hex seeds from resources/theme.json and normalized `rgb()` probe output,
 * so those branches are deliberately not carried over.)
 */
function parseColor(input: string): Rgb {
  const str = input.trim().toLowerCase();
  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) {
    return { r: round(+m[1]), g: round(+m[2]), b: round(+m[3]) };
  }
  throw new Error(`[theme-shim] unsupported color format: ${input}`);
}

/** rgb -> hsv, mirroring FastColor.getHue/getSaturation/getValue exactly. */
function toHsv({ r, g, b }: Rgb): Hsv {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const h =
    delta === 0
      ? 0
      : round(
          60 *
            (r === max
              ? (g - b) / delta + (g < b ? 6 : 0)
              : g === max
                ? (b - r) / delta + 2
                : (r - g) / delta + 4),
        );
  return { h, s: max === 0 ? 0 : delta / max, v: max / 255 };
}

/** hsv -> rgb, mirroring FastColor.fromHsv exactly (incl. rounding points). */
function fromHsv({ h, s, v }: Hsv): Rgb {
  const vv = round(v * 255);
  if (s <= 0) {
    return { r: vv, g: vv, b: vv };
  }
  const hh = (h % 360) / 60;
  const i = Math.floor(hh);
  const ff = hh - i;
  const p = round(v * (1.0 - s) * 255);
  const q = round(v * (1.0 - s * ff) * 255);
  const t = round(v * (1.0 - s * (1.0 - ff)) * 255);
  switch (i) {
    case 0:
      return { r: vv, g: t, b: p };
    case 1:
      return { r: q, g: vv, b: p };
    case 2:
      return { r: p, g: vv, b: t };
    case 3:
      return { r: p, g: q, b: vv };
    case 4:
      return { r: t, g: p, b: vv };
    default:
      return { r: vv, g: p, b: q };
  }
}

/** Linear rgb mix, mirroring FastColor.mix (amount 0..100, toward `to`). */
function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const p = amount / 100;
  return {
    r: round((to.r - from.r) * p + from.r),
    g: round((to.g - from.g) * p + from.g),
    b: round((to.b - from.b) * p + from.b),
  };
}

/** rgb -> `#rrggbb` (lowercase), mirroring FastColor.toHexString. */
function toHexString({ r, g, b }: Rgb): string {
  const h = (v: number) => (v || 0).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// ---------------------------------------------------------------------------
// generate() — verbatim port of @ant-design/colors/es/generate.js
// ---------------------------------------------------------------------------

const hueStep = 2;
const saturationStep = 0.16;
const saturationStep2 = 0.05;
const brightnessStep1 = 0.05;
const brightnessStep2 = 0.15;
const lightColorCount = 5;
const darkColorCount = 4;

/** Dark-theme mapping table: which light-ramp index mixes at which amount. */
const darkColorMap = [
  { index: 7, amount: 15 },
  { index: 6, amount: 25 },
  { index: 5, amount: 30 },
  { index: 5, amount: 45 },
  { index: 5, amount: 65 },
  { index: 5, amount: 85 },
  { index: 4, amount: 90 },
  { index: 3, amount: 95 },
  { index: 2, amount: 97 },
  { index: 1, amount: 98 },
];

function getHue(hsv: Hsv, i: number, light?: boolean): number {
  let hue: number;
  if (round(hsv.h) >= 60 && round(hsv.h) <= 240) {
    hue = light ? round(hsv.h) - hueStep * i : round(hsv.h) + hueStep * i;
  } else {
    hue = light ? round(hsv.h) + hueStep * i : round(hsv.h) - hueStep * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return hue;
}

function getSaturation(hsv: Hsv, i: number, light?: boolean): number {
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }
  let saturation: number;
  if (light) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  }
  if (saturation > 1) {
    saturation = 1;
  }
  if (light && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }
  if (saturation < 0.06) {
    saturation = 0.06;
  }
  return round(saturation * 100) / 100;
}

function getValue(hsv: Hsv, i: number, light?: boolean): number {
  let value: number;
  if (light) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }
  value = Math.max(0, Math.min(1, value));
  return round(value * 100) / 100;
}

export interface GenerateOptions {
  theme?: 'dark' | 'default';
  backgroundColor?: string;
}

/**
 * antd's 10-step palette generator. `generate(seed)` yields the light ramp
 * (index 5 === the seed); `generate(seed, {theme: 'dark'})` yields the dark
 * ramp (each step mixed into the dark background, default `#141414`).
 */
export function generate(color: string, opts: GenerateOptions = {}): string[] {
  const patterns: Rgb[] = [];
  const pColor = parseColor(color);
  const hsv = toHsv(pColor);
  for (let i = lightColorCount; i > 0; i -= 1) {
    patterns.push(
      fromHsv({
        h: getHue(hsv, i, true),
        s: getSaturation(hsv, i, true),
        v: getValue(hsv, i, true),
      }),
    );
  }
  patterns.push(pColor);
  for (let i = 1; i <= darkColorCount; i += 1) {
    patterns.push(
      fromHsv({
        h: getHue(hsv, i),
        s: getSaturation(hsv, i),
        v: getValue(hsv, i),
      }),
    );
  }
  if (opts.theme === 'dark') {
    return darkColorMap.map(({ index, amount }) =>
      toHexString(
        mix(
          parseColor(opts.backgroundColor || '#141414'),
          patterns[index],
          amount,
        ),
      ),
    );
  }
  return patterns.map(toHexString);
}

// ---------------------------------------------------------------------------
// Preset palettes — verbatim data from @ant-design/colors/es/presets.js
// (generated tables; antd indexes them directly instead of calling generate())
// ---------------------------------------------------------------------------

/* prettier-ignore */
export const presetPalettes: Record<string, string[]> = {
  red:      ["#fff1f0", "#ffccc7", "#ffa39e", "#ff7875", "#ff4d4f", "#f5222d", "#cf1322", "#a8071a", "#820014", "#5c0011"],
  volcano:  ["#fff2e8", "#ffd8bf", "#ffbb96", "#ff9c6e", "#ff7a45", "#fa541c", "#d4380d", "#ad2102", "#871400", "#610b00"],
  orange:   ["#fff7e6", "#ffe7ba", "#ffd591", "#ffc069", "#ffa940", "#fa8c16", "#d46b08", "#ad4e00", "#873800", "#612500"],
  gold:     ["#fffbe6", "#fff1b8", "#ffe58f", "#ffd666", "#ffc53d", "#faad14", "#d48806", "#ad6800", "#874d00", "#613400"],
  yellow:   ["#feffe6", "#ffffb8", "#fffb8f", "#fff566", "#ffec3d", "#fadb14", "#d4b106", "#ad8b00", "#876800", "#614700"],
  lime:     ["#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261", "#bae637", "#a0d911", "#7cb305", "#5b8c00", "#3f6600", "#254000"],
  green:    ["#f6ffed", "#d9f7be", "#b7eb8f", "#95de64", "#73d13d", "#52c41a", "#389e0d", "#237804", "#135200", "#092b00"],
  cyan:     ["#e6fffb", "#b5f5ec", "#87e8de", "#5cdbd3", "#36cfc9", "#13c2c2", "#08979c", "#006d75", "#00474f", "#002329"],
  blue:     ["#e6f4ff", "#bae0ff", "#91caff", "#69b1ff", "#4096ff", "#1677ff", "#0958d9", "#003eb3", "#002c8c", "#001d66"],
  geekblue: ["#f0f5ff", "#d6e4ff", "#adc6ff", "#85a5ff", "#597ef7", "#2f54eb", "#1d39c4", "#10239e", "#061178", "#030852"],
  purple:   ["#f9f0ff", "#efdbff", "#d3adf7", "#b37feb", "#9254de", "#722ed1", "#531dab", "#391085", "#22075e", "#120338"],
  magenta:  ["#fff0f6", "#ffd6e7", "#ffadd2", "#ff85c0", "#f759ab", "#eb2f96", "#c41d7f", "#9e1068", "#780650", "#520339"],
  grey:     ["#a6a6a6", "#999999", "#8c8c8c", "#808080", "#737373", "#666666", "#404040", "#1a1a1a", "#000000", "#000000"],
};

/* prettier-ignore */
export const presetDarkPalettes: Record<string, string[]> = {
  red:      ["#2a1215", "#431418", "#58181c", "#791a1f", "#a61d24", "#d32029", "#e84749", "#f37370", "#f89f9a", "#fac8c3"],
  volcano:  ["#2b1611", "#441d12", "#592716", "#7c3118", "#aa3e19", "#d84a1b", "#e87040", "#f3956a", "#f8b692", "#fad4bc"],
  orange:   ["#2b1d11", "#442a11", "#593815", "#7c4a15", "#aa6215", "#d87a16", "#e89a3c", "#f3b765", "#f8cf8d", "#fae3b7"],
  gold:     ["#2b2111", "#443111", "#594214", "#7c5914", "#aa7714", "#d89614", "#e8b339", "#f3cc62", "#f8df8b", "#faedb5"],
  yellow:   ["#2b2611", "#443b11", "#595014", "#7c6e14", "#aa9514", "#d8bd14", "#e8d639", "#f3ea62", "#f8f48b", "#fafab5"],
  lime:     ["#1f2611", "#2e3c10", "#3e4f13", "#536d13", "#6f9412", "#8bbb11", "#a9d134", "#c9e75d", "#e4f88b", "#f0fab5"],
  green:    ["#162312", "#1d3712", "#274916", "#306317", "#3c8618", "#49aa19", "#6abe39", "#8fd460", "#b2e58b", "#d5f2bb"],
  cyan:     ["#112123", "#113536", "#144848", "#146262", "#138585", "#13a8a8", "#33bcb7", "#58d1c9", "#84e2d8", "#b2f1e8"],
  blue:     ["#111a2c", "#112545", "#15325b", "#15417e", "#1554ad", "#1668dc", "#3c89e8", "#65a9f3", "#8dc5f8", "#b7dcfa"],
  geekblue: ["#131629", "#161d40", "#1c2755", "#203175", "#263ea0", "#2b4acb", "#5273e0", "#7f9ef3", "#a8c1f8", "#d2e0fa"],
  purple:   ["#1a1325", "#24163a", "#301c4d", "#3e2069", "#51258f", "#642ab5", "#854eca", "#ab7ae0", "#cda8f0", "#ebd7fa"],
  magenta:  ["#291321", "#40162f", "#551c3b", "#75204f", "#a02669", "#cb2b83", "#e0529c", "#f37fb7", "#f8a8cc", "#fad2e3"],
  grey:     ["#151515", "#1f1f1f", "#2d2d2d", "#393939", "#494949", "#5a5a5a", "#6a6a6a", "#7b7b7b", "#888888", "#969696"],
};

// ---------------------------------------------------------------------------
// antd's palette-key indexing (themes/default|dark/colors.js)
// ---------------------------------------------------------------------------

/**
 * antd never indexes the raw `generate()` array from its map tokens — it goes
 * through a 1..10 "palette key" indirection whose mapping DIFFERS between the
 * default and dark algorithms (`generateColorPalettes` in
 * `antd/es/theme/themes/{default,dark}/colors.js`). E.g. `colorPrimaryHover`
 * is palette key 5 in both modes, which is `ramp[4]` in light but `ramp[6]`
 * in dark. Reproducing the key indirection (instead of hardcoding raw ramp
 * indices) is what makes the shim's dark-mode derivation exact.
 */
/* prettier-ignore */
const PALETTE_KEY_TO_RAMP_INDEX: Record<'light' | 'dark', Record<number, number>> = {
  light: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 4, 9: 5, 10: 6 },
  dark:  { 1: 0, 2: 1, 3: 2, 4: 3, 5: 6, 6: 5, 7: 4, 8: 6, 9: 5, 10: 4 },
};

/**
 * antd-equivalent color palette for a seed: `palette(seed, mode)(key)` returns
 * exactly what antd's `generateColorPalettes(seed)[key]` returns under the
 * default (light) / dark algorithm. Note dark uses the generator's default
 * `#141414` background — this is how `#DC6B03` becomes the measured `#be5e06`
 * (`palette(seed, 'dark')(6)`), i.e. antd's darkAlgorithm seed transform.
 */
export function palette(
  seed: string,
  mode: 'light' | 'dark',
): (key: number) => string {
  const ramp = generate(seed, mode === 'dark' ? { theme: 'dark' } : {});
  return (key: number) => ramp[PALETTE_KEY_TO_RAMP_INDEX[mode][key]];
}
