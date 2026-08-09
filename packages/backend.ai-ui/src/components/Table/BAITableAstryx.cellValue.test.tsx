/*
 approved-2: the value `BAITableAstryx` hands to a column's `render`.

 rc-table's `getPathValue` returns the RECORD ITSELF when a column has no
 `dataIndex`, so `render: (row) => …` on a computed column is correct antd and
 the app is full of it. `BAITableAstryx` passed `undefined` there instead,
 which silently blanked every such cell — the Environments image list rendered
 its full-image-path column as a lone copy button with no path beside it — and
 threw outright wherever the render body dereferenced the row.

 These tests pin the antd contract at the seam. They are structural, not
 visual, so jsdom's lack of layout does not matter.
*/
import BAITableAstryx from './BAITableAstryx';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';

interface Row {
  id: string;
  registry: string;
  name: string;
  tag: string;
}

const ROWS: Array<Row> = [
  { id: '1', registry: 'cr.backend.ai', name: 'python-ff', tag: '24.03-py310' },
  { id: '2', registry: 'index.docker.io', name: 'base', tag: '1.0' },
];

const fullPath = (row: Row) => `${row.registry}/${row.name}:${row.tag}`;

const renderTable = (columns: BAIColumnsType<Row>) =>
  render(
    <BAITableAstryx<Row> rowKey="id" dataSource={ROWS} columns={columns} />,
  );

describe('BAITableAstryx cell values', () => {
  it('should pass the whole record to `render` when the column has no dataIndex', () => {
    renderTable([
      {
        title: 'Full path',
        key: 'fullPath',
        // The antd idiom this table used to break.
        render: (row: Row) => <span data-testid="path">{fullPath(row)}</span>,
      },
    ]);

    expect(
      screen.getByText('cr.backend.ai/python-ff:24.03-py310'),
    ).toBeInTheDocument();
    expect(screen.getByText('index.docker.io/base:1.0')).toBeInTheDocument();
  });

  it('should treat an empty dataIndex the same as a missing one, as rc-table does', () => {
    renderTable([
      {
        title: 'Full path',
        key: 'fullPath',
        dataIndex: [],
        render: (row: Row) => fullPath(row),
      },
    ]);

    expect(
      screen.getByText('cr.backend.ai/python-ff:24.03-py310'),
    ).toBeInTheDocument();
  });

  it('should still pass the field value when the column HAS a dataIndex', () => {
    renderTable([
      {
        title: 'Registry',
        key: 'registry',
        dataIndex: 'registry',
        render: (value: string, record: Row) => `${value}|${record.id}`,
      },
    ]);

    expect(screen.getByText('cr.backend.ai|1')).toBeInTheDocument();
    expect(screen.getByText('index.docker.io|2')).toBeInTheDocument();
  });

  it('should pass the record as the first argument AND the second, so both signatures work', () => {
    renderTable([
      {
        title: 'Same',
        key: 'same',
        render: (value: Row, record: Row) => String(value === record),
      },
    ]);

    expect(screen.getAllByText('true')).toHaveLength(ROWS.length);
  });

  it('should render nothing for a column with neither dataIndex nor render, not "[object Object]"', () => {
    const { container } = renderTable([{ title: 'Empty', key: 'empty' }]);

    expect(container.textContent).not.toContain('[object Object]');
  });

  it('should resolve a nested dataIndex path', () => {
    render(
      <BAITableAstryx<{ id: string; meta: { owner: string } }>
        rowKey="id"
        dataSource={[{ id: '1', meta: { owner: 'admin' } }]}
        columns={[
          { title: 'Owner', key: 'owner', dataIndex: ['meta', 'owner'] },
        ]}
      />,
    );

    expect(screen.getByText('admin')).toBeInTheDocument();
  });
});
