import { Form, FormItemProps, Input } from 'antd';
import { TFunction } from 'i18next';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionNameFormItemProps extends FormItemProps {}

export interface SessionNameFormItemValue {
  sessionName: string;
}

export const getSessionNameRules = (
  t: TFunction,
): Exclude<FormItemProps['rules'], undefined> => [
  {
    min: 4,
    message: t('session.validation.SessionNameTooShort'),
  },
  {
    max: 64,
    message: t('session.validation.SessionNameTooLong64'),
  },
  {
    validator(f, value) {
      if (_.isEmpty(value)) {
        return Promise.resolve();
      }
      if (!/^\w/.test(value)) {
        return Promise.reject(
          t('session.validation.SessionNameShouldStartWith'),
        );
      }

      if (!/^[\w.-]*$/.test(value)) {
        return Promise.reject(
          t('session.validation.SessionNameInvalidCharacter'),
        );
      }

      if (!/\w$/.test(value) && value.length >= 4) {
        return Promise.reject(t('session.validation.SessionNameShouldEndWith'));
      }
      return Promise.resolve();
    },
  },
];

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
      rules={getSessionNameRules(t)}
      {...formItemProps}
    >
      <Input allowClear autoComplete="off" />
    </Form.Item>
  );
};

export default SessionNameFormItem;
