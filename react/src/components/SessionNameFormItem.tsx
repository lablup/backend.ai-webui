import { Form, FormItemProps, Input } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionNameFormItemProps extends FormItemProps {}

export interface SessionNameFormItemValue {
  sessionName: string;
}
const SessionNameFormItem: React.FC<SessionNameFormItemProps> = ({
  ...formItemProps
}) => {
  /* TODO: check SessionNameAlreadyExist */
  const { t } = useTranslation();
  return (
    <Form.Item
      label={t('session.launcher.SessionName')}
      name="sessionName"
      // Original rule : /^(?=.{4,64}$)\w[\w.-]*\w$/
      // https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/api/session.py#L355-L356
      rules={[
        {
          min: 4,
          message: t('session.Validation.SessionNameTooShort'),
        },
        {
          max: 64,
          message: t('session.Validation.SessionNameTooLong64'),
        },
        {
          validator(_, value) {
            if (!/^\w/.test(value)) {
              return Promise.reject(
                t('session.Validation.SessionNameShouldStartWith'),
              );
            }

            if (!/^[\w.-]*$/.test(value)) {
              return Promise.reject(
                t('session.Validation.SessionNameInvalidCharacter'),
              );
            }

            if (!/\w$/.test(value) && value.length >= 4) {
              return Promise.reject(
                t('session.Validation.SessionNameShouldEndWith'),
              );
            }
            return Promise.resolve();
          },
        },
      ]}
      {...formItemProps}
    >
      <Input allowClear autoComplete="off" />
    </Form.Item>
  );
};

export default SessionNameFormItem;
