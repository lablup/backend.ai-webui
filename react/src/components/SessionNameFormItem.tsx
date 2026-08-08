/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from '../form-engine';
import { useValidateSessionName } from '../hooks/useValidateSessionName';
// FRONTIER (ticket 17): Form.Item is antd's again — ticket 34's self-hosted
// engine is parked (see form-engine/engine.ts) — and `Input` is an antd
// control too.
import { Input } from 'antd';
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
