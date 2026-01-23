import usePrimaryColors from './usePrimaryColors';
import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';

// Mock @ant-design/colors
jest.mock('@ant-design/colors', () => ({
  generate: jest.fn((color: string) => [
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

describe('usePrimaryColors', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorInfo: '#1677ff',
        },
      }}
    >
      {children}
    </ConfigProvider>
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
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#ff0000',
            colorSuccess: '#00ff00',
            colorInfo: '#0000ff',
          },
        }}
      >
        {children}
      </ConfigProvider>
    );

    const { result: result1 } = renderHook(() => usePrimaryColors(), {
      wrapper: customWrapper1,
    });

    expect(result1.current.primary).toBe('#ff0000');
    expect(result1.current.secondary).toBe('#00ff00');
    expect(result1.current.admin).toBe('#0000ff');
    expect(result1.current.primary1).toBe('#ff0000-1');

    const customWrapper2 = ({ children }: { children: React.ReactNode }) => (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00ff00',
            colorSuccess: '#ff0000',
            colorInfo: '#ffff00',
          },
        }}
      >
        {children}
      </ConfigProvider>
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
