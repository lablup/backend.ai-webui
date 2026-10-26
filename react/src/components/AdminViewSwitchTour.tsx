/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { useRouteScope } from '../hooks/useRouteScope';
import BAITour from './BAITour';
import useTourTargets from './useTourTargets';
import { TourStep } from '@lablup/ui-common/lab';
import { BAIModal } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Shows a superadmin, once each, where the user menu switches between the
 * system admin pages and the user view.
 */
const AdminViewSwitchTour: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const isSuperAdmin = useEffectiveAdminRole() === 'superadmin';
  const scope = useRouteScope();
  const [hasOpenedBackToUserView, setHasOpenedBackToUserView] =
    useBAISettingUserState('has_opened_tour_back_to_user_view');
  const [hasOpenedBackToAdminSettings, setHasOpenedBackToAdminSettings] =
    useBAISettingUserState('has_opened_tour_back_to_admin_settings');
  // The admin tour opens with a target-less intro, which a TourStep cannot
  // render (it anchors a Popover), so that step is a modal.
  const [isIntroDone, setIsIntroDone] = useState(false);

  const isAdminTour =
    isSuperAdmin && scope === 'admin' && !hasOpenedBackToUserView;
  const isUserTour =
    isSuperAdmin && scope === 'project' && !hasOpenedBackToAdminSettings;
  const isIntroShown = isAdminTour && !isIntroDone;
  const isSpotlightActive = (isAdminTour && isIntroDone) || isUserTour;

  const target = useTourTargets<HTMLElement>(isSpotlightActive, () =>
    document.querySelector<HTMLElement>('[data-testid="user-dropdown-button"]'),
  );

  const dismiss = () => {
    if (isAdminTour) {
      setHasOpenedBackToUserView(true);
    } else {
      setHasOpenedBackToAdminSettings(true);
    }
  };

  if (isIntroShown) {
    return (
      <BAIModal
        open
        title={t('tourGuide.adminViewSwitch.AdminLandingTitle')}
        okText={t('button.Next')}
        onOk={() => setIsIntroDone(true)}
        onCancel={dismiss}
        footer={(_, { OkBtn }) => <OkBtn />}
      >
        {t('tourGuide.adminViewSwitch.AdminLandingText')}
      </BAIModal>
    );
  }

  if (!isSpotlightActive || !target) return null;

  return (
    <BAITour
      // Remount when the tour switches, so each starts at its own first step.
      key={isAdminTour ? 'admin' : 'user'}
      isActive
      hasBackdrop
      onDismiss={dismiss}
    >
      <TourStep
        targetRef={{ current: target }}
        heading={
          isAdminTour
            ? t('tourGuide.adminViewSwitch.BackToUserViewTitle')
            : t('tourGuide.adminViewSwitch.BackToAdminSettingsTitle')
        }
      >
        {isAdminTour
          ? t('tourGuide.adminViewSwitch.BackToUserViewText')
          : t('tourGuide.adminViewSwitch.BackToAdminSettingsText')}
      </TourStep>
    </BAITour>
  );
};

export default AdminViewSwitchTour;
