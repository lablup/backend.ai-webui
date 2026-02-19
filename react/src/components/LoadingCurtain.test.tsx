/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import LoadingCurtain from './LoadingCurtain';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';

jest.mock('antd-style', () => ({
  createStyles: (fn: Function) => {
    const result = fn({
      css: (..._args: any[]) => '',
      token: {},
    });
    const styles = Object.fromEntries(
      Object.keys(result).map((key) => [key, key]),
    );
    return () => ({
      styles,
      cx: (...args: (string | false | undefined)[]) =>
        args.filter(Boolean).join(' '),
    });
  },
}));

describe('LoadingCurtain', () => {
  it('renders the loading curtain initially', () => {
    render(<LoadingCurtain />);

    const curtain = document.getElementById('loading-curtain');
    expect(curtain).toBeInTheDocument();
  });

  it('renders the drag area initially', () => {
    render(<LoadingCurtain />);

    const dragArea = document.getElementById('loading-drag-area');
    expect(dragArea).toBeInTheDocument();
  });

  it('applies visually hidden styles when backend-ai-connected event fires', () => {
    render(<LoadingCurtain />);

    const curtain = document.getElementById('loading-curtain');
    expect(curtain?.className).not.toContain('visuallyHidden');

    act(() => {
      document.dispatchEvent(new CustomEvent('backend-ai-connected'));
    });

    expect(curtain?.className).toContain('visuallyHidden');
  });

  it('removes background image from body when backend-ai-connected fires', () => {
    document.body.style.backgroundImage =
      'url(/resources/images/loading-background-large.jpg)';

    render(<LoadingCurtain />);

    act(() => {
      document.dispatchEvent(new CustomEvent('backend-ai-connected'));
    });

    expect(document.body.style.backgroundImage).toBe('none');
  });

  it('does not apply visually hidden styles before backend-ai-connected event', () => {
    render(<LoadingCurtain />);

    const curtain = document.getElementById('loading-curtain');
    expect(curtain?.className).not.toContain('visuallyHidden');
  });

  it('cleans up event listener on unmount', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<LoadingCurtain />);

    const addedListeners = addSpy.mock.calls.filter(
      ([event]) => event === 'backend-ai-connected',
    );
    expect(addedListeners).toHaveLength(1);

    unmount();

    const removedListeners = removeSpy.mock.calls.filter(
      ([event]) => event === 'backend-ai-connected',
    );
    expect(removedListeners).toHaveLength(1);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('applies transition styles for fade-out animation', () => {
    render(<LoadingCurtain />);

    const curtain = document.getElementById('loading-curtain');
    // Initial class includes base styles
    expect(curtain?.className).toContain('loadingBackground');
    expect(curtain?.className).toContain('loadingBackgroundBefore');
  });

  it('curtain remains in DOM before transition completes', () => {
    render(<LoadingCurtain />);

    act(() => {
      document.dispatchEvent(new CustomEvent('backend-ai-connected'));
    });

    // Still in DOM - transition has not ended yet
    expect(document.getElementById('loading-curtain')).toBeInTheDocument();
  });
});
