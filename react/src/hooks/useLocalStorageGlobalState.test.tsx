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

  it('keeps mounted instances on one value when another document changes the storage', () => {
    localStorage.setItem(KEY, JSON.stringify('stained'));
    const view = render(
      <>
        <Reader testId="a" />
        <Reader testId="b" />
      </>,
    );
    localStorage.setItem(KEY, JSON.stringify('bliss'));
    view.rerender(
      <>
        <Reader testId="a" />
        <Reader testId="b" />
        <Reader testId="mounted-later" />
      </>,
    );
    expect(screen.getByTestId('a')).toHaveTextContent('stained');
    expect(screen.getByTestId('b')).toHaveTextContent('stained');
    expect(screen.getByTestId('mounted-later')).toHaveTextContent('stained');
  });

  it('reads the storage again once no instance is mounted', () => {
    const first = render(<Parent next="bliss" />);
    first.unmount();
    localStorage.setItem(KEY, JSON.stringify('glass'));
    render(<Reader testId="fresh" />);
    expect(screen.getByTestId('fresh')).toHaveTextContent('glass');
  });

  it('keeps a value the storage refused, also after every instance unmounted', () => {
    // Its own key: the refused value stays in the atom for the rest of the file.
    const REFUSED_KEY = 'backendaiwebui.settings.test.globalState.refused';
    const RefusedKeyView = ({ next }: { next?: string }) => {
      const [value, setValue] = useLocalStorageGlobalState<string | undefined>(
        REFUSED_KEY,
        undefined,
      );
      return (
        <>
          <span data-testid="refused">{value ?? 'none'}</span>
          <button onClick={() => setValue(next)}>write</button>
        </>
      );
    };
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });
    const first = render(<RefusedKeyView next="glass" />);
    try {
      fireEvent.click(screen.getByRole('button', { name: 'write' }));
      expect(screen.getByTestId('refused')).toHaveTextContent('glass');
    } finally {
      setItem.mockRestore();
    }
    expect(localStorage.getItem(REFUSED_KEY)).toBeNull();
    first.unmount();
    render(<RefusedKeyView />);
    expect(screen.getByTestId('refused')).toHaveTextContent('glass');
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
