import { useUpdatableState } from '../hooks';
import BAIModal from './BAIModal';
import Flex from './Flex';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  RedoOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, Typography, Table, Alert, Checkbox, Input, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

type logType = NonNullable<{
  isError: boolean;
  statusCode: any;
  statusText: any;
  title: any;
  message: string;
  requestMethod: string;
  timestamp: string;
  type: string;
  requestUrl: string;
  requestParameters?: string;
  formattedTimestamp?: string; // for display only
}>;
const ErrorLogList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [key, checkUpdate] = useUpdatableState('first');
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();

  const columns: ColumnsType<logType> = [
    {
      title: t('logs.TimeStamp'),
      dataIndex: 'formattedTimeStamp',
      key: 'timeStamp',
      render: (value) => (
        <div style={{ minWidth: 50 }}>
          {_.isUndefined(value) ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
      fixed: 'left',
    },
    {
      title: t('logs.Status'),
      dataIndex: 'statusCode',
      key: 'status',
      render: (value, record) => (
        <div style={{ minWidth: 50 }}>
          {_.isUndefined(value) ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>
              {value + ' ' + record.statusText}
            </TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.ErrorTitle'),
      dataIndex: 'title',
      key: 'errorTitle',
      render: (value) => (
        <div style={{ minWidth: 50 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>
              {_.toString(value)}
              {/* set toString because sometime value type is object */}
            </TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.ErrorMessage'),
      dataIndex: 'message',
      key: 'errorMessage',
      render: (value) => (
        <div style={{ minWidth: 70 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.ErrorType'),
      dataIndex: 'type',
      key: 'errorType',
      render: (value) => (
        <div style={{ minWidth: 60 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.Method'),
      dataIndex: 'requestMethod',
      key: 'method',
      render: (value) => (
        <div style={{ minWidth: 60 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.RequestUrl'),
      dataIndex: 'requestUrl',
      key: 'requestUrl',
      render: (value) => (
        <div style={{ minWidth: 60 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
    },
    {
      title: t('logs.Parameters'),
      dataIndex: 'requestParameters',
      key: 'requestParameter',
      render: (value) => (
        <div style={{ minWidth: 100 }}>
          {!value ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          )}
        </div>
      ),
    },
  ];

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.ErrorLogList.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  const storageLogData = useMemo(() => {
    const raw = JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]');
    return _.map(raw, (log) => {
      return {
        ...log,
        formattedTimeStamp: dayjs(log.timestamp).format('lll'),
      };
    });
    // Add blow comment because eslint dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const filteredLogData = useMemo(() => {
    const regExp = new RegExp(`${_.escapeRegExp(logSearch)}`, 'i');
    return _.filter(storageLogData, (log) => {
      if (!logSearch) return true;
      return !!_.find(log, (value, key) => {
        if (key === 'timestamp') {
          // timestamp is not display in table, use formattedTimestamp instead
          return false;
        }
        return _.toString(value).match(regExp);
      });
    });
  }, [logSearch, storageLogData]);

  const handleOk = () => {
    localStorage.removeItem('backendaiwebui.logs');
    checkUpdate();
    setIsOpenClearLogsModal(false);
  };

  return (
    <Flex direction="column" align="stretch">
      <Flex
        direction="row"
        justify="between"
        wrap="wrap"
        gap={'xs'}
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Flex direction="column" align="start">
          <Typography.Title level={4} style={{ margin: 0, padding: 0 }}>
            {t('logs.LogMessages')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('logs.UpTo3000Logs')}
          </Typography.Text>
        </Flex>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={t('logs.SearchLogs')}
              onChange={(e) => {
                startSearchTransition(() => setLogSearch(e.target.value));
              }}
              style={{
                width: 200,
              }}
            />
            <Checkbox
              onChange={(e) => setCheckedShowOnlyError(e.target.checked)}
            >
              {t('logs.ShowOnlyError')}
            </Checkbox>
          </Flex>
          <Flex gap={'xs'}>
            <Button
              icon={<RedoOutlined />}
              loading={isPendingRefreshTransition}
              onClick={() => {
                startRefreshTransition(() => checkUpdate());
              }}
            >
              {t('button.Refresh')}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsOpenClearLogsModal(true);
              }}
            >
              {t('button.ClearLogs')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Table
        pagination={{ showSizeChanger: false }}
        loading={
          isPendingSearchTransition
            ? {
                indicator: <LoadingOutlined />,
              }
            : false
        }
        scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
        dataSource={
          checkedShowOnlyError
            ? _.filter(filteredLogData, (log) => {
                return log.isError;
              })
            : (filteredLogData as logType[])
        }
        columns={columns.filter(
          (column) => displayedColumnKeys?.includes(_.toString(column.key)),
        )}
        onRow={(record) => {
          return {
            style: { color: record.isError ? 'red' : '' },
          };
        }}
      />
      <Flex
        justify="end"
        style={{
          paddingRight: token.paddingXS,
          marginTop: token.paddingContentVertical * -1,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            setIsOpenColumnsSetting(true);
          }}
        />
      </Flex>
      <BAIModal
        open={isOpenClearLogsModal}
        title={t('dialog.warning.LogDeletion')}
        okText={t('button.Delete')}
        okButtonProps={{ danger: true }}
        onOk={handleOk}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenClearLogsModal(false)}
      >
        <Alert message={t('dialog.warning.CannotBeUndone')} type="warning" />
      </BAIModal>
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(false);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </Flex>
  );
};

export default ErrorLogList;
