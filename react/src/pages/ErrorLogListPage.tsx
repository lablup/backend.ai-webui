import BAIModal from '../components/BAIModal';
import Flex from '../components/Flex';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import TextHighlighter from '../components/TextHighlighter';
import { useUpdatableState } from '../hooks';
import {
  RedoOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import {
  Button,
  Typography,
  Table,
  Alert,
  Checkbox,
  Input,
  Row,
  Col,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type logType = NonNullable<{
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
}>;
const ErrorLogListPage: React.FC = () => {
  const { t } = useTranslation();
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [filteredLogData, setFilteredLogData] = useState<logType[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [key, checkUpdate] = useUpdatableState('first');

  const columns: ColumnsType<logType> = [
    {
      title: t('logs.TimeStamp'),
      dataIndex: 'timestamp',
      key: 'timeStamp',
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
      key: 'status',
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
      key: 'errorTitle',
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
      key: 'errorMessage',
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
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          </Typography.Text>
        ),
    },
    {
      title: t('logs.ErrorType'),
      dataIndex: 'type',
      key: 'errorType',
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
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          </Typography.Text>
        ),
    },
    {
      title: t('logs.Method'),
      dataIndex: 'requestMethod',
      key: 'method',
      render: (value, record) => {
        return (
          <Typography.Text type={record.isError ? 'danger' : undefined}>
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          </Typography.Text>
        );
      },
    },
    {
      title: t('logs.RequestUrl'),
      dataIndex: 'requestUrl',
      key: 'requestUrl',
      render: (value, record) => {
        return (
          <Typography.Text type={record.isError ? 'danger' : undefined}>
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          </Typography.Text>
        );
      },
    },
    {
      title: t('logs.Parameters'),
      dataIndex: 'requestParameters',
      key: 'requestParameter',
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
            <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
          </Typography.Text>
        ),
    },
  ];

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.ErrorLogListPage.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  const storageLogData = useMemo(() => {
    return JSON.parse(localStorage.getItem('backendaiwebui.logs') || '[]');
    // Add blow comment because eslint dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setFilteredLogData(
      _.filter(storageLogData, (log) => {
        return _.map(_.keysIn(log), (key) => {
          if (key === 'timestamp') {
            //timestamp need to change LocaleString
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
        <Row
          justify="space-between"
          align="middle"
          gutter={[0, 12]}
          style={{ padding: 20 }}
        >
          <Col>
            <Flex gap="sm">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('logs.LogMessages')}
              </Typography.Title>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('logs.UpTo3000Logs')}
              </Typography.Title>
            </Flex>
          </Col>
          <Col>
            <Row align="middle" gutter={[12, 12]}>
              <Col xs={24} lg={9}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder={t('logs.SearchLogs')}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </Col>
              {/*
              Add checkbox because Table filter has an error by shadowRoot 
              todo: remove below Checkbox and add Table's filter props
            */}
              <Col>
                <Checkbox
                  onChange={(e) => setCheckedShowOnlyError(e.target.checked)}
                >
                  {t('logs.ShowOnlyError')}
                </Checkbox>
              </Col>
              <Col>
                <Button
                  type="link"
                  icon={<RedoOutlined />}
                  onClick={() => checkUpdate()}
                >
                  {t('button.Refresh')}
                </Button>
              </Col>
              <Col>
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
              </Col>
            </Row>
          </Col>
        </Row>
        <Table
          virtual
          pagination={false}
          scroll={{ x: window.innerWidth, y: '50vh' }}
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
        />
      </Flex>
      <Flex justify="end">
        <Button
          type="text"
          size="large"
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
    </>
  );
};

export default ErrorLogListPage;
