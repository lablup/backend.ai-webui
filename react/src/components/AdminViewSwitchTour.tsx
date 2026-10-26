/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { useRouteScope } from '../hooks/useRouteScope';
import BAITour from './BAITour';
import useTourTargets from './useTourTargets';
import { List, ListItem } from '@lablup/ui-common/List';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import { TourStep } from '@lablup/ui-common/lab';
import { BAIModal } from 'backend.ai-ui';
import { CircleUserRound, LogIn, ShieldUser } from 'lucide-react';
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
        footer={(_, { OkBtn }) => (
          <HStack justify="end">
            <OkBtn />
          </HStack>
        )}
      >
        <VStack gap={3}>
          <Text>{t('tourGuide.adminViewSwitch.AdminLandingText')}</Text>
          <List>
            <ListItem
              startContent={<LogIn size="1.25em" />}
              label={t('tourGuide.adminViewSwitch.AdminLandingStartTitle')}
              description={
                <Text type="supporting" color="secondary">
                  {t('tourGuide.adminViewSwitch.AdminLandingStartText')}
                </Text>
              }
            />
            <ListItem
              startContent={<CircleUserRound size="1.25em" />}
              label={t('tourGuide.adminViewSwitch.AdminLandingMenuTitle')}
              description={
                <Text type="supporting" color="secondary">
                  {t('tourGuide.adminViewSwitch.AdminLandingMenuText')}
                </Text>
              }
            />
            <ListItem
              startContent={<ShieldUser size="1.25em" />}
              label={t('tourGuide.adminViewSwitch.AdminLandingProjectTitle')}
              description={
                <Text type="supporting" color="secondary">
                  {t('tourGuide.adminViewSwitch.AdminLandingProjectText')}
                </Text>
              }
            />
          </List>
        </VStack>
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
