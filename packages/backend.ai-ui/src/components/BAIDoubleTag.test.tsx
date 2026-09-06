import BAIDoubleTag from './BAIDoubleTag';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

/*
 * FR-3687. The weld itself is CSS (`BAIDoubleTag.css`) and vitest does not
 * evaluate stylesheets, so these tests pin the DOM CONTRACT the stylesheet is
 * written against — what a refactor could silently break while the component
 * still "renders fine": the `bai-double-tag` anchor, direct-child badges in
 * source order (the corner rules are `> .astryx-badge:not(:first-child)` /
 * `:not(:last-child)`), and `gap: 0` (a gap detaches the halves).
 */
describe('BAIDoubleTag', () => {
  const root = (c: HTMLElement) =>
    c.querySelector('.bai-double-tag') as HTMLElement;

  it('anchors the stylesheet on `bai-double-tag` and pins gap to 0', () => {
    const { container } = render(<BAIDoubleTag values={['User', 'admin']} />);
    expect(root(container)).toBeInTheDocument();
    expect(root(container)).toHaveAttribute('data-gap', '0');
  });

  it('renders each value as a direct badge child, in source order', () => {
    const { container } = render(
      <BAIDoubleTag
        values={[
          { label: 'R', color: 'green' },
          { label: 'W', color: 'blue' },
          { label: 'D', color: 'red' },
        ]}
      />,
    );
    const badges = Array.from(root(container).children);
    expect(badges).toHaveLength(3);
    badges.forEach((el) => expect(el).toHaveClass('astryx-badge'));
    expect(badges.map((el) => el.textContent)).toEqual(['R', 'W', 'D']);
  });

  it('leaves a lone badge with both corners rounded (no neighbour to weld to)', () => {
    const { container } = render(<BAIDoubleTag values={['only']} />);
    const badges = Array.from(root(container).children);
    expect(badges).toHaveLength(1);
    // `:not(:first-child)` and `:not(:last-child)` both no-op on a single child.
    expect(badges[0]).toHaveClass('astryx-badge');
  });

  it('skips empty labels so they cannot open a hole in the run', () => {
    const { container } = render(
      <BAIDoubleTag
        values={[
          { label: 'User', color: 'blue' },
          { label: '', color: 'default' },
        ]}
      />,
    );
    expect(root(container).children).toHaveLength(1);
  });
});
