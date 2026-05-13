import { buildAntdTheme } from './antdTheme';

describe('hexToRgba (via itemSelectedBg)', () => {
  it('produces rgba 15% from a #RRGGBB primary in light mode', () => {
    const theme = buildAntdTheme(
      { colors: { light: { primary: '#FF7A00' } } },
      false,
    );
    expect(theme.components?.Menu?.itemSelectedBg).toBe(
      'rgba(255, 122, 0, 0.15)',
    );
  });

  it('uses dark primary when isDarkMode=true', () => {
    const theme = buildAntdTheme(
      {
        colors: { light: { primary: '#1677FF' }, dark: { primary: '#4096FF' } },
      },
      true,
    );
    expect(theme.components?.Menu?.itemSelectedBg).toBe(
      'rgba(64, 150, 255, 0.15)',
    );
  });

  it('falls back to undefined for invalid hex (no #fff shorthand support)', () => {
    const theme = buildAntdTheme(
      { colors: { light: { primary: '#fff' } } },
      false,
    );
    // Invalid → undefined. Documented limitation; #RRGGBB only.
    expect(theme.components?.Menu?.itemSelectedBg).toBeUndefined();
  });
});

describe('buildAntdTheme', () => {
  it('selects dark or light algorithm based on isDarkMode', () => {
    const dark = buildAntdTheme(undefined, true);
    const light = buildAntdTheme(undefined, false);
    expect(dark.algorithm).not.toBe(light.algorithm);
  });

  it('forwards Layout.headerBg from branding.colors[mode]', () => {
    const theme = buildAntdTheme(
      {
        colors: {
          light: { headerBg: '#ABCDEF' },
          dark: { headerBg: '#123456' },
        },
      },
      false,
    );
    expect(theme.components?.Layout?.headerBg).toBe('#ABCDEF');
  });

  it('keeps Menu component tokens locked to WebUI/FastTrack convention', () => {
    const theme = buildAntdTheme(undefined, false);
    expect(theme.components?.Menu?.itemHeight).toBe(40);
    expect(theme.components?.Menu?.itemBorderRadius).toBe(20);
    expect(theme.components?.Menu?.itemMarginInline).toBe(16);
    expect(theme.components?.Menu?.fontSize).toBe(16);
  });
});
