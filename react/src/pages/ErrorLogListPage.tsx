import BAIModal from '../components/BAIModal';
import Flex from '../components/Flex';
import { RedoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, Space, Typography, Table, Alert } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type logType = NonNullable<
  {
    isError: boolean;
    message: string;
    requestMethod: string;
    requestParameters: string;
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
  const [logs, setLogs] = useLocalStorageState<logType>('backendaiwebui.logs', {
    defaultValue: [],
  });
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);

  const onClickRefreshLogs = () => {
    setLogs(JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]'));
  };

  const handleOk = () => {
    setLogs([]);
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
            <Button
              type="link"
              icon={<RedoOutlined />}
              onClick={onClickRefreshLogs}
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
          dataSource={logs as logType}
          pagination={{ showSizeChanger: false }}
          columns={[
            {
              title: t('logs.TimeStamp'),
              dataIndex: 'timestamp',
              render: (value, record) => {
                const date = new Date(value);
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {date.toLocaleString('en-US', { hour12: false })}
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
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value + ' ' + record.statusText}
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
              render: (value, record) => {
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.ErrorMessage'),
              dataIndex: 'message',
              onCell: () => {
                return {
                  style: { minWidth: 93 },
                };
              },
              render: (value, record) => {
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.ErrorType'),
              dataIndex: 'type',
              onCell: () => {
                return {
                  style: { minWidth: 90 },
                };
              },
              render: (value, record) => {
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
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
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.RequestUrl'),
              dataIndex: 'requestUrl',
              render: (value, record) => {
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
            },
            {
              title: t('logs.Parameters'),
              dataIndex: 'requestParameters',
              width: 400,
              render: (value, record) => {
                return (
                  <Typography.Text color={record.isError ? 'red' : ''}>
                    {value}
                  </Typography.Text>
                );
              },
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
