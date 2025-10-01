import useControllableState from '../hooks/useControllableState';
import { useInterval, useIntervalValue } from '../hooks/useIntervalValue';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BAIAutoRefetchButtonProps
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
const BAIFetchKeyButton: React.FC<BAIAutoRefetchButtonProps> = ({
  value,
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
  const { t } = useTranslation();
  const [lastLoadTime, setLastLoadTime] = useControllableState(
    {
      value: lastLoadTimeProp,
    },
    {
      defaultValue: new Date(),
    },
  );

  // display loading icon for at least "some ms" to avoid flickering
  const [displayLoading, setDisplayLoading] = useState(false);
  useEffect(() => {
    if (loading) {
      const startTime = Date.now();
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
        return `${t('general.LastUpdated')}: ${dayjs(lastLoadTime).fromNow()}`;
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
        title={tooltipTitle ? undefined : t('general.Refresh')}
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
