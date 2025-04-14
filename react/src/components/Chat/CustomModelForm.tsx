import Flex from '../Flex';
import EndpointTokenSelect from './EndpointTokenSelect';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, theme } from 'antd';
import type { FormInstance } from 'antd';
import { useRef, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export type CustomModelFormValues = {
  baseURL?: string;
  token?: string;
};

type CustomModelFormProps = {
  baseURL?: string;
  endpointId?: string | null;
  onSubmit?: (formData: CustomModelFormValues) => void;
};

function parseBaseURL(baseURL: string) {
  const { origin, pathname } = new URL(baseURL || '');
  return {
    origin: `${origin}/`,
    pathname: pathname.replace(/^\//, ''),
  };
}

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  baseURL,
  endpointId,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const formRef = useRef<FormInstance>(null);

  const [isPendingSubmit, startSubmitTransition] = useTransition();
  const { origin, pathname } = parseBaseURL(baseURL || '');

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
          baseURL: baseURL,
          token: undefined,
        }}
      >
        <div style={{ marginBottom: themeToken.size }}>
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
          />
        </div>
        <Form.Item
          label="Base Path"
          name="basePath"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input
            placeholder="v1"
            addonBefore={origin}
            defaultValue={pathname}
          />
        </Form.Item>
        <Form.Item label="Token" name="token">
          <EndpointTokenSelect
            loading={isPendingSubmit}
            endpointId={endpointId}
          />
        </Form.Item>
        <Button
          icon={<ReloadOutlined />}
          loading={isPendingSubmit}
          onClick={() => {
            startSubmitTransition(() => {
              const basePath =
                formRef.current?.getFieldValue('basePath') ?? 'v1';
              onSubmit?.({
                baseURL: new URL(basePath, origin).href,
                token: formRef.current?.getFieldValue('token'),
              });
            });
          }}
        >
          {t('button.Refresh')}
        </Button>
      </Form>
    </Flex>
  );
};

export { CustomModelForm };
