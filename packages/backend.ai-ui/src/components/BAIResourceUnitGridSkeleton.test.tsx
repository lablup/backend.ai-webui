import BAIResourceUnitGridSkeleton from './BAIResourceUnitGridSkeleton';
import { render } from '@testing-library/react';

const platesOf = (container: HTMLElement) =>
  container.querySelectorAll('.bai-resource-unit-grid-skeleton-plate');

const cellsOf = (plate: Element) =>
  plate.querySelectorAll('.bai-resource-unit-grid-skeleton-cell');

describe('BAIResourceUnitGridSkeleton', () => {
  it('renders one plate per group by default (6)', () => {
    const { container } = render(<BAIResourceUnitGridSkeleton />);
    expect(platesOf(container)).toHaveLength(6);
  });

  it('renders `groupCount` plates', () => {
    const { container } = render(
      <BAIResourceUnitGridSkeleton groupCount={3} />,
    );
    expect(platesOf(container)).toHaveLength(3);
  });

  it('sizes each plate from the fixed cell-count array, in order', () => {
    const { container } = render(
      <BAIResourceUnitGridSkeleton groupCount={6} />,
    );
    const counts = Array.from(platesOf(container)).map(
      (plate) => cellsOf(plate).length,
    );
    expect(counts).toEqual([12, 4, 24, 6, 9, 16]);
  });

  it('cycles the fixed cell-count array once groupCount exceeds its length', () => {
    const { container } = render(
      <BAIResourceUnitGridSkeleton groupCount={8} />,
    );
    const counts = Array.from(platesOf(container)).map(
      (plate) => cellsOf(plate).length,
    );
    expect(counts).toEqual([12, 4, 24, 6, 9, 16, 12, 4]);
  });

  it('renders no plates for a zero groupCount', () => {
    const { container } = render(
      <BAIResourceUnitGridSkeleton groupCount={0} />,
    );
    expect(platesOf(container)).toHaveLength(0);
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
