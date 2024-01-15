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
  theme,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import React, { useState, useMemo, useEffect, useTransition } from 'react';
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
}>;
const ErrorLogList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isOpenClearLogsModal, setIsOpenClearLogsModal] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [filteredLogData, setFilteredLogData] = useState<logType[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [key, checkUpdate] = useUpdatableState('first');
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();

  const columns: ColumnsType<logType> = [
    {
      title: t('logs.TimeStamp'),
      dataIndex: 'timestamp',
      key: 'timeStamp',
      render: (value) => {
        const date = new Date(value);
        return _.isUndefined(value) || value === '' ? (
          <div>-</div>
        ) : (
          <TextHighlighter keyword={logSearch}>
            {date.toLocaleString('en-US', { hour12: false })}
          </TextHighlighter>
        );
      },
      fixed: 'left',
    },
    {
      title: t('logs.Status'),
      dataIndex: 'statusCode',
      key: 'status',
      render: (value, record) =>
        _.isUndefined(value) || value === '' ? (
          <div>-</div>
        ) : (
          <TextHighlighter keyword={logSearch}>
            {value + ' ' + record.statusText}
          </TextHighlighter>
        ),
    },
    {
      title: t('logs.ErrorTitle'),
      dataIndex: 'title',
      key: 'errorTitle',
      render: (value) => (
        <div style={{ minWidth: 50 }}>
          {_.isEmpty(value) ? (
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
          {_.isEmpty(value) ? (
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
          {_.isEmpty(value) ? (
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
          {_.isEmpty(value) ? (
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
      render: (value) =>
        value === '' ? (
          <div>-</div>
        ) : (
          <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
        ),
    },
    {
      title: t('logs.Parameters'),
      dataIndex: 'requestParameters',
      key: 'requestParameter',
      width: 400,
      render: (value) =>
        _.isUndefined(value) || value === '' ? (
          <div>-</div>
        ) : (
          <TextHighlighter keyword={logSearch}>{value}</TextHighlighter>
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
          style={{ padding: token.paddingMD }}
        >
          <Col>
            <Flex direction="column" align="start">
              <Typography.Title level={4} style={{ margin: 0, padding: 0 }}>
                {t('logs.LogMessages')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('logs.UpTo3000Logs')}
              </Typography.Text>
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
                  icon={<RedoOutlined />}
                  loading={isPendingRefreshTransition}
                  onClick={() => {
                    startRefreshTransition(() => checkUpdate());
                  }}
                >
                  {t('button.Refresh')}
                </Button>
              </Col>
              <Col>
                <Button
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
          pagination={{ showSizeChanger: false }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 430px)' }}
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
      </Flex>
      <Flex
        justify="end"
        style={{
          paddingRight: token.paddingXS,
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
    </>
  );
};

export default ErrorLogList;
