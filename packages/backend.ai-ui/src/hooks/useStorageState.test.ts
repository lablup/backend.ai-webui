import {
  useLocalStorageState,
  useSessionStorageState,
} from './useStorageState';
import { renderHook, act } from '@testing-library/react';

describe('useStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns the defaultValue when nothing is stored', () => {
    const { result } = renderHook(() =>
      useSessionStorageState('missing', { defaultValue: false }),
    );
    expect(result.current[0]).toBe(false);
    expect(sessionStorage.getItem('missing')).toBeNull();
  });

  it('accepts a lazy defaultValue', () => {
    const { result } = renderHook(() =>
      useLocalStorageState('lazy', { defaultValue: () => ({ n: 1 }) }),
    );
    expect(result.current[0]).toEqual({ n: 1 });
  });

  it('hydrates from a pre-existing entry', () => {
    sessionStorage.setItem('hydrate', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() =>
      useSessionStorageState<{ a: number }>('hydrate'),
    );
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('writes through to storage and back', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string>('key', { defaultValue: 'a' }),
    );

    act(() => result.current[1]('b'));

    expect(result.current[0]).toBe('b');
    expect(localStorage.getItem('key')).toBe(JSON.stringify('b'));
  });

  it('supports an updater function', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<number>('count', { defaultValue: 1 }),
    );
    act(() => result.current[1]((prev) => (prev ?? 0) + 1));
    expect(result.current[0]).toBe(2);
  });

  it('removes the entry when set to undefined, but stores null', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string | null | undefined>('nullable', {
        defaultValue: 'a',
      }),
    );

    act(() => result.current[1](null));
    expect(localStorage.getItem('nullable')).toBe('null');

    act(() => result.current[1](undefined));
    expect(localStorage.getItem('nullable')).toBeNull();
  });

  it('is a no-op when the next value is Object.is-equal', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string>('same', { defaultValue: 'a' }),
    );
    act(() => result.current[1]('a'));
    // The write is skipped entirely, so the key was never created.
    expect(localStorage.getItem('same')).toBeNull();
  });

  it('re-reads storage when the key changes', () => {
    localStorage.setItem('k1', JSON.stringify('one'));
    localStorage.setItem('k2', JSON.stringify('two'));

    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorageState<string>(key),
      { initialProps: { key: 'k1' } },
    );
    expect(result.current[0]).toBe('one');

    rerender({ key: 'k2' });
    expect(result.current[0]).toBe('two');
  });

  it('keeps a stable setter identity', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorageState<number>('stable', { defaultValue: 0 }),
    );
    const setter = result.current[1];
    act(() => result.current[1](1));
    rerender();
    expect(result.current[1]).toBe(setter);
  });

  it('syncs sibling instances only when listenStorageChange is on', () => {
    const withoutSync = renderHook(() =>
      useLocalStorageState<string>('shared', { defaultValue: 'a' }),
    );
    const withSync = renderHook(() =>
      useLocalStorageState<string>('shared', {
        defaultValue: 'a',
        listenStorageChange: true,
      }),
    );

    act(() => withoutSync.result.current[1]('b'));

    expect(withoutSync.result.current[0]).toBe('b');
    expect(withSync.result.current[0]).toBe('b');

    // The non-listening instance does not observe the listener's write.
    act(() => withSync.result.current[1]('c'));
    expect(withoutSync.result.current[0]).toBe('b');
    expect(withSync.result.current[0]).toBe('c');
  });

  it('reports deserialization failures through onError instead of throwing', () => {
    localStorage.setItem('broken', '{not json');
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useLocalStorageState<string>('broken', {
        defaultValue: 'fallback',
        onError,
      }),
    );

    expect(result.current[0]).toBe('fallback');
    expect(onError).toHaveBeenCalled();
  });

  it('honours custom serializer / deserializer', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string>('raw', {
        defaultValue: 'a',
        serializer: (v) => v,
        deserializer: (v) => v,
      }),
    );

    act(() => result.current[1]('plain'));
    expect(localStorage.getItem('raw')).toBe('plain');
  });
});
