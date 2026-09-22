import BAIDoubleToken from './BAIDoubleToken';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// The weld is CSS (vitest does not evaluate it), so these pin the DOM contract
// BAIDoubleToken.css is written against: the `bai-double` anchor, direct-child
// tokens in source order, and `gap: 0`.
describe('BAIDoubleToken', () => {
  const root = (c: HTMLElement) =>
    c.querySelector('.bai-double') as HTMLElement;

  it('anchors the stylesheet on `bai-double` and pins gap to 0', () => {
    const { container } = render(<BAIDoubleToken values={['User', 'admin']} />);
    expect(root(container)).toBeInTheDocument();
    expect(root(container)).toHaveAttribute('data-gap', '0');
  });

  it('renders each value as a direct token child, in source order', () => {
    const { container } = render(
      <BAIDoubleToken
        values={[
          { label: 'R', color: 'green' },
          { label: 'W', color: 'blue' },
          { label: 'D', color: 'red' },
        ]}
      />,
    );
    const tokens = Array.from(root(container).children);
    expect(tokens).toHaveLength(3);
    tokens.forEach((el) => expect(el).toHaveClass('astryx-token'));
    expect(tokens.map((el) => el.textContent)).toEqual(['R', 'W', 'D']);
    expect(tokens.map((el) => el.getAttribute('data-color'))).toEqual([
      'green',
      'blue',
      'red',
    ]);
  });

  it('colours the string shorthand blue', () => {
    const { container } = render(<BAIDoubleToken values={['only']} />);
    const tokens = Array.from(root(container).children);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toHaveAttribute('data-color', 'blue');
  });

  it('skips empty labels so they cannot open a hole in the run', () => {
    const { container } = render(
      <BAIDoubleToken
        values={[
          { label: 'User', color: 'blue' },
          { label: '', color: 'default' },
        ]}
      />,
    );
    expect(root(container).children).toHaveLength(1);
  });

  it('keeps the plain label as the accessible name when highlighting', () => {
    const { container } = render(
      <BAIDoubleToken values={['python', '3.11']} highlightKeyword="py" />,
    );
    const tokens = Array.from(root(container).children);
    expect(tokens[0]).toHaveAttribute('aria-label', 'python');
    expect(screen.getByText('py')).toBeInTheDocument();
  });

  it('appends the copy control to a copyable segment, keeping tokens the direct children', () => {
    const { container } = render(
      <BAIDoubleToken
        values={[
          { label: 'Project', color: 'blue' },
          {
            label: '01a0c2f9-4e84-7f7c-a9b5-f24958a5f8fa',
            color: 'default',
            copyable: true,
          },
        ]}
      />,
    );
    // The copy control's tooltip bubble lands as a trailing sibling of the
    // chips, so the weld CSS keys on `:last-of-type` — count the chips only.
    const tokens = Array.from(
      root(container).querySelectorAll(':scope > .astryx-token'),
    );
    expect(tokens).toHaveLength(2);
    expect(tokens[1]).toBe(
      root(container).querySelector(':scope > .astryx-token:last-of-type'),
    );
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    expect(tokens[1]).toContainElement(copyButton);
    expect(tokens[0]).not.toContainElement(copyButton);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
