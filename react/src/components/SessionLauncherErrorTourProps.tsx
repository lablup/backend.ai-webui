import { useBAISettingUserState } from '../hooks/useBAISetting';
import { Tour, type TourProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionLauncherValidationTourProps extends Omit<TourProps, 'steps'> {}
const SessionLauncherValidationTour: React.FC<
  SessionLauncherValidationTourProps
> = ({ open, onClose, ...otherProps }) => {
  const { t } = useTranslation();
  const [hasOpenedValidationTour, setHasOpenedValidationTour] =
    useBAISettingUserState('has_opened_tour_neo_session_validation');

  const steps = [
    {
      title: t('tourGuide.neoSessionLauncher.ValidationErrorTitle'),
      description: t('tourGuide.neoSessionLauncher.ValidationErrorText'),
      target: () =>
        document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement,
    },
    {
      title: t('tourGuide.neoSessionLauncher.ValidationErrorTitle'),
      description: t(
        'tourGuide.neoSessionLauncher.FixErrorFieldByModifyButton',
      ),
      target: () =>
        (
          document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement
        )?.querySelector('.ant-card-extra') as HTMLElement,
    },
    {
      title: t('tourGuide.neoSessionLauncher.ValidationErrorTitle'),
      description: t('tourGuide.neoSessionLauncher.FixErrorAndTryAgainText'),
      target: () =>
        document.querySelector(
          '[data-test-id="neo-session-launcher-tour-step-navigation"]',
        ) as HTMLElement,
    },
  ];
  return (
    <Tour
      steps={steps}
      onClose={(e) => {
        onClose?.(e);
        setHasOpenedValidationTour(true);
      }}
      open={!hasOpenedValidationTour && open}
      {...otherProps}
    />
  );
};

export default SessionLauncherValidationTour;
