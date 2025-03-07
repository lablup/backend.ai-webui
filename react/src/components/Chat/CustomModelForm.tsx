import Flex from '../Flex';
import { ReloadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  ButtonProps,
  Form,
  FormInstance,
  Input,
  theme,
} from 'antd';
import { useTranslation } from 'react-i18next';

type CustomModelFormProps = {
  baseURL?: string;
  token?: string;
  allowCustomModel?: boolean;
  alert?: React.ReactNode;
  modelId?: string;
  formRef: React.RefObject<FormInstance<any> | null>;
};

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  baseURL,
  token,
  allowCustomModel,
  alert,
  modelId,
  formRef,
}) => {
  const { token: themeToken } = theme.useToken();

  return (
    <Flex
      direction="row"
      style={{
        padding: themeToken.paddingSM,
        paddingRight: themeToken.paddingContentHorizontalLG,
        paddingLeft: themeToken.paddingContentHorizontalLG,
        backgroundColor: themeToken.colorBgContainer,
        // @FIXME: check the condition at the parent component
        display: (allowCustomModel && modelId === 'custom' && 'flex') || 'none',
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
          token: token,
        }}
      >
        {alert ? (
          <div style={{ marginBottom: themeToken.size }}>{alert}</div>
        ) : null}
        <Form.Item
          label="baseURL"
          name="baseURL"
          rules={[
            {
              type: 'url',
            },
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="https://domain/v1" />
        </Form.Item>
        <Form.Item
          label="Model ID"
          name="modelId"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="llm-model" />
        </Form.Item>
        <Form.Item label="Token" name="token">
          <Input />
        </Form.Item>
      </Form>
    </Flex>
  );
};

type CustomModelAlertProp = {
  onClick?: ButtonProps['onClick'];
};

const CustomModelAlert: React.FC<CustomModelAlertProp> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Alert
      type="warning"
      showIcon
      message={t('chatui.CannotFindModel')}
      action={
        <Button icon={<ReloadOutlined />} onClick={onClick}>
          {t('button.Refresh')}
        </Button>
      }
    />
  );
};

export { CustomModelForm, CustomModelAlert };
