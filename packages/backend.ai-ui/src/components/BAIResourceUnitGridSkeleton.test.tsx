import BAIResourceUnitGridSkeleton from './BAIResourceUnitGridSkeleton';
import { render } from '@testing-library/react';

const rowsOf = (container: HTMLElement) =>
  container.querySelectorAll('.bai-resource-unit-grid-skeleton-row');

describe('BAIResourceUnitGridSkeleton', () => {
  it('renders 3 lattice rows by default, two blocks each', () => {
    const { container } = render(<BAIResourceUnitGridSkeleton />);
    const rows = rowsOf(container);
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row.children).toHaveLength(2);
    });
  });

  it('renders `rows` rows', () => {
    const { container } = render(<BAIResourceUnitGridSkeleton rows={5} />);
    expect(rowsOf(container)).toHaveLength(5);
  });

  it('renders no lattice rows for rows=0', () => {
    const { container } = render(<BAIResourceUnitGridSkeleton rows={0} />);
    expect(rowsOf(container)).toHaveLength(0);
  });

  it('spreads className and other DOM props onto the root', () => {
    const { container } = render(
      <BAIResourceUnitGridSkeleton
        className="custom-class"
        data-testid="grid-skeleton"
      />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass('bai-resource-unit-grid-skeleton', 'custom-class');
    expect(root).toHaveAttribute('data-testid', 'grid-skeleton');
  });
});
