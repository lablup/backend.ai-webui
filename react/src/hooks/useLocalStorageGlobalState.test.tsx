/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useEffectEvent } from 'react';

const KEY = 'backendaiwebui.settings.test.globalState';

const Reader = ({ testId }: { testId: string }) => {
  const [value] = useLocalStorageGlobalState<string | undefined>(
    KEY,
    undefined,
  );
  return <span data-testid={testId}>{value ?? 'none'}</span>;
};

const WriterOnMount = ({ next }: { next: string | undefined }) => {
  const [, setValue] = useLocalStorageGlobalState<string | undefined>(
    KEY,
    undefined,
  );
  const writeOnMount = useEffectEvent(() => setValue(next));
  useEffect(() => {
    writeOnMount();
  }, []);
  return null;
};

const Parent = ({ next }: { next: string | undefined }) => {
  const [value] = useLocalStorageGlobalState<string | undefined>(
    KEY,
    undefined,
  );
  return (
    <>
      <span data-testid="parent">{value ?? 'none'}</span>
      <WriterOnMount next={next} />
      <Reader testId="later-sibling" />
    </>
  );
};

describe('useLocalStorageGlobalState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gives a value written in a mount effect to the parent and later siblings mounted in the same commit', () => {
    localStorage.setItem(KEY, JSON.stringify('stained'));
    render(<Parent next="bliss" />);
    expect(screen.getByTestId('parent')).toHaveTextContent('bliss');
    expect(screen.getByTestId('later-sibling')).toHaveTextContent('bliss');
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify('bliss'));
  });

  it('removes the entry and returns the default when set to undefined', () => {
    localStorage.setItem(KEY, JSON.stringify('stained'));
    render(<Parent next={undefined} />);
    expect(screen.getByTestId('parent')).toHaveTextContent('none');
    expect(screen.getByTestId('later-sibling')).toHaveTextContent('none');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('updates every mounted instance when one of them writes', () => {
    const Writer = () => {
      const [, setValue] = useLocalStorageGlobalState<string | undefined>(
        KEY,
        undefined,
      );
      return <button onClick={() => setValue('glass')}>write</button>;
    };
    render(
      <>
        <Reader testId="a" />
        <Writer />
        <Reader testId="b" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'write' }));
    expect(screen.getByTestId('a')).toHaveTextContent('glass');
    expect(screen.getByTestId('b')).toHaveTextContent('glass');
  });
});
