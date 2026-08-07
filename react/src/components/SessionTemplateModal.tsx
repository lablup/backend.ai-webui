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
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIQuestionIconWithTooltip,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIFlex,
  BAILink,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PencilIcon, PinIcon } from 'lucide-react';
import React, { Key, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [sessionHistory, { update: updateSessionHistory }] =
    useRecentSessionHistory();
  const [hoverRowKey, setHoverRowKey] = useState<Key | null>(null);

  const [, { getImageAliasName, getBaseVersion }] = useBackendAIImageMetaData();
  const [pinnedSessionHistory, { pin, unpin, update: updatePinnedHistory }] =
    usePinnedSessionHistory();

  const [, setSelectedHistoryId] = useState<string>();
  // Inline rename editor state (replaces antd `Typography.Text editable`).
  const [editingRow, setEditingRow] = useState<{
    id: string;
    value: string;
  } | null>(null);

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

    return _.unionBy([...pinned, ...recent], 'id');
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
        <Text>{t('session.launcher.YouCanStartWithHistory')}</Text>
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
                  <BAIQuestionIconWithTooltip
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
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<PinIcon />}
                    label={t('session.launcher.PinnedHistoryTooltip')}
                    onClick={() => {
                      unpin(record.id);
                      // TODO: add it to recent session history
                    }}
                  />
                ) : (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={
                      <PinIcon
                        style={{
                          color: isHovered
                            ? 'var(--color-text-disabled)'
                            : 'transparent',
                        }}
                      />
                    }
                    label={t('session.launcher.PinnedHistoryTooltip')}
                    onClick={() => pin(record.id)}
                  />
                );
              },
            },
            {
              title: t('session.launcher.SessionNameShort'),
              dataIndex: 'name',
              render: (name, record) => {
                const displayName = name || record.id.split('-')[0];
                const isMultiNode =
                  record.cluster_mode === 'multi-node' &&
                  Number.isFinite(record.cluster_size) &&
                  record.cluster_size > 1;
                const commitRename = (value: string) => {
                  if (!_.isEmpty(value)) {
                    updateSessionHistory(record.id, value);
                    record.pinned && updatePinnedHistory(record.id, value);
                  }
                  setEditingRow(null);
                };
                // PILOT-DECISION: antd `Typography.Text editable` (inline
                // pencil rename) rebuilt with Astryx TextInput + ghost
                // IconButton — antd Typography's editable behaviour has no
                // Astryx destination (MAPPING.md §3.4).
                return editingRow?.id === record.id ? (
                  <TextInput
                    label={t('data.folders.Rename')}
                    isLabelHidden
                    value={editingRow.value}
                    onChange={(value) =>
                      setEditingRow({ id: record.id, value })
                    }
                    onEnter={() => commitRename(editingRow.value)}
                    onBlur={() => commitRename(editingRow.value)}
                  />
                ) : (
                  <BAIFlex align="center" gap="xs">
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
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={<PencilIcon />}
                      label={t('data.folders.Rename')}
                      tooltip={t('data.folders.Rename')}
                      onClick={() =>
                        setEditingRow({ id: record.id, value: displayName })
                      }
                    />
                    {isMultiNode && (
                      <Badge
                        label={`${t('session.launcher.MultiNode')} ×${record.cluster_size}`}
                      />
                    )}
                  </BAIFlex>
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
                    <Tooltip content={imageStr} placement="end">
                      <BAIFlex gap={'xxs'}>
                        <ImageMetaIcon image={imageStr} />
                        <Text>
                          {getImageAliasName(imageStr)}{' '}
                          {getBaseVersion(imageStr)}
                        </Text>
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
