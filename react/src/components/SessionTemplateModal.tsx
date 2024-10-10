import BAIModal, { BAIModalProps } from './BAIModal';
import { Table, Tabs } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionTemplateModalProps extends BAIModalProps {}
const SessionTemplateModal: React.FC<SessionTemplateModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  return (
    <BAIModal title={t('session.launcher.TemplateAndHistory')} {...modalProps}>
      <Tabs
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
              <Table
                columns={[
                  {
                    title: t('session.launcher.SessionName'),
                    dataIndex: 'sessionName',
                  },
                  {
                    title: t('session.launcher.ResourceAllocation'),
                    dataIndex: 'resourceAllocation',
                  },
                  {
                    title: t('general.Image'),
                    dataIndex: 'image',
                  },
                  {
                    title: t('session.launcher.CreatedAt'),
                    dataIndex: 'createdAt',
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </BAIModal>
  );
};

export default SessionTemplateModal;
