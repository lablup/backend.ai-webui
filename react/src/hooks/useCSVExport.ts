import { useSuspendedBackendaiClient } from '.';
import { downloadCSV } from '../helper/csv-util';
import { useCurrentUserRole } from './backendai';
import { useSuspenseTanQuery } from './reactQueryAlias';
import {
  ErrorResponse,
  useBAISignedRequestWithPromise,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

type SupportedNodeKeys = 'sessions' | 'users' | 'projects' | 'audit-logs';

/** Export route the caller asks for; `my` is only available for `sessions`. */
export type CSVExportScope = 'admin' | 'my';

/** Route the hook resolved to, or `none` when the user can reach neither. */
export type CSVExportRoute = CSVExportScope | 'none';

/**
 * Field keys of the manager's `sessions` export report. `GET /export/reports/*`
 * is superadmin-only, so the `my` route cannot discover them at runtime
 * (backend.ai `manager/repositories/export/reports/session.py`, SESSION_FIELDS).
 */
export const MY_SESSION_EXPORT_FIELDS = [
  'id',
  'name',
  'session_type',
  'domain_name',
  'access_key',
  'status',
  'status_info',
  'cluster_size',
  'resource_used',
  'resource_requested',
  'created_at',
  'terminated_at',
  'project_name',
  'project_description',
  'project_resource_policy',
  'project_is_active',
  'project_created_at',
  'project_policy_max_vfolder_count',
  'project_policy_max_quota_scope_size',
  'project_policy_max_network_count',
  'user_email',
  'user_username',
  'user_full_name',
  'user_role',
  'resource_group_name',
  'resource_group_description',
  'resource_group_is_active',
  'resource_group_is_public',
  'resource_group_scheduler',
  'resource_group_created_at',
  'kernel_id',
  'kernel_role',
  'kernel_status',
  'kernel_image',
  'kernel_architecture',
  'kernel_registry',
  'kernel_tag',
  'kernel_agent',
  'kernel_created_at',
  'kernel_terminated_at',
];

/**
 * Every `/export` route is `superadmin_required` except `POST
 * /v2/export/sessions/my/csv`, which is `auth_required` and scopes the rows to
 * the caller — so a non-superadmin can export their own sessions and nothing else.
 */
export const resolveCSVExportRoute = ({
  nodeKey,
  scope,
  userRole,
  supportsExportCSV,
  supportsMySessionsExport,
}: {
  nodeKey: SupportedNodeKeys;
  scope: CSVExportScope;
  userRole: string | undefined;
  supportsExportCSV: boolean;
  supportsMySessionsExport: boolean;
}): CSVExportRoute => {
  if (!supportsExportCSV) return 'none';
  if (userRole === 'superadmin') return 'admin';
  if (scope === 'my' && nodeKey === 'sessions' && supportsMySessionsExport) {
    return 'my';
  }
  return 'none';
};

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

export const useCSVExport = (
  nodeKey: SupportedNodeKeys,
  { scope = 'admin' }: { scope?: CSVExportScope } = {},
) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  const { getErrorMessage } = useErrorMessageResolver();
  const userRole = useCurrentUserRole();

  const route = resolveCSVExportRoute({
    nodeKey,
    scope,
    userRole,
    supportsExportCSV: baiClient.supports('export-csv'),
    supportsMySessionsExport: baiClient.supports('my-sessions-export-csv'),
  });

  const { data: supportedFields } = useSuspenseTanQuery<Array<string>>({
    queryKey: ['CSVExport', 'supportedFields', nodeKey, route],
    queryFn: () => {
      if (route === 'none') return [];
      if (route === 'my') return MY_SESSION_EXPORT_FIELDS;
      return baiRequestWithPromise({
        method: 'GET',
        url: `/export/reports/${nodeKey}`,
      }).then((res: ReportResponse) =>
        _.map(res.report.fields, (field) => field.key),
      );
    },
  });

  const exportCSV = async (
    selectedExportKeys: string[],
    filter?: Record<string, unknown>,
  ) => {
    return await baiRequestWithPromise({
      method: 'POST',
      url:
        route === 'my'
          ? `/v2/export/${nodeKey}/my/csv`
          : `/export/${nodeKey}/csv`,
      body: {
        fields: selectedExportKeys,
        ...(filter && { filter }),
      },
    })
      .then((res: string) => {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5);
        const filename = `${nodeKey}_export_${timestamp}.csv`;

        downloadCSV(res, filename);
        return Promise.resolve();
      })
      .catch((err: ErrorResponse) => {
        return Promise.reject(
          getErrorMessage(err, t('general.FailedToExportCSV')),
        );
      });
  };

  return {
    supportedFields,
    exportCSV,
  };
};
