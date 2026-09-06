import { AstryxNumberStepper, nextLadderIndex } from './astryxNumberStepper';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/*
 * FR-3688. The weld is CSS (`astryxNumberStepper.css`) and vitest does not
 * evaluate stylesheets, so these pin the DOM CONTRACT the stylesheet is written
 * against — what a refactor could break while the component still "renders
 * fine": the `bai-number-stepper` slot must be the `InputGroupText` (that is
 * what carries Astryx's border + `-1 * --border-width` weld), the stack must be
 * its direct child (`.bai-number-stepper > *` sizes it), and both buttons must
 * carry `bai-number-stepper__button` (that rule is what beats `Button`'s fixed
 * `sizeStyles.sm` height and `aspect-ratio: 1/1`).
 *
 * Same approach as `BAICompactGroup.test.tsx` for the other CSS-only weld.
 */
const renderInGroup = (onStep: (d: 'up' | 'down') => void = () => {}) =>
  render(
    <InputGroup label="Amount" isLabelHidden>
      <AstryxNumberStepper
        onStep={onStep}
        increaseLabel="Increase"
        decreaseLabel="Decrease"
      />
    </InputGroup>,
  );

describe('AstryxNumberStepper', () => {
  it('anchors the stylesheet on an InputGroupText slot', () => {
    const { container } = renderInGroup();
    const slot = container.querySelector('.bai-number-stepper');
    expect(slot).not.toBeNull();
    // The weld comes from Astryx's own addon primitive, not from a bare Stack.
    expect(slot).toHaveClass('astryx-input-group-text');
  });

  it('keeps both buttons DIRECT children of the slot', () => {
    const { container } = renderInGroup();
    const slot = container.querySelector('.bai-number-stepper') as HTMLElement;
    // `.bai-number-stepper` is the flex column itself — no wrapper in between,
    // or `flex: 1` on the buttons has nothing to divide.
    expect(slot.children).toHaveLength(2);
    Array.from(slot.children).forEach((el) =>
      expect(el).toHaveClass('bai-number-stepper__button'),
    );
  });

  it('keeps the halves off the tab order, as the built-in stepper does', () => {
    const { container } = renderInGroup();
    container.querySelectorAll('.bai-number-stepper__button').forEach((el) => {
      expect(el).toHaveAttribute('tabindex', '-1');
      expect(el).toHaveAttribute('type', 'button');
    });
  });

  it('marks each half so the mirrored Astryx rules reach it', () => {
    renderInGroup();
    // The modifier classes carry the hairline between the halves and the
    // rotation that makes the increment chevron point up.
    expect(screen.getByLabelText('Increase')).toHaveClass(
      'bai-number-stepper__button--increase',
    );
    expect(screen.getByLabelText('Decrease')).toHaveClass(
      'bai-number-stepper__button--decrease',
    );
  });

  it('disables both halves together', () => {
    render(
      <InputGroup label="Amount" isLabelHidden>
        <AstryxNumberStepper
          onStep={() => {}}
          isDisabled
          increaseLabel="Increase"
          decreaseLabel="Decrease"
        />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Increase')).toBeDisabled();
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
  });

  it('still drives the ladder from the buttons', async () => {
    const steps: Array<string> = [];
    const user = userEvent.setup();
    renderInGroup((d) => steps.push(d));
    await user.click(screen.getByLabelText('Increase'));
    await user.click(screen.getByLabelText('Decrease'));
    expect(steps).toEqual(['up', 'down']);
  });

  it('lands on the next rung, not the current one', () => {
    const rungs = [1, 2, 4, 8, 16];
    expect(nextLadderIndex(rungs, 4, 'up')).toBe(3);
    expect(nextLadderIndex(rungs, 4, 'down')).toBe(1);
  });
});
