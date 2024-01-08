import BAIModal from '../components/BAIModal';
import Flex from '../components/Flex';
import { RedoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRafInterval } from 'ahooks';
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
  const [logs, setLogs] = useState<logType>(
    JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]'),
  );
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);

  useRafInterval(() => {
    setLogs(JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]'));
  }, 5000);

  const handleOk = () => {
    localStorage.removeItem('backendaiwebui.logs');
    setLogs(JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]'));
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
            <Button type="link" icon={<RedoOutlined />}>
              {t('button.Refresh')}
            </Button>
            <Button
              type="primary"
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
          scroll={{ x: 'max-content' }}
          dataSource={logs as logType}
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
                  <div style={{ width: 150 }}>
                    <Typography.Text
                      color={record.isError ? 'red' : ''}
                      ellipsis={{
                        tooltip: {
                          overlayInnerStyle: { width: 'max-content' },
                        },
                      }}
                    >
                      {value}
                    </Typography.Text>
                  </div>
                );
              },
            },
            {
              title: t('logs.Parameters'),
              dataIndex: 'requestParameters',
              render: (value, record) => {
                return (
                  <div style={{ width: 400 }}>
                    <Typography.Text color={record.isError ? 'red' : ''}>
                      {value}
                    </Typography.Text>
                  </div>
                );
              },
            },
          ]}
        />
      </Flex>
      <BAIModal
        open={isOpenClearLogsModal}
        title={t('dialog.warning.LogDeletion')}
        okText={t('button.Yes')}
        okButtonProps={{ danger: true }}
        onOk={handleOk}
        cancelText={t('button.No')}
        onCancel={() => setIsOpenClearLogsModal(false)}
      >
        <Alert message={t('dialog.warning.CannotBeUndone')} type="warning" />
      </BAIModal>
    </>
  );
};

export default ErrorLogListPage;
