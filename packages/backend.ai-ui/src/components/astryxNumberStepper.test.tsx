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

  it('keeps the stack a DIRECT child of the slot', () => {
    const { container } = renderInGroup();
    const slot = container.querySelector('.bai-number-stepper') as HTMLElement;
    expect(slot.children).toHaveLength(1);
    expect(slot.children[0]).toHaveClass('astryx-stack');
    expect(slot.children[0]).toHaveAttribute('data-gap', '0');
  });

  it('marks both buttons so the size override reaches them', () => {
    const { container } = renderInGroup();
    const buttons = container.querySelectorAll('.bai-number-stepper__button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByLabelText('Increase')).toHaveClass(
      'bai-number-stepper__button',
    );
    expect(screen.getByLabelText('Decrease')).toHaveClass(
      'bai-number-stepper__button',
    );
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
