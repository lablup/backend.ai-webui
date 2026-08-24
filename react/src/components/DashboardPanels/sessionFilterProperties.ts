/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Every session field the manager's queryfilter accepts
 (`gql_legacy/session.py::_queryfilter_fieldspec`), so a custom panel can
 express any condition the backend supports instead of the three the picker
 used to offer (FR-3654).
*/
import { isValidUUID, type FilterProperty } from 'backend.ai-ui';
import type { TFunction } from 'i18next';

/**
 * Enum values are shown verbatim: they are what goes into the filter string,
 * and the app renders session status/type/result raw everywhere else too.
 */
const asOptions = (values: ReadonlyArray<string>) =>
  values.map((value) => ({ label: value, value }));

/** `SessionStatus` (manager `data/session/types.py`). */
const SESSION_STATUSES = [
  'PENDING',
  'DEPRIORITIZING',
  'RESERVED',
  'SCHEDULED',
  'PREPARING',
  'PULLING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'RESTARTING',
  'RUNNING_DEGRADED',
  'PREEMPTED',
  'RESCHEDULING',
  'TERMINATING',
  'TERMINATED',
  'ERROR',
  'CANCELLED',
] as const;

/** `SessionTypes`, `SessionResult`, `ClusterMode` (`common/types.py`). */
const SESSION_TYPES = ['interactive', 'batch', 'inference', 'system'] as const;
const SESSION_RESULTS = ['undefined', 'success', 'failure'] as const;
const CLUSTER_MODES = ['single-node', 'multi-node'] as const;

/** Postgres rejects a partial UUID outright, so flag it before it is sent. */
const uuidProperty = (key: string, propertyLabel: string, t: TFunction) =>
  ({
    key,
    propertyLabel,
    type: 'uuid',
    rule: {
      message: t('general.InvalidUUID'),
      validate: (value: string) => isValidUUID(value),
    },
  }) satisfies FilterProperty;

const enumProperty = (
  key: string,
  propertyLabel: string,
  values: ReadonlyArray<string>,
): FilterProperty => ({
  key,
  propertyLabel,
  type: 'string',
  defaultOperator: '==',
  strictSelection: true,
  options: asOptions(values),
});

/**
 * `project_id` / `group_name` are absent because the panel query is already
 * scoped to the current project; `scheduled_at` because the manager compares
 * its JSON text extraction against a parsed datetime, which no backend
 * accepts.
 */
export const getSessionFilterProperties = (
  t: TFunction,
): Array<FilterProperty> => [
  { key: 'name', propertyLabel: t('session.SessionName'), type: 'string' },
  enumProperty('status', t('session.Status'), SESSION_STATUSES),
  enumProperty('type', t('session.SessionType'), SESSION_TYPES),
  {
    key: 'scaling_group',
    propertyLabel: t('session.ResourceGroup'),
    type: 'string',
  },
  { key: 'agent_ids', propertyLabel: t('session.Agent'), type: 'string' },
  { key: 'image', propertyLabel: t('general.Image'), type: 'string' },
  {
    key: 'user_email',
    propertyLabel: t('session.launcher.OwnerEmail'),
    type: 'string',
  },
  uuidProperty('user_id', t('credential.UserID'), t),
  { key: 'full_name', propertyLabel: t('credential.FullName'), type: 'string' },
  {
    key: 'access_key',
    propertyLabel: t('general.AccessKey'),
    type: 'string',
  },
  {
    key: 'domain_name',
    propertyLabel: t('credential.Domain'),
    type: 'string',
  },
  enumProperty('cluster_mode', t('session.ClusterMode'), CLUSTER_MODES),
  {
    key: 'cluster_size',
    propertyLabel: t('session.launcher.ClusterSize'),
    type: 'number',
  },
  { key: 'priority', propertyLabel: t('session.Priority'), type: 'number' },
  enumProperty('result', t('session.Result'), SESSION_RESULTS),
  {
    key: 'status_info',
    propertyLabel: t('session.StatusInfo'),
    type: 'string',
  },
  {
    key: 'startup_command',
    propertyLabel: t('session.StartupCommand'),
    type: 'string',
  },
  uuidProperty('id', t('session.SessionId'), t),
  {
    key: 'created_at',
    propertyLabel: t('session.CreatedAt'),
    type: 'datetime',
  },
  {
    key: 'starts_at',
    propertyLabel: t('session.StartsAt'),
    type: 'datetime',
  },
  {
    key: 'terminated_at',
    propertyLabel: t('session.TerminatedAt'),
    type: 'datetime',
  },
];
