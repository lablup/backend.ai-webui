import { ThemeShimProvider } from '../theme-shim';
import usePrimaryColors from './usePrimaryColors';
import { renderHook } from '@testing-library/react';
import React from 'react';

// `usePrimaryColors` reads `theme.useToken()` from the theme-shim, not from
// antd's `ConfigProvider` (to-astryx ticket 10 moved every `useToken` call
// site across). This test used to drive it through `<ConfigProvider theme>`,
// which stopped having any effect on the hook — the assertions were reading
// the shim's fallback brand seeds and failing against antd's old defaults.
// Seeds now go in through the shim's own provider, which is the supported way
// a deployment overrides them (`resources/theme.json` → `ThemeShimProvider`).

// Mock the palette algorithm only. Ticket 35 repointed `usePrimaryColors`
// from `@ant-design/colors` to the theme-shim's re-export of the vendored,
// parity-tested port of that same algorithm (so react/ no longer carries
// `@ant-design/colors` as a production dependency). The palette assertions
// below deliberately test the WIRING — that palette[n] lands on primaryN —
// not the algorithm's real output, so `generate` stays stubbed. Everything
// else in the module must remain real: the test drives the hook through the
// genuine `ThemeShimProvider`.
vi.mock('../theme-shim', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../theme-shim')>()),
  generate: vi.fn((color: string) => [
    `${color}-1`,
    `${color}-2`,
    `${color}-3`,
    `${color}-4`,
    `${color}-5`,
    `${color}-6`,
    `${color}-7`,
    `${color}-8`,
    `${color}-9`,
    `${color}-10`,
  ]),
}));

// Hoisted so the identity is stable across re-renders: `ThemeShimProvider`
// keys its token build on `seeds`, and an inline literal would hand it a new
// object every render — which is exactly what the memoization test below is
// asserting does NOT happen.
const SEEDS = {
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  colorInfo: '#1677ff',
};

describe('usePrimaryColors', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeShimProvider mode="light" seeds={SEEDS}>
      {children}
    </ThemeShimProvider>
  );

  it('should return custom colors object', () => {
    const { result } = renderHook(() => usePrimaryColors(), { wrapper });

    expect(result.current).toHaveProperty('primary');
    expect(result.current).toHaveProperty('secondary');
    expect(result.current).toHaveProperty('admin');
    expect(result.current).toHaveProperty('primary1');
    expect(result.current).toHaveProperty('primary2');
    expect(result.current).toHaveProperty('primary3');
    expect(result.current).toHaveProperty('primary4');
    expect(result.current).toHaveProperty('primary5');
    expect(result.current).toHaveProperty('primary6');
    expect(result.current).toHaveProperty('primary7');
    expect(result.current).toHaveProperty('primary8');
    expect(result.current).toHaveProperty('primary9');
    expect(result.current).toHaveProperty('primary10');
  });

  it('should return primary color from theme token', () => {
    const { result } = renderHook(() => usePrimaryColors(), { wrapper });

    expect(result.current.primary).toBe('#1890ff');
  });

  it('should return secondary color as colorSuccess', () => {
    const { result } = renderHook(() => usePrimaryColors(), { wrapper });

    expect(result.current.secondary).toBe('#52c41a');
  });

  it('should return admin color as colorInfo', () => {
    const { result } = renderHook(() => usePrimaryColors(), { wrapper });

    expect(result.current.admin).toBe('#1677ff');
  });

  it('should generate primary color palette', () => {
    const { result } = renderHook(() => usePrimaryColors(), { wrapper });

    expect(result.current.primary1).toBe('#1890ff-1');
    expect(result.current.primary2).toBe('#1890ff-2');
    expect(result.current.primary3).toBe('#1890ff-3');
    expect(result.current.primary4).toBe('#1890ff-4');
    expect(result.current.primary5).toBe('#1890ff-5');
    expect(result.current.primary6).toBe('#1890ff-6'); // Main primary color
    expect(result.current.primary7).toBe('#1890ff-7');
    expect(result.current.primary8).toBe('#1890ff-8');
    expect(result.current.primary9).toBe('#1890ff-9');
    expect(result.current.primary10).toBe('#1890ff-10');
  });

  it('should memoize colors based on token', () => {
    const { result, rerender } = renderHook(() => usePrimaryColors(), {
      wrapper,
    });

    const firstResult = result.current;

    rerender();

    // Should return the same object reference due to memoization
    expect(result.current).toBe(firstResult);
  });

  it('should update colors when theme token changes', () => {
    const customWrapper1 = ({ children }: { children: React.ReactNode }) => (
      <ThemeShimProvider
        mode="light"
        seeds={{
          colorPrimary: '#ff0000',
          colorSuccess: '#00ff00',
          colorInfo: '#0000ff',
        }}
      >
        {children}
      </ThemeShimProvider>
    );

    const { result: result1 } = renderHook(() => usePrimaryColors(), {
      wrapper: customWrapper1,
    });

    expect(result1.current.primary).toBe('#ff0000');
    expect(result1.current.secondary).toBe('#00ff00');
    expect(result1.current.admin).toBe('#0000ff');
    expect(result1.current.primary1).toBe('#ff0000-1');

    const customWrapper2 = ({ children }: { children: React.ReactNode }) => (
      <ThemeShimProvider
        mode="light"
        seeds={{
          colorPrimary: '#00ff00',
          colorSuccess: '#ff0000',
          colorInfo: '#ffff00',
        }}
      >
        {children}
      </ThemeShimProvider>
    );

    const { result: result2 } = renderHook(() => usePrimaryColors(), {
      wrapper: customWrapper2,
    });

    expect(result2.current.primary).toBe('#00ff00');
    expect(result2.current.secondary).toBe('#ff0000');
    expect(result2.current.admin).toBe('#ffff00');
    expect(result2.current.primary1).toBe('#00ff00-1');
  });
});
