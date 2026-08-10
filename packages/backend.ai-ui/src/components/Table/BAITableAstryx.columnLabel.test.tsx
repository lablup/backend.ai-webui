/*
 QA-FINDINGS Q-12 — the plain-text label a column carries in the settings and
 CSV-export modals.

 Both modals need a `string`, and both used to take it with
 `String(renderTitle(column))`. A `title` is a `ReactNode`, so any header that
 is an element rather than a bare string — one with a tooltip, a unit suffix, a
 sort affordance — stringified to the literal `"[object Object]"`. Reported on
 the Deployments page's column list.

 These tests drive the label through the real settings modal, which is the
 surface that showed the defect, and cover the shapes a header actually takes:
 string, element, fragment, array, function-as-title, a textless (icon-only)
 header, and a column nested under a group.

 Structural, not visual — jsdom's lack of layout does not matter.
*/
import BAITableAstryx from './BAITableAstryx';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface Row {
  id: string;
  cpu: string;
}

const ROWS: Array<Row> = [{ id: '1', cpu: '2' }];

const openSettings = async (columns: BAIColumnsType<Row>) => {
  render(
    <BAITableAstryx<Row>
      rowKey="id"
      dataSource={ROWS}
      columns={columns}
      tableSettings={{ columnOverrides: {}, onChangeColumnOverrides: () => {} }}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /setting/i }));
};

describe('BAITableAstryx column labels in the settings modal', () => {
  it('uses the text of an ELEMENT title instead of stringifying the element', async () => {
    await openSettings([
      {
        key: 'cpu',
        dataIndex: 'cpu',
        title: (
          <span>
            CPU <small>(cores)</small>
          </span>
        ),
      },
    ]);

    expect(screen.getByLabelText('CPU (cores)')).toBeInTheDocument();
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
  });

  it('keeps a plain string title as-is', async () => {
    await openSettings([{ key: 'cpu', dataIndex: 'cpu', title: 'CPU' }]);

    expect(screen.getByLabelText('CPU')).toBeInTheDocument();
  });

  it('flattens a fragment / array title', async () => {
    await openSettings([
      {
        key: 'cpu',
        dataIndex: 'cpu',
        title: (
          <>
            {'Allocated'} {'CPU'}
          </>
        ),
      },
    ]);

    expect(screen.getByLabelText('Allocated CPU')).toBeInTheDocument();
  });

  it('resolves a function title before flattening it', async () => {
    await openSettings([
      {
        key: 'cpu',
        dataIndex: 'cpu',
        title: () => <span>CPU</span>,
      } as BAIColumnsType<Row>[number],
    ]);

    expect(screen.getByLabelText('CPU')).toBeInTheDocument();
  });

  it('prefixes a nested column with its group title', async () => {
    await openSettings([
      {
        key: 'resources',
        title: 'Resources',
        children: [{ key: 'cpu', dataIndex: 'cpu', title: 'CPU' }],
      } as BAIColumnsType<Row>[number],
    ]);

    expect(screen.getByLabelText('Resources / CPU')).toBeInTheDocument();
  });

  it('falls back to the column key when the header carries no text', async () => {
    await openSettings([
      {
        key: 'actions',
        dataIndex: 'cpu',
        title: <svg aria-hidden />,
      },
    ]);

    expect(screen.getByLabelText('actions')).toBeInTheDocument();
  });
});
