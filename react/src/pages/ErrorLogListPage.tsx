import BAIModal from '../components/BAIModal';
import Flex from '../components/Flex';
import TextHighlighter from '../components/TextHighlighter';
import { useUpdatableState } from '../hooks';
import {
  RedoOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Space, Typography, Table, Alert, Checkbox, Input } from 'antd';
import _ from 'lodash';
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type logType = NonNullable<
  {
    isError: boolean;
    message: string;
    requestMethod: string;
    requestParameters?: string;
    requestUrl: string;
    statusCode: number;
    statusText: string;
    timestamp: string;
    type: string;
    title?: string;
  }[]
>;
const ErrorLogListPage: React.FC = () => {
  const { t } = useTranslation();
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [filteredLogData, setFilteredLogData] = useState<logType>([]);
  const [logSearch, setLogSearch] = useState('');
  const [key, checkUpdate] = useUpdatableState('first');

  const storageLogData = useMemo(() => {
    return JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setFilteredLogData(
      _.filter(storageLogData, (log) => {
        return _.map(_.keysIn(log), (key) => {
          if (key === 'timestamp') {
            const date = new Date(log[key]);
            return RegExp(`\\w*${logSearch.toLowerCase()}\\w*`).test(
              date.toLocaleString('en-US', { hour12: false }),
            );
          }
          return RegExp(`\\w*${logSearch.toLowerCase()}\\w*`).test(
            _.toString(log[key]).toLowerCase(),
          );
        }).includes(true);
      }),
    );
  }, [logSearch, storageLogData]);

  const handleOk = () => {
    localStorage.removeItem('backendaiwebui.logs');
    checkUpdate();
    setIsOpenClearLogsModal(false);
  };

  return (
    <>
      <Flex direction="column" align="stretch">
        <Flex justify="between" style={{ padding: 20 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            <Space>
              {t('logs.LogMessages')}
              {t('logs.UpTo3000Logs')}
            </Space>
          </Typography.Title>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={t('logs.SearchLogs')}
              onChange={(e) => setLogSearch(e.target.value)}
            />
            <Checkbox
              onChange={(e) => setCheckedShowOnlyError(e.target.checked)}
            >
              {t('logs.ShowOnlyError')}
            </Checkbox>
            <Button
              type="link"
              icon={<RedoOutlined />}
              onClick={() => checkUpdate()}
            >
              {t('button.Refresh')}
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsOpenClearLogsModal(true);
              }}
            >
              {t('button.ClearLogs')}
            </Button>
          </Space>
        </Flex>
        <Table
          scroll={{ x: 'max-content', y: '40vh' }}
          dataSource={
            checkedShowOnlyError
              ? _.filter(filteredLogData, (log) => {
                  return log.isError;
                })
              : (filteredLogData as logType)
          }
          pagination={{ showSizeChanger: false }}
          columns={[
            {
              title: t('logs.TimeStamp'),
              dataIndex: 'timestamp',
              render: (value, record) => {
                const date = new Date(value);
                return (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {date.toLocaleString('en-US', { hour12: false })}
                    </TextHighlighter>
                  </Typography.Text>
                );
              },
              fixed: 'left',
            },
            {
              title: t('logs.Status'),
              dataIndex: 'statusCode',
              render: (value, record) => {
                return (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value + ' ' + record.statusText}
                    </TextHighlighter>
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.ErrorTitle'),
              dataIndex: 'title',
              onCell: () => {
                return {
                  style: { minWidth: 65 },
                };
              },
              render: (value, record) =>
                _.isUndefined(value) ? (
                  <Flex
                    justify="center"
                    style={{ color: record.isError ? 'red' : undefined }}
                  >
                    -
                  </Flex>
                ) : (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {_.toString(value)}
                      {/* set toString because sometime value is object */}
                    </TextHighlighter>
                  </Typography.Text>
                ),
            },
            {
              title: t('logs.ErrorMessage'),
              dataIndex: 'message',
              onCell: () => {
                return {
                  style: { minWidth: 93 },
                };
              },
              render: (value, record) =>
                value === '' ? (
                  <Flex
                    justify="center"
                    style={{ color: record.isError ? 'red' : undefined }}
                  >
                    -
                  </Flex>
                ) : (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value}
                    </TextHighlighter>
                  </Typography.Text>
                ),
            },
            {
              title: t('logs.ErrorType'),
              dataIndex: 'type',
              onCell: () => {
                return {
                  style: { minWidth: 90 },
                };
              },
              render: (value, record) =>
                value === '' ? (
                  <Flex
                    justify="center"
                    style={{ color: record.isError ? 'red' : undefined }}
                  >
                    -
                  </Flex>
                ) : (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value}
                    </TextHighlighter>
                  </Typography.Text>
                ),
            },
            {
              title: t('logs.Method'),
              dataIndex: 'requestMethod',
              onCell: () => {
                return {
                  style: { minWidth: 90 },
                };
              },
              render: (value, record) => {
                return (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value}
                    </TextHighlighter>
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.RequestUrl'),
              dataIndex: 'requestUrl',
              render: (value, record) => {
                return (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value}
                    </TextHighlighter>
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.Parameters'),
              dataIndex: 'requestParameters',
              width: 400,
              render: (value, record) =>
                _.isUndefined(value) || value === '' ? (
                  <Flex
                    justify="center"
                    style={{ color: record.isError ? 'red' : undefined }}
                  >
                    -
                  </Flex>
                ) : (
                  <Typography.Text type={record.isError ? 'danger' : undefined}>
                    <TextHighlighter keyword={logSearch}>
                      {value}
                    </TextHighlighter>
                  </Typography.Text>
                ),
            },
          ]}
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
    </>
  );
};

export default ErrorLogListPage;
