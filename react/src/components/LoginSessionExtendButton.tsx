import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIIntervalView from './BAIIntervalView';
import Flex from './Flex';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Grid, Tooltip } from 'antd';
import { default as dayjs } from 'dayjs';
import { Repeat2Icon } from 'lucide-react';
import React, { useTransition, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginSessionExtendButtonProps {}

const LoginSessionExtendButton: React.FC<
  LoginSessionExtendButtonProps
> = () => {
  const { t } = useTranslation();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [isPending, startTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isDisabled, setIsDisabled] = useState(false);

  const gridBreakpoint = Grid.useBreakpoint();

  const { data } = useSuspenseTanQuery<{
    expires: string;
  }>({
    queryKey: ['TimeContainerExpires', fetchKey],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/server/extend-login-session`,
      });
    },
    staleTime: 1000,
  });

  return (
    <Flex direction="row" gap="xs">
      <BAIIntervalView
        callback={() => {
          const diff = dayjs(data?.expires).diff(dayjs(), 'seconds');
          const duration = dayjs.duration(Math.max(0, diff), 'seconds');
          const days = Math.floor(duration.asDays());
          const isExpired = duration.asMilliseconds() <= 0;
          setIsDisabled(isExpired);
          if (isExpired) {
            // FIXME: temporally add timeout (5s) for page reload to be applied
            setTimeout(() => {
              // @ts-ignore
              if (globalThis.isElectron) {
                // @ts-ignore
                globalThis.location.href = globalThis.electronInitialHref;
              } else {
                globalThis.location.reload();
              }
            }, 5000);
          }
          return gridBreakpoint.lg
            ? `${days ? days + 'd ' : ''}${duration.format('HH:mm:ss')}`
            : days
              ? days + 'd'
              : duration.format('HH:mm:ss');
        }}
        delay={isDisabled ? null : 100}
        render={(text) => {
          return (
            <Tooltip title={t('general.RemainingLoginSessionTime')}>
              <Flex gap={'xxs'}>
                <ClockCircleOutlined />
                {text}
              </Flex>
            </Tooltip>
          );
        }}
      />
      <ConfigProvider
        theme={{
          token: {
            // hack to change the primary hover color for header
            colorPrimaryHover: 'rgb(255,255,255,0.15)',
          },
        }}
      >
        <Tooltip title={t('general.ExtendLoginSession')}>
          <Button
            type="primary"
            loading={isPending}
            onClick={() => startTransition(() => updateFetchKey())}
            icon={<Repeat2Icon />}
            disabled={isDisabled}
          />
        </Tooltip>
      </ConfigProvider>
    </Flex>
  );
};

export default LoginSessionExtendButton;
