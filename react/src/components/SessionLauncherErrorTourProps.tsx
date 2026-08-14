/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
// Mirrors `AdminDeploymentPresetValidationTour` — the same three-step
// "you have a validation error" tour.
import BAITourAstryx from './astryx-bui/BAITourAstryx';
import { useTourTargets } from './astryx-bui/useTourTargets';
import { TourStep } from '@astryxdesign/lab';
import React from 'react';
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

  // lab `TourStep` anchors through a `targetRef` whose element must already
  // exist when the step renders, so the DOM queries run in an effect and the
  // resolved elements are handed to the steps as literal ref objects.
  // The header anchor is `.bai-card__head` — `BAICard` emits a BAI-namespaced
  // class for exactly this purpose (see the comment on its header row).
  const isActive = !!open && !hasOpenedValidationTour;

  const targets = useTourTargets<TourTargets>(isActive, () => {
    const card = document.getElementsByClassName('bai-card-error')?.[0] as
      HTMLElement | undefined;
    if (!card) {
      return null;
    }
    return {
      card,
      head: card.querySelector<HTMLElement>('.bai-card__head'),
      nav: document.querySelector<HTMLElement>(
        '[data-test-id="neo-session-launcher-tour-step-navigation"]',
      ),
    };
  });

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
