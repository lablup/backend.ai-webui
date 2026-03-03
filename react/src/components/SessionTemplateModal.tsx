/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBackendAIImageMetaData } from '../hooks';
import { SessionHistory } from '../hooks/useBAISetting';
import {
  usePinnedSessionHistory,
  useRecentSessionHistory,
} from '../hooks/useRecentSessionHistory';
import {
  ResourceNumbersOfSession,
  SessionLauncherFormValue,
} from '../pages/SessionLauncherPage';
import ImageMetaIcon from './ImageMetaIcon';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Button, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIFlex,
  BAILink,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { PinIcon } from 'lucide-react';
import React, { Key, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyle = createStyles(({ css }) => ({
  fixEditableVerticalAlign: css`
    & {
      margin-top: 0px !important;
    }
  `,
}));

interface SessionTemplateModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  onRequestClose: (formValue?: SessionLauncherFormValue) => void;
}

interface ParsedSessionHistory
  extends SessionLauncherFormValue, SessionHistory {
  pinned?: boolean;
}

const SessionTemplateModal: React.FC<SessionTemplateModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { styles } = useStyle();
  const [sessionHistory, { update: updateSessionHistory }] =
    useRecentSessionHistory();
  const [hoverRowKey, setHoverRowKey] = useState<Key | null>(null);

  const [, { getImageAliasName, getBaseVersion }] = useBackendAIImageMetaData();
  const [pinnedSessionHistory, { pin, unpin, update: updatePinnedHistory }] =
    usePinnedSessionHistory();

  const [, setSelectedHistoryId] = useState<string>();
  const { token } = theme.useToken();

  const parsedSessionHistory: Array<ParsedSessionHistory> = useMemo(() => {
    const parseToFormValues = (history: SessionHistory, isPinned: boolean) => {
      const params = new URLSearchParams(history.params);
      const formValues: SessionLauncherFormValue = JSON.parse(
        params.get('formValues') || '{}',
      );
      return {
        ...formValues,
        pinned: isPinned,
        name: history.name,
      };
    };

    // const params = new URLSearchParams(history.params);
    //   const formValues: SessionLauncherFormValue = JSON.parse(
    //     params.get('formValues') || '{}',
    //   );
    const recent = _.map(sessionHistory, (history) => ({
      ...history,
      ...parseToFormValues(history, false),
    }));

    const pinned = _.map(pinnedSessionHistory, (history) => ({
      ...history,
      ...parseToFormValues(history, true),
    }));

    return _.chain([...pinned, ...recent])
      .unionBy('id')
      .value();
  }, [sessionHistory, pinnedSessionHistory]);

  return (
    <BAIModal
      width={800}
      title={t('session.launcher.RecentHistory')}
      footer={null}
      onCancel={() => {
        // reset
        setSelectedHistoryId(undefined);
        modalProps.onRequestClose();
      }}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Typography.Text>
          {t('session.launcher.YouCanStartWithHistory')}
        </Typography.Text>
        <BAITable<ParsedSessionHistory>
          rowSelection={{
            selectedRowKeys: pinnedSessionHistory?.map((item) => item.id),
            columnWidth: 0,
            hideSelectAll: true,
            renderCell: () => null,
          }}
          scroll={{ x: 'max-content' }}
          dataSource={parsedSessionHistory}
          pagination={false}
          onRow={(record) => ({
            onMouseEnter: () => setHoverRowKey(record.id),
            onMouseLeave: () => setHoverRowKey(null),
          })}
          rowKey={(record) => record.id}
          columns={[
            {
              title: (
                <BAIFlex gap={'xxs'}>
                  <PinIcon />
                  <QuestionIconWithTooltip
                    title={t('session.launcher.PinnedHistoryTooltip')}
                  />
                </BAIFlex>
              ),
              dataIndex: 'pinned',
              width: 40,
              render: (_value, record) => {
                const isPinned = !!record.pinned;
                const isHovered = hoverRowKey === record.id;
                return isPinned ? (
                  <Button
                    size="small"
                    onClick={() => {
                      unpin(record.id);
                      // TODO: add it to recent session history
                    }}
                    type="link"
                  >
                    <PinIcon />
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={() => pin(record.id)}
                    type="link"
                  >
                    <PinIcon
                      style={{
                        color: isHovered
                          ? token.colorTextQuaternary
                          : 'transparent',
                      }}
                    />
                  </Button>
                );
              },
            },
            {
              title: t('session.launcher.SessionNameShort'),
              dataIndex: 'name',
              render: (name, record) => {
                const displayName = name || record.id.split('-')[0];
                return (
                  <Typography.Text
                    className={styles.fixEditableVerticalAlign}
                    editable={{
                      onChange(value) {
                        if (!_.isEmpty(value)) {
                          updateSessionHistory(record.id, value);
                          record.pinned &&
                            updatePinnedHistory(record.id, value);
                        }
                      },
                      text: displayName,
                    }}
                  >
                    <BAILink
                      type="hover"
                      onClick={() => {
                        modalProps.onRequestClose?.(
                          JSON.parse(
                            new URLSearchParams(record.params || '').get(
                              'formValues',
                            ) || '{}',
                          ),
                        );
                      }}
                    >
                      {displayName}
                    </BAILink>
                  </Typography.Text>
                );
              },
            },
            {
              title: t('session.launcher.Environments'),
              dataIndex: ['environments', 'version'],
              render: (_version, record) => {
                const imageStr =
                  record.environments?.version || record.environments?.manual;
                return (
                  imageStr && (
                    <Tooltip title={imageStr} placement="right">
                      <BAIFlex gap={'xxs'}>
                        <ImageMetaIcon image={imageStr} />
                        <Typography.Text>
                          {getImageAliasName(imageStr)}{' '}
                          {getBaseVersion(imageStr)}
                        </Typography.Text>
                      </BAIFlex>
                    </Tooltip>
                  )
                );
              },
              onCell: () => ({
                style: { maxWidth: 250, textOverflow: 'ellipsis' },
              }),
            },
            {
              title: t('session.launcher.ResourceAllocation'),
              dataIndex: 'resource',
              render: (resource) => {
                // return JSON.stringify(resource)
                return (
                  <BAIFlex gap={'xs'}>
                    <ResourceNumbersOfSession resource={resource} />
                  </BAIFlex>
                );
              },
            },
            // {
            //   dataIndex: 'mounts',
            //   render: (value, record) => {
            //     return _.join(record.mounts,', ');
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
      </BAIFlex>
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
