import Flex from '../Flex';
import EndpointTokenSelect from './EndpointTokenSelect';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, theme } from 'antd';
import type { FormInstance } from 'antd';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type CustomModelFormValues = {
  baseURL?: string;
  token?: string;
};

type CustomModelFormProps = {
  baseURL?: string;
  token?: string;
  endpointId?: string | null;
  loading: boolean;
  onSubmit?: (formData: CustomModelFormValues) => void;
};

function parseBaseURL(baseURL?: string) {
  const { origin, pathname } = new URL(baseURL || '');
  return {
    origin: `${origin}/`,
    pathname: pathname.replace(/^\//, ''),
  };
}

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  baseURL,
  token,
  endpointId,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const formRef = useRef<FormInstance>(null);

  const { origin, pathname: basePath } = parseBaseURL(baseURL);

  return (
    <Flex
      direction="row"
      style={{
        padding: themeToken.paddingSM,
        paddingRight: themeToken.paddingContentHorizontalLG,
        paddingLeft: themeToken.paddingContentHorizontalLG,
        backgroundColor: themeToken.colorBgContainer,
      }}
    >
      <Form
        ref={formRef}
        layout="horizontal"
        size="small"
        requiredMark="optional"
        style={{ flex: 1 }}
        key={baseURL}
        initialValues={{
          basePath: basePath,
          token: token,
        }}
      >
        <div style={{ marginBottom: themeToken.size }}>
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
          />
        </div>
        <Form.Item label={t('modelService.BasePath')} name="basePath">
          <Input
            placeholder="v1"
            addonBefore={origin}
            defaultValue={basePath}
          />
        </Form.Item>
        <Form.Item label={t('modelService.Token')} name="token">
          <EndpointTokenSelect loading={loading} endpointId={endpointId} />
        </Form.Item>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => {
            onSubmit?.({
              baseURL: new URL(
                formRef.current?.getFieldValue('basePath') ?? '',
                origin,
              ).toString(),
              token: formRef.current?.getFieldValue('token'),
            });
          }}
        >
          {t('button.RefreshModelInformation')}
        </Button>
      </Form>
    </Flex>
  );
};

export { CustomModelForm };
