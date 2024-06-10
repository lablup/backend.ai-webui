import { generateRandomString } from '../helper';
import { useWebUINavigate } from '../hooks';
import {
  AppOption,
  SessionLauncherFormValue,
} from '../pages/SessionLauncherPage';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, FormProps, Input } from 'antd';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const navigate = useWebUINavigate();
  return (
    <Form ref={formRef} layout="inline" requiredMark="optional" {...props}>
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
      <Button
        icon={<CloudDownloadOutlined />}
        type="primary"
        onClick={() => {
          formRef.current
            ?.validateFields()
            .then((values) => {
              const notebookURL = regularizeGithubURL(values.url);
              const launcherValue: DeepPartial<SessionLauncherFormValue> = {
                sessionName: 'imported-notebook-' + generateRandomString(5),
                environments: {
                  environment: 'cr.backend.ai/stable/python',
                },
                bootstrap_script: '#!/bin/sh\ncurl -O ' + notebookURL,
              };
              const params = new URLSearchParams();
              params.set('step', '4');
              params.set('formValues', JSON.stringify(launcherValue));
              params.set(
                'appOption',
                JSON.stringify({
                  runtime: 'jupyter',
                  filename: notebookURL.split('/').pop(),
                } as AppOption),
              );
              navigate(`/session/start?${params.toString()}`);
            })
            .catch(() => {});
        }}
      >
        {t('import.GetAndRunNotebook')}
      </Button>
    </Form>
  );
};

export default ImportNotebook;
