import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import CopyButton from './Chat/CopyButton';
import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import { EllipsisOutlined } from '@ant-design/icons';
import {
  App,
  Divider,
  Dropdown,
  Form,
  FormInstance,
  FormProps,
  Input,
  Space,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  generateRandomString,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { FolderInput } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from 'src/hooks/useStartSession';

const regularizeGithubURL = (url: string) => {
  url = url.replace('/blob/', '/');
  url = url.replace('github.com', 'raw.githubusercontent.com');
  return url;
};

const notebookURLPattern = new RegExp('^(https?)://([\\w./-]{1,}).ipynb$');

const createLauncherValue = (notebookURL: string, defaultEnv: string) => {
  return {
    sessionName: `imported-notebook-${generateRandomString(5)}`,
    environments: {
      version: defaultEnv,
    },
    bootstrap_script: '#!/bin/sh\ncurl -O ' + notebookURL,
  };
};

interface ImportNotebookFormProps extends FormProps {
  initialUrl?: string;
}

const ImportNotebookForm: React.FC<ImportNotebookFormProps> = ({
  initialUrl,
  ...props
}) => {
  'use memo';
  const formRef = useRef<FormInstance<{
    url: string;
  }> | null>(null);

  const { t } = useTranslation();
  const app = App.useApp();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();

  const handleNotebookImport = async (url: string) => {
    const notebookURL = regularizeGithubURL(url);
    const fileName = notebookURL.split('/').pop();

    const launcherValue: StartSessionWithDefaultValue = createLauncherValue(
      notebookURL,
      baiClient._config.default_import_environment,
    );

    const results = await startSessionWithDefault(launcherValue);
    if (results.fulfilled && results.fulfilled.length > 0) {
      // Handle successful result
      upsertSessionNotification(results.fulfilled, [
        {
          extraData: {
            appName: 'jupyter',
            urlPostfix: '&redirect=/notebooks/' + fileName,
          } as PrimaryAppOption,
        },
      ]);
      webuiNavigate('/session');
    }

    if (results?.rejected && results.rejected.length > 0) {
      const error = results.rejected[0].reason;
      app.modal.error({
        title: error?.title,
        content: getErrorMessage(error),
      });
    }
  };

  return (
    <Form
      ref={formRef}
      layout="vertical"
      initialValues={{ url: initialUrl }}
      onFinish={async (values) => {
        await handleNotebookImport(values.url);
      }}
      {...props}
    >
      <Form.Item
        name="url"
        label={t('import.NotebookURL')}
        rules={[
          {
            required: true,
          },
          {
            pattern: notebookURLPattern,
            message: t('import.InvalidNotebookURL'),
          },
          {
            type: 'string',
            max: 2048,
          },
        ]}
        style={{
          flex: 1,
        }}
      >
        <Input placeholder={t('import.NotebookURL')} />
      </Form.Item>
      <Space.Compact style={{ width: '100%' }}>
        <BAIButton
          icon={<FolderInput />}
          type="primary"
          block
          action={async () => {
            formRef.current?.submit();
          }}
        >
          {t('import.GetAndRunNotebook')}
        </BAIButton>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'custom',
                label: t('import.StartWithOptions'),
                onClick: () => {
                  formRef.current
                    ?.validateFields()
                    .then(() => {
                      const url =
                        formRef.current?.getFieldValue('url') ||
                        initialUrl ||
                        '';
                      const notebookURL = regularizeGithubURL(url);
                      const launcherValue = createLauncherValue(
                        notebookURL,
                        baiClient._config.default_import_environment,
                      );
                      const params = new URLSearchParams();
                      params.set('formValues', JSON.stringify(launcherValue));
                      params.set('step', '4');
                      webuiNavigate({
                        pathname: '/session/start',
                        search: params.toString(),
                      });
                    })
                    .catch((error) => {
                      logger.error(error);
                    });
                },
              },
            ],
          }}
        >
          <BAIButton icon={<EllipsisOutlined />} type="primary" />
        </Dropdown>
      </Space.Compact>
      <BAIFlex
        direction="column"
        wrap="wrap"
        data-testid="panel-notebook-badge-code-section"
      >
        <Divider />
        <Typography.Paragraph>
          {t('import.YouCanCreateNotebookCode')}
        </Typography.Paragraph>
        <Form.Item dependencies={[['url']]}>
          {({ getFieldValue }) => {
            const url = getFieldValue('url') || '';

            // Create the new format URL with encoded JSON data
            const importData = { url };
            const encodedData = encodeURIComponent(JSON.stringify(importData));

            let baseURL = '';
            if (globalThis.isElectron) {
              baseURL = 'https://cloud.backend.ai';
            } else {
              baseURL =
                window.location.protocol + '//' + window.location.hostname;
              if (window.location.port) {
                baseURL = baseURL + ':' + window.location.port;
              }
            }

            const badgeURL = `${baseURL}/start?type=url&data=${encodedData}`;

            const fullText = `<a href="${badgeURL}"><img src="https://www.backend.ai/assets/badge.svg" /></a>`;
            const fullTextMarkdown = `[![Run on Backend.AI](https://www.backend.ai/assets/badge.svg)](${badgeURL})`;

            const isValidURL =
              notebookURLPattern.test(url) && url.length <= 2048;
            const isButtonDisabled = !url || !isValidURL;

            return (
              <BAIFlex justify="start" gap={'sm'} wrap="wrap">
                <img
                  src="/resources/badge.svg"
                  style={{ marginTop: 5, marginBottom: 5 }}
                  width="147"
                />
                <BAIFlex gap={'sm'}>
                  <CopyButton
                    size="small"
                    copyable={{
                      text: fullText,
                    }}
                    disabled={isButtonDisabled}
                  >
                    {t('import.NotebookBadgeCodeHTML')}
                  </CopyButton>
                  <CopyButton
                    size="small"
                    copyable={{
                      text: fullTextMarkdown,
                    }}
                    disabled={isButtonDisabled}
                  >
                    {t('import.NotebookBadgeCodeMarkdown')}
                  </CopyButton>
                </BAIFlex>
              </BAIFlex>
            );
          }}
        </Form.Item>
      </BAIFlex>
    </Form>
  );
};

// Add display name for debugging
ImportNotebookForm.displayName = 'ImportNotebookForm';

export default ImportNotebookForm;
