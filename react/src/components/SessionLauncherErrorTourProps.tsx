/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
// Ticket 17's FRONTIER note is discharged: ticket 18 pinned
// `@astryxdesign/lab@0.3.0-canary.12db2a1`, so the Astryx Tour is available.
// This file follows `AdminDeploymentPresetValidationTour` — the same
// three-step "you have a validation error" tour — verbatim.
import BAITourAstryx from './astryx-bui/BAITourAstryx';
import { TourStep } from '@astryxdesign/lab';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PILOT-DECISION: public props narrowed from antd's
 * `Omit<TourProps, 'steps'>` to the two the sole consumer
 * (`SessionLauncherPage`) actually reads (`open`, `onClose`). The lab Tour's
 * surface is entirely different, so the blanket antd-prop passthrough
 * (`{...otherProps}`) had nothing left to carry. `onClose` loses antd's mouse
 * event — the consumer ignores it. antd's `scrollIntoViewOptions` (passed as a
 * bare boolean at the call site) is handled per step by `BAITourAstryx`
 * (FR-3526), matching the preset tour.
 */
interface SessionLauncherValidationTourProps {
  open?: boolean;
  onClose?: () => void;
  /** Accepted for source compatibility with the existing call site; the
   *  scroll behaviour is unconditional, per step, via `BAITourAstryx`. */
  scrollIntoViewOptions?: boolean;
}

interface TourTargets {
  card: HTMLElement;
  head: HTMLElement | null;
  nav: HTMLElement | null;
}

const SessionLauncherValidationTour: React.FC<
  SessionLauncherValidationTourProps
> = ({ open, onClose }) => {
  'use memo';
  const { t } = useTranslation();
  const [hasOpenedValidationTour, setHasOpenedValidationTour] =
    useBAISettingUserState('has_opened_tour_neo_session_validation');

  // PILOT-DECISION: antd Tour took lazy function targets
  // (`target: () => HTMLElement`); lab `TourStep` anchors through a
  // `targetRef` whose element must already exist when the step renders. The
  // same DOM queries now run once in an effect when the tour opens, and the
  // resolved elements are handed to the steps as literal ref objects. The
  // The header anchor is `.bai-card__head`. It was `.ant-card-head`, on the
  // then-true premise that `BAICard` was an unconverted frontier component
  // still rendering antd Card DOM. It converted; the class went with it, the
  // query started returning null, and this step lost its anchor without
  // failing. `BAICard` now emits a BAI-namespaced class for exactly this
  // purpose (see the comment on its header row).
  const [targets, setTargets] = useState<TourTargets | null>(null);

  const isActive = !!open && !hasOpenedValidationTour;

  useEffect(() => {
    // Resolve targets on the next frame (never synchronously in the effect —
    // react-hooks/set-state-in-effect): the error-card DOM this queries is
    // painted by the same commit that flips `isActive`.
    const frame = requestAnimationFrame(() => {
      if (!isActive) {
        setTargets(null);
        return;
      }
      const card = document.getElementsByClassName('bai-card-error')?.[0] as
        HTMLElement | undefined;
      if (!card) {
        setTargets(null);
        return;
      }
      setTargets({
        card,
        head: card.querySelector<HTMLElement>('.bai-card__head'),
        nav: document.querySelector<HTMLElement>(
          '[data-test-id="neo-session-launcher-tour-step-navigation"]',
        ),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  if (!isActive || !targets) return null;

  const handleDismiss = () => {
    onClose?.();
    setHasOpenedValidationTour(true);
  };

  return (
    <BAITourAstryx
      isActive
      hasBackdrop
      isStepCountShown
      onDismiss={handleDismiss}
      // One entry per rendered step, in step order (nulls are skipped below).
      scrollTargets={[targets.card, targets.head, targets.nav].filter(
        (el): el is HTMLElement => el != null,
      )}
    >
      <TourStep
        targetRef={{ current: targets.card }}
        heading={t('tourGuide.neoSessionLauncher.ValidationErrorTitle')}
      >
        {t('tourGuide.neoSessionLauncher.ValidationErrorText')}
      </TourStep>
      {targets.head ? (
        <TourStep
          targetRef={{ current: targets.head }}
          heading={t('tourGuide.neoSessionLauncher.ValidationErrorTitle')}
        >
          {t('tourGuide.neoSessionLauncher.FixErrorFieldByModifyButton')}
        </TourStep>
      ) : null}
      {targets.nav ? (
        <TourStep
          targetRef={{ current: targets.nav }}
          heading={t('tourGuide.neoSessionLauncher.ValidationErrorTitle')}
        >
          {t('tourGuide.neoSessionLauncher.FixErrorAndTryAgainText')}
        </TourStep>
      ) : null}
    </BAITourAstryx>
  );
};

export default SessionLauncherValidationTour;
