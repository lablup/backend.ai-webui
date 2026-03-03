import '../__test__/matchMedia.mock.js';
import { useInterval, useIntervalValue } from './useIntervalValue';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

// Test component for useInterval
const TestIntervalComponent: React.FC<{
  delay: number | null;
  pauseWhenHidden?: boolean;
}> = ({ delay, pauseWhenHidden = true }) => {
  const [count, setCount] = React.useState(0);

  useInterval(
    () => {
      setCount((prev) => prev + 1);
    },
    delay,
    pauseWhenHidden,
  );

  return <div data-testid="interval-count">{count}</div>;
};

// Test component for useIntervalValue
const TestIntervalValueComponent: React.FC<{
  delay: number | null;
  pauseWhenHidden?: boolean;
}> = ({ delay, pauseWhenHidden = true }) => {
  const value = useIntervalValue(
    () => Date.now(),
    delay,
    undefined,
    pauseWhenHidden,
  );

  return <div data-testid="interval-value">{value}</div>;
};

describe('useInterval and useIntervalValue hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock document.hidden as false initially (page is visible)
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useInterval', () => {
    it('should increment count at specified interval', () => {
      render(<TestIntervalComponent delay={1000} />);

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('1');

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('3');
    });

    it('should pause when pauseWhenHidden is true and page becomes hidden', () => {
      render(<TestIntervalComponent delay={1000} pauseWhenHidden={true} />);

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');

      // Page becomes hidden
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Timer should not increment
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');

      // Page becomes visible again
      act(() => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Should execute immediately when visible again
      expect(screen.getByTestId('interval-count')).toHaveTextContent('1');

      // Continue normal interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('2');
    });

    it('should continue running when pauseWhenHidden is false and page becomes hidden', () => {
      render(<TestIntervalComponent delay={1000} pauseWhenHidden={false} />);

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');

      // Page becomes hidden
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Timer should continue to increment even when hidden
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('2');
    });

    it('should not run when delay is null', () => {
      render(<TestIntervalComponent delay={null} />);

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByTestId('interval-count')).toHaveTextContent('0');
    });
  });

  describe('useIntervalValue', () => {
    it('should update value at specified interval', () => {
      render(<TestIntervalValueComponent delay={1000} />);

      const initialValue = screen.getByTestId('interval-value').textContent;

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const updatedValue = screen.getByTestId('interval-value').textContent;
      expect(updatedValue).not.toBe(initialValue);
    });

    it('should pause value updates when page becomes hidden and pauseWhenHidden is true', () => {
      render(
        <TestIntervalValueComponent delay={1000} pauseWhenHidden={true} />,
      );

      const initialValue = screen.getByTestId('interval-value').textContent;

      // Page becomes hidden
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Value should not change when hidden
      expect(screen.getByTestId('interval-value')).toHaveTextContent(
        initialValue!,
      );

      // Page becomes visible again
      act(() => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Value should update immediately when visible again
      const newValue = screen.getByTestId('interval-value').textContent;
      expect(newValue).not.toBe(initialValue);
    });

    it('should continue updating when pauseWhenHidden is false and page becomes hidden', () => {
      render(
        <TestIntervalValueComponent delay={1000} pauseWhenHidden={false} />,
      );

      const initialValue = screen.getByTestId('interval-value').textContent;

      // Page becomes hidden
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Value should continue to update even when hidden
      const updatedValue = screen.getByTestId('interval-value').textContent;
      expect(updatedValue).not.toBe(initialValue);
    });
  });
});
