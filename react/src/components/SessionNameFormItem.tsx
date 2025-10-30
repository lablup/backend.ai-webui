import { useValidateSessionName } from '../hooks/useValidateSessionName';
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
  const { t } = useTranslation();
  const validationRules = useValidateSessionName();
  return (
    <Form.Item
      label={t('session.launcher.SessionName')}
      name="sessionName"
      validateDebounce={200}
      // Original rule : /^(?=.{4,64}$)\w[\w.-]*\w$/
      // https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/api/session.py#L355-L356
      rules={validationRules}
      {...formItemProps}
    >
      <Input
        allowClear
        autoComplete="off"
        count={{
          max: 64,
          show: true,
        }}
      />
    </Form.Item>
  );
};

export default SessionNameFormItem;
