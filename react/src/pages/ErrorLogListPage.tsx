import Flex from '../components/Flex';
import { RedoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, Space, Typography, Table } from 'antd';
import React from 'react';
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
  const [logs] = useLocalStorageState<logType>('backendaiwebui.logs', {
    defaultValue: [],
  });

  return (
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
          <Button type="primary" icon={<DeleteOutlined />}>
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
            render: (value) => {
              const date = new Date(value);
              return date.toLocaleString('en-US', { hour12: false });
            },
            fixed: 'left',
          },
          {
            title: t('logs.Status'),
            dataIndex: 'statusCode',
            render: (value, record) => {
              return value + ' ' + record.statusText;
            },
          },
          {
            title: t('logs.ErrorTitle'),
            dataIndex: 'title',
          },
          {
            title: t('logs.ErrorMessage'),
            dataIndex: 'message',
          },
          {
            title: t('logs.ErrorType'),
            dataIndex: 'type',
          },
          {
            title: t('logs.Method'),
            dataIndex: 'requestMethod',
          },
          {
            title: t('logs.RequestUrl'),
            dataIndex: 'requestUrl',
            render: (value) => {
              return (
                <div style={{ width: 150 }}>
                  <Typography.Text
                    ellipsis={{
                      tooltip: { overlayInnerStyle: { width: 'max-content' } },
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
            render: (value) => {
              return <div style={{ width: 400 }}>{value}</div>;
            },
          },
        ]}
      />
    </Flex>
  );
};

export default ErrorLogListPage;
