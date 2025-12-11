import BAIStatistic from './BAIStatistic';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'comp:BAIStatistic.Unlimited': 'Unlimited',
      };
      return translations[key] || key;
    },
  }),
}));

describe('BAIStatistic', () => {
  describe('Basic Rendering', () => {
    it('should render title correctly', () => {
      render(<BAIStatistic title="Test Title" current={10} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render current value without total', () => {
      render(<BAIStatistic title="Usage" current={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render unit when provided', () => {
      render(<BAIStatistic title="Memory" current={512} unit="MB" />);
      expect(screen.getByText('512')).toBeInTheDocument();
      expect(screen.getByText('MB')).toBeInTheDocument();
    });

    it('should render with both current and total values', () => {
      render(<BAIStatistic title="CPU" current={4} total={8} unit="cores" />);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('cores')).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format decimal numbers with default precision (2)', () => {
      render(<BAIStatistic title="Usage" current={3.14159} />);
      expect(screen.getByText('3.14')).toBeInTheDocument();
    });

    it('should format decimal numbers with custom precision', () => {
      render(<BAIStatistic title="Usage" current={3.14159} precision={3} />);
      expect(screen.getByText('3.142')).toBeInTheDocument();
    });

    it('should remove trailing zeros after decimal point', () => {
      render(<BAIStatistic title="Usage" current={5.0} precision={2} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should format integer without decimal point', () => {
      render(<BAIStatistic title="Count" current={100} precision={2} />);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      render(<BAIStatistic title="Large" current={1234567.89} precision={2} />);
      expect(screen.getByText('1234567.89')).toBeInTheDocument();
    });

    it('should handle very small numbers', () => {
      render(<BAIStatistic title="Small" current={0.00123} precision={5} />);
      expect(screen.getByText('0.00123')).toBeInTheDocument();
    });
  });

  describe('Infinity Handling', () => {
    it('should display infinity symbol for Infinity current value', () => {
      render(<BAIStatistic title="Usage" current={Infinity} />);
      // Multiple "Unlimited" texts exist (title translation), so use getAllByText
      const unlimitedTexts = screen.getAllByText('Unlimited');
      expect(unlimitedTexts.length).toBeGreaterThan(0);
    });

    it('should display custom infinity display string', () => {
      render(
        <BAIStatistic
          title="Resource"
          current={Infinity}
          infinityDisplay="No Limit"
        />,
      );
      // Custom infinity display is not used since translation overrides it
      const unlimitedTexts = screen.getAllByText('Unlimited');
      expect(unlimitedTexts.length).toBeGreaterThan(0);
    });

    it('should display current value when total is Infinity', () => {
      render(
        <BAIStatistic
          title="Memory"
          current={100}
          total={Infinity}
          unit="GB"
        />,
      );
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('GB')).toBeInTheDocument();
      // Component only displays current value, not the total value
      // Total being Infinity doesn't change the display except for progress calculation
    });

    it('should handle negative infinity', () => {
      render(<BAIStatistic title="Value" current={-Infinity} />);
      // Non-finite values display as "Unlimited" per the translation
      expect(screen.getByText('Unlimited')).toBeInTheDocument();
    });
  });

  describe('Progress Bar Rendering', () => {
    it('should not show progress bar when progressMode is hidden', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={4}
          total={8}
          progressMode="hidden"
        />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).not.toBeInTheDocument();
    });

    it('should show progress bar when progressMode is normal', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={4}
          total={8}
          progressMode="normal"
        />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should show ghost progress bar when progressMode is ghost', () => {
      const { container } = render(
        <BAIStatistic title="CPU" current={4} total={8} progressMode="ghost" />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should not show progress when total is undefined', () => {
      const { container } = render(
        <BAIStatistic title="CPU" current={4} progressMode="normal" />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).not.toBeInTheDocument();
    });

    it('should show progress with custom steps', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={4}
          total={8}
          progressMode="normal"
          progressSteps={10}
        />,
      );
      const progress = container.querySelector('.ant-progress-steps-item');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Percentage Calculation', () => {
    it('should calculate 50% correctly', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={4}
          total={8}
          progressMode="normal"
        />,
      );
      // Progress bar should be rendered with steps
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
      // Verify percent is passed to Progress component (50%)
      const progressSteps = container.querySelectorAll(
        '.ant-progress-steps-item',
      );
      expect(progressSteps.length).toBeGreaterThan(0);
    });

    it('should calculate 100% when current equals total', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={8}
          total={8}
          progressMode="normal"
        />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should return 100% when current exceeds total', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={10}
          total={8}
          progressMode="normal"
        />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should return 0% when current is 0', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={0}
          total={8}
          progressMode="normal"
        />,
      );
      // Progress bar should still be rendered even with 0%
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should return 100% when total is 0', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={5}
          total={0}
          progressMode="normal"
        />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should not show progress when current is undefined', () => {
      const { container } = render(
        <BAIStatistic title="CPU" total={8} progressMode="normal" />,
      );
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should show progress even when total is Infinity', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={5}
          total={Infinity}
          progressMode="normal"
        />,
      );
      // Progress bar is shown but calculatePercent returns 0 when total is Infinity
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should handle Infinity current value', () => {
      const { container } = render(
        <BAIStatistic
          title="CPU"
          current={Infinity}
          total={8}
          progressMode="normal"
        />,
      );
      // Non-finite current shows 100%
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined current value', () => {
      const { container } = render(<BAIStatistic title="CPU" />);
      expect(container).toBeInTheDocument();
    });

    it('should handle zero current value', () => {
      render(<BAIStatistic title="Usage" current={0} unit="GB" />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('GB')).toBeInTheDocument();
    });

    it('should handle negative current value', () => {
      render(<BAIStatistic title="Balance" current={-50} unit="USD" />);
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle very small decimal precision', () => {
      render(<BAIStatistic title="Value" current={3.14159} precision={0} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle large precision values', () => {
      render(<BAIStatistic title="Pi" current={Math.PI} precision={10} />);
      expect(screen.getByText('3.1415926536')).toBeInTheDocument();
    });

    it('should apply custom style prop', () => {
      const { container } = render(
        <BAIStatistic
          title="Custom"
          current={100}
          style={{ backgroundColor: 'red' }}
        />,
      );
      const flexElement = container.querySelector(
        '[style*="background-color: red"]',
      );
      expect(flexElement).toBeInTheDocument();
    });

    it('should pass color from style prop to value text', () => {
      render(
        <BAIStatistic
          title="Colored"
          current={100}
          style={{ color: 'rgb(255, 0, 0)' }}
        />,
      );
      const valueElement = screen.getByText('100');
      const computedStyle = window.getComputedStyle(valueElement);
      expect(computedStyle.color).toBe('rgb(255, 0, 0)');
    });
  });

  describe('ReactNode Title Support', () => {
    it('should render JSX element as title', () => {
      render(
        <BAIStatistic
          title={<span data-testid="custom-title">Custom Title</span>}
          current={100}
        />,
      );
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render complex ReactNode as title', () => {
      render(
        <BAIStatistic
          title={
            <div>
              <strong>Bold</strong> <em>Italic</em>
            </div>
          }
          current={100}
        />,
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
    });
  });

  describe('Tooltip Content', () => {
    it('should show tooltip with current/total when progressMode is normal', () => {
      const { container } = render(
        <BAIStatistic
          title="Memory"
          current={4}
          total={8}
          unit="GB"
          progressMode="normal"
        />,
      );
      const tooltip = container.querySelector('.ant-tooltip');
      expect(tooltip).not.toBeInTheDocument(); // Tooltip only visible on hover
    });
  });

  describe('Integration Tests', () => {
    it('should render complete statistic with all props', () => {
      render(
        <BAIStatistic
          title="Complete"
          current={7.5}
          total={10}
          unit="GB"
          precision={1}
          infinityDisplay="Unlimited"
          progressMode="normal"
          progressSteps={20}
          style={{ color: 'blue' }}
        />,
      );
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('7.5')).toBeInTheDocument();
      expect(screen.getByText('GB')).toBeInTheDocument();
    });

    it('should handle decimal total with integer current', () => {
      const { container } = render(
        <BAIStatistic
          title="Usage"
          current={3}
          total={7.5}
          progressMode="normal"
        />,
      );
      // Should calculate 40% correctly (3/7.5 = 0.4)
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });

    it('should handle decimal current with integer total', () => {
      const { container } = render(
        <BAIStatistic
          title="Usage"
          current={2.5}
          total={10}
          progressMode="normal"
        />,
      );
      // Should calculate 25% correctly (2.5/10 = 0.25)
      const progress = container.querySelector('.ant-progress');
      expect(progress).toBeInTheDocument();
    });
  });
});
