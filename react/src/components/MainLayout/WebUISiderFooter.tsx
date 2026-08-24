/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import { theme } from '../../theme-shim';
import AboutBackendAIModal from '../AboutBackendAIModal';
import PrivacyPolicyModal from '../PrivacyPolicyModal';
import SignoutModal from '../SignoutModal';
import TermsOfServiceModal from '../TermsOfServiceModal';
import { Divider } from '@astryxdesign/core/Divider';
import { Link } from '@astryxdesign/core/Link';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useToggle } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  // `Link`'s own `color` lands on the inner `Text` too, so a rest/hover pair
  // needs `color="inherit"` plus this override on the anchor. FR-3512.
  footerLink: {
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': colorVars['--color-text-accent'],
    },
  },
});

/**
 * Terms/privacy/about/signout links plus the version line, with the modals
 * they open. Shared by the sider rail footer and the mobile nav drawer
 * (FR-3612); at most one instance is mounted at a time.
 */
const WebUISiderFooter: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { themeConfig } = useCustomThemeConfig();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);
  const [isOpenTOSModal, { toggle: toggleTOSModal }] = useToggle(false);
  const [isOpenPrivacyPolicyModal, { toggle: togglePrivacyPolicyModal }] =
    useToggle(false);
  const [isOpenAboutBackendAIModal, { toggle: toggleAboutBackendAIModal }] =
    useToggle(false);

  const modals = (
    <>
      <TermsOfServiceModal
        open={isOpenTOSModal}
        onRequestClose={toggleTOSModal}
      />
      <PrivacyPolicyModal
        open={isOpenPrivacyPolicyModal}
        onRequestClose={togglePrivacyPolicyModal}
      />
      <AboutBackendAIModal
        open={isOpenAboutBackendAIModal}
        onRequestClose={toggleAboutBackendAIModal}
      />
      <SignoutModal
        open={isOpenSignoutModal}
        onRequestClose={toggleSignoutModal}
      />
    </>
  );

  return (
    // Chrome-level block: links stay at `supporting` size and secondary
    // tone at rest, taking the accent only on hover. FR-3512.
    <VStack
      gap={2}
      align="center"
      className="terms-of-use"
      style={{ textAlign: 'center', paddingBlockEnd: token.paddingSM }}
    >
      <Divider />
      <HStack gap={1} justify="center" wrap="wrap">
        <Link
          data-testid="button-terms-of-service"
          type="supporting"
          color="inherit"
          xstyle={styles.footerLink}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleTOSModal();
          }}
        >
          {t('webui.menu.TermsOfService')}
        </Link>
        <Text type="supporting">·</Text>
        <Link
          data-testid="button-privacy-policy"
          type="supporting"
          color="inherit"
          xstyle={styles.footerLink}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            togglePrivacyPolicyModal();
          }}
        >
          {t('webui.menu.PrivacyPolicy')}
        </Link>
        <Text type="supporting">·</Text>
        <Link
          data-testid="button-about-backend-ai"
          type="supporting"
          color="inherit"
          xstyle={styles.footerLink}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleAboutBackendAIModal();
          }}
        >
          {t('webui.menu.AboutBackendAI')}
        </Link>
        {!!baiClient?._config?.allowSignout && (
          <>
            <Text type="supporting">·</Text>
            <Link
              data-testid="button-leave-service"
              type="supporting"
              color="inherit"
              xstyle={styles.footerLink}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleSignoutModal();
              }}
            >
              {t('webui.menu.LeaveService')}
            </Link>
          </>
        )}
      </HStack>
      <Text type="supporting" size="xsm" as="div">
        <address className="sidebar-footer">
          {themeConfig?.branding?.companyName || 'Lablup Inc.'}
          &nbsp;
          {/* @ts-ignore */}
          {`${globalThis.packageVersion}.${globalThis.buildNumber}`}
        </address>
      </Text>
      {modals}
    </VStack>
  );
};

export default WebUISiderFooter;
