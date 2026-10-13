/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { formatDurationAsDays } from '../../helper';
import { ATTENTION_THRESHOLD_SEC } from '../../helper/sessionMonitor';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import {
  sessionMonitorScopeAtom,
  sessionMonitorSummaryAtom,
} from '../../hooks/useSessionMonitor';
import { useThemeMode } from '../../hooks/useThemeMode';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import SessionMonitorAcceleratorSummary from './SessionMonitorAcceleratorSummary';
import SessionMonitorPopoverContent, {
  sessionMonitorTitleKey,
} from './SessionMonitorPopoverContent';
import { Button } from '@lablup/ui-common/Button';
import { Popover } from '@lablup/ui-common/Popover';
import { StatusDot } from '@lablup/ui-common/StatusDot';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAISkeleton, useIntervalValue } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { Clock } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionMonitorButtonProps {
  'data-testid'?: string;
}

const Separator: React.FC = () => {
  'use memo';
  const { token } = useTheme();
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'currentColor',
        opacity: 0.3,
        marginInline: token('--spacing-1'),
      }}
    />
  );
};

/** Header chip: running count, accelerator use, nearest termination. */
const SessionMonitorButton: React.FC<SessionMonitorButtonProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { isDarkMode } = useThemeMode();
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const summary = useAtomValue(sessionMonitorSummaryAtom);
  const scope = useAtomValue(sessionMonitorScopeAtom);
  const [isOpen, setIsOpen] = useState(false);
  // The band is a reversed surface; the media scope goes on the trigger only
  // so the popover panel (an inline sibling) keeps the app palette.
  const bandMediaMode = isDarkMode ? 'light' : 'dark';

  const deadline = summary?.nearest?.deadline ?? null;
  const tick = useIntervalValue(
    () => {
      if (deadline === null) return null;
      const remainingMs = deadline - Date.now();
      return {
        text:
          remainingMs > 0
            ? formatDurationAsDays(
                dayjs().toISOString(),
                dayjs(deadline).toISOString(),
              )
            : '00:00:00',
        isUrgent: remainingMs <= ATTENTION_THRESHOLD_SEC * 1000,
      };
    },
    deadline !== null ? 1000 : null,
    String(deadline),
  );
  const running = summary?.running ?? 0;
  if (!scope) return null;
  const title = t(sessionMonitorTitleKey(scope.mode));

  return (
    <Popover
      label={title}
      placement="below"
      alignment="end"
      padding={0}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        isOpen ? (
          <ErrorBoundaryWithNullFallback>
            <Suspense
              fallback={
                <div style={{ width: 560, padding: 16 }}>
                  <BAISkeleton />
                </div>
              }
            >
              <SessionMonitorPopoverContent
                onNavigate={() => setIsOpen(false)}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ) : (
          <span />
        )
      }
    >
      <Tooltip content={t('sessionMonitor.Tooltip')}>
        <Button
          data-astryx-media={bandMediaMode}
          data-testid={props['data-testid']}
          variant="ghost"
          size="sm"
          label={title}
        >
          <BAIFlex direction="row" align="center" gap="xs">
            <StatusDot
              variant={running > 0 ? 'success' : 'neutral'}
              label={t('sessionMonitor.RunningCount', { count: running })}
              isPulsing={running > 0}
            />
            <Text type="inherit" textWrap="nowrap">
              {t('sessionMonitor.RunningCount', { count: running })}
            </Text>
            {!isProjectAgnosticPage && scope.mode !== 'domain' && (
              <ErrorBoundaryWithNullFallback>
                <Suspense fallback={null}>
                  <SessionMonitorAcceleratorSummary separator={<Separator />} />
                </Suspense>
              </ErrorBoundaryWithNullFallback>
            )}
            {tick && (
              <>
                <Separator />
                <BAIFlex
                  direction="row"
                  align="center"
                  gap="xxs"
                  style={{
                    color: tick.isUrgent ? 'var(--color-error)' : undefined,
                    fontWeight: tick.isUrgent ? 700 : undefined,
                  }}
                >
                  <Clock size="1em" />
                  <Text type="inherit" color="inherit" textWrap="nowrap">
                    {tick.text}
                  </Text>
                </BAIFlex>
              </>
            )}
          </BAIFlex>
        </Button>
      </Tooltip>
    </Popover>
  );
};

export default SessionMonitorButton;
