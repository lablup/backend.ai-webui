import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { PrimaryAppOption } from './ComputeSessionNodeItems/SessionActionButtons';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { App, Form, FormInstance, FormProps, Input } from 'antd';
import {
  BAIButton,
  generateRandomString,
  useErrorMessageResolver,
} from 'backend.ai-ui';
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
const ImportNotebook: React.FC<FormProps> = (props) => {
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

  const handleNotebookImport = async (url: string) => {
    const notebookURL = regularizeGithubURL(url);
    const fileName = notebookURL.split('/').pop();

    const launcherValue: StartSessionWithDefaultValue = {
      sessionName: `imported-notebook-${generateRandomString(5)}`,
      environments: {
        version: baiClient._config.default_import_environment,
      },
      bootstrap_script: '#!/bin/sh\ncurl -O ' + notebookURL,
    };

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
    }

    if (results?.rejected && results.rejected.length > 0) {
      const error = results.rejected[0].reason;
      app.modal.error({
        title: error?.title,
        content: getErrorMessage(error),
      });
    }

    webuiNavigate('/session');
  };

  return (
    <Form ref={formRef} layout="inline" {...props}>
      <Form.Item
        name="url"
        label={t('import.NotebookURL')}
        rules={[
          {
            required: true,
          },
          {
            pattern: new RegExp('^(https?)://([\\w./-]{1,}).ipynb$'),
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
      <BAIButton
        icon={<CloudDownloadOutlined />}
        type="primary"
        action={async () => {
          const values = await formRef.current
            ?.validateFields()
            .catch(() => undefined);
          if (values) {
            await handleNotebookImport(values.url);
          }
        }}
      >
        {t('import.GetAndRunNotebook')}
      </BAIButton>
    </Form>
  );
};

export default ImportNotebook;
