import BAICompactGroup from './BAICompactGroup';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

/*
 * QA-FINDINGS Q-32. The weld itself is CSS (`BAICompactGroup.css`) and vitest
 * does not evaluate stylesheets, so these tests pin the DOM CONTRACT that the
 * stylesheet is written against — the part that a refactor could silently
 * break while the component still "renders fine":
 *
 *   - the root carries `bai-compact-group`, which every selector is anchored on;
 *   - each member is a DIRECT child of that root, in source order, because the
 *     inner-corner rules are `> *:not(:first-child)` / `> *:not(:last-child)`;
 *   - `gap` and `wrap` are fixed, not defaulted — a gap would undo the weld and
 *     a wrapped run would strand a squared corner at the end of a line.
 */
describe('BAICompactGroup', () => {
  const root = () => screen.getByTestId('group');

  it('anchors the stylesheet on `bai-compact-group` and keeps a caller class', () => {
    render(
      <BAICompactGroup data-testid="group" className="my-row">
        <span>a</span>
      </BAICompactGroup>,
    );
    expect(root()).toHaveClass('bai-compact-group');
    expect(root()).toHaveClass('my-row');
  });

  it('renders every member as a direct child, in source order', () => {
    render(
      <BAICompactGroup data-testid="group">
        <span>prefix</span>
        <span>middle</span>
        <span>suffix</span>
      </BAICompactGroup>,
    );
    const children = Array.from(root().children);
    expect(children.map((el) => el.textContent)).toEqual([
      'prefix',
      'middle',
      'suffix',
    ]);
  });

  it('pins gap and wrap so a call site cannot unweld the run', () => {
    render(
      // @ts-expect-error `gap` / `wrap` are Omitted from the props on purpose;
      // the runtime must ignore them too, not just the type checker.
      <BAICompactGroup data-testid="group" gap={4} wrap="wrap">
        <span>a</span>
        <span>b</span>
      </BAICompactGroup>,
    );
    expect(root()).toHaveAttribute('data-gap', '0');
    expect(root()).toHaveAttribute('data-wrap', 'nowrap');
  });

  it('fills its container by default and honours an explicit width', () => {
    const { rerender } = render(
      <BAICompactGroup data-testid="group">
        <span>a</span>
      </BAICompactGroup>,
    );
    expect(root()).toHaveStyle({ width: '100%' });

    rerender(
      <BAICompactGroup data-testid="group" width={320}>
        <span>a</span>
      </BAICompactGroup>,
    );
    expect(root()).toHaveStyle({ width: '320px' });
  });
});
