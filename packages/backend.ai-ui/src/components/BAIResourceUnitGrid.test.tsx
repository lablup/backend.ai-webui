import BAIResourceUnitGrid, {
  type BAIUnitGridGroup,
} from './BAIResourceUnitGrid';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GROUPS: BAIUnitGridGroup[] = [
  { key: 'alpha', label: 'Alpha', units: [{ color: '#3469d6' }] },
  { key: 'beta', label: 'Beta', units: [{ color: '#b84134' }] },
];

describe('BAIResourceUnitGrid', () => {
  it('renders ui-common UnitGrid under the WebUI palette class', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        className="extra"
        aria-label="Sessions"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass(
      'uic-unit-grid',
      'bai-resource-unit-grid',
      'extra',
    );
    expect(screen.getByRole('img', { name: 'Sessions' })).toBeInTheDocument();
    expect(
      container.querySelector<SVGPathElement>('path[data-group-key="beta"]')!
        .style.fill,
    ).toBe('var(--uic-unit-grid-group-2)');
  });

  it("names the picker controls from ui-common's catalog", () => {
    const onHueOverrideChange = vi.fn();
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        onHueOverrideChange={onHueOverrideChange}
      />,
    );
    fireEvent.mouseMove(
      container.querySelector('.uic-unit-grid__cell[data-group-key="alpha"]')!,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Change group color' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use color 3' }));
    expect(onHueOverrideChange).toHaveBeenCalledWith('alpha', 2);
  });

  // The stylesheet is the adapter's contract: every group hue and both inks.
  it('sets all seven group hues and both inks', () => {
    const css = readFileSync(
      resolve(__dirname, 'BAIResourceUnitGrid.css'),
      'utf8',
    );
    for (let i = 1; i <= 7; i++) {
      expect(css).toMatch(
        new RegExp(
          `--uic-unit-grid-group-${i}: light-dark\\(#[0-9a-f]{6}, #[0-9a-f]{6}\\);`,
        ),
      );
    }
    expect(css).toMatch(/--uic-unit-grid-ink-dark: #262626;/);
    expect(css).toMatch(/--uic-unit-grid-ink-light: #fafafa;/);
  });
});
