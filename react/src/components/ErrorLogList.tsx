import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import TextHighlighter from './TextHighlighter';
import {
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Typography, Alert, Checkbox, Input, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAIModal,
  BAITable,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

type LogType = {
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
};
const ErrorLogList: React.FC<{
  onChangeSearch?: (value: string) => void;
}> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [updateKey, checkUpdateKey] = useUpdatableState('first');
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const [isPendingReset, startResetTransition] = useTransition();

  useSuspendedBackendaiClient(); // TODO: remove this after react routing is stable. This is for remove flickering when browser reload
  const columns: ColumnsType<LogType> = [
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
          {_.isNil(value) || (_.isObject(value) && _.isEmpty(value)) ? (
            '-'
          ) : (
            <TextHighlighter keyword={logSearch}>
              {_.isObject(value) ? JSON.stringify(value) : _.toString(value)}
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

  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ErrorLogList');

  const storageLogData = useMemo(() => {
    const raw: LogType[] = JSON.parse(
      localStorage.getItem('backendaiwebui.logs') || '[]',
    );
    return _.map(raw, (log, index) => {
      return {
        ...log,
        key: index,
        formattedTimeStamp: dayjs(log.timestamp).format('ll LTS'),
      };
    });
    // Only update when updateKey is changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateKey]);

  const filteredLogData = useMemo(() => {
    if (_.isEmpty(logSearch)) return storageLogData;
    const regExp = new RegExp(`${_.escapeRegExp(logSearch)}`, 'i');
    return _.filter(storageLogData, (log) => {
      return _.some(log, (value, key) => {
        if (key === 'timestamp') {
          // timestamp is not display in table, use formattedTimestamp instead
          return false;
        }
        return regExp.test(_.toString(value));
      });
    });
  }, [logSearch, storageLogData]);

  return (
    <BAIFlex direction="column" align="stretch" gap={'xs'}>
      <BAIFlex direction="row" justify="between" wrap="wrap" gap={'xs'}>
        <Typography.Text>{t('logs.UpTo3000Logs')}</Typography.Text>
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
          <BAIFlex gap={'xs'}>
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
          </BAIFlex>
          <BAIFlex gap={'xs'}>
            <Button
              icon={<ReloadOutlined />}
              loading={isPendingRefreshTransition}
              onClick={() => {
                startRefreshTransition(() => checkUpdateKey());
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
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        pagination={{
          showSizeChanger: false,
          style: {
            marginBottom: 0,
          },
        }}
        loading={
          isPendingSearchTransition
            ? {
                indicator: <LoadingOutlined />,
              }
            : false
        }
        scroll={{
          x: 'max-content',
          y:
            _.filter(filteredLogData, (log) => log.isError).length === 0
              ? undefined
              : 'calc(100vh - 400px)',
        }}
        dataSource={
          checkedShowOnlyError
            ? _.filter(filteredLogData, (log) => {
                return log.isError;
              })
            : (filteredLogData as LogType[])
        }
        columns={_.filter(
          columns,
          (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
        )}
        onRow={(record) => {
          return {
            style: { color: record.isError ? token.colorError : '' },
          };
        }}
      />
      <BAIFlex
        justify="end"
        style={{
          paddingRight: token.paddingXS,
          paddingBottom: token.paddingXS,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            toggleColumnSettingModal();
          }}
        />
      </BAIFlex>
      <BAIModal
        open={isOpenClearLogsModal}
        title={t('dialog.warning.LogDeletion')}
        okText={t('button.Delete')}
        okButtonProps={{ danger: true }}
        confirmLoading={isPendingReset}
        onOk={() => {
          startResetTransition(() => {
            localStorage.removeItem('backendaiwebui.logs');
            checkUpdateKey();
            setIsOpenClearLogsModal(false);
          });
        }}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenClearLogsModal(false)}
      >
        <Alert message={t('dialog.warning.CannotBeUndone')} type="warning" />
      </BAIModal>
      <BAIUnmountAfterClose>
        <TableColumnsSettingModal
          open={visibleColumnSettingModal}
          onRequestClose={(values) => {
            values?.selectedColumnKeys &&
              setHiddenColumnKeys(
                _.difference(
                  columns.map((column) => _.toString(column.key)),
                  values?.selectedColumnKeys,
                ),
              );
            toggleColumnSettingModal();
          }}
          columns={columns}
          hiddenColumnKeys={hiddenColumnKeys}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ErrorLogList;
