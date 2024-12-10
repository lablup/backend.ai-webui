import { filterEmptyItem, filterNonNullItems } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIPropertyFilter, { mergeFilterValues } from './BAIPropertyFilter';
import Flex from './Flex';
import { SessionNodesQuery } from './__generated__/SessionNodesQuery.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Radio, Table } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const SessionNodes = () => {
  const currentProject = useCurrentProjectValue();
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [filterString, setFilterString] = useState<string>();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const { compute_session_nodes } = useLazyLoadQuery<SessionNodesQuery>(
    graphql`
      query SessionNodesQuery(
        $projectId: UUID!
        $first: Int = 20
        $offset: Int = 0
        $filter: String
      ) {
        compute_session_nodes(
          project_id: $projectId
          first: $first
          offset: $offset
          filter: $filter
        ) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              id
              name
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
      filter: mergeFilterValues([filterString]),
    },
    {
      fetchPolicy: 'network-only',
    },
  );
  const nodes = filterNonNullItems(
    _.map(compute_session_nodes?.edges, (e) => e?.node),
  );
  return (
    <Flex direction="column" align="stretch" gap={'sm'}>
      <Flex gap={'sm'} align="start">
        <Radio.Group optionType="button" buttonStyle="solid">
          <Radio value={'status == "RUNNING"'}>Running</Radio>
          <Radio value={'finished'}>Finished</Radio>
        </Radio.Group>
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
            });
          }}
        />
      </Flex>
      <Table
        dataSource={nodes}
        columns={[
          {
            title: t('session.SessionName'),
            dataIndex: 'name',
          },
        ]}
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
        onChange={({ current, pageSize }) => {
          if (_.isNumber(current) && _.isNumber(pageSize)) {
            startPageChangeTransition(() => {
              setTablePaginationOption({ current, pageSize });
            });
          }
        }}
      />
    </Flex>
  );
};

export default SessionNodes;
