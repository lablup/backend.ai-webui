import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIIntervalView from './BAIIntervalView';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Grid, Tooltip } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import { atom, useAtom } from 'jotai';
import { Repeat2Icon } from 'lucide-react';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginSessionExtendButtonProps {}

export const isLoginSessionExpiredState = atom(false);

const LoginSessionExtendButton: React.FC<
  LoginSessionExtendButtonProps
> = () => {
  const { t } = useTranslation();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [isPending, startTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const gridBreakpoint = Grid.useBreakpoint();

  const [isLoginSessionExpired, setIsLoginSessionExpired] = useAtom(
    isLoginSessionExpiredState,
  );

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

  if (isLoginSessionExpired) {
    const error = new Error('Login session expired');
    error.name = 'AuthorizationError';
    throw error;
  }

  return (
    <BAIFlex direction="row" gap="xs">
      <BAIIntervalView
        callback={() => {
          const diff = dayjs(data?.expires).diff(dayjs(), 'seconds');
          const duration = dayjs.duration(Math.max(0, diff), 'seconds');
          const days = Math.floor(duration.asDays());
          const isExpired = duration.asMilliseconds() <= 0;
          setIsLoginSessionExpired(isExpired);
          return gridBreakpoint.lg
            ? `${days ? days + 'd ' : ''}${duration.format('HH:mm:ss')}`
            : days
              ? days + 'd'
              : duration.format('HH:mm:ss');
        }}
        delay={isLoginSessionExpired ? null : 100}
        render={(text) => {
          return (
            <Tooltip title={t('general.RemainingLoginSessionTime')}>
              <BAIFlex gap={'xxs'}>
                <ClockCircleOutlined />
                {text}
              </BAIFlex>
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
            disabled={isLoginSessionExpired}
          />
        </Tooltip>
      </ConfigProvider>
    </BAIFlex>
  );
};

export default LoginSessionExtendButton;
