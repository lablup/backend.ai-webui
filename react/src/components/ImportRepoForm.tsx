import { useSuspendedBackendaiClient } from '../hooks';
import StorageSelect from './StorageSelect';
import { CloudDownloadOutlined } from '@ant-design/icons';
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
  useBAILogger,
  useErrorMessageResolver,
  useGetAvailableFolderName,
} from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

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

  const prepareGitHubArchive = async (inputUrl: string) => {
    const sanitizedUrl = inputUrl.trim().replace(/\.git$/, '');
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(sanitizedUrl);
    } catch (error) {
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
      } catch (error) {
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
    } catch (error) {
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
    try {
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

      // create virtual folder
      const vfolderInfo = await baiClient.vfolder.create(
        folderName,
        values.storageHost,
        '', // group
        values.vfolder_usage_mode ?? 'general', // usage mode
        'rw', // permission
      );

      upsertNotification({
        key: `folder-create-success-${vfolderInfo.id}`,
        icon: 'folder',
        message: `${vfolderInfo.name}: ${t('data.folders.FolderCreated')}`,
        toText: t('data.folders.OpenAFolder'),
        to: {
          search: new URLSearchParams({
            folder: vfolderInfo.id,
          }).toString(),
        },
        open: true,
        duration: 0,
      });

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
        mount_ids: [vfolderInfo.id],
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
            pattern:
              urlType === 'github'
                ? /^(https?):\/\/github\.com\/([\w./-]{1,})$/
                : /^(https?):\/\/gitlab\.com\/([\w./-]{1,})$/,
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
          icon={<CloudDownloadOutlined />}
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
