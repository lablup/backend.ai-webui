import { Form, FormItemProps, Input } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionNameFormItemProps extends FormItemProps {}

export interface SessionNameFormItemValue {
  name: string;
}
const SessionNameFormItem: React.FC<SessionNameFormItemProps> = ({
  ...formItemProps
}) => {
  /* TODO: check SessionNameAlreadyExist */
  const { t } = useTranslation();
  return (
    <Form.Item
      label={t('session.launcher.SessionName')}
      name="name"
      rules={[
        {
          max: 64,
          message: t('session.Validation.SessionNameTooLong64'),
        },
        {
          pattern: /^(?:[a-zA-Z0-9][a-zA-Z0-9._-]{2,}[a-zA-Z0-9])?$/,
          message: t(
            'session.Validation.PleaseFollowSessionNameRule',
          ).toString(),
        },
      ]}
      {...formItemProps}
    >
      <Input allowClear />
    </Form.Item>
  );
};

export default SessionNameFormItem;
