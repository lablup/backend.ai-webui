import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import { App, Form, type FormInstance } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SessionLauncherFormIncompatibleValueChecker: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
}> = ({ form }) => {
  const mounts = Form.useWatch('mounts', form);
  const app = App.useApp();
  const { t } = useTranslation();

  const hasIncompatibleMountsParam = useMemo(() => {
    return _.isArray(mounts) && mounts.length > 0;
  }, [mounts]);
  useEffect(() => {
    if (hasIncompatibleMountsParam) {
      app.message.warning(
        t('session.launcher.InvalidMountsSelectionWarning'),
        5,
      );
      form.setFieldValue('mounts', undefined);
    }
  }, [hasIncompatibleMountsParam, t, app.message, form]);
  return null;
};

export default SessionLauncherFormIncompatibleValueChecker;
