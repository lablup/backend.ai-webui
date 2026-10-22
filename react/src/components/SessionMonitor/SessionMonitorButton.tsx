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
import SessionMonitorAllocationSummary from './SessionMonitorAllocationSummary';
import SessionMonitorDetailDrawer from './SessionMonitorDetailDrawer';
import { Button } from '@lablup/ui-common/Button';
import { Popover } from '@lablup/ui-common/Popover';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { BAIFlex, BAISkeleton, useIntervalValue } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { Hourglass } from 'lucide-react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// The popover body (session list, settings pane) loads when first opened.
const SessionMonitorPopoverContent = React.lazy(
  () => import('./SessionMonitorPopoverContent'),
);

interface SessionMonitorButtonProps {
  'data-testid'?: string;
}

const Separator: React.FC = () => {
  'use memo';
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'currentColor',
        opacity: 0.3,
      }}
    />
  );
};

/** A chip item and its leading separator, kept together when the line wraps. */
const ChipItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  'use memo';
  return (
    <BAIFlex direction="row" align="center" gap="xs">
      <Separator />
      {children}
    </BAIFlex>
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
  // When the header squeezes the chip below its first item, hide it whole
  // rather than show a cut-off count; visibility keeps its layout width.
  const rowRef = useRef<HTMLDivElement>(null);
  const [isCountCut, setIsCountCut] = useState(false);
  useEffect(() => {
    const row = rowRef.current;
    const clip = row?.parentElement;
    const first = row?.firstElementChild;
    if (!clip || !first) return;
    const check = () =>
      setIsCountCut(
        first.getBoundingClientRect().right >
          clip.getBoundingClientRect().right + 0.5,
      );
    const observer = new ResizeObserver(check);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [scope]);
  const count = summary?.total ?? 0;
  if (!scope) return null;
  const title = t('sessionMonitor.Title');
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
        <Tooltip content={t('sessionMonitor.Title')} placement="start">
          <Button
            data-astryx-media={bandMediaMode}
            data-testid={props['data-testid']}
            variant="ghost"
            label={title}
            style={{ visibility: isCountCut ? 'hidden' : undefined }}
          >
            {/* One clipped line: an item that does not fit wraps out of view
                whole, with its separator, instead of being cut mid-text. */}
            <BAIFlex
              ref={rowRef}
              direction="row"
              align="center"
              gap="xs"
              style={{ flexWrap: 'wrap', height: '1lh', overflow: 'hidden' }}
            >
              <Text type="inherit" textWrap="nowrap">
                {t('sessionMonitor.SessionCount', { count })}
              </Text>
              {summary?.starting != null && (
                <ChipItem>
                  <Text type="inherit" textWrap="nowrap">
                    {t('sessionMonitor.ChipStartingCount', {
                      count: summary.starting,
                    })}
                  </Text>
                </ChipItem>
              )}
              {summary?.errors != null && (
                <ChipItem>
                  <Text type="inherit" textWrap="nowrap">
                    {t('sessionMonitor.ErrorCount', { count: summary.errors })}
                  </Text>
                </ChipItem>
              )}
              {summary?.allocated && (
                <ErrorBoundaryWithNullFallback>
                  <Suspense fallback={null}>
                    <BAIFlex direction="row" align="center" gap="xs">
                      <SessionMonitorAllocationSummary
                        allocated={summary.allocated}
                        separator={<Separator />}
                      />
                    </BAIFlex>
                  </Suspense>
                </ErrorBoundaryWithNullFallback>
              )}
              {showsIdle && tick && (
                <ChipItem>
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
                </ChipItem>
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
