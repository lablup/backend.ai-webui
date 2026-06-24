import { buildBrandingFromProps } from './buildBrandingFromProps';

describe('buildBrandingFromProps', () => {
  it('returns undefined when nothing is supplied (lets defaults take over)', () => {
    expect(buildBrandingFromProps({})).toBeUndefined();
  });

  it('individual props override the corresponding fields on a passed branding object', () => {
    const result = buildBrandingFromProps({
      branding: {
        branding: { brandName: 'Old', companyName: 'OldCo' },
      },
      brandName: 'New',
    });
    expect(result?.branding?.brandName).toBe('New');
    expect(result?.branding?.companyName).toBe('OldCo');
  });

  it('shallow-merges colors per mode (light + dark)', () => {
    const result = buildBrandingFromProps({
      branding: {
        colors: {
          light: { primary: '#111', headerBg: '#222' },
          dark: { primary: '#AAA' },
        },
      },
      colors: {
        light: { headerBg: '#333' }, // overrides light.headerBg only
      },
    });
    expect(result?.colors?.light?.primary).toBe('#111');
    expect(result?.colors?.light?.headerBg).toBe('#333');
    expect(result?.colors?.dark?.primary).toBe('#AAA');
  });

  it('translates the flat tokens shape into nested sider/header config', () => {
    const result = buildBrandingFromProps({
      tokens: {
        siderWidth: 250,
        siderCollapsedWidth: 80,
        headerHeight: 64,
        fontFamily: "'Inter', sans-serif",
      },
    });
    expect(result?.sider?.widthExpanded).toBe(250);
    expect(result?.sider?.widthCollapsed).toBe(80);
    expect(result?.header?.height).toBe(64);
    expect(result?.fontFamily).toBe("'Inter', sans-serif");
  });
});
