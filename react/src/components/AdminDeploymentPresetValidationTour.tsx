/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { Tour } from 'antd';
import type { TourProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PresetValidationTourProps extends Omit<TourProps, 'steps'> {}

const PresetValidationTour: React.FC<PresetValidationTourProps> = ({
  open,
  onClose,
  ...otherProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [hasOpened, setHasOpened] = useBAISettingUserState(
    'has_opened_tour_deployment_preset_validation',
  );

  const steps: TourProps['steps'] = [
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.ValidationErrorText'),
      target: () =>
        document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement,
    },
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.FixErrorFieldByModifyButton'),
      target: () =>
        (
          document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement
        )?.querySelector('.ant-card-extra') as HTMLElement,
    },
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.FixErrorAndTryAgainText'),
      target: () =>
        document.querySelector(
          '[data-test-id="deployment-preset-step-navigation"]',
        ) as HTMLElement,
    },
  ];

  return (
    <Tour
      steps={steps}
      open={!hasOpened && open}
      onClose={(e) => {
        onClose?.(e);
        setHasOpened(true);
      }}
      scrollIntoViewOptions
      {...otherProps}
    />
  );
};

export default PresetValidationTour;
