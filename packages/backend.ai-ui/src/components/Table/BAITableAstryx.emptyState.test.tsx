/*
 FR-3503 — the empty state BAITableAstryx renders when it has no rows.

 Astryx's `Table` falls back to its OWN catalog (`@astryx.table.noData`), which
 ships en/fr only, so a Korean UI showed a bare English "No data". Owning the
 node moved the copy onto BUI's catalog and restored the icon.

 `resolvedEmptyState` has four branches behind ~80 call sites, and nothing
 asserted them: `false` renders nothing, nullish takes the localized default, a
 string is WRAPPED in `EmptyState`, and any other ReactNode passes through
 unwrapped. The legacy `locale.emptyText` feeds the same resolution.

 Structural, not visual — jsdom's lack of layout does not matter.
*/
import BAITableAstryx from './BAITableAstryx';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';

interface Row {
  id: string;
  name: string;
}

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];

const renderEmpty = (
  props: Partial<React.ComponentProps<typeof BAITableAstryx<Row>>> = {},
) =>
  render(
    <BAITableAstryx<Row>
      rowKey="id"
      dataSource={[]}
      columns={COLUMNS}
      {...props}
    />,
  );

describe('BAITableAstryx empty state (FR-3503)', () => {
  it('renders the localized default when no override is given', () => {
    renderEmpty();
    // The copy comes from BUI's catalog, NOT Astryx's `@astryx.table.noData`.
    expect(screen.getByText('No data to display')).toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
  });

  it('wraps a string override in the same empty state', () => {
    renderEmpty({ emptyState: 'Nothing deployed yet' });
    expect(screen.getByText('Nothing deployed yet')).toBeInTheDocument();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });

  it('passes a ReactNode override through unwrapped', () => {
    renderEmpty({
      emptyState: <div data-testid="custom-empty">custom</div>,
    });
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });

  it('renders no empty state at all when given false', () => {
    renderEmpty({ emptyState: false });
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });

  it('still honours the legacy locale.emptyText', () => {
    renderEmpty({ locale: { emptyText: 'Legacy copy' } });
    expect(screen.getByText('Legacy copy')).toBeInTheDocument();
  });

  it('lets emptyState win over locale.emptyText', () => {
    renderEmpty({
      emptyState: 'Explicit wins',
      locale: { emptyText: 'Legacy copy' },
    });
    expect(screen.getByText('Explicit wins')).toBeInTheDocument();
    expect(screen.queryByText('Legacy copy')).not.toBeInTheDocument();
  });

  it('does not render the empty state when rows are present', () => {
    renderEmpty({ dataSource: [{ id: '1', name: 'alpha' }] });
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
  });
});
