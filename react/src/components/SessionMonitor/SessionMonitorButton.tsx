/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { formatDurationAsDays } from '../../helper';
import { ATTENTION_THRESHOLD_SEC } from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import {
  sessionMonitorScopeAtom,
  sessionMonitorSummaryAtom,
} from '../../hooks/useSessionMonitor';
import { useThemeMode } from '../../hooks/useThemeMode';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import SessionMonitorAcceleratorSummary from './SessionMonitorAcceleratorSummary';
import SessionMonitorDetailDrawer from './SessionMonitorDetailDrawer';
import SessionMonitorPopoverContent, {
  sessionMonitorTitleKey,
} from './SessionMonitorPopoverContent';
import { Button } from '@lablup/ui-common/Button';
import { Popover } from '@lablup/ui-common/Popover';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAISkeleton, useIntervalValue } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { Hourglass } from 'lucide-react';
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

/**
 * Header chip: the watched-session count, plus whichever of the starting and
 * error counts, allocated resources and nearest termination the user turned
 * on. Colour means one
 * thing here, a deadline under 30 minutes, so the chip carries no status dot.
 */
const SessionMonitorButton: React.FC<SessionMonitorButtonProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { isDarkMode } = useThemeMode();
  const [chipItems] = useBAISettingUserState('session_monitor_chip_items');
  const summary = useAtomValue(sessionMonitorSummaryAtom);
  const scope = useAtomValue(sessionMonitorScopeAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);
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
  const count = summary?.total ?? 0;
  if (!scope) return null;
  const title = t(sessionMonitorTitleKey(scope));
  const showsIdle = chipItems?.includes('idle') ?? false;

  return (
    <>
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
                  onOpenSessionDetail={(id) => {
                    setIsOpen(false);
                    setDetailSessionId(id);
                  }}
                />
              </Suspense>
            </ErrorBoundaryWithNullFallback>
          ) : (
            <span />
          )
        }
      >
        <Tooltip content={t('sessionMonitor.Tooltip')} placement="start">
          <Button
            data-astryx-media={bandMediaMode}
            data-testid={props['data-testid']}
            variant="ghost"
            size="sm"
            label={title}
          >
            <BAIFlex direction="row" align="center" gap="xs">
              <Text type="inherit" textWrap="nowrap">
                {t('sessionMonitor.SessionCount', { count })}
              </Text>
              {summary?.starting != null && (
                <>
                  <Separator />
                  <Text type="inherit" textWrap="nowrap">
                    {t('sessionMonitor.ChipStartingCount', {
                      count: summary.starting,
                    })}
                  </Text>
                </>
              )}
              {summary?.errors != null && (
                <>
                  <Separator />
                  <Text type="inherit" textWrap="nowrap">
                    {t('sessionMonitor.ErrorCount', { count: summary.errors })}
                  </Text>
                </>
              )}
              {summary?.allocated && (
                <ErrorBoundaryWithNullFallback>
                  <Suspense fallback={null}>
                    <SessionMonitorAcceleratorSummary
                      allocated={summary.allocated}
                      separator={<Separator />}
                    />
                  </Suspense>
                </ErrorBoundaryWithNullFallback>
              )}
              {showsIdle && tick && (
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
                    <Hourglass size="1em" />
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
      <SessionMonitorDetailDrawer
        sessionId={detailSessionId}
        onClose={() => setDetailSessionId(null)}
      />
    </>
  );
};

export default SessionMonitorButton;
