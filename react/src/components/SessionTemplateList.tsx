/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionTemplate,
  useSessionTemplates,
} from '../hooks/useSessionTemplates';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BAIButton,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionTemplateListProps {
  onEdit?: (template: SessionTemplate) => void;
  onCreate?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SessionTemplateList: React.FC<SessionTemplateListProps> = ({
  onEdit,
  onCreate,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [deletingTemplate, setDeletingTemplate] =
    useState<SessionTemplate | null>(null);

  const { sessionTemplates, isLoading, refresh, deleteTemplate } =
    useSessionTemplates(true);

  const columns: ColumnsType<SessionTemplate> = [
    {
      key: 'name',
      title: t('sessionTemplate.Name'),
      dataIndex: 'name',
      render: (value: string | null) => value ?? '-',
    },
    {
      key: 'image',
      title: t('sessionTemplate.Image'),
      render: (_value, record) => {
        const image = record.template?.spec?.kernel?.image;
        return image ? (
          <span style={{ fontFamily: 'monospace', fontSize: token.fontSizeSM }}>
            {image}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'session_type',
      title: t('sessionTemplate.SessionType'),
      render: (_value, record) => {
        const sessionType = record.template?.spec?.session_type;
        if (!sessionType) return '-';
        return (
          <Tag color={sessionType === 'interactive' ? 'blue' : 'green'}>
            {sessionType}
          </Tag>
        );
      },
    },
    {
      key: 'resources',
      title: t('sessionTemplate.Resources'),
      render: (_value, record) => {
        const resources = record.template?.spec?.resources;
        if (!resources) return '-';

        const acceleratorType = resources['cuda.shares']
          ? 'cuda.shares'
          : resources['cuda.device']
            ? 'cuda.device'
            : undefined;
        const acceleratorValue = acceleratorType
          ? Number(resources[acceleratorType])
          : undefined;

        return (
          <BAIFlex gap="xxs" wrap="wrap">
            <ResourceNumbersOfSession
              resource={{
                cpu: Number(resources.cpu ?? 0),
                mem: resources.mem ?? '0',
                ...(acceleratorType && acceleratorValue
                  ? {
                      acceleratorType,
                      accelerator: acceleratorValue,
                    }
                  : {}),
              }}
            />
          </BAIFlex>
        );
      },
    },
    {
      key: 'domain_name',
      title: t('sessionTemplate.Domain'),
      dataIndex: 'domain_name',
      render: (value: string) => value ?? '-',
    },
    {
      key: 'group_name',
      title: t('sessionTemplate.Project'),
      dataIndex: 'group_name',
      render: (value: string | null) => value ?? '-',
    },
    {
      key: 'user_email',
      title: t('sessionTemplate.OwnerEmail'),
      dataIndex: 'user_email',
      render: (value: string | null) => value ?? '-',
    },
    {
      key: 'created_at',
      title: t('sessionTemplate.CreatedAt'),
      dataIndex: 'created_at',
      render: (value: string) => (value ? dayjs(value).format('ll LT') : '-'),
      sorter: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
    },
    {
      key: 'controls',
      title: t('general.Control'),
      fixed: 'right',
      render: (_value, record) => {
        return (
          <BAIFlex>
            <Tooltip title={t('button.Edit')}>
              <BAIButton
                type="text"
                icon={<EditOutlined style={{ color: token.colorInfo }} />}
                onClick={() => {
                  onEdit?.(record);
                }}
              />
            </Tooltip>
            <Tooltip title={t('button.Delete')}>
              <BAIButton
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDeletingTemplate(record);
                }}
              />
            </Tooltip>
          </BAIFlex>
        );
      },
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="end" gap="xs">
        <BAIFetchKeyButton
          value="fetchKey"
          loading={isLoading}
          onChange={() => {
            refresh();
          }}
        />
        <BAIButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            onCreate?.();
          }}
        >
          {t('button.Create')}
        </BAIButton>
      </BAIFlex>

      <BAITable
        rowKey="id"
        resizable
        size="small"
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={filterOutNullAndUndefined(sessionTemplates)}
        loading={isLoading}
      />

      <BAIConfirmModalWithInput
        open={!!deletingTemplate}
        title={t('dialog.ask.DoYouWantToDeleteSomething', {
          name: deletingTemplate?.name ?? deletingTemplate?.id ?? '',
        })}
        content={t('dialog.warning.CannotBeUndone')}
        confirmText={deletingTemplate?.name ?? deletingTemplate?.id ?? ''}
        okText={t('button.Delete')}
        onOk={async () => {
          if (!deletingTemplate) return;
          try {
            await deleteTemplate(deletingTemplate.id);
          } finally {
            setDeletingTemplate(null);
          }
        }}
        onCancel={() => setDeletingTemplate(null)}
      />
    </BAIFlex>
  );
};

export default SessionTemplateList;
