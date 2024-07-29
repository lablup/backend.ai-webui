import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIIntervalText from './BAIIntervalText';
import Flex from './Flex';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { default as dayjs } from 'dayjs';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface TimeContainerProps {
  format?: string;
}

const TimeContainer: React.FC<TimeContainerProps> = ({
  format = 'YYYY/MM/DD dddd HH:mm:ss',
}) => {
  const { t } = useTranslation();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [isPending, startTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const { data } = useTanQuery<{
    expires: string;
  }>({
    queryKey: ['TimeContainerExpires', fetchKey],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/server/extend-login-session`,
      });
    },
    staleTime: 0,
    cacheTime: 0,
    suspense: true,
  });

  return (
    <Flex direction="row" gap="xxs">
      <ClockCircleOutlined />
      <BAIIntervalText
        callback={() => {
          const diff = dayjs(data?.expires).diff(dayjs(), 'seconds');
          const duration = dayjs.duration(Math.max(0, diff), 'seconds');
          return duration.format(format);
        }}
        delay={1000}
      ></BAIIntervalText>
      <Button
        loading={isPending}
        onClick={() => startTransition(() => updateFetchKey())}
      >
        {t('general.Extend')}
      </Button>
    </Flex>
  );
};

export default TimeContainer;
