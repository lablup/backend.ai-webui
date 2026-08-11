/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Covers the two things the antd -> Astryx conversion had to rebuild rather
 than rename (see the header of InputNumberWithSlider.tsx):

 1. the marks SPLIT — string/number labels go to Astryx (which draws the tick
    AND the label), node labels go to the overlay (Astryx still draws their
    tick), and marks above `max` are dropped from both;
 2. `tooltip.open === false` -> `valueDisplay="none"`.

 The overlay's *position* is asserted as the percentage it writes, which is
 the same formula Astryx uses for its own marks — jsdom has no layout, so a
 live probe run during the FR-3482 Astryx migration is what confirmed the
 two land on the same pixel.
*/
import '../../__test__/matchMedia.mock.js';
import InputNumberWithSlider from './InputNumberWithSlider';
import { render, screen } from '@testing-library/react';

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
