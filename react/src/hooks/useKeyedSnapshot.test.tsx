/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useKeyedSnapshot } from '.';
import { renderHook, act } from '@testing-library/react';

type Tab = 'users' | 'credentials';

const renderKeyedSnapshot = (initialKey: Tab, initialValue: string) =>
  renderHook(
    ({ sourceKey, value }: { sourceKey: Tab; value: string }) =>
      useKeyedSnapshot<Tab, string>(sourceKey, value),
    { initialProps: { sourceKey: initialKey, value: initialValue } },
  );

describe('useKeyedSnapshot', () => {
  it('seeds the initial key with the first rendered value', () => {
    const { result } = renderKeyedSnapshot('users', 'users-initial');

    expect(result.current[0]).toBe('users');

    // Leave and come back: the value present on the first render must be what
    // the initial key restores to.
    act(() => {
      result.current[1]('credentials');
    });
    expect(result.current[2]('users')).toBe('users-initial');
  });

  it('snapshots the departing key and peeks the target key value', () => {
    const { result, rerender } = renderKeyedSnapshot('users', 'users-initial');

    rerender({ sourceKey: 'users', value: 'users-edited' });
    act(() => {
      result.current[1]('credentials');
    });
    rerender({ sourceKey: 'credentials', value: 'credentials-edited' });

    expect(result.current[2]('users')).toBe('users-edited');
    act(() => {
      result.current[1]('users');
    });
    expect(result.current[0]).toBe('users');
    expect(result.current[2]('credentials')).toBe('credentials-edited');
  });

  it('peeks the live value for the current key', () => {
    const { result, rerender } = renderKeyedSnapshot('users', 'users-initial');

    rerender({ sourceKey: 'users', value: 'users-edited' });

    expect(result.current[2]('users')).toBe('users-edited');
  });

  it('returns undefined for a key that was never visited, without switching', () => {
    const { result } = renderKeyedSnapshot('users', 'users-initial');

    expect(result.current[2]('credentials')).toBeUndefined();
    expect(result.current[0]).toBe('users');

    act(() => {
      result.current[1]('credentials');
    });
    expect(result.current[0]).toBe('credentials');
  });

  it('holds the new key while the source key still reports the departing one', () => {
    const { result, rerender } = renderKeyedSnapshot('users', 'users-initial');

    act(() => {
      result.current[1]('credentials');
    });
    expect(result.current[0]).toBe('credentials');

    // A rerender arrives with `sourceKey` still describing the tab the user
    // just left: an unchanged `sourceKey` must never override a key that was
    // set through `setKey`.
    rerender({ sourceKey: 'users', value: 'users-initial' });
    expect(result.current[0]).toBe('credentials');
  });

  it('re-syncs the current key when the source key changes', () => {
    const { result, rerender } = renderKeyedSnapshot('users', 'users-initial');

    // A browser navigation changes the source key without going through
    // setKey.
    rerender({ sourceKey: 'credentials', value: 'credentials-from-url' });

    expect(result.current[0]).toBe('credentials');

    // An unchanged source key is a no-op.
    rerender({ sourceKey: 'credentials', value: 'credentials-from-url' });
    expect(result.current[0]).toBe('credentials');
  });
});
