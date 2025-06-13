import Flex from '../Flex';
import EndpointTokenSelect from './EndpointTokenSelect';
import { ReloadOutlined } from '@ant-design/icons';
import useResizeObserver from '@react-hook/resize-observer';
import { Alert, Button, Form, Input, theme } from 'antd';
import type { FormInstance } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CustomModelFormValues = {
  baseURL?: string;
  basePath?: string;
  token?: string;
};

type CustomModelFormProps = {
  endpointUrl?: string;
  basePath?: string;
  token?: string;
  endpointId?: string | null;
  loading: boolean;
  onSubmit?: (formData: CustomModelFormValues) => void;
};

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  endpointUrl,
  basePath,
  token,
  endpointId,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const formRef = useRef<FormInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shrinkControlSize, setShrinkControlSize] = useState<boolean>(true);

  useResizeObserver(containerRef.current, ({ contentRect }) => {
    setShrinkControlSize(contentRect.width < 480);
  });

  return (
    <Flex
      direction="row"
      style={{
        padding: themeToken.paddingSM,
        paddingRight: themeToken.paddingContentHorizontalLG,
        paddingLeft: themeToken.paddingContentHorizontalLG,
        backgroundColor: themeToken.colorBgContainer,
        overflow: 'hidden',
      }}
      ref={containerRef}
    >
      <Form
        ref={formRef}
        layout="horizontal"
        size="small"
        requiredMark="optional"
        style={{ flex: 1 }}
        key={endpointUrl}
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
            addonBefore={shrinkControlSize ? undefined : endpointUrl}
            defaultValue={basePath}
          />
        </Form.Item>
        <Form.Item label={t('modelService.Token')} name="token">
          <EndpointTokenSelect
            loading={loading}
            endpointId={endpointId}
            style={{
              width: shrinkControlSize ? '100%' : '200px',
            }}
          />
        </Form.Item>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => {
            onSubmit?.({
              basePath: formRef.current?.getFieldValue('basePath') ?? '',
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
