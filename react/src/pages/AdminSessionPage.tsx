/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Skeleton } from 'antd';
import { BAICard, BAIUnmountAfterClose, filterOutEmpty } from 'backend.ai-ui';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import PendingSessionNodeList from 'src/components/PendingSessionNodeList';
import SessionDetailAndContainerLogOpenerLegacy from 'src/components/SessionDetailAndContainerLogOpenerLegacy';
import SessionTemplateList from 'src/components/SessionTemplateList';
import SessionTemplateSettingModal from 'src/components/SessionTemplateSettingModal';
import { useWebUINavigate } from 'src/hooks';
import { SessionTemplate } from 'src/hooks/useSessionTemplates';

const AdminSessionPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const [queryParam, setQueryParam] = useQueryStates(
    {
      tab: parseAsString.withDefault('pending-sessions'),
    },
    { history: 'push' },
  );
  const webUINavigate = useWebUINavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<SessionTemplate | null>(null);

  return (
    <BAICard
      activeTabKey={queryParam.tab}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/admin-session',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          },
          {
            params: {
              tab: key,
            },
          },
        );
        setQueryParam({ tab: key });
      }}
      tabList={filterOutEmpty([
        {
          key: 'pending-sessions',
          label: t('adminSession.PendingSessions'),
        },
        {
          key: 'session-templates',
          label: t('sessionTemplate.SessionTemplates'),
        },
      ])}
    >
      <Suspense fallback={<Skeleton active />}>
        {queryParam.tab === 'pending-sessions' && (
          <BAIErrorBoundary>
            <PendingSessionNodeList />
            <SessionDetailAndContainerLogOpenerLegacy />
          </BAIErrorBoundary>
        )}
        {queryParam.tab === 'session-templates' && (
          <BAIErrorBoundary>
            <SessionTemplateList
              onCreate={() => {
                setEditingTemplate(null);
                setModalOpen(true);
              }}
              onEdit={(template) => {
                setEditingTemplate(template);
                setModalOpen(true);
              }}
            />
            <BAIUnmountAfterClose>
              <SessionTemplateSettingModal
                open={modalOpen}
                editingTemplate={editingTemplate}
                onRequestClose={() => {
                  setModalOpen(false);
                  setEditingTemplate(null);
                }}
              />
            </BAIUnmountAfterClose>
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminSessionPage;
