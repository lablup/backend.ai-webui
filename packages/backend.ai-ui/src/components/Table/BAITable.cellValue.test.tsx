/*
 approved-2: the value `BAITable` hands to a column's `render`.

 The contract is Astryx/antd's `render(value, record, index)`, nothing more.
 A column with no `dataIndex` has NO cell value, so `value` is `undefined` and
 the record is reached through the second argument.

 rc-table has a quirk here — its `getPathValue` returns the whole RECORD when
 the path is empty, which is why `render: (row) => …` works under antd. That
 quirk is deliberately NOT re-implemented in this engine (user direction on
 the to-astryx migration): call sites use `render: (_value, row) => …`
 instead. These tests pin the contract in BOTH directions so the emulation
 cannot creep back in and the native form cannot regress.

 They are structural, not visual, so jsdom's lack of layout does not matter.
*/
import BAITable from './BAITable';
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
  render(<BAITable<Row> rowKey="id" dataSource={ROWS} columns={columns} />);

describe('BAITable cell values', () => {
  it('should reach the record through `render`s SECOND argument on a column with no dataIndex', () => {
    renderTable([
      {
        title: 'Full path',
        key: 'fullPath',
        render: (_value, row) => <span>{fullPath(row)}</span>,
      },
    ]);

    expect(
      screen.getByText('cr.backend.ai/python-ff:24.03-py310'),
    ).toBeInTheDocument();
    expect(screen.getByText('index.docker.io/base:1.0')).toBeInTheDocument();
  });

  it('should pass `undefined` as the cell value when the column has no dataIndex, NOT the record', () => {
    const seen: Array<unknown> = [];
    renderTable([
      {
        title: 'Full path',
        key: 'fullPath',
        render: (value, row) => {
          seen.push(value);
          return fullPath(row);
        },
      },
    ]);

    expect(seen).toHaveLength(ROWS.length);
    seen.forEach((value) => expect(value).toBeUndefined());
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

  it('should pass the row itself as the second argument, identical to the dataSource entry', () => {
    const seen: Array<Row> = [];
    renderTable([
      {
        title: 'Same',
        key: 'same',
        render: (_value, record: Row) => {
          seen.push(record);
          return record.id;
        },
      },
    ]);

    expect(seen).toEqual(ROWS);
    seen.forEach((record, index) => expect(record).toBe(ROWS[index]));
  });

  it('should render nothing for a column with neither dataIndex nor render, not "[object Object]"', () => {
    const { container } = renderTable([{ title: 'Empty', key: 'empty' }]);

    expect(container.textContent).not.toContain('[object Object]');
  });

  it('should resolve a nested dataIndex path', () => {
    render(
      <BAITable<{ id: string; meta: { owner: string } }>
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
