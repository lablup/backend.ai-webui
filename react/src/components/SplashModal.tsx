import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from 'antd';
import {
  BAIFlex,
  BAILink,
  BAIModal,
  BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SplashModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const SplashModal: React.FC<SplashModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  const edition = globalThis.packageEdition || 'Open Source';
  const version = globalThis.packageVersion || '';
  const validUntil = globalThis.packageValidUntil || '';
  const managerVersion = globalThis.backendaiclient?.managerVersion || '';
  const buildVersion = globalThis.buildVersion || '';
  const isElectron = globalThis.isElectron || false;

  const licenseType =
    edition !== 'Open Source'
      ? validUntil === '2099-12-31' || validUntil === '""' || validUntil === ''
        ? 'perpetual'
        : 'subscription'
      : 'openSource';

  const licenseText =
    licenseType === 'perpetual'
      ? t('license.Perpetual')
      : licenseType === 'subscription'
        ? t('license.Subscription')
        : t('license.OpenSource');

  const logoSrc = isDarkMode
    ? 'manifest/backend.ai-text-bgdark.svg'
    : 'manifest/backend.ai-text.svg';

  return (
    <BAIModal
      {...modalProps}
      destroyOnHidden
      title={
        <div
          style={{
            height: 50,
            width: 280,
            backgroundImage: `url(${logoSrc})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left top',
          }}
        />
      }
      footer={null}
      width={350}
      onCancel={() => onRequestClose()}
      maskClosable={false}
    >
      <BAIFlex direction="column" gap="xs" style={{ paddingLeft: 20 }}>
        <BAIText style={{ fontSize: token.fontSizeSM }}>
          Backend.AI Web UI <span>{version}</span>
        </BAIText>
        <BAIText style={{ fontSize: token.fontSizeSM }}>
          {edition} Edition
        </BAIText>
        {licenseType === 'subscription' && validUntil ? (
          <BAIText style={{ fontSize: token.fontSizeSM }}>
            Subscription is active until {validUntil}
          </BAIText>
        ) : licenseType === 'perpetual' ? (
          <BAIText style={{ fontSize: token.fontSizeSM }}>
            {licenseText}
          </BAIText>
        ) : null}
        <div style={{ marginTop: token.marginMD }}>
          <BAIText style={{ fontSize: token.fontSizeSM }}>
            Backend.AI Cluster {managerVersion}
          </BAIText>
        </div>
        <BAIText style={{ fontSize: token.fontSizeSM }}>
          {isElectron ? 'App' : 'WebServer'} Build {buildVersion}
        </BAIText>
      </BAIFlex>
      <BAIFlex
        direction="column"
        gap="xs"
        style={{ paddingLeft: 20, marginTop: token.marginSM }}
      >
        <BAIText style={{ fontSize: token.fontSizeSM }}>
          Powered by{' '}
          <BAILink
            target="_blank"
            to="https://github.com/lablup/backend.ai/blob/main/LICENSE"
          >
            open-source software
          </BAILink>
        </BAIText>
        <BAIText style={{ fontSize: token.fontSizeSM - 1 }}>
          Copyright &copy; 2015-2025 Lablup Inc.
        </BAIText>
        <BAIFlex gap="sm">
          <BAILink
            target="_blank"
            to={`https://github.com/lablup/backend.ai-webui/releases/tag/v${version}`}
            style={{ fontSize: token.fontSizeSM - 1 }}
          >
            Release Note
          </BAILink>
          <BAILink
            target="_blank"
            to="https://github.com/lablup/backend.ai-webui/blob/main/LICENSE"
            style={{ fontSize: token.fontSizeSM - 1 }}
          >
            License
          </BAILink>
        </BAIFlex>
      </BAIFlex>
    </BAIModal>
  );
};

export default SplashModal;
