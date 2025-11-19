import {
  ComputeSessionListPageQuery,
  ComputeSessionListPageQuery$data,
  ComputeSessionListPageQuery$variables,
} from '../__generated__/ComputeSessionListPageQuery.graphql';
import ActionItemContent from '../components/ActionItemContent';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import ConfigurableResourceCard from '../components/ConfigurableResourceCard';
import SessionNodes, {
  availableSessionSorterValues,
} from '../components/SessionNodes';
import { handleRowSelectionChange } from '../helper';
import { ExtractResultValue } from '../helper/resultTypes';
import { INITIAL_FETCH_KEY, useFetchKey, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  Alert,
  Badge,
  Button,
  Col,
  Grid,
  Row,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIFlex,
  BAICard,
  BAISessionsIcon,
  BAILink,
  BAIPropertyFilter,
  mergeFilterValues,
  BAIAlertIconWithTooltip,
  filterOutNullAndUndefined,
  filterOutEmpty,
} from 'backend.ai-ui';
import _ from 'lodash';
import { PowerOffIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';
import { useCurrentUserRole } from 'src/hooks/backendai';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

const typeFilterValues = [
  'all',
  'interactive',
  'batch',
  'inference',
  'system',
] as const;
type TypeFilterType = (typeof typeFilterValues)[number];

// Extract the success value type from Result
type ComputeSessionNodesData = ExtractResultValue<
  ComputeSessionListPageQuery$data['computeSessionNodeResult']
>;

type SessionNode = NonNullableNodeOnEdges<ComputeSessionNodesData>;

const CARD_MIN_HEIGHT = 200;

const ComputeSessionListPage = () => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const userRole = useCurrentUserRole();

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ComputeSessionListPage',
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableSessionSorterValues).withDefault(
        '-created_at',
      ),
      filter: parseAsString.withDefault(''),
      type: parseAsStringLiteral(typeFilterValues).withDefault('all'),
      statusCategory: parseAsStringLiteral(['running', 'finished']).withDefault(
        'running',
      ),
    },
    {
      history: 'replace',
    },
  );

  const queryMapRef = useRef({
    [queryParams.type]: {
      queryParams,
      tablePaginationOption,
    },
  });

  useEffect(() => {
    queryMapRef.current[queryParams.type] = {
      queryParams,
      tablePaginationOption,
    };
  }, [queryParams, tablePaginationOption]);

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

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables: ComputeSessionListPageQuery$variables = {
    projectId: currentProject.id,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([statusFilter, queryParams.filter, typeFilter]),
    order: queryParams.order,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<ComputeSessionListPageQuery>(
    graphql`
        query ComputeSessionListPageQuery(
          $projectId: UUID!
          $first: Int = 20
          $offset: Int = 0
          $filter: String
          $order: String
        ) {
          computeSessionNodeResult: compute_session_nodes(
            project_id: $projectId
            first: $first
            offset: $offset
            filter: $filter
            order: $order
          ) @catch(to: RESULT) {
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
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const { computeSessionNodeResult, ...sessionCounts } = queryRef;
  const compute_session_nodes = computeSessionNodeResult.ok
    ? computeSessionNodeResult.value
    : null;
  const { lg } = Grid.useBreakpoint();

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Row gutter={[16, 16]} align={'stretch'}>
        {lg && (
          <Col xs={24} lg={8} xl={4} style={{ display: 'flex' }}>
            <BAICard
              style={{
                width: '100%',
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
        )}

        <Col xs={24} lg={16} xl={20} style={{ display: 'flex' }}>
          <ErrorBoundary
            fallbackRender={() => {
              return (
                <BAICard
                  style={{
                    width: '100%',
                  }}
                  status="error"
                  extra={
                    <BAIAlertIconWithTooltip
                      title={t('error.UnexpectedError')}
                    />
                  }
                />
              );
            }}
          >
            <Suspense
              fallback={
                <BAICard
                  style={{
                    width: '100%',
                  }}
                  loading
                />
              }
            >
              <ConfigurableResourceCard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                fetchKey={deferredFetchKey}
              />
            </Suspense>
          </ErrorBoundary>
        </Col>
      </Row>
      <BAICard
        variant="borderless"
        title={t('webui.menu.Sessions')}
        extra={
          <BAIFlex gap={'xs'}>
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
          </BAIFlex>
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
            // Set to null first to reset to default values
            setQueryParams(null);
            setQueryParams({
              ...storedQuery.queryParams,
              type: key as TypeFilterType,
            });
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
                <BAIFlex justify="center" gap={10}>
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
                </BAIFlex>
              ),
            }),
          )}
        />
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
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
                  setQueryParams({ statusCategory: e.target.value });
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
                options={[
                  {
                    label: t('session.Running'),
                    value: 'running',
                  },
                  {
                    label: t('session.Finished'),
                    value: 'finished',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={filterOutEmpty([
                  {
                    key: 'name',
                    propertyLabel: t('session.SessionName'),
                    type: 'string',
                  },
                  {
                    key: 'scaling_group',
                    propertyLabel: t('session.ResourceGroup'),
                    type: 'string',
                  },
                  {
                    key: 'agent_ids',
                    propertyLabel: t('session.Agent'),
                    type: 'string',
                  },
                  (userRole === 'superadmin' ||
                    userRole === 'admin' ||
                    userRole === 'monitor') && {
                    key: 'user_email',
                    propertyLabel: t('session.launcher.OwnerEmail'),
                    type: 'string',
                  },
                ])}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  setQueryParams({ filter: value || '' });
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
              />
            </BAIFlex>
            <BAIFlex gap={'sm'}>
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
            </BAIFlex>
          </BAIFlex>
          {computeSessionNodeResult.ok ? (
            <SessionNodes
              order={queryParams.order}
              onClickSessionName={(session) => {
                // Set sessionDetailDrawerFrgmt in location state via webUINavigate
                // instead of directly setting sessionDetailId query param
                // to avoid additional fetch in SessionDetailDrawer
                const newSearchParams = new URLSearchParams(location.search);
                newSearchParams.set('sessionDetail', session.row_id);
                webUINavigate(
                  {
                    pathname: location.pathname,
                    hash: location.hash,
                    search: newSearchParams.toString(),
                  },
                  {
                    state: {
                      sessionDetailDrawerFrgmt: session,
                      createdAt: new Date().toISOString(),
                    },
                  },
                );
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
                    filterOutNullAndUndefined(
                      compute_session_nodes?.edges.map((e) => e?.node),
                    ),
                    setSelectedSessionList,
                  );
                },
                selectedRowKeys: _.map(selectedSessionList, (i) => i.id),
              }}
              sessionsFrgmt={filterOutNullAndUndefined(
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
              sortDirections={['ascend', 'descend', 'ascend']}
              onChangeOrder={(order) => {
                setQueryParams({ order });
              }}
              tableSettings={{
                columnOverrides: columnOverrides,
                onColumnOverridesChange: setColumnOverrides,
              }}
            />
          ) : (
            <Alert
              type="error"
              showIcon
              message={t('error.FailedToLoadTableData')}
            />
          )}
        </BAIFlex>
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
    </BAIFlex>
  );
};

export default ComputeSessionListPage;
