/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  useUpdatableState,
  BAIFlex,
  BAIIntervalView,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import { default as dayjs } from 'dayjs';
import { atom, useAtom } from 'jotai';
import { Clock, Repeat2Icon } from 'lucide-react';
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

  // RESPONSIVE-POLICY R3: antd `Grid.useBreakpoint()` → BUI's
  // `useBAIBreakpoint()` (MAPPING §3.9 — `useMediaQuery` is not equivalent).
  const gridBreakpoint = useBAIBreakpoint();

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
            <Tooltip content={t('general.RemainingLoginSessionTime')}>
              <BAIFlex gap={'xxs'}>
                <Clock size="1em" />
                {text}
              </BAIFlex>
            </Tooltip>
          );
        }}
      />
      {/* PILOT-DECISION: antd `Tooltip` + icon-only `Button type="primary"`
          → Astryx `IconButton variant="primary"` with its own `tooltip`
          (MAPPING §3.3 / §4). The `ConfigProvider` `colorPrimaryHover`
          "hack to change the primary hover color for header" is DROPPED —
          Astryx has no per-instance colour escape hatch (P5/P11), and a
          wrapper that existed only to re-theme antd has nowhere to land.
          Astryx also forbids wrapping a disabled control in a Tooltip
          (P18), which `IconButton`'s own `tooltip` prop sidesteps. */}
      <IconButton
        variant="primary"
        tooltip={t('general.ExtendLoginSession')}
        label={t('general.ExtendLoginSession')}
        isLoading={isPending}
        onClick={() => startTransition(() => updateFetchKey())}
        icon={<Repeat2Icon size="1em" />}
        isDisabled={isLoginSessionExpired}
      />
    </BAIFlex>
  );
};

export default LoginSessionExtendButton;
