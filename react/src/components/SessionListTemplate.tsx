import { transformSorterToOrderString } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Table, theme } from 'antd';
import { TableProps } from 'antd/lib';
import { AnyObject } from 'antd/lib/_util/type';
import { TableRowSelection } from 'antd/lib/table/interface';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionListTemplateProps extends TableProps {}
const SessionListTemplate: React.FC<SessionListTemplateProps> = (props) => {
  // TODO: refactor with useControllableState
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<React.Key>>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<AnyObject> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const [
    ,
    // isPendingPageChange
    startPageChangeTransition,
  ] = useTransition();
  const [order, setOrder] = useState<string>();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const [
    sessionFetchKey,
    // setSessionFetchKey
  ] = useUpdatableState('initial-fetch');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const { id: projectId } = useCurrentProjectValue();
  return (
    <Table
      scroll={{ x: 'max-content' }}
      showSorterTooltip={false}
      sortDirections={['descend', 'ascend', 'descend']}
      dataSource={props.dataSource}
      rowKey={'id'}
      rowSelection={rowSelection}
      onChange={({ pageSize, current }, filters, sorter) => {
        startPageChangeTransition(() => {
          if (_.isNumber(current) && _.isNumber(pageSize)) {
            setTablePaginationOption({
              current,
              pageSize,
            });
          }
          setOrder(transformSorterToOrderString(sorter));
        });
      }}
      columns={props.columns}
    />
  );
};

export default SessionListTemplate;
