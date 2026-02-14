import { useSuspenseTanQuery } from './reactQueryAlias';
import {
  ErrorResponse,
  useBAISignedRequestWithPromise,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';

type SupportedNodeKeys = 'sessions' | 'users' | 'projects' | 'audit-logs';

type ReportResponse = {
  report: {
    report_key: string;
    name: string;
    description: string;
    fields: Array<{
      key: string;
      name: string;
      description: string;
      field_type: string;
    }>;
  };
};

export const useCSVExport = (nodeKey: SupportedNodeKeys) => {
  'use memo';

  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  const { getErrorMessage } = useErrorMessageResolver();

  const { data: supportedFields } = useSuspenseTanQuery<Array<string>>({
    queryKey: ['CSVExport', 'supportedFields', nodeKey],
    queryFn: () =>
      baiRequestWithPromise({
        method: 'GET',
        url: `/export/reports/${nodeKey}`,
      }).then((res: ReportResponse) =>
        _.map(res.report.fields, (field) => field.key),
      ),
  });

  const exportCSV = async (selectedRowKeys: string[]) => {
    return await baiRequestWithPromise({
      method: 'POST',
      url: `/export/${nodeKey}/csv`,
      body: {
        fields: selectedRowKeys,
      },
    })
      .then((res: string) => {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5);
        const filename = `${nodeKey}_export_${timestamp}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        return Promise.resolve();
      })
      .catch((err: ErrorResponse) => {
        return Promise.reject(getErrorMessage(err, 'Failed to export CSV'));
      });
  };

  return {
    supportedFields,
    exportCSV,
  };
};
