/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from '../form-engine';
import { useValidateSessionName } from '../hooks/useValidateSessionName';
// FRONTIER (ticket 17): Form.Item is self-hosted since ticket 34 (live again
// since ticket 35). The CONTROL is Astryx now, via the shared `Form.Item`
// adapter.
import { AstryxFormTextInput } from './astryxFormControls';
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
      {/* PILOT-DECISION: antd's `count={{max, show}}` character counter has
          no Astryx counterpart (`TextInput` exposes no counter slot) and is
          dropped — the 64-char bound is already enforced by
          `useValidateSessionName`'s rules, which surface the same limit as a
          validation message. `autoComplete="off"` is likewise dropped: the
          adapter's surface does not carry it and a session name is not an
          autofillable field. */}
      <AstryxFormTextInput
        label={t('session.launcher.SessionName')}
        allowClear
      />
    </Form.Item>
  );
};

export default SessionNameFormItem;
