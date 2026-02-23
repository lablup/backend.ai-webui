import { useScrollBreakPoint } from './useScrollBreackPoint';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

describe('useScrollBreakPoint', () => {
  beforeEach(() => {
    // Reset window scroll position
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with false values when below breakpoints', () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);
    });

    it('should handle only x breakpoint', () => {
      const { result } = renderHook(() => useScrollBreakPoint({ x: 100 }));

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);
    });

    it('should handle only y breakpoint', () => {
      const { result } = renderHook(() => useScrollBreakPoint({ y: 200 }));

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);
    });

    it('should handle no breakpoints', () => {
      const { result } = renderHook(() => useScrollBreakPoint({}));

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);
    });
  });

  describe('Window Scroll Detection', () => {
    it('should detect when horizontal scroll exceeds breakpoint', async () => {
      const { result } = renderHook(() => useScrollBreakPoint({ x: 100 }));

      expect(result.current.x).toBe(false);

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 150,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
      });
    });

    it('should detect when vertical scroll exceeds breakpoint', async () => {
      const { result } = renderHook(() => useScrollBreakPoint({ y: 200 }));

      expect(result.current.y).toBe(false);

      act(() => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 250,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.y).toBe(true);
      });
    });

    it('should detect both x and y exceeding breakpoints', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 150,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 250,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });
    });

    it('should remain false when scroll is at exact breakpoint', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 100,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 200,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });

    it('should transition from true to false when scrolling back', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      // First scroll past the breakpoint
      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 150,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 250,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });

      // Then scroll back below the breakpoint
      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 50,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 100,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });
  });

  describe('Element Scroll Detection', () => {
    it('should detect scroll on a custom element', async () => {
      const element = document.createElement('div');
      Object.defineProperty(element, 'scrollLeft', {
        writable: true,
        configurable: true,
        value: 0,
      });
      Object.defineProperty(element, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }, element),
      );

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);

      act(() => {
        Object.defineProperty(element, 'scrollLeft', {
          writable: true,
          configurable: true,
          value: 150,
        });
        Object.defineProperty(element, 'scrollTop', {
          writable: true,
          configurable: true,
          value: 250,
        });
        element.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });
    });

    it('should use element scroll values when available', async () => {
      // When element has scroll properties, they should be used instead of window scroll
      const element = document.createElement('div');
      Object.defineProperty(element, 'scrollLeft', {
        writable: true,
        configurable: true,
        value: 50,
      });
      Object.defineProperty(element, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 100,
      });

      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }, element),
      );

      // Set window scroll to high values
      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 500,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 600,
        });
        element.dispatchEvent(new Event('scroll'));
      });

      // Should use element scroll values (50, 100) which are below breakpoints
      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });

    it('should handle null element', () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }, null),
      );

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);
    });
  });

  describe('Dynamic Breakpoint Updates', () => {
    it('should update when breakpoints change', async () => {
      const { result, rerender } = renderHook(
        ({ breakpoints }) => useScrollBreakPoint(breakpoints),
        {
          initialProps: { breakpoints: { x: 100, y: 200 } },
        },
      );

      // Scroll past initial breakpoint
      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 150,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 250,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });

      // Update breakpoints to higher values
      rerender({ breakpoints: { x: 200, y: 300 } });

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });

    it('should update when element changes', async () => {
      const element1 = document.createElement('div');
      Object.defineProperty(element1, 'scrollLeft', {
        writable: true,
        configurable: true,
        value: 150,
      });
      Object.defineProperty(element1, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 250,
      });

      const element2 = document.createElement('div');
      Object.defineProperty(element2, 'scrollLeft', {
        writable: true,
        configurable: true,
        value: 50,
      });
      Object.defineProperty(element2, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 100,
      });

      const { result, rerender } = renderHook(
        ({ element }) => useScrollBreakPoint({ x: 100, y: 200 }, element),
        {
          initialProps: { element: element1 },
        },
      );

      act(() => {
        element1.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });

      // Change element
      rerender({ element: element2 });

      act(() => {
        element2.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero breakpoints', async () => {
      const { result } = renderHook(() => useScrollBreakPoint({ x: 0, y: 0 }));

      expect(result.current.x).toBe(false);
      expect(result.current.y).toBe(false);

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 1,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 1,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });
    });

    it('should handle negative scroll values', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: -10,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: -20,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(false);
        expect(result.current.y).toBe(false);
      });
    });

    it('should handle very large scroll values', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      act(() => {
        Object.defineProperty(window, 'scrollX', {
          writable: true,
          configurable: true,
          value: 999999,
        });
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: 999999,
        });
        window.dispatchEvent(new Event('scroll'));
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });
    });

    it('should handle multiple rapid scroll events', async () => {
      const { result } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      act(() => {
        for (let i = 0; i < 10; i++) {
          Object.defineProperty(window, 'scrollX', {
            writable: true,
            configurable: true,
            value: 50 + i * 10,
          });
          Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 100 + i * 20,
          });
          window.dispatchEvent(new Event('scroll'));
        }
      });

      await waitFor(() => {
        expect(result.current.x).toBe(true);
        expect(result.current.y).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should cleanup element event listeners on unmount', () => {
      const element = document.createElement('div');
      const removeEventListenerSpy = jest.spyOn(element, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useScrollBreakPoint({ x: 100, y: 200 }, element),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should remove old listener and add new one when element changes', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      const removeEventListenerSpy1 = jest.spyOn(
        element1,
        'removeEventListener',
      );
      const addEventListenerSpy2 = jest.spyOn(element2, 'addEventListener');

      const { rerender } = renderHook(
        ({ element }) => useScrollBreakPoint({ x: 100, y: 200 }, element),
        {
          initialProps: { element: element1 },
        },
      );

      rerender({ element: element2 });

      expect(removeEventListenerSpy1).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      );
      expect(addEventListenerSpy2).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      );

      removeEventListenerSpy1.mockRestore();
      addEventListenerSpy2.mockRestore();
    });
  });
});
