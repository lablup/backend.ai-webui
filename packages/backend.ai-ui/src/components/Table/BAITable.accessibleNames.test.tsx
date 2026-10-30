/*
 Row checkboxes are named after the row, never its (often opaque) key, so
 agents and screen readers do not read a global id off the table (FR-4078).
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
  { key: 'name', dataIndex: 'name', title: 'Session Name' },
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

  it('keeps positions distinct when rows have no row key value', () => {
    render(
      <BAITable<Partial<Row>>
        rowKey="id"
        dataSource={[{ name: 'alpha' }, { name: 'beta' }]}
        columns={[{ key: 'name', dataIndex: 'name', title: 'Session Name' }]}
        rowSelection={{ selectedRowKeys: [], onChange: () => {} }}
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select row 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select row 2' }),
    ).toBeInTheDocument();
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
});
