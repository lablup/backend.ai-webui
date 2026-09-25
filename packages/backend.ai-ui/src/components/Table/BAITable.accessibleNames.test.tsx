/*
 Accessible names agents and screen readers read off the table (FR-4078):
 row checkboxes are named after the row, never its (often opaque) key, and a
 column header's name is its title — not the sort button plus the resize
 separator's value.
*/
import BAITable from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';

interface Row {
  id: string;
  name: string;
}

const ROWS: Array<Row> = [
  { id: 'Q29tcHV0ZVNlc3Npb25Ob2RlOjE=', name: 'alpha' },
  { id: 'Q29tcHV0ZVNlc3Npb25Ob2RlOjI=', name: 'beta' },
];

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', dataIndex: 'name', title: 'Session Name', sorter: true },
  { key: 'id', dataIndex: 'id', title: <span>Session ID</span> },
];

describe('BAITable accessible names', () => {
  it('names row checkboxes by position when no row label is given', () => {
    render(
      <BAITable<Row>
        rowKey="id"
        dataSource={ROWS}
        columns={COLUMNS}
        rowSelection={{ selectedRowKeys: [], onChange: () => {} }}
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select row 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select row 2' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Q29tcHV0/ }),
    ).not.toBeInTheDocument();
  });

  it('names row checkboxes after the row when getRowLabel is given', () => {
    render(
      <BAITable<Row>
        rowKey="id"
        dataSource={ROWS}
        columns={COLUMNS}
        rowSelection={{
          selectedRowKeys: [],
          onChange: () => {},
          getRowLabel: (record) =>
            record.id === ROWS[1].id ? '' : record.name,
        }}
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select alpha' }),
    ).toBeInTheDocument();
    // An empty label falls back to the position.
    expect(
      screen.getByRole('checkbox', { name: 'Select row 2' }),
    ).toBeInTheDocument();
  });

  it('names a resizable, sortable column header by its title alone', () => {
    render(
      <BAITable<Row>
        rowKey="id"
        dataSource={ROWS}
        columns={COLUMNS}
        resizable
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Session Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Session ID' }),
    ).toBeInTheDocument();
    // The separator keeps its own name and value.
    expect(
      screen.getAllByRole('separator', { name: /^Resize column/ }).length,
    ).toBeGreaterThan(0);
  });
});
