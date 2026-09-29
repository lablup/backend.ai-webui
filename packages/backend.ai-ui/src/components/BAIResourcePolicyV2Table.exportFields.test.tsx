// The exportable field lists are hand-written beside the sorter keys, so only
// this test stops a new column from silently staying out of the CSV export.
import BAIKeypairResourcePolicyV2Table, {
  availableKeypairResourcePolicyExportFields,
} from './BAIKeypairResourcePolicyV2Table';
import BAIProjectResourcePolicyV2Table, {
  availableProjectResourcePolicyExportFields,
} from './BAIProjectResourcePolicyV2Table';
import BAIUserResourcePolicyV2Table, {
  availableUserResourcePolicyExportFields,
} from './BAIUserResourcePolicyV2Table';
import type { BAIColumnsType } from './Table/tableTypes';
import { render } from '@testing-library/react';

// The tables only need their column list built, not real rows.
vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useFragment: () => [],
}));

const columnKeysOf = (
  renderTable: (
    capture: (columns: BAIColumnsType<any>) => BAIColumnsType<any>,
  ) => void,
) => {
  let captured: BAIColumnsType<any> = [];
  renderTable((columns) => {
    captured = columns;
    return columns;
  });
  return captured.map((column) => String(column.key));
};

describe('resource policy V2 tables expose every column to the CSV export', () => {
  it('keypair', () => {
    expect(
      columnKeysOf((capture) =>
        render(
          <BAIKeypairResourcePolicyV2Table
            keypairResourcePoliciesFrgmt={[]}
            customizeColumns={capture}
          />,
        ),
      ),
    ).toEqual([...availableKeypairResourcePolicyExportFields]);
  });

  it('user', () => {
    expect(
      columnKeysOf((capture) =>
        render(
          <BAIUserResourcePolicyV2Table
            userResourcePoliciesFrgmt={[]}
            customizeColumns={capture}
          />,
        ),
      ),
    ).toEqual([...availableUserResourcePolicyExportFields]);
  });

  it('project', () => {
    expect(
      columnKeysOf((capture) =>
        render(
          <BAIProjectResourcePolicyV2Table
            projectResourcePoliciesFrgmt={[]}
            customizeColumns={capture}
          />,
        ),
      ),
    ).toEqual([...availableProjectResourcePolicyExportFields]);
  });
});
