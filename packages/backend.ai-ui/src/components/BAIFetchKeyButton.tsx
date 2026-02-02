import { omitNullAndUndefinedFields } from '../helper';
import { useInterval, useIntervalValue } from '../hooks/useIntervalValue';
import { ReloadOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Button, Tooltip, type ButtonProps } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BAIFetchKeyButtonProps
  extends Omit<ButtonProps, 'value' | 'onChange' | 'loading'> {
  value: string;
  loading?: boolean;
  lastLoadTime?: Date;
  showLastLoadTime?: boolean;
  autoUpdateDelay?: number | null;
  size?: ButtonProps['size'];
  onChange: (fetchKey: string) => void;
  hidden?: boolean;
  pauseWhenHidden?: boolean;
}

/**
 * A refresh button that manages fetch keys for data refetching with auto-update capabilities.
 * Extends Ant Design Button with fetch key management, auto-refresh, and last update time display.
 *
 * @param value - Current fetch key value
 * @param loading - Loading state of the data fetch
 * @param lastLoadTime - Timestamp of the last successful load
 * @param showLastLoadTime - When true, shows "Last updated: X ago" in tooltip
 * @param autoUpdateDelay - Auto-refresh interval in milliseconds, null to disable
 * @param onChange - Callback fired when fetch key should be updated
 * @param hidden - When true, hides the button completely
 * @param pauseWhenHidden - When true, pauses auto-update when button is hidden
 */
const BAIFetchKeyButton: React.FC<BAIFetchKeyButtonProps> = ({
  loading,
  onChange,
  showLastLoadTime,
  autoUpdateDelay = null,
  size,
  hidden,
  lastLoadTime: lastLoadTimeProp,
  pauseWhenHidden = true,
  ...buttonProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const [lastLoadTime, setLastLoadTime] = useControllableValue(
    // To use the default value when lastLoadTimeProp is undefined, we need to omit the value field
    omitNullAndUndefinedFields({
      value: lastLoadTimeProp,
    }),
    {
      defaultValue: new Date(),
    },
  );

  // display loading icon for at least "some ms" to avoid flickering
  const [displayLoading, setDisplayLoading] = useState(false);
  useEffect(() => {
    if (loading) {
      const startTime = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayLoading(true);

      return () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(700 - elapsedTime, 0);

        setTimeout(() => {
          setDisplayLoading(false);
        }, remainingTime);
      };
    }
  }, [loading]);

  const loadTimeMessage = useIntervalValue(
    () => {
      if (lastLoadTime) {
        return `${t('comp:BAIFetchKeyButton.LastUpdated')}: ${dayjs(lastLoadTime).fromNow()}`;
      }
      return '';
    },
    showLastLoadTime ? 5_000 : null,
    lastLoadTime.toISOString(),
    pauseWhenHidden,
  );

  // remember when loading is done to display when the last fetch was done
  useLayoutEffect(() => {
    if (!loading) {
      setLastLoadTime(new Date());
    }
  }, [loading, setLastLoadTime]);

  useInterval(
    () => {
      onChange(new Date().toISOString());
    },
    // only start auto-updating after the previous loading is false(done).
    loading ? null : autoUpdateDelay,
    pauseWhenHidden,
  );

  const tooltipTitle = showLastLoadTime ? loadTimeMessage : undefined;
  return hidden ? null : (
    <Tooltip title={tooltipTitle} placement="topLeft">
      <Button
        title={tooltipTitle ? undefined : t('comp:BAIFetchKeyButton.Refresh')}
        loading={displayLoading}
        size={size}
        icon={<ReloadOutlined />}
        onClick={() => {
          onChange(new Date().toISOString());
        }}
        {...buttonProps}
      />
    </Tooltip>
  );
};

export default BAIFetchKeyButton;
