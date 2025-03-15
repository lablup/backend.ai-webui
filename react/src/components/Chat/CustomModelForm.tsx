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
  modelToken?: string; // @FIXME doesn't exist on the original version
  allowCustomModel?: boolean;
  alert?: React.ReactNode;
  modelId?: string;
  customModelFormRef: React.RefObject<FormInstance<any> | null>;
};

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  baseURL,
  modelToken,
  allowCustomModel,
  alert,
  modelId,
  customModelFormRef,
}) => {
  const { token } = theme.useToken();

  return (
    <Flex
      direction="row"
      style={{
        padding: token.paddingSM,
        paddingRight: token.paddingContentHorizontalLG,
        paddingLeft: token.paddingContentHorizontalLG,
        backgroundColor: token.colorBgContainer,
        display: (allowCustomModel && modelId === 'custom' && 'flex') || 'none',
      }}
    >
      <Form
        ref={customModelFormRef}
        layout="horizontal"
        size="small"
        requiredMark="optional"
        style={{ flex: 1 }}
        key={baseURL}
        initialValues={{
          baseURL: baseURL,
          token: modelToken,
        }}
      >
        {alert ? <div style={{ marginBottom: token.size }}>{alert}</div> : null}
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
