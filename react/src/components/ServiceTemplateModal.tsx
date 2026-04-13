/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBackendAIImageMetaData } from '../hooks';
import { ServiceHistory, useBAISettingUserState } from '../hooks/useBAISetting';
import {
  usePinnedServiceHistory,
  useRecentServiceHistory,
} from '../hooks/useRecentServiceHistory';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import ImageMetaIcon from './ImageMetaIcon';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { ServiceLauncherFormValue } from './ServiceLauncherPageContent';
import { Button, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIColumnsType,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIFlex,
  BAILink,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
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

interface ServiceTemplateModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  onRequestClose: (formValue?: ServiceLauncherFormValue) => void;
}

interface ParsedServiceHistory
  extends ServiceLauncherFormValue, ServiceHistory {
  pinned?: boolean;
}

const ServiceTemplateModal: React.FC<ServiceTemplateModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { styles } = useStyle();
  const [serviceHistory, { update: updateServiceHistory }] =
    useRecentServiceHistory();
  const [hoverRowKey, setHoverRowKey] = useState<Key | null>(null);

  const [, { getImageAliasName, getBaseVersion }] = useBackendAIImageMetaData();
  const [pinnedServiceHistory, { pin, unpin, update: updatePinnedHistory }] =
    usePinnedServiceHistory();

  const [, setSelectedHistoryId] = useState<string>();
  const { token } = theme.useToken();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ServiceTemplateModal',
  );

  const parsedServiceHistory: Array<ParsedServiceHistory> = useMemo(() => {
    const parseToFormValues = (history: ServiceHistory, isPinned: boolean) => {
      const params = new URLSearchParams(history.params);
      const formValues: ServiceLauncherFormValue = JSON.parse(
        params.get('formValues') || '{}',
      );
      return {
        ...formValues,
        pinned: isPinned,
        name: history.name,
      };
    };

    const recent = _.map(serviceHistory, (history) => ({
      ...history,
      ...parseToFormValues(history, false),
    }));

    const pinned = _.map(pinnedServiceHistory, (history) => ({
      ...history,
      ...parseToFormValues(history, true),
    }));

    return _.unionBy([...pinned, ...recent], 'id');
  }, [serviceHistory, pinnedServiceHistory]);

  return (
    <BAIModal
      width={800}
      title={t('modelService.RecentHistory')}
      footer={null}
      onCancel={() => {
        setSelectedHistoryId(undefined);
        modalProps.onRequestClose();
      }}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Typography.Text>
          {t('modelService.YouCanStartWithHistory')}
        </Typography.Text>
        <BAITable<ParsedServiceHistory>
          rowSelection={{
            selectedRowKeys: pinnedServiceHistory?.map((item) => item.id),
            columnWidth: 0,
            hideSelectAll: true,
            renderCell: () => null,
          }}
          scroll={{ x: 'max-content' }}
          dataSource={parsedServiceHistory}
          pagination={false}
          onRow={(record) => ({
            onMouseEnter: () => setHoverRowKey(record.id),
            onMouseLeave: () => setHoverRowKey(null),
          })}
          rowKey={(record) => record.id}
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          columns={
            [
              {
                key: 'pinned',
                required: true,
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
                key: 'serviceName',
                required: true,
                title: t('modelService.ServiceName'),
                dataIndex: 'serviceName',
                render: (serviceName, record) => {
                  const displayName =
                    record.name || serviceName || record.id.split('-')[0];
                  return (
                    <BAIFlex align="center" gap="xs">
                      <Typography.Text
                        className={styles.fixEditableVerticalAlign}
                        editable={{
                          onChange(value) {
                            if (!_.isEmpty(value)) {
                              updateServiceHistory(record.id, value);
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
                            const formValues = JSON.parse(
                              new URLSearchParams(record.params || '').get(
                                'formValues',
                              ) || '{}',
                            );
                            modalProps.onRequestClose?.({
                              ...formValues,
                              serviceName: displayName,
                            });
                          }}
                        >
                          {displayName}
                        </BAILink>
                      </Typography.Text>
                    </BAIFlex>
                  );
                },
              },
              {
                key: 'environments',
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
                key: 'resource',
                title: t('session.launcher.ResourceAllocation'),
                dataIndex: 'resource',
                render: (resource) => {
                  return (
                    resource && (
                      <BAIFlex gap={'xs'}>
                        <ResourceNumbersOfSession resource={resource} />
                      </BAIFlex>
                    )
                  );
                },
              },
              {
                key: 'replicas',
                title: t('modelService.NumberOfReplicas'),
                dataIndex: 'replicas',
                render: (replicas) =>
                  replicas !== undefined ? replicas : null,
              },
              {
                key: 'resourceGroup',
                title: t('session.ResourceGroup'),
                dataIndex: 'resourceGroup',
                defaultHidden: true,
              },
              {
                key: 'allocationPreset',
                title: t('resourcePreset.ResourcePreset'),
                dataIndex: 'allocationPreset',
                defaultHidden: true,
              },
              {
                key: 'cluster_mode',
                title: t('session.launcher.ClusterMode'),
                dataIndex: 'cluster_mode',
                defaultHidden: true,
              },
              {
                key: 'runtimeVariant',
                title: t('modelService.RuntimeVariant'),
                dataIndex: 'runtimeVariant',
                defaultHidden: true,
              },
              {
                key: 'vFolderName',
                title: t('session.launcher.ModelStorageToMount'),
                dataIndex: 'vFolderName',
                defaultHidden: true,
                render: (vFolderName: string | undefined, record) => {
                  const display = vFolderName || record.vFolderID;
                  return (
                    display && (
                      <Typography.Text
                        ellipsis={{ tooltip: display }}
                        style={{ maxWidth: 200 }}
                      >
                        {display}
                      </Typography.Text>
                    )
                  );
                },
              },
              {
                key: 'createdAt',
                title: t('session.launcher.CreatedAt'),
                dataIndex: 'createdAt',
                render: (createdAt: string) => {
                  return dayjs(createdAt).fromNow();
                },
              },
            ] satisfies BAIColumnsType<ParsedServiceHistory>
          }
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default ServiceTemplateModal;
