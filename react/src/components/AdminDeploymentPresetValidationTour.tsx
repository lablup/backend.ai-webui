/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { Tour, TourStep } from '@astryxdesign/lab';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PILOT-DECISION: public props narrowed from antd's
 * `Omit<TourProps, 'steps'>` to the two props the sole consumer
 * (`AdminDeploymentPresetSettingPageContent`) actually passes (`open`,
 * `onClose`). The lab Tour's surface is entirely different, so the blanket
 * antd-prop passthrough (`{...otherProps}`) had nothing left to carry.
 * `onClose` loses antd's mouse-event argument — the consumer ignores it.
 */
interface PresetValidationTourProps {
  open?: boolean;
  onClose?: () => void;
}

interface TourTargets {
  card: HTMLElement;
  extra: HTMLElement | null;
  nav: HTMLElement | null;
}

const PresetValidationTour: React.FC<PresetValidationTourProps> = ({
  open,
  onClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [hasOpened, setHasOpened] = useBAISettingUserState(
    'has_opened_tour_deployment_preset_validation',
  );

  // PILOT-DECISION: antd Tour took lazy function targets
  // (`target: () => HTMLElement`); lab `TourStep` anchors through a
  // `targetRef` whose element must already exist when the step renders. The
  // same DOM queries now run once in an effect when the tour opens, and the
  // resolved elements are handed to the steps as literal ref objects. Each
  // target contains a real `<button>` (the review card's Modify link / the
  // footer nav buttons), satisfying the Popover anchor contract. The
  // `.ant-card-extra` selector is intentional: BAICard is an unconverted BUI
  // frontier component and still renders antd Card DOM.
  const [targets, setTargets] = useState<TourTargets | null>(null);

  const isActive = !!open && !hasOpened;

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
      // antd `scrollIntoViewOptions` parity: bring the first target on screen.
      card.scrollIntoView({ block: 'center' });
      setTargets({
        card,
        extra: card.querySelector<HTMLElement>('.ant-card-extra'),
        nav: document.querySelector<HTMLElement>(
          '[data-test-id="deployment-preset-step-navigation"]',
        ),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  if (!isActive || !targets) return null;

  const handleDismiss = () => {
    onClose?.();
    setHasOpened(true);
  };

  return (
    <Tour isActive hasBackdrop isStepCountShown onDismiss={handleDismiss}>
      <TourStep
        targetRef={{ current: targets.card }}
        heading={t('tourGuide.deploymentPreset.ValidationErrorTitle')}
      >
        {t('tourGuide.deploymentPreset.ValidationErrorText')}
      </TourStep>
      {targets.extra ? (
        <TourStep
          targetRef={{ current: targets.extra }}
          heading={t('tourGuide.deploymentPreset.ValidationErrorTitle')}
        >
          {t('tourGuide.deploymentPreset.FixErrorFieldByModifyButton')}
        </TourStep>
      ) : null}
      {targets.nav ? (
        <TourStep
          targetRef={{ current: targets.nav }}
          heading={t('tourGuide.deploymentPreset.ValidationErrorTitle')}
        >
          {t('tourGuide.deploymentPreset.FixErrorAndTryAgainText')}
        </TourStep>
      ) : null}
    </Tour>
  );
};

export default PresetValidationTour;
