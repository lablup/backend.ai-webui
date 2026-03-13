import {
  BAIRouteNodesFragment$data,
  BAIRouteNodesFragment$key,
} from '../../__generated__/BAIRouteNodesFragment.graphql';
import {
  SemanticColor,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useSemanticColorMap,
} from '../../helper';
import BAIButton from '../BAIButton';
import BAILink from '../BAILink';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
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

const routeStatusSemanticMap: Record<string, SemanticColor> = {
  HEALTHY: 'success',
  PROVISIONING: 'info',
  UNHEALTHY: 'warning',
  DEGRADED: 'warning',
  FAILED_TO_START: 'error',
};

const trafficStatusSemanticMap: Record<string, SemanticColor> = {
  ACTIVE: 'success',
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
}

const BAIRouteNodes = ({
  routesFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  onClickSessionId,
  onClickErrorData,
  ...tableProps
}: BAIRouteNodesProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const semanticColorMap = useSemanticColorMap();

  const routes = useFragment<BAIRouteNodesFragment$key>(
    graphql`
      fragment BAIRouteNodesFragment on Route @relay(plural: true) {
        id
        status
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
                icon={<ExclamationCircleOutlined />}
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
        render: (status) =>
          status && status !== '%future added value' ? (
            <BAITag
              color={
                semanticColorMap[routeStatusSemanticMap[status] ?? 'default']
              }
              style={{ marginRight: 0 }}
            >
              {status}
            </BAITag>
          ) : null,
      },
      {
        title: t('comp:BAIRouteNodes.TrafficStatus'),
        dataIndex: 'trafficStatus',
        key: 'trafficStatus',
        render: (trafficStatus) =>
          trafficStatus && trafficStatus !== '%future added value' ? (
            <BAITag
              color={
                semanticColorMap[
                  trafficStatusSemanticMap[trafficStatus] ?? 'default'
                ]
              }
              style={{ marginRight: 0 }}
            >
              {trafficStatus}
            </BAITag>
          ) : null,
      },
      {
        title: t('comp:BAIRouteNodes.TrafficRatio'),
        dataIndex: 'trafficRatio',
        key: 'trafficRatio',
        sorter: isEnableSorter('trafficRatio'),
      },
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
      rowKey={'id'}
      dataSource={filterOutNullAndUndefined(routes)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
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
