/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import BAITabs from './BAITabs';
import ImportHuggingFaceModelForm from './ImportHuggingFaceModelForm';
import ImportNotebookForm from './ImportNotebookForm';
import ImportRepoForm from './ImportRepoForm';
import {
  BAIGitHubIcon,
  BAIGitLabIcon,
  BAIFlex,
  BAIHuggingFaceIcon,
  BAIJupyterIcon,
  BAIModal,
  BAIModalProps,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StartFromURLModalProps extends Omit<BAIModalProps, 'children'> {
  initialTab?: 'notebook' | 'github' | 'gitlab' | 'huggingface';
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
  const baiClient = useSuspendedBackendaiClient();
  const [experimentalImportFromHuggingFace] = useBAISettingUserState(
    'experimental_import_from_huggingface',
  );
  // The Hugging Face import targets model folders, which are only meaningful
  // when the deployments (model serving) feature is available. Follow the
  // same menu-key gating the Start page uses for its deployment card.
  const blockList = baiClient?._config?.blockList ?? [];
  const inactiveList = baiClient?._config?.inactiveList ?? [];
  const isDeploymentsEnabled = ![...blockList, ...inactiveList].includes(
    'deployments',
  );

  return (
    <BAIModal
      title={t('start.StartFromURL')}
      // The four import tabs lay out on one row and do not shrink; at 800 the
      // strip needed 867px and the modal body became an x-scroller (FR-3598).
      width={1000}
      footer={null}
      {...modalProps}
    >
      <BAITabs
        defaultActiveKey={initialTab}
        items={[
          ...(experimentalImportFromHuggingFace && isDeploymentsEnabled
            ? [
                {
                  key: 'huggingface',
                  children: (
                    <ImportHuggingFaceModelForm
                      onRequestClose={() => {
                        // Close the modal the same way the header close
                        // button does after a successful launch.
                        modalProps.onCancel?.(
                          undefined as unknown as React.MouseEvent<HTMLButtonElement>,
                        );
                      }}
                    />
                  ),
                  label: (
                    <BAIFlex gap="xs">
                      <BAIHuggingFaceIcon />
                      {t('import.ImportHuggingFaceModel')}
                    </BAIFlex>
                  ),
                },
              ]
            : []),
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
                <BAIGitHubIcon style={{ display: 'inline' }} />
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
                <BAIGitLabIcon style={{ display: 'inline' }} />
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
