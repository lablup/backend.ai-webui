/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionTemplate,
  useSessionTemplates,
} from '../hooks/useSessionTemplates';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BYTES_PER_GIB = 1024 ** 3;

const bytesToGiB = (bytes: string | undefined): string | null => {
  'use memo';
  if (!bytes) return null;
  const num = parseFloat(bytes);
  if (isNaN(num)) return null;
  return (num / BYTES_PER_GIB).toFixed(1);
};

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
  const { modal } = App.useApp();

  const { sessionTemplates, isLoading, refresh, deleteTemplate, isDeleting } =
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

        const tags: React.ReactNode[] = [];

        if (resources.cpu) {
          tags.push(
            <Tag key="cpu" color="orange">
              CPU: {resources.cpu}
            </Tag>,
          );
        }

        const memGiB = bytesToGiB(resources.mem);
        if (memGiB) {
          tags.push(
            <Tag key="mem" color="purple">
              MEM: {memGiB} GiB
            </Tag>,
          );
        }

        if (resources['cuda.device']) {
          tags.push(
            <Tag key="gpu" color="volcano">
              GPU: {resources['cuda.device']}
            </Tag>,
          );
        }

        if (resources['cuda.shares']) {
          tags.push(
            <Tag key="fgpu" color="magenta">
              fGPU: {resources['cuda.shares']}
            </Tag>,
          );
        }

        return tags.length > 0 ? (
          <BAIFlex gap="xxs" wrap="wrap">
            {tags}
          </BAIFlex>
        ) : (
          '-'
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
              <Button
                type="text"
                icon={<EditOutlined style={{ color: token.colorInfo }} />}
                onClick={() => {
                  onEdit?.(record);
                }}
              />
            </Tooltip>
            <Tooltip title={t('button.Delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
                onClick={() => {
                  modal.confirm({
                    title: t('dialog.ask.DoYouWantToDeleteSomething', {
                      name: record.name ?? record.id,
                    }),
                    content: t('dialog.warning.CannotBeUndone'),
                    okText: t('button.Delete'),
                    okButtonProps: {
                      danger: true,
                      type: 'primary',
                    },
                    onOk: () => deleteTemplate(record.id),
                  });
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            onCreate?.();
          }}
        >
          {t('button.Create')}
        </Button>
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
    </BAIFlex>
  );
};

export default SessionTemplateList;
