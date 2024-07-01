import { Form, FormItemProps, Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface VFolderNameInputProps extends FormItemProps {
  onChangeDuplicatedNameStatus?: (status: boolean) => void;
}

const VFolderNameFormItem: React.FC<VFolderNameInputProps> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <Form.Item
      label={t('data.Foldername')}
      rules={[
        {
          required: true,
        },
        {
          pattern: /^[a-zA-Z0-9._-]*$/,
          message: t('data.Allowslettersnumbersand-_dot'),
        },
      ]}
      {...props}
    >
      <Input autoComplete="off" />
    </Form.Item>
  );
};

export default VFolderNameFormItem;
