import {
  ComputeSessionListPageQuery,
  ComputeSessionListPageQuery$data,
  ComputeSessionListPageQuery$variables,
} from '../__generated__/ComputeSessionListPageQuery.graphql';
import ActionItemContent from '../components/ActionItemContent';
import AvailableResourcesCard from '../components/AvailableResourcesCard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import BAILink from '../components/BAILink';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import Flex from '../components/Flex';
import SessionNodes from '../components/SessionNodes';
import { filterNonNullItems, handleRowSelectionChange } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAINotificationState } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { SESSION_LAUNCHER_NOTI_PREFIX } from './SessionLauncherPage';
import { useUpdateEffect } from 'ahooks';
import {
  Badge,
  Button,
  Col,
  Grid,
  Row,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { BAICard, BAISessionsIcon } from 'backend.ai-ui';
import _ from 'lodash';
import { PowerOffIcon } from 'lucide-react';
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TypeFilterType = 'all' | 'interactive' | 'batch' | 'inference' | 'system';
type SessionNode = NonNullableNodeOnEdges<
  ComputeSessionListPageQuery$data['compute_session_nodes']
>;

const CARD_MIN_HEIGHT = 200;

const ComputeSessionListPage = () => {
  const currentProject = useCurrentProjectValue();

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
    type: withDefault(StringParam, 'all'),
    statusCategory: withDefault(StringParam, 'running'),
  });

  const [, setSessionDetailId] = useQueryParam('sessionDetail', StringParam);
  const queryMapRef = useRef({
    [queryParams.type]: {
      queryParams,
      tablePaginationOption,
    },
  });

  queryMapRef.current[queryParams.type] = {
    queryParams,
    tablePaginationOption,
  };

  const typeFilter =
    queryParams.type === 'all' || queryParams.type === undefined
      ? undefined
      : `type == "${queryParams.type}"`;

  const statusFilter =
    queryParams.statusCategory === 'running' ||
    queryParams.statusCategory === undefined
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"';

  const isNotRunningCategory = (status?: string | null) => {
    return status === 'TERMINATED' || status === 'CANCELLED';
  };

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const queryVariables: ComputeSessionListPageQuery$variables = useMemo(
    () => ({
      projectId: currentProject.id,
      offset: baiPaginationOption.offset,
      first: baiPaginationOption.first,
      filter: mergeFilterValues([statusFilter, queryParams.filter, typeFilter]),
      order: queryParams.order,
    }),
    [
      currentProject.id,
      baiPaginationOption.offset,
      baiPaginationOption.first,
      statusFilter,
      queryParams.filter,
      typeFilter,
      queryParams.order,
    ],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { compute_session_nodes, ...sessionCounts } =
    useLazyLoadQuery<ComputeSessionListPageQuery>(
      graphql`
        query ComputeSessionListPageQuery(
          $projectId: UUID!
          $first: Int = 20
          $offset: Int = 0
          $filter: String
          $order: String
        ) {
          compute_session_nodes(
            project_id: $projectId
            first: $first
            offset: $offset
            filter: $filter
            order: $order
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                name @required(action: THROW)
                ...SessionNodesFragment
                ...TerminateSessionModalFragment
              }
            }
            count
          }
          all: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\""
          ) {
            count
          }
          interactive: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
          ) {
            count
          }
          inference: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
          ) {
            count
          }
          batch: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
          ) {
            count
          }
          system: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
          ) {
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        // fetchPolicy: 'network-only',
        // fetchKey: deferredFetchKey,

        // fetchPolicy:'store-only',
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );
  const { lg } = Grid.useBreakpoint();

  const [notifications] = useBAINotificationState();

  const sessionNotifications = _.filter(notifications, (n) =>
    _.startsWith(n.key.toString(), SESSION_LAUNCHER_NOTI_PREFIX),
  );

  const pendingSessionNames = _.filter(
    sessionNotifications,
    (n) => n.backgroundTask?.status === 'pending',
  ).map((notifications) =>
    notifications.key.toString().replace(SESSION_LAUNCHER_NOTI_PREFIX, ''),
  );

  const resolvedSessionNames = _.filter(
    sessionNotifications,
    (n) => n.backgroundTask?.status === 'resolved',
  ).map((notifications) =>
    notifications.key.toString().replace(SESSION_LAUNCHER_NOTI_PREFIX, ''),
  );

  // Monkey patch to show pending sessions in the list immediately when navigating to this page
  // before receiving the response after session creation request
  // TODO: Remove this effect when the session creation API response right after creation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (queryParams.type === 'all' && pendingSessionNames.length > 0) {
      if (
        !_.some(compute_session_nodes?.edges, (e) => {
          return e?.node.name && pendingSessionNames.includes(e.node.name);
        })
      ) {
        timeoutId = setTimeout(() => {
          updateFetchKey();
        }, 500);
      }
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pendingSessionNames), queryParams.type]);

  // Update fetch key when session creation notifications are resolved
  // TODO: Remove this effect when the session creation API supports bg_task or GraphQL subscriptions
  useUpdateEffect(() => {
    if (resolvedSessionNames.length > 0) {
      updateFetchKey();
    }
  }, [resolvedSessionNames.length, updateFetchKey]);

  return (
    <Flex direction="column" align="stretch" gap={'md'}>
      <Row
        gutter={[16, 16]}
        align={'stretch'}
        style={{ minHeight: lg ? CARD_MIN_HEIGHT : undefined }}
      >
        <Col xs={24} lg={8} xl={4} style={{ display: 'flex' }}>
          <BAICard
            style={{
              width: '100%',
              minHeight: lg ? CARD_MIN_HEIGHT : undefined,
            }}
          >
            <ActionItemContent
              title={
                <Typography.Text
                  style={{
                    maxWidth: lg ? 120 : undefined,
                    wordBreak: 'keep-all',
                  }}
                >
                  {t('start.CreateASession')}
                </Typography.Text>
              }
              buttonText={t('start.button.StartSession')}
              icon={<BAISessionsIcon />}
              type="simple"
              to={'/session/start'}
              style={{
                height: '100%',
              }}
            />
          </BAICard>
        </Col>
        <Col xs={24} lg={16} xl={20} style={{ display: 'flex' }}>
          <Suspense
            fallback={
              <BAICard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                title={t('Allocated Resources')}
                loading
              />
            }
          >
            <AvailableResourcesCard
              style={{
                width: '100%',
                minHeight: lg ? CARD_MIN_HEIGHT : undefined,
              }}
              isRefetching={deferredFetchKey !== fetchKey}
              fetchKey={deferredFetchKey}
            />
          </Suspense>
        </Col>
      </Row>
      <BAICard
        variant="borderless"
        title={t('webui.menu.Sessions')}
        extra={
          <Flex gap={'xs'}>
            <BAIFetchKeyButton
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
              autoUpdateDelay={15_000}
              // showLastLoadTime
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
            <BAILink to={'/session/start'}>
              <Button type="primary">{t('start.button.StartSession')}</Button>
            </BAILink>
          </Flex>
        }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAITabs
          activeKey={queryParams.type}
          onChange={(key) => {
            const storedQuery = queryMapRef.current[key] || {
              queryParams: {
                statusCategory: 'running',
              },
            };
            setQuery(
              { ...storedQuery.queryParams, type: key as TypeFilterType },
              'replace',
            );
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedSessionList([]);
          }}
          items={_.map(
            {
              all: t('general.All'),
              interactive: t('session.Interactive'),
              batch: t('session.Batch'),
              inference: t('session.Inference'),
              system: t('session.System'),
            },
            (label, key) => ({
              key,
              label: (
                <Flex justify="center" gap={10}>
                  {label}
                  {
                    // display badge only if count is greater than 0
                    // @ts-ignore
                    (sessionCounts[key]?.count || 0) > 0 && (
                      <Badge
                        // @ts-ignore
                        count={sessionCounts[key].count}
                        color={
                          queryParams.type === key
                            ? token.colorPrimary
                            : token.colorTextDisabled
                        }
                        size="small"
                        showZero
                        style={{
                          paddingRight: token.paddingXS,
                          paddingLeft: token.paddingXS,
                          fontSize: 10,
                        }}
                      />
                    )
                  }
                </Flex>
              ),
            }),
          )}
        />
        <Flex direction="column" align="stretch" gap={'sm'}>
          <Flex justify="between" wrap="wrap" gap={'sm'}>
            <Flex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={queryParams.statusCategory}
                onChange={(e) => {
                  setQuery({ statusCategory: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
                options={[
                  {
                    label: 'Running',
                    value: 'running',
                  },
                  {
                    label: 'Finished',
                    value: 'finished',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('session.SessionName'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter}
                onChange={(value) => {
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
              />
            </Flex>
            <Flex gap={'sm'}>
              {selectedSessionList.length > 0 && (
                <>
                  {t('general.NSelected', {
                    count: selectedSessionList.length,
                  })}
                  <Tooltip
                    title={t('session.TerminateSession')}
                    placement="topLeft"
                  >
                    <Button
                      icon={<PowerOffIcon color={token.colorError} />}
                      onClick={() => {
                        setOpenTerminateModal(true);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </Flex>
          </Flex>
          <SessionNodes
            order={queryParams.order}
            onClickSessionName={(session) => {
              setSessionDetailId(session.row_id);
            }}
            loading={deferredQueryVariables !== queryVariables}
            rowSelection={{
              type: 'checkbox',
              // Preserve selected rows between pages, but clear when filter changes
              preserveSelectedRowKeys: true,
              getCheckboxProps(record) {
                return {
                  disabled: isNotRunningCategory(record.status),
                };
              },
              onChange: (selectedRowKeys) => {
                // Using selectedRowKeys to retrieve selected rows since selectedRows lack nested fragment types
                handleRowSelectionChange(
                  selectedRowKeys,
                  filterNonNullItems(
                    compute_session_nodes?.edges.map((e) => e?.node),
                  ),
                  setSelectedSessionList,
                );
              },
              selectedRowKeys: _.map(selectedSessionList, (i) => i.id),
            }}
            sessionsFrgmt={filterNonNullItems(
              compute_session_nodes?.edges.map((e) => e?.node),
            )}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: compute_session_nodes?.count ?? 0,
              onChange: (current, pageSize) => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({ order }, 'replaceIn');
            }}
          />
        </Flex>
      </BAICard>
      <TerminateSessionModal
        open={isOpenTerminateModal}
        sessionFrgmts={selectedSessionList}
        onRequestClose={(success) => {
          setOpenTerminateModal(false);
          if (success) {
            setSelectedSessionList([]);
          }
        }}
      />
    </Flex>
  );
};

export default ComputeSessionListPage;
