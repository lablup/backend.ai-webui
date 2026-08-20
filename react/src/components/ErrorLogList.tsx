/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { theme } from '../theme-shim';
import TextHighlighter from './TextHighlighter';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import {
  BAIFlex,
  BAIModal,
  BAITable,
  type BAIColumnsType,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Trash2, Search, RotateCw } from 'lucide-react';
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
  const [checkedShowOnlyError, setCheckedShowOnlyError] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [updateKey, checkUpdateKey] = useUpdatableState('first');
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();
  const [isPendingSearchTransition, startSearchTransition] = useTransition();
  const [isPendingReset, startResetTransition] = useTransition();

  useSuspendedBackendaiClient(); // TODO: remove this after react routing is stable. This is for remove flickering when browser reload
  const columns: BAIColumnsType<LogType> = [
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

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ErrorLogList',
  );

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
        <Text>{t('logs.UpTo3000Logs')}</Text>
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
          <BAIFlex gap={'xs'}>
            <TextInput
              label={t('logs.SearchLogs')}
              isLabelHidden
              hasClear
              startIcon={Search}
              placeholder={t('logs.SearchLogs')}
              value={logSearch}
              onChange={(value) => {
                startSearchTransition(() => setLogSearch(value));
              }}
              width={200}
            />
            <CheckboxInput
              label={t('logs.ShowOnlyError')}
              value={checkedShowOnlyError}
              onChange={(checked) => setCheckedShowOnlyError(checked)}
            />
          </BAIFlex>
          <BAIFlex gap={'xs'}>
            <Button
              icon={<RotateCw size="1em" />}
              isLoading={isPendingRefreshTransition}
              label={t('button.Refresh')}
              onClick={() => {
                startRefreshTransition(() => checkUpdateKey());
              }}
            />
            <Button
              variant="destructive"
              icon={<Trash2 size="1em" />}
              label={t('button.ClearLogs')}
              onClick={() => {
                setIsOpenClearLogsModal(true);
              }}
            />
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        pagination={{
          showSizeChanger: false,
        }}
        // PILOT-DECISION (ticket 25 §4): the Astryx engine dims the rows while
        // a refetch is in flight but has no spinner slot, so the antd
        // `{ indicator }` object collapses to a boolean.
        loading={isPendingSearchTransition}
        // PILOT-DECISION (ticket 25 §5): `scroll.y` — a fixed body height with
        // a sticky header — is DROPPED. This log list now scrolls with the
        // page instead of inside its own viewport-height box.
        dataSource={
          checkedShowOnlyError
            ? _.filter(filteredLogData, (log) => {
                return log.isError;
              })
            : (filteredLogData as LogType[])
        }
        columns={columns}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        onRow={(record) => {
          return {
            style: { color: record.isError ? token.colorError : '' },
          };
        }}
      />
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
        <Banner status="warning" title={t('dialog.warning.CannotBeUndone')} />
      </BAIModal>
    </BAIFlex>
  );
};

export default ErrorLogList;
