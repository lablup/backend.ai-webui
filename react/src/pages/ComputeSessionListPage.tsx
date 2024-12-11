import BAIModal from '../components/BAIModal';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import ContainerLogModalWithLazyQueryLoader from '../components/ComputeSessionNodeItems/ContainerLogModalWithLazyQueryLoader';
import Flex from '../components/Flex';
import SessionDetailDrawer from '../components/SessionDetailDrawer';
import SessionNodes from '../components/SessionNodes';
import { filterNonNullItems, transformSorterToOrderString } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ComputeSessionListPageQuery } from './__generated__/ComputeSessionListPageQuery.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Card, Radio, Skeleton } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam } from 'use-query-params';

const ComputeSessionList = () => {
  const [sessionId, setSessionId] = useQueryParam('sessionDetail', StringParam);
  const currentProject = useCurrentProjectValue();
  const [containerLogModalSessionId, setContainerLogModalSessionId] =
    useState<string>();
  useEffect(() => {
    const handler = (e: any) => {
      setContainerLogModalSessionId(e.detail);
    };
    document.addEventListener('bai-open-session-log', handler);
    return () => {
      document.removeEventListener('bai-open-session-log', handler);
    };
  }, []);

  const { t } = useTranslation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const [order, setOrder] = useState<string>();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [filterString, setFilterString] = useState<string>();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [runningFilterType, setRunningFilterType] = useState<
    'running' | 'finished'
  >('running');
  const statusFilter =
    runningFilterType === 'running'
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"';

  const { compute_session_nodes } =
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
                id
                ...SessionNodesFragment
              }
            }
            count
          }
        }
      `,
      {
        projectId: currentProject.id,
        offset: baiPaginationOption.offset,
        first: baiPaginationOption.first,
        filter: mergeFilterValues([statusFilter, filterString]),
        order,
      },
      {
        fetchPolicy: 'network-only',
      },
    );

  return (
    <>
      <Card>
        <Flex direction="column" align="stretch" gap={'sm'}>
          <Flex gap={'sm'} align="start">
            <Radio.Group
              optionType="button"
              value={runningFilterType}
              onChange={(e) => {
                startFilterTransition(() => {
                  setRunningFilterType(e.target.value);
                });
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
              value={filterString}
              onChange={(value) => {
                startFilterTransition(() => {
                  setFilterString(value);
                  setTablePaginationOption({ current: 1 });
                });
              }}
            />
          </Flex>
          <SessionNodes
            sessionsFrgmt={filterNonNullItems(
              compute_session_nodes?.edges.map((e) => e?.node),
            )}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: compute_session_nodes?.count ?? 0,
              showTotal: (total) => {
                return total;
              },
            }}
            loading={{
              spinning: isPendingPageChange || isPendingFilter,
              indicator: <LoadingOutlined />,
            }}
            onChange={({ current, pageSize }, filters, sorter) => {
              startPageChangeTransition(() => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
                setOrder(transformSorterToOrderString(sorter));
              });
            }}
          />
        </Flex>
      </Card>
      <SessionDetailDrawer
        open={!sessionId}
        sessionId={sessionId || undefined}
        onClose={() => {
          setSessionId(null, 'replaceIn');
        }}
      />
      {containerLogModalSessionId && (
        <Suspense
          fallback={
            <BAIModal
              open
              // loading
              width={'100%'}
              styles={{
                header: {
                  width: '100%',
                },
                body: {
                  height: 'calc(100vh - 100px)',
                  maxHeight: 'calc(100vh - 100px)',
                },
              }}
              footer={null}
            >
              <Skeleton active />
            </BAIModal>
          }
        >
          <ContainerLogModalWithLazyQueryLoader
            sessionId={containerLogModalSessionId}
            afterClose={() => {
              setContainerLogModalSessionId(undefined);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default ComputeSessionList;
