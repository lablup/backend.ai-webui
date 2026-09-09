/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  BAIAllowedVfolderHostsWithPermission,
  BAIColumnsType,
  BAIColumnType,
  BAIFlex,
  BAIQuestionIconWithTooltip,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
  ResourceTypeIcon,
} from '..';
import type {
  BAIKeypairResourcePolicyV2TableFragment$data,
  BAIKeypairResourcePolicyV2TableFragment$key,
} from '../__generated__/BAIKeypairResourcePolicyV2TableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type KeypairResourcePolicyV2InList = NonNullable<
  BAIKeypairResourcePolicyV2TableFragment$data[number]
>;

type ResourceLimitEntry =
  KeypairResourcePolicyV2InList['totalResourceSlots'][number];

// `max_containers_per_session` is stored as the signed 32-bit ceiling when the
// operator means "no limit", so that exact value renders as ∞.
const SIGNED_32BIT_MAX_INT = 2147483647;

const availableKeypairResourcePolicySorterKeys = [
  'name',
  'createdAt',
  'maxSessionLifetime',
  'maxConcurrentSessions',
  'maxContainersPerSession',
  'idleTimeout',
  'maxConcurrentSftpSessions',
  'maxPendingSessionCount',
] as const;

export const availableKeypairResourcePolicySorterValues = [
  ...availableKeypairResourcePolicySorterKeys,
  ...availableKeypairResourcePolicySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableKeypairResourcePolicySorterKeys, key);
};

export interface BAIKeypairResourcePolicyV2TableProps extends Omit<
  BAITableProps<KeypairResourcePolicyV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  keypairResourcePoliciesFrgmt: BAIKeypairResourcePolicyV2TableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<KeypairResourcePolicyV2InList>,
  ) => BAIColumnsType<KeypairResourcePolicyV2InList>;
  onChangeOrder?: (
    order: (typeof availableKeypairResourcePolicySorterValues)[number] | null,
  ) => void;
}

const BAIKeypairResourcePolicyV2Table = ({
  keypairResourcePoliciesFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIKeypairResourcePolicyV2TableProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const keypairResourcePolicies =
    useFragment<BAIKeypairResourcePolicyV2TableFragment$key>(
      graphql`
        fragment BAIKeypairResourcePolicyV2TableFragment on KeypairResourcePolicyV2
        @relay(plural: true) {
          id
          name
          createdAt
          defaultForUnspecified
          totalResourceSlots {
            resourceType
            quantity
            unlimited
          }
          maxSessionLifetime
          maxConcurrentSessions
          maxPendingSessionCount
          maxPendingSessionResourceSlots {
            resourceType
            quantity
            unlimited
          }
          maxConcurrentSftpSessions
          maxContainersPerSession
          idleTimeout
          allowedVfolderHosts {
            host
            permissions
          }
        }
      `,
      keypairResourcePoliciesFrgmt,
    );

  const renderResourceSlots = (
    entries: ReadonlyArray<ResourceLimitEntry> | null | undefined,
  ) =>
    _.isEmpty(entries) ? (
      '-'
    ) : (
      <BAIFlex gap="xxs" wrap="wrap">
        {_.map(entries, (entry) =>
          entry.unlimited ? (
            <BAIFlex key={entry.resourceType} gap="xxs" align="center">
              <ResourceTypeIcon type={entry.resourceType} />
              <BAIText>∞</BAIText>
            </BAIFlex>
          ) : (
            <BAIResourceNumberWithIcon
              key={entry.resourceType}
              type={entry.resourceType}
              value={_.toString(entry.quantity)}
            />
          ),
        )}
      </BAIFlex>
    );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<KeypairResourcePolicyV2InList>>([
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.Name'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        sorter: isEnableSorter('name'),
      },
      {
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:BAIKeypairResourcePolicyV2Table.DefaultForUnspecified')}
            <BAIQuestionIconWithTooltip
              title={
                <>
                  {t(
                    'comp:BAIKeypairResourcePolicyV2Table.DefaultForUnspecifiedTooltipDesc1',
                  )}
                  <br />
                  <br />
                  {t(
                    'comp:BAIKeypairResourcePolicyV2Table.DefaultForUnspecifiedTooltipDesc2',
                  )}
                </>
              }
            />
          </BAIFlex>
        ),
        dataIndex: 'defaultForUnspecified',
        key: 'defaultForUnspecified',
        render: (text) => text ?? '-',
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.TotalResourceSlots'),
        dataIndex: 'totalResourceSlots',
        key: 'totalResourceSlots',
        render: (__, row) => renderResourceSlots(row.totalResourceSlots),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.Concurrency'),
        dataIndex: 'maxConcurrentSessions',
        key: 'maxConcurrentSessions',
        sorter: isEnableSorter('maxConcurrentSessions'),
        render: (text) => (text ? text : '∞'),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.ClusterSize'),
        dataIndex: 'maxContainersPerSession',
        key: 'maxContainersPerSession',
        sorter: isEnableSorter('maxContainersPerSession'),
        render: (text) => (text === SIGNED_32BIT_MAX_INT ? '∞' : text),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.IdleTimeout'),
        dataIndex: 'idleTimeout',
        key: 'idleTimeout',
        sorter: isEnableSorter('idleTimeout'),
        render: (text) => (text ? text : '∞'),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.MaxSessionLifetime'),
        dataIndex: 'maxSessionLifetime',
        key: 'maxSessionLifetime',
        sorter: isEnableSorter('maxSessionLifetime'),
        render: (text) => (text ? text : '∞'),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.StorageNodes'),
        dataIndex: 'allowedVfolderHosts',
        key: 'allowedVfolderHosts',
        render: (__, row) =>
          _.isEmpty(row.allowedVfolderHosts) ? (
            '-'
          ) : (
            <BAIAllowedVfolderHostsWithPermission
              allowedVfolderHostEntries={row.allowedVfolderHosts}
            />
          ),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.MaxPendingSessionCount'),
        dataIndex: 'maxPendingSessionCount',
        key: 'maxPendingSessionCount',
        sorter: isEnableSorter('maxPendingSessionCount'),
        render: (text) => (text == null ? '∞' : text),
      },
      {
        title: t(
          'comp:BAIKeypairResourcePolicyV2Table.MaxConcurrentSFTPSessions',
        ),
        dataIndex: 'maxConcurrentSftpSessions',
        key: 'maxConcurrentSftpSessions',
        sorter: isEnableSorter('maxConcurrentSftpSessions'),
        render: (text) => (text ? text : '∞'),
      },
      {
        title: t(
          'comp:BAIKeypairResourcePolicyV2Table.MaxPendingSessionResourceSlots',
        ),
        dataIndex: 'maxPendingSessionResourceSlots',
        key: 'maxPendingSessionResourceSlots',
        render: (__, row) =>
          renderResourceSlots(row.maxPendingSessionResourceSlots),
      },
      {
        title: t('comp:BAIKeypairResourcePolicyV2Table.CreatedAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (text) => (text ? dayjs(text).format('lll') : '-'),
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      scroll={{ x: 'max-content' }}
      resizable
      rowKey="id"
      dataSource={filterOutNullAndUndefined(keypairResourcePolicies)}
      columns={allColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableKeypairResourcePolicySorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIKeypairResourcePolicyV2Table;
