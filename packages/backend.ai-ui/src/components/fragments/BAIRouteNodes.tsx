import {
  BAIRouteNodesFragment$data,
  BAIRouteNodesFragment$key,
} from '../../__generated__/BAIRouteNodesFragment.graphql';
import {
  badgeVariantForStatus,
  filterOutEmpty,
  filterOutNullAndUndefined,
  safeDecodeUuid,
  toLocalId,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { Badge } from '@lablup/ui-common/Badge';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleAlert, History } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export type RouteNodeInList = NonNullable<BAIRouteNodesFragment$data[number]>;

const availableRouteSorterKeys = [
  'createdAt',
  'status',
  'trafficRatio',
] as const;

export const availableRouteSorterValues = [
  ...availableRouteSorterKeys,
  ...availableRouteSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableRouteSorterKeys, key);
};

export interface BAIRouteNodesProps extends Omit<
  BAITableProps<RouteNodeInList>,
  'dataSource' | 'onChangeOrder' | 'columns'
> {
  routesFrgmt: BAIRouteNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<RouteNodeInList>,
  ) => BAIColumnsType<RouteNodeInList>;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableRouteSorterValues)[number] | null,
  ) => void;
  onClickSessionId?: (sessionId: string) => void;
  onClickErrorData?: (errorData: unknown) => void;
  onClickSchedulingHistory?: (routeId: string) => void;
}

const BAIRouteNodes = ({
  routesFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  onClickSessionId,
  onClickErrorData,
  onClickSchedulingHistory,
  ...tableProps
}: BAIRouteNodesProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();
  const baiClient = useConnectedBAIClient();
  const isSupportRouteHealthStatus = baiClient.supports('route-health-status');

  const routes = useFragment<BAIRouteNodesFragment$key>(
    graphql`
      fragment BAIRouteNodesFragment on Route @relay(plural: true) {
        id
        status
        healthStatus @since(version: "26.4.0")
        trafficRatio
        createdAt
        errorData
        session
        trafficStatus
      }
    `,
    routesFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<RouteNodeInList>>([
      {
        title: t('comp:BAIRouteNodes.RouteId'),
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        render: (_value, record) => (
          <BAIText ellipsis>
            {toLocalId(record.id)}
            {!_.isEmpty(record.errorData) && (
              <BAIButton
                size="small"
                type="text"
                icon={<CircleAlert size="1em" />}
                style={{ color: token.colorError }}
                onClick={() => {
                  onClickErrorData?.(record.errorData);
                }}
              />
            )}
          </BAIText>
        ),
      },
      {
        title: t('comp:BAIRouteNodes.SessionId'),
        dataIndex: 'session',
        key: 'session',
        render: (sessionId) =>
          sessionId ? (
            onClickSessionId ? (
              <BAILink
                ellipsis
                onClick={() => {
                  onClickSessionId(toLocalId(sessionId));
                }}
              >
                {toLocalId(sessionId)}
              </BAILink>
            ) : (
              <BAIText>{toLocalId(sessionId)}</BAIText>
            )
          ) : (
            '-'
          ),
      },
      {
        title: t('comp:BAIRouteNodes.Status'),
        dataIndex: 'status',
        key: 'status',
        sorter: isEnableSorter('status'),
        render: (status, record) => (
          <BAIFlex align="center" gap="xs">
            {status && status !== '%future added value' ? (
              <Badge
                variant={badgeVariantForStatus('route', status)}
                label={status}
              />
            ) : null}
            {onClickSchedulingHistory && (
              <Tooltip content={t('comp:BAIRouteNodes.SchedulingHistory')}>
                <BAIButton
                  type="text"
                  icon={<History size="1em" />}
                  size="small"
                  onClick={() =>
                    onClickSchedulingHistory(
                      safeDecodeUuid(record.id) ?? record.id,
                    )
                  }
                />
              </Tooltip>
            )}
          </BAIFlex>
        ),
      },
      isSupportRouteHealthStatus
        ? {
            title: t('comp:BAIRouteNodes.HealthStatus'),
            dataIndex: 'healthStatus',
            key: 'healthStatus',
            render: (healthStatus) =>
              healthStatus && healthStatus !== '%future added value' ? (
                <Badge
                  variant={badgeVariantForStatus('route', healthStatus)}
                  label={healthStatus}
                />
              ) : null,
          }
        : undefined,
      // TODO(needs-backend): Unhide when backend interaction for traffic status is supported (FR-2591)
      // {
      //   title: t('comp:BAIRouteNodes.TrafficStatus'),
      //   dataIndex: 'trafficStatus',
      //   key: 'trafficStatus',
      //   render: (trafficStatus) =>
      //     trafficStatus && trafficStatus !== '%future added value' ? (
      //       <Badge
      //         variant={trafficStatus === 'ACTIVE' ? 'success' : 'neutral'}
      //         label={trafficStatus}
      //       />
      //     ) : null,
      // },
      // TODO(needs-backend): Uncomment when the backend supports traffic ratio for routes
      // {
      //   title: t('comp:BAIRouteNodes.TrafficRatio'),
      //   dataIndex: 'trafficRatio',
      //   key: 'trafficRatio',
      //   sorter: isEnableSorter('trafficRatio'),
      // },
      {
        title: t('comp:BAIRouteNodes.CreatedAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (value: string | null) =>
          value ? <span>{dayjs(value).format('ll LT')}</span> : '-',
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
      rowKey={'id'}
      dataSource={filterOutNullAndUndefined(routes)}
      columns={allColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableRouteSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIRouteNodes;
