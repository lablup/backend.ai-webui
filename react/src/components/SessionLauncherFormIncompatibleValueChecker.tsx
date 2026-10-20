/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import * as _ from 'lodash-es';
import React, { useEffect, useEffectEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SessionLauncherFormIncompatibleValueChecker: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  /** P-28: clears `mounts` through the page model. */
  onDiscardLegacyMounts: () => void;
}> = ({ form, onDiscardLegacyMounts }) => {
  // `mounts` has no Form.Item of its own; `preserve` reads the raw store.
  const mounts = Form.useWatch('mounts', { form, preserve: true });
  const app = App.useApp();
  const { t } = useTranslation();

  const hasIncompatibleMountsParam = useMemo(() => {
    return _.isArray(mounts) && mounts.length > 0;
  }, [mounts]);
  const discardLegacyMounts = useEffectEvent(() => onDiscardLegacyMounts());
  useEffect(() => {
    if (hasIncompatibleMountsParam) {
      app.message.warning(
        t('session.launcher.InvalidMountsSelectionWarning'),
        5,
      );
      discardLegacyMounts();
    }
  }, [hasIncompatibleMountsParam, t, app.message]);
  return null;
};

export default SessionLauncherFormIncompatibleValueChecker;
