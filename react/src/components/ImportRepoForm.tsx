/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ImportRepoFormCreateVFolderMutation,
  ImportRepoFormCreateVFolderMutation$data,
} from '../__generated__/ImportRepoFormCreateVFolderMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from '../hooks/useStartSession';
import StorageSelect from './StorageSelect';
import {
  App,
  Form,
  FormInstance,
  FormProps,
  Input,
  message,
  Radio,
} from 'antd';
import {
  BAIButton,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
  useGetAvailableFolderName,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { FolderInput } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

const IMPORT_REPO_FORM_CREATE_VFOLDER_MUTATION = graphql`
  mutation ImportRepoFormCreateVFolderMutation($input: CreateVFolderV2Input!) {
    createVfolderV2(input: $input) {
      vfolder {
        id
        ...BAINodeNotificationItemFragment @alias(as: "notificationFrgmt")
      }
    }
  }
`;

type URLType = 'github' | 'gitlab';

type VFolderUsageModeForImport = 'general' | 'model';
interface ImportFromURLFormValues {
  url: string;
  storageHost: string;
  gitlabBranch?: string;
  vfolder_usage_mode?: VFolderUsageModeForImport;
}

interface ImportFromURLFormProps extends FormProps {
  urlType: URLType;
  initialUrl?: string;
  initialBranch?: string;
}

const createRepoBootstrapScript = (
  archiveUrl: string,
  folderName: string,
  extractedDirectory?: string,
) => {
  // Helper function to escape shell arguments
  const escapeShellArg = (arg: string): string => {
    return `'${arg.replace(/'/g, "'\\''")}'`;
  };

  const scriptLines = [
    '#!/bin/sh',
    '# Create folder and download repository',
    `curl -o /tmp/repo.zip ${escapeShellArg(archiveUrl)}`,
    `mkdir -p /home/work/${escapeShellArg(folderName)}`,
    `cd /home/work/${escapeShellArg(folderName)}`,
    'unzip -o /tmp/repo.zip',
    extractedDirectory
      ? [
          '# Move contents if in subfolder',
          `if [ -d ${escapeShellArg(extractedDirectory)} ]; then`,
          `  mv ${escapeShellArg(extractedDirectory)}/* .`,
          `  rm -rf ${escapeShellArg(extractedDirectory)}`,
          'fi',
        ].join('\n')
      : undefined,
    'rm -f /tmp/repo.zip',
  ];

  return scriptLines.filter(Boolean).join('\n');
};

// Only allow: https://github.com/owner/repo or https://github.com/owner/repo/ or https://github.com/owner/repo/tree/branch
const GITHUB_URL_REGEX =
  /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(\/?)$|^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/tree\/([\w./-]+)$/;

const GITLAB_URL_REGEX =
  /^https:\/\/gitlab\.com\/([\w.-]+)\/([\w.-]+)(\/?)$|^https:\/\/gitlab\.com\/([\w.-]+)\/([\w.-]+)\/-\/tree\/([\w./-]+)$/;

const ImportRepoForm: React.FC<ImportFromURLFormProps> = ({
  urlType,
  initialUrl,
  initialBranch,
  ...formProps
}) => {
  'use memo';
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<ImportFromURLFormValues> | null>(null);
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification } = useSetBAINotification();
  const app = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const { t } = useTranslation();

  const getAvailableFolderName = useGetAvailableFolderName();

  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();

  const commitCreateMutation =
    useMutationWithPromise<ImportRepoFormCreateVFolderMutation>(
      IMPORT_REPO_FORM_CREATE_VFOLDER_MUTATION,
    );

  const prepareGitHubArchive = async (inputUrl: string) => {
    const sanitizedUrl = inputUrl.trim().replace(/\.git$/, '');
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(sanitizedUrl);
    } catch {
      message.error(t('import.InvalidGitHubURL'));
      return null;
    }

    const pathname = parsedUrl.pathname.replace(/\/$/, '');
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length < 2) {
      message.error(t('import.InvalidGitHubURL'));
      return null;
    }

    const owner = segments[0];
    const repo = segments[1];
    const branchMatch = pathname.match(/\/tree\/([\w./-]+)/);
    let branch = branchMatch?.[1];

    if (!branch) {
      const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      try {
        const response = await fetch(repoApiUrl);

        if (response.status === 200) {
          const data = await response.json();
          branch = data.default_branch;
        } else if (response.status === 404) {
          message.error(t('import.RepositoryNotFound'));
          return null;
        } else {
          message.error(t('import.FailedToFetchRepositoryInformation'));
          return null;
        }
      } catch {
        message.error(t('import.FailedToFetchRepositoryInformation'));
        return null;
      }
    }

    const resolvedBranch = branch ?? 'master';
    const encodedBranch = encodeURIComponent(resolvedBranch);
    const sanitizedBranch = resolvedBranch.replace(/\//g, '-');

    return {
      archiveUrl: `https://codeload.github.com/${owner}/${repo}/zip/${encodedBranch}`,
      repoName: repo,
      branch: resolvedBranch,
      extractedDirectory: `${repo}-${sanitizedBranch}`,
    };
  };

  const prepareGitLabArchive = (inputUrl: string, branchInput?: string) => {
    const sanitizedUrl = inputUrl.trim().replace(/\.git$/, '');
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(sanitizedUrl);
    } catch {
      message.error(t('import.InvalidGitLabURL'));
      return null;
    }

    const pathname = parsedUrl.pathname.replace(/\/$/, '');
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length < 2) {
      message.error(
        'Invalid GitLab URL. Must be a valid GitLab repository URL',
      );
      return null;
    }

    const repoName = segments[segments.length - 1];
    const branchMatch = pathname.match(/\/-\/tree\/([^/]+)/);
    const branchFromUrl = branchMatch?.[1];
    const branch =
      (branchInput && branchInput.trim()) || branchFromUrl || 'master';

    const encodedBranch = encodeURIComponent(branch);
    const sanitizedBranch = branch.replace(/\//g, '-');
    const basePath = branchMatch
      ? pathname.slice(0, pathname.indexOf('/-/tree/'))
      : pathname;

    return {
      archiveUrl: `${parsedUrl.origin}${basePath}/-/archive/${encodedBranch}/${repoName}-${sanitizedBranch}.zip`,
      repoName,
      branch,
      extractedDirectory: `${repoName}-${sanitizedBranch}`,
    };
  };

  const handleRepoImport = async (values: ImportFromURLFormValues) => {
    const repoInfo =
      urlType === 'github'
        ? await prepareGitHubArchive(values.url)
        : urlType === 'gitlab'
          ? prepareGitLabArchive(values.url, values.gitlabBranch)
          : null;
    if (!repoInfo) return;

    const folderName = await getAvailableFolderName(
      repoInfo.repoName || 'imported-from-repo',
    );

    // Create the virtual folder via the V2 mutation; its payload already
    // includes the rich folder-card fragment, so the notification can be
    // driven directly without a separate `vfolder_node` lookup.
    let vfolder:
      | NonNullable<
          ImportRepoFormCreateVFolderMutation$data['createVfolderV2']
        >['vfolder']
      | undefined;
    try {
      vfolder = await commitCreateMutation({
        input: {
          name: folderName,
          host: values.storageHost,
          cloneable: false,
          usageMode: values.vfolder_usage_mode ?? 'general',
          permission: 'rw',
          projectId: null,
        },
      }).then((res) => res?.createVfolderV2?.vfolder);
    } catch (error) {
      const errorDetail = Array.isArray(error)
        ? (error as Array<{ message: string }>).map((e) => e.message).join('\n')
        : error instanceof Error
          ? getErrorMessage(error)
          : undefined;
      upsertNotification({
        key: `folder-create-failure-${folderName}-${Date.now()}`,
        icon: 'folder',
        message: `${t('general.Folder')}: ${folderName}`,
        description: t('data.folders.FolderCreationFailed'),
        extraDescription: errorDetail,
        open: true,
      });
      logger.error(error);
      return;
    }

    // No vfolder payload — creation likely went through but we lack the id
    // needed to mount it; surface a plain success and stop before launching
    // the import session.
    if (!vfolder) {
      upsertNotification({
        key: `folder-create-success-${folderName}-${Date.now()}`,
        icon: 'folder',
        message: `${t('general.Folder')}: ${folderName}`,
        description: t('data.folders.FolderCreated'),
        open: true,
        duration: 0,
      });
      return;
    }

    const vfolderLocalId = toLocalId(vfolder.id);
    upsertNotification({
      key: `folder-create-success-${vfolderLocalId}`,
      icon: 'folder',
      node: vfolder.notificationFrgmt,
      description: t('data.folders.FolderCreated'),
      open: true,
      duration: 0,
    });

    try {
      const launcherValue: StartSessionWithDefaultValue = {
        sessionName: `importing-files-to-${folderName}`,
        environments: {
          version: baiClient._config.default_import_environment,
        },
        sessionType: 'batch',
        batch: {
          command: createRepoBootstrapScript(
            repoInfo.archiveUrl,
            folderName,
            repoInfo.extractedDirectory,
          ),
          enabled: true,
        },
        mount_ids: [vfolderLocalId],
      };

      const results = await startSessionWithDefault(launcherValue);

      if (results.fulfilled && results.fulfilled.length > 0) {
        // Handle successful result
        upsertSessionNotification(results.fulfilled);
        formRef.current?.resetFields();
      }

      if (results?.rejected && results.rejected.length > 0) {
        const error = results.rejected[0].reason;
        app.modal.error({
          title: error?.title,
          content: getErrorMessage(error),
        });
      }
    } catch (error: any) {
      app.message.error(getErrorMessage(error));
    }
  };

  return (
    <Form
      ref={formRef}
      layout="vertical"
      {...formProps}
      initialValues={
        {
          vfolder_usage_mode: 'general',
          url: initialUrl,
          gitlabBranch: initialBranch,
        } as ImportFromURLFormValues
      }
    >
      <Form.Item>
        {urlType === 'github'
          ? t('import.RepoWillBeFolder')
          : t('import.GitlabRepoWillBeFolder')}
      </Form.Item>
      <Form.Item
        name="url"
        label={
          urlType == 'github' ? t('import.GitHubURL') : t('import.GitlabURL')
        }
        rules={[
          { required: true },
          { type: 'string', max: 2048 },
          {
            pattern: urlType === 'github' ? GITHUB_URL_REGEX : GITLAB_URL_REGEX,
            message: t('import.WrongURLType'),
          },
        ]}
      >
        <Input />
      </Form.Item>

      {urlType === 'gitlab' && (
        <>
          <Form.Item
            name="gitlabBranch"
            label={t('import.GitlabDefaultBranch')}
          >
            <Input placeholder="master" maxLength={200} />
          </Form.Item>
        </>
      )}

      <Form.Item
        name="storageHost"
        label={t('import.StorageHost')}
        rules={[{ required: true }]}
      >
        <StorageSelect showUsageStatus autoSelectType="usage" />
      </Form.Item>
      <Form.Item
        label={t('import.VFolderUsageMode')}
        name={'vfolder_usage_mode'}
        hidden={baiClient._config.enableModelFolders !== true}
        required
      >
        <Radio.Group>
          <Radio value={'general'} data-testid="general-usage-mode">
            {t('data.General')}
          </Radio>
          <Radio value={'model'} data-testid="model-usage-mode">
            {t('data.Models')}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <BAIButton
          icon={<FolderInput />}
          action={async () => {
            try {
              const values = await formRef.current?.validateFields();
              if (!values) return;
              await handleRepoImport(values);
            } catch (error) {
              logger.error('Form validation failed:', error);
            }
          }}
          block
          type="primary"
        >
          {t('import.GetToFolder')}
        </BAIButton>
      </Form.Item>
    </Form>
  );
};

export default ImportRepoForm;
