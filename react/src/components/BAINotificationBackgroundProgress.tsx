/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationState } from '../hooks/useBAINotification';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

interface BAINotificationBackgroundProgressProps {
  backgroundTask: NotificationState['backgroundTask'];
  showDate?: boolean;
}

const BAINotificationBackgroundProgress: React.FC<
  BAINotificationBackgroundProgressProps
> = ({ backgroundTask, showDate }) => {
  'use memo';

  const { t } = useTranslation();

  return _.isNumber(backgroundTask?.percent) ? (
    // antd `Progress size="small" showInfo={false}` -> Astryx `ProgressBar`
    // (MAPPING §3.11): `percent`->`value`, `showInfo={false}` is the default
    // (`hasValueLabel` defaults false), `size="small"` has no destination and
    // is dropped. `strokeColor={colorTextDisabled}` for a rejected task ->
    // `variant="neutral"`, the closed-enum equivalent of "greyed out" (P5);
    // `isDisabled` would additionally dim the track, which antd did not do.
    // `label` is required and antd shipped none (P8); the existing
    // `general.InProgress` string names it in all 22 locales without adding a
    // key that would then have to be translated 22 times.
    <ProgressBar
      label={t('general.InProgress')}
      isLabelHidden
      value={backgroundTask.percent}
      variant={backgroundTask.status === 'rejected' ? 'neutral' : 'accent'}
      style={{
        margin: 0,
        opacity: backgroundTask.status === 'resolved' && showDate ? 0 : 1,
      }}
    />
  ) : null;
};

export default BAINotificationBackgroundProgress;
