import { useBackendAIImageMetaData } from '../hooks';
import { useRecentSessionHistory } from '../hooks/backendai';
import {
  ResourceNumbersOfSession,
  SessionLauncherFormValue,
} from '../pages/SessionLauncherPage';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import { Divider, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionTemplateModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
  onRequestClose: (formValue?: SessionLauncherFormValue) => void;
}
const SessionTemplateModal: React.FC<SessionTemplateModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const [sessionHistory] = useRecentSessionHistory();

  const [, { getImageAliasName, getBaseVersion }] = useBackendAIImageMetaData();

  const [selectedHistoryId, setSelectedHistoryId] = useState<string>();

  const parsedSessionHistory = useMemo(() => {
    return _.map(sessionHistory, (history) => {
      const params = new URLSearchParams(history.params);
      const formValues: SessionLauncherFormValue = JSON.parse(
        params.get('formValues') || '{}',
      );
      return {
        ...history,
        ...formValues,
        // resourceAllocation: `${history.cpu}CPU ${history.memory}GB`,
      };
    });
  }, [sessionHistory]);

  return (
    <BAIModal
      width={800}
      title={t('session.launcher.RecentHistory')}
      okButtonProps={{ disabled: !selectedHistoryId }}
      okText={t('button.Apply')}
      {...modalProps}
      onOk={(e) => {
        const params = _.find(sessionHistory, {
          id: selectedHistoryId,
        })?.params;
        modalProps.onRequestClose?.(
          JSON.parse(new URLSearchParams(params).get('formValues') || '{}'),
        );
      }}
      onCancel={() => {
        // reset
        setSelectedHistoryId(undefined);
        modalProps.onRequestClose();
      }}
    >
      <Divider style={{ margin: 0 }} />
      <Table
        showHeader={false}
        scroll={{ x: 'max-content' }}
        dataSource={parsedSessionHistory}
        pagination={false}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedHistoryId ? [selectedHistoryId] : [],
          onSelect: (record) => {
            setSelectedHistoryId(record.id);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedHistoryId(record.id);
          },
        })}
        rowKey={(record) => record.id}
        columns={[
          // {
          //   title: t('session.launcher.SessionName'),
          //   dataIndex: 'sessionName',
          //   render: (sessionName, record) => {
          //     return sessionName ?? '-';
          //   },
          // },
          {
            title: t('general.Image'),
            dataIndex: ['environments', 'version'],
            render: (version, record) => {
              const imageStr =
                record.environments.version || record.environments.manual;
              return (
                !!imageStr && (
                  <Flex gap={'xs'}>
                    <ImageMetaIcon image={imageStr} />
                    <Typography.Text>
                      {getImageAliasName(imageStr)}
                    </Typography.Text>
                    <Typography.Text>
                      {getBaseVersion(imageStr)}
                    </Typography.Text>
                    <Typography.Text>
                      {record.sessionName ? `(${record.sessionName})` : null}
                    </Typography.Text>
                  </Flex>
                )
              );
            },
            // onCell: () => ({
            //   style: { maxWidth: 250, textOverflow: 'ellipsis' },
            // }),
          },
          {
            title: t('session.launcher.ResourceAllocation'),
            dataIndex: 'resource',
            render: (resource) => {
              // return JSON.stringify(resource)
              return (
                <Flex>
                  <ResourceNumbersOfSession resource={resource} />
                </Flex>
              );
            },
          },
          // {
          //   dataIndex: 'mounts',
          //   render: (value, record) => {
          //     record.mou
          //   }
          // },
          {
            title: t('session.launcher.CreatedAt'),
            dataIndex: 'createdAt',
            render: (createdAt: string) => {
              return dayjs(createdAt).fromNow();
            },
          },
        ]}
      />
      {/* <Tabs
        defaultActiveKey="history"
        items={[
          {
            key: 'template',
            label: t('session.launcher.Template'),
            children: <div>Template</div>,
          },
          {
            key: 'history',
            label: t('session.launcher.RecentHistory'),
            children: (
              
            ),
          },
        ]}
      /> */}
    </BAIModal>
  );
};

export default SessionTemplateModal;
