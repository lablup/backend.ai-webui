/*
 FR-3833 — the order-string field name a sortable column emits.

 The order string is built from the dataIndex path joined with '.', so a
 column whose dataIndex is a nested DISPLAY path (['calculationSnapshot',
 'fairShareFactor']) used to emit 'calculationSnapshot.fairShareFactor' — a
 string no server order-field enum accepts. `sortKey` overrides the emitted
 field name; these tests pin the override and the default.

 Structural, not visual — jsdom's lack of layout does not matter.
*/
import BAITable from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface Row {
  id: string;
  snapshot: { factor: number };
}

const ROWS: Array<Row> = [
  { id: '1', snapshot: { factor: 0.5 } },
  { id: '2', snapshot: { factor: 1.0 } },
];

const renderSorted = (
  columns: BAIColumnsType<Row>,
  onChangeOrder: (order?: string) => void,
) =>
  render(
    <BAITable<Row>
      rowKey="id"
      dataSource={ROWS}
      columns={columns}
      order={null}
      onChangeOrder={onChangeOrder}
    />,
  );

describe('BAITable sortable column order-string field name', () => {
  it('emits the sortKey override instead of the dataIndex path', async () => {
    const onChangeOrder = vi.fn();
    renderSorted(
      [
        {
          key: 'fairShareFactor',
          title: 'Factor',
          dataIndex: ['snapshot', 'factor'],
          sortKey: 'fairShareFactor',
          sorter: true,
        },
      ],
      onChangeOrder,
    );

    await userEvent.click(screen.getByText('Factor'));
    expect(onChangeOrder).toHaveBeenCalledTimes(1);
    expect(onChangeOrder.mock.calls[0][0]).toMatch(/^-?fairShareFactor$/);
  });

  it('defaults to the dot-joined dataIndex path without sortKey', async () => {
    const onChangeOrder = vi.fn();
    renderSorted(
      [
        {
          key: 'factor',
          title: 'Factor',
          dataIndex: ['snapshot', 'factor'],
          sorter: true,
        },
      ],
      onChangeOrder,
    );

    await userEvent.click(screen.getByText('Factor'));
    expect(onChangeOrder).toHaveBeenCalledTimes(1);
    expect(onChangeOrder.mock.calls[0][0]).toMatch(/^-?snapshot\.factor$/);
  });
});
