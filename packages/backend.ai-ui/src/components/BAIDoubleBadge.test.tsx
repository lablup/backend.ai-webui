import BAIDoubleBadge from './BAIDoubleBadge';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

// Same DOM contract as BAIDoubleToken: BAIDoubleToken.css welds direct-child
// badges under `.bai-double` with `gap: 0`.
describe('BAIDoubleBadge', () => {
  const root = (c: HTMLElement) =>
    c.querySelector('.bai-double') as HTMLElement;

  it('anchors the stylesheet on `bai-double` and pins gap to 0', () => {
    const { container } = render(<BAIDoubleBadge values={['ALIVE', '26.4']} />);
    expect(root(container)).toBeInTheDocument();
    expect(root(container)).toHaveAttribute('data-gap', '0');
  });

  it('renders each value as a direct badge child with its variant', () => {
    const { container } = render(
      <BAIDoubleBadge
        values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0' }]}
      />,
    );
    const badges = Array.from(root(container).children);
    expect(badges).toHaveLength(2);
    badges.forEach((el) => expect(el).toHaveClass('astryx-badge'));
    expect(badges.map((el) => el.textContent)).toEqual(['ALIVE', '26.4.0']);
    expect(badges.map((el) => el.getAttribute('data-variant'))).toEqual([
      'success',
      'neutral',
    ]);
  });

  it('renders the string shorthand as neutral', () => {
    const { container } = render(<BAIDoubleBadge values={['Elapsed', '1m']} />);
    Array.from(root(container).children).forEach((el) =>
      expect(el).toHaveAttribute('data-variant', 'neutral'),
    );
  });

  it('skips empty labels and renders nothing for an empty array', () => {
    const { container } = render(
      <BAIDoubleBadge values={[{ label: 'A' }, { label: '' }]} />,
    );
    expect(root(container).children).toHaveLength(1);
    const { container: empty } = render(<BAIDoubleBadge values={[]} />);
    expect(empty).toBeEmptyDOMElement();
  });
});
