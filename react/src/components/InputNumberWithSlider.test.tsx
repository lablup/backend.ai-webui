/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Covers the marks SPLIT (string labels go to Astryx, node labels to the
 overlay, marks above `max` are dropped from both) and the number input's
 built-in steppers.

 The overlay's *position* is asserted as the percentage it writes, which is
 the same formula Astryx uses for its own marks — jsdom has no layout, so a
 live probe is what confirmed the two land on the same pixel.
*/
import '../../__test__/matchMedia.mock.js';
import InputNumberWithSlider from './InputNumberWithSlider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const renderSlider = (props = {}) =>
  render(
    <InputNumberWithSlider
      min={1}
      max={7}
      step={1}
      value={1}
      sliderProps={{
        marks: {
          1: '1',
          3: { label: <span data-testid="node-mark-label">remaining</span> },
          7: 7,
          9: '9-above-max',
        },
      }}
      {...props}
    />,
  );

describe('InputNumberWithSlider marks', () => {
  it('hands every in-range mark to Astryx so each one still draws a tick', () => {
    renderSlider();
    const ticks = screen
      .getAllByTestId('slider-mark')
      .map((el) => el.dataset.markValue);
    expect(ticks).toEqual(['1', '3', '7']);
  });

  it('drops marks above max from both layers', () => {
    renderSlider();
    expect(screen.queryByText('9-above-max')).toBeNull();
  });

  it('renders a node label in the overlay, not as an Astryx label', () => {
    const { container } = renderSlider();
    const overlayMarks = container.querySelectorAll('.bai-slider__node-mark');
    expect(overlayMarks).toHaveLength(1);
    // (3 - 1) / (7 - 1) = 33.33% — Astryx's own getPercent for the same mark.
    expect((overlayMarks[0] as HTMLElement).style.insetInlineStart).toBe(
      `${((3 - 1) / (7 - 1)) * 100}%`,
    );
    expect(screen.getByTestId('node-mark-label')).toBeTruthy();
  });

  it('keeps the plain labels on the Astryx marks, and only those', () => {
    renderSlider();
    const labels = screen
      .getAllByTestId('slider-mark-label')
      .map((el) => el.textContent);
    // The node-labelled mark at 3 has a tick but no Astryx label — its label
    // is the overlay's job.
    expect(labels).toEqual(['1', '7']);
  });

  it('honours a per-mark style on an overlay mark', () => {
    const { container } = renderSlider({
      sliderProps: {
        marks: {
          3: {
            style: { color: 'rgb(1, 2, 3)' },
            label: <span data-testid="node-mark-label">remaining</span>,
          },
        },
      },
    });
    const mark = container.querySelector(
      '.bai-slider__node-mark',
    ) as HTMLElement;
    expect(mark.style.color).toBe('rgb(1, 2, 3)');
  });

  it('renders no marks at all in empty mode', () => {
    const { container } = renderSlider({ disableMode: 'empty' });
    expect(screen.queryAllByTestId('slider-mark')).toHaveLength(0);
    expect(container.querySelectorAll('.bai-slider__node-mark')).toHaveLength(
      0,
    );
    expect(container.querySelector('.bai-slider--empty')).toBeTruthy();
  });
});

const ControlledSlider: React.FC = () => {
  const [value, setValue] = useState(0);
  return (
    <InputNumberWithSlider
      label="Accelerator"
      min={0}
      max={4}
      step={0.5}
      value={value}
      onChange={setValue}
    />
  );
};

describe('InputNumberWithSlider number steppers', () => {
  it('steps the value up by `step` when the increment button is clicked', async () => {
    const user = userEvent.setup();
    render(<ControlledSlider />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('0');

    const increment = screen.getByRole('button', { name: /increment/i });
    await user.click(increment);
    expect(input.value).toBe('0.5');

    await user.click(increment);
    expect(input.value).toBe('1');
  });
});

describe('InputNumberWithSlider addons', () => {
  it('renders addonAfter as a direct InputGroup child', () => {
    renderSlider({
      inputNumberProps: {
        addonAfter: <span data-testid="addon-after">after</span>,
      },
    });
    const after = screen.getByTestId('addon-after');
    const inputWrapper = screen.getByRole('spinbutton').parentElement;
    // Addons must be InputGroup's own children for it to weld them onto the field.
    expect(after.parentElement).toBe(inputWrapper?.parentElement);
  });
});
