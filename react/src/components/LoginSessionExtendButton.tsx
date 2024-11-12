import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import BAIIntervalView from './BAIIntervalView';
import Flex from './Flex';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { default as dayjs } from 'dayjs';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginSessionExtendButtonProps {}

const LoginSessionExtendButton: React.FC<
  LoginSessionExtendButtonProps
> = () => {
  const { t } = useTranslation();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [isPending, startTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

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
    <Flex direction="row" gap="xxs">
      <Tooltip title={t('general.RemainingLoginSessionTime')}>
        <Flex gap={'xxs'}>
          <ClockCircleOutlined />
          <BAIIntervalView
            callback={() => {
              const diff = dayjs(data?.expires).diff(dayjs(), 'seconds');
              const duration = dayjs.duration(Math.max(0, diff), 'seconds');
              const days = duration.days();
              if (duration.seconds() === 0) {
                // @ts-ignore
                if (globalThis.isElectron) {
                  // @ts-ignore
                  globalThis.location.href = globalThis.electronInitialHref;
                } else {
                  globalThis.location.reload();
                }
              }
              return `${days ? days + 'd ' : ''}${duration.format('HH:mm:ss')}`;
            }}
            delay={100}
          ></BAIIntervalView>
        </Flex>
      </Tooltip>
      <Button
        loading={isPending}
        onClick={() => startTransition(() => updateFetchKey())}
        size="small"
      >
        {t('general.Extend')}
      </Button>
    </Flex>
  );
};

export default LoginSessionExtendButton;
