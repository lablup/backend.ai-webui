import BAIResourceUnitGrid, {
  type BAIUnitGridGroup,
} from './BAIResourceUnitGrid';
import { fireEvent, render, screen } from '@testing-library/react';

// Partial mock: preserve every real export from `react-i18next` (notably
// `initReactI18next`, which BUI's `locale/index.ts` consumes at import time)
// and only override `useTranslation`. See BAIStatistic.test.tsx (FR-2986).
vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { n?: number }) => {
        const translations: { [key: string]: string } = {
          'comp:BAIResourceUnitGrid.ChangeGroupColor': 'Change group color',
          'comp:BAIResourceUnitGrid.ResourceGrid': 'Resource grid',
          'comp:BAIResourceUnitGrid.UseColorN': `Use color ${options?.n}`,
        };
        return translations[key] || key;
      },
    }),
  };
});

const unit = (color = '#3469d6') => ({ color });

const GROUPS: BAIUnitGridGroup[] = [
  { key: 'alpha', label: 'Alpha', units: [unit(), unit(), unit()] },
  { key: 'beta', label: 'Beta', units: [unit('#b84134'), unit('#b84134')] },
];

const cellsOf = (container: HTMLElement, key?: string) =>
  container.querySelectorAll(
    key
      ? `.bai-resource-unit-grid-cell[data-group-key="${key}"]`
      : '.bai-resource-unit-grid-cell',
  );

describe('BAIResourceUnitGrid', () => {
  it('renders one cell per unit, attributed to its group by key', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        aria-label="Unit grid"
      />,
    );
    expect(cellsOf(container)).toHaveLength(5);
    expect(cellsOf(container, 'alpha')).toHaveLength(3);
    expect(cellsOf(container, 'beta')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Unit grid' })).toBeInTheDocument();
  });

  it('caps each group at maxUnitsPerGroup', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={[{ key: 'big', units: Array.from({ length: 10 }, unit) }]}
        maxUnitsPerGroup={4}
        columns={8}
      />,
    );
    expect(cellsOf(container, 'big')).toHaveLength(4);
  });

  it('renders a partial-fill overlay for fraction cells', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={[
          { key: 'a', units: [unit(), { color: '#3469d6', fraction: 0.5 }] },
        ]}
        columns={8}
      />,
    );
    // 2 base cells + 1 fraction overlay rect, all attributed to the group.
    expect(cellsOf(container, 'a')).toHaveLength(2);
    expect(container.querySelectorAll('rect[data-group-key="a"]')).toHaveLength(
      3,
    );
  });

  it('names each group plate for assistive tech', () => {
    const { container } = render(
      <BAIResourceUnitGrid groups={GROUPS} columns={8} />,
    );
    const titles = Array.from(container.querySelectorAll('path > title')).map(
      (el) => el.textContent,
    );
    expect(titles).toEqual(['Alpha', 'Beta']);
    // role="img" on the svg flattens its subtree for AT, so the groups must
    // also be enumerable through the parallel sr-only list.
    const srItems = Array.from(
      container.querySelectorAll('.bai-resource-unit-grid-sr-only li'),
    ).map((el) => el.textContent);
    expect(srItems).toEqual(['Alpha', 'Beta']);
  });

  it('shows the popover slot content for the hovered group', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        renderGroupPopover={(group) => <div>popover: {group.label}</div>}
      />,
    );
    fireEvent.mouseMove(cellsOf(container, 'beta')[0]);
    expect(screen.getByText('popover: Beta')).toBeInTheDocument();
    expect(screen.queryByText('popover: Alpha')).not.toBeInTheDocument();
  });

  it('keeps hover attribution keyed by group key when groups are reordered', () => {
    const renderPopover = (group: BAIUnitGridGroup) => (
      <div>popover: {group.label}</div>
    );
    const { container, rerender } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        renderGroupPopover={renderPopover}
      />,
    );
    rerender(
      <BAIResourceUnitGrid
        groups={[...GROUPS].reverse()}
        columns={8}
        renderGroupPopover={renderPopover}
      />,
    );
    fireEvent.mouseMove(cellsOf(container, 'alpha')[0]);
    expect(screen.getByText('popover: Alpha')).toBeInTheDocument();
  });

  it('fires onHueOverrideChange with (key, paletteIdx) from the picker', () => {
    const onHueOverrideChange = vi.fn();
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        onHueOverrideChange={onHueOverrideChange}
      />,
    );
    fireEvent.mouseMove(cellsOf(container, 'alpha')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Change group color' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use color 3' }));
    expect(onHueOverrideChange).toHaveBeenCalledWith('alpha', 2);
  });

  it('falls back to a translated accessible name when aria-label is omitted', () => {
    render(<BAIResourceUnitGrid groups={GROUPS} columns={8} />);
    expect(
      screen.getByRole('img', { name: 'Resource grid' }),
    ).toBeInTheDocument();
  });

  it('supports keyboard activation of the picker controls', () => {
    const onHueOverrideChange = vi.fn();
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        onHueOverrideChange={onHueOverrideChange}
      />,
    );
    fireEvent.mouseMove(cellsOf(container, 'alpha')[0]);
    const toggle = screen.getByRole('button', { name: 'Change group color' });
    expect(toggle).toHaveAttribute('tabindex', '0');
    // Enter on the toggle opens the palette row.
    fireEvent.keyDown(toggle, { key: 'Enter' });
    const swatch = screen.getByRole('button', { name: 'Use color 2' });
    expect(swatch).toHaveAttribute('tabindex', '0');
    // Space activates a swatch AND is prevented from scrolling the page.
    const spaceNotPrevented = fireEvent.keyDown(swatch, { key: ' ' });
    expect(spaceNotPrevented).toBe(false);
    expect(onHueOverrideChange).toHaveBeenCalledWith('alpha', 1);
  });

  it('fires onClickGroup with the group key', () => {
    const onClickGroup = vi.fn();
    const { container } = render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        onClickGroup={onClickGroup}
      />,
    );
    fireEvent.click(cellsOf(container, 'beta')[1]);
    expect(onClickGroup).toHaveBeenCalledWith('beta');
  });

  it('renders the empty fallback when there are no units to show', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={[]}
        columns={8}
        emptyFallback={<div>nothing here</div>}
      />,
    );
    expect(screen.getByText('nothing here')).toBeInTheDocument();
    expect(cellsOf(container)).toHaveLength(0);
  });

  it('renders a dashed plate outline only for plateVariant "dashed" groups', () => {
    const { container } = render(
      <BAIResourceUnitGrid
        groups={[
          {
            key: 'pending-ish',
            units: [unit(), unit()],
            plateVariant: 'dashed',
          },
          { key: 'solid-default', units: [unit()] },
          { key: 'solid-explicit', units: [unit()], plateVariant: 'solid' },
        ]}
        columns={8}
      />,
    );
    const plateOf = (key: string) =>
      container.querySelector(`path[data-group-key="${key}"]`);
    expect(plateOf('pending-ish')).toHaveAttribute('stroke-dasharray', '6 4');
    expect(plateOf('solid-default')).not.toHaveAttribute('stroke-dasharray');
    expect(plateOf('solid-explicit')).not.toHaveAttribute('stroke-dasharray');
  });

  it('renders provided legend items', () => {
    render(
      <BAIResourceUnitGrid
        groups={GROUPS}
        columns={8}
        legendItems={[
          { color: '#42825c', label: 'Low' },
          { color: '#b84134', label: 'High' },
        ]}
      />,
    );
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
