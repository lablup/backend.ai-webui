/*
 Shared fixture for the scroll.x / scroll.y test pair — each file asserts the
 NEGATIVE of the other's axis, so they must agree on the render shape.
*/
import BAITable from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render } from '@testing-library/react';

export interface ScrollTestRow {
  id: string;
  name: string;
  note: string;
}

export const SCROLL_COLUMNS: BAIColumnsType<ScrollTestRow> = [
  { key: 'name', title: 'Name', dataIndex: 'name', width: 120 },
  { key: 'note', title: 'Note', dataIndex: 'note' },
];

export const SCROLL_PINNED_COLUMNS: BAIColumnsType<ScrollTestRow> = [
  { ...SCROLL_COLUMNS[0], fixed: 'left' },
  SCROLL_COLUMNS[1],
];

export const SCROLL_ROWS: Array<ScrollTestRow> = [
  { id: '1', name: 'alpha', note: 'a long note' },
];

export const renderScrollTable = (
  props: Partial<React.ComponentProps<typeof BAITable<ScrollTestRow>>> = {},
) =>
  render(
    <BAITable<ScrollTestRow>
      rowKey="id"
      dataSource={SCROLL_ROWS}
      columns={SCROLL_COLUMNS}
      {...props}
    />,
  );

export const dimLayerOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.bai-table-astryx-dim-layer')!;
