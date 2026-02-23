/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAITabs from './BAITabs';
import ImportNotebookForm from './ImportNotebookForm';
import ImportRepoForm from './ImportRepoForm';
import { GithubOutlined, GitlabOutlined } from '@ant-design/icons';
import {
  BAIFlex,
  BAIJupyterIcon,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StartFromURLModalProps extends Omit<BAIModalProps, 'children'> {
  initialTab?: 'notebook' | 'github' | 'gitlab';
  initialData?: {
    url?: string;
    branch?: string;
  };
}

const StartFromURLModal: React.FC<StartFromURLModalProps> = ({
  initialTab,
  initialData,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAIModal
      title={t('start.StartFromURL')}
      width={800}
      footer={null}
      {...modalProps}
    >
      <BAITabs
        defaultActiveKey={initialTab}
        items={[
          {
            key: 'notebook',
            children: <ImportNotebookForm initialUrl={initialData?.url} />,
            label: (
              <BAIFlex gap={'xs'}>
                <BAIJupyterIcon /> {t('import.ImportNotebook')}
              </BAIFlex>
            ),
          },
          {
            key: 'github',
            children: (
              <ImportRepoForm
                urlType="github"
                initialUrl={initialData?.url}
                initialBranch={initialData?.branch}
              />
            ),
            label: (
              <BAIFlex gap="xs">
                <GithubOutlined style={{ display: 'inline' }} />
                {t('import.ImportGithubRepo')}
              </BAIFlex>
            ),
          },
          {
            key: 'gitlab',
            children: (
              <ImportRepoForm
                urlType="gitlab"
                initialUrl={initialData?.url}
                initialBranch={initialData?.branch}
              />
            ),
            label: (
              <BAIFlex gap="xs">
                <GitlabOutlined style={{ display: 'inline' }} />
                {t('import.ImportGitlabRepo')}
              </BAIFlex>
            ),
          },
        ]}
      ></BAITabs>
    </BAIModal>
  );
};

export default StartFromURLModal;
