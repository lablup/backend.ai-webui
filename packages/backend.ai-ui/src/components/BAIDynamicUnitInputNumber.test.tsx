/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the three behaviours the antd -> Astryx migration silently dropped from
 * `BAIDynamicUnitInputNumber`, all of which antd's `InputNumber` supplied for
 * free and a native `<input type="number">` does not:
 *
 *  1. **↑/↓ walk the non-linear ladder** (`dynamicSteps`), not the browser's
 *     `step`. antd routed both the spinner and the arrow keys through
 *     `onStep` with `step={0}`; the migration re-created only the spinner, so
 *     ↑ from `4g` produced `5g` instead of `8g`.
 *  2. **↑/↓ carry across units** at the ends of the ladder — `512g` -> `1t`,
 *     and back down again.
 *  3. **Typing a unit letter switches the unit.** antd's field was a TEXT
 *     input, so `"512m"` reached a raw `input` listener; a number field
 *     discards the letter before any value listener sees it, so the KEY event
 *     is the only surviving signal.
 *
 * Plus the clamp antd did on blur, which Astryx's `NumberInput` replaced with
 * a silent revert (`parseNumberInput` returns `null` past a bound, so
 * `onChange` never fires and the entry is thrown away).
 *
 * These are unit tests rather than live checks because the ladder's
 * interesting rungs — the unit carries at `512g`/`1t`, the sub-`m` floor — are
 * outside the range any resource group on the dev cluster offers.
 */
import BAIDynamicUnitInputNumber from './BAIDynamicUnitInputNumber';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

/** Controlled harness — the component's contract is a `"<number><unit>"` string. */
const Harness: React.FC<{
  initial?: string;
  onValue?: (next: string) => void;
  props?: Partial<React.ComponentProps<typeof BAIDynamicUnitInputNumber>>;
}> = ({ initial, onValue, props }) => {
  const [value, setValue] = React.useState<string | undefined>(initial);
  return (
    <BAIDynamicUnitInputNumber
      label="Size"
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      {...props}
    />
  );
};

const field = () => screen.getByRole('spinbutton') as HTMLInputElement;

describe('BAIDynamicUnitInputNumber — keyboard stepping', () => {
  it('walks the dynamic ladder on ArrowUp instead of stepping by 1', () => {
    render(<Harness initial="4g" />);
    fireEvent.keyDown(field(), { key: 'ArrowUp' });
    // Astryx 0.4.0's NumberInput is a text-backed spinbutton (#4896), so the
    // DOM value is a string.
    expect(field()).toHaveValue('8');
  });

  it('walks the ladder downwards on ArrowDown', () => {
    render(<Harness initial="8g" />);
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(field()).toHaveValue('4');
  });

  it('lands on the next rung up from a value between two rungs', () => {
    // 5 is not on the ladder; ↑ selects the next rung (8), not 6.
    render(<Harness initial="5g" />);
    fireEvent.keyDown(field(), { key: 'ArrowUp' });
    expect(field()).toHaveValue('8');
  });

  it('cancels the browser’s own linear step', () => {
    render(<Harness initial="4g" />);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(field(), event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('carries to the next unit UP past the top of the ladder', () => {
    const onValue = vi.fn();
    render(<Harness initial="512g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'ArrowUp' });
    expect(onValue).toHaveBeenCalledWith('1t');
  });

  it('carries to the next unit DOWN past the bottom of the ladder', () => {
    const onValue = vi.fn();
    render(<Harness initial="1g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(onValue).toHaveBeenCalledWith('512m');
  });

  it('floors at zero rather than carrying below the smallest unit', () => {
    const onValue = vi.fn();
    render(<Harness initial="1m" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(onValue).toHaveBeenCalledWith('0m');
  });

  it('does not step while disabled', () => {
    const onValue = vi.fn();
    render(
      <Harness initial="4g" onValue={onValue} props={{ disabled: true }} />,
    );
    fireEvent.keyDown(field(), { key: 'ArrowUp' });
    expect(onValue).not.toHaveBeenCalled();
  });

  it('keeps the ladder within `disableAutoUnit` (no carry)', () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="1g"
        onValue={onValue}
        props={{ disableAutoUnit: true }}
      />,
    );
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(onValue).not.toHaveBeenCalled();
  });
});

describe('BAIDynamicUnitInputNumber — unit-letter entry', () => {
  it('switches the unit when the user types a unit letter', () => {
    const onValue = vi.fn();
    render(<Harness initial="512g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'm' });
    expect(onValue).toHaveBeenCalledWith('512m');
  });

  it('accepts an upper-case unit letter too', () => {
    const onValue = vi.fn();
    render(<Harness initial="4g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'T' });
    expect(onValue).toHaveBeenCalledWith('4t');
  });

  it('covers every unit, not just the `m`/`g` the old regex hard-coded', () => {
    const onValue = vi.fn();
    render(<Harness initial="4g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'p' });
    expect(onValue).toHaveBeenCalledWith('4p');
  });

  it('prevents the character from reaching the field', () => {
    render(<Harness initial="4g" />);
    const event = new KeyboardEvent('keydown', {
      key: 'm',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(field(), event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores a letter that is not one of `units`', () => {
    const onValue = vi.fn();
    render(<Harness initial="4g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'q' });
    expect(onValue).not.toHaveBeenCalled();
  });

  it('leaves modifier chords alone so Ctrl+V still pastes', () => {
    const onValue = vi.fn();
    render(<Harness initial="4g" onValue={onValue} />);
    fireEvent.keyDown(field(), { key: 'm', ctrlKey: true });
    expect(onValue).not.toHaveBeenCalled();
  });

  it('honours a restricted `units` list', () => {
    const onValue = vi.fn();
    render(
      <Harness initial="4g" onValue={onValue} props={{ units: ['m', 'g'] }} />,
    );
    fireEvent.keyDown(field(), { key: 't' });
    expect(onValue).not.toHaveBeenCalled();
  });
});

describe('BAIDynamicUnitInputNumber — clamping', () => {
  it('clamps an over-max entry on blur instead of reverting it', () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="4g"
        onValue={onValue}
        props={{ min: '0g', max: '8g' }}
      />,
    );
    // Astryx rejects the out-of-range string outright, so `value` never moves;
    // the raw field text is the only trace, exactly as in a browser.
    fireEvent.blur(field(), { target: { value: '9999' } });
    expect(onValue).toHaveBeenCalledWith('8g');
  });

  it('clamps an under-min entry on blur', () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="4g"
        onValue={onValue}
        props={{ min: '2g', max: '8g' }}
      />,
    );
    fireEvent.blur(field(), { target: { value: '1' } });
    expect(onValue).toHaveBeenCalledWith('2g');
  });

  it('leaves an in-range value alone', () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="4g"
        onValue={onValue}
        props={{ min: '0g', max: '8g' }}
      />,
    );
    fireEvent.blur(field(), { target: { value: '4' } });
    expect(onValue).not.toHaveBeenCalled();
  });

  it('still rounds to `roundStep` on blur', () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial="4.03g"
        onValue={onValue}
        props={{ min: '0g', max: '8g', roundStep: 0.05 }}
      />,
    );
    fireEvent.blur(field(), { target: { value: '4.03' } });
    expect(onValue).toHaveBeenCalledWith('4.05g');
  });
});
