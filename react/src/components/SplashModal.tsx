import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps, BAIText } from 'backend.ai-ui';
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

  let licenseText = '';
  if (edition !== 'Open Source') {
    if (
      validUntil === '2099-12-31' ||
      validUntil === '""' ||
      validUntil === ''
    ) {
      licenseText = t('license.Perpetual');
    } else {
      licenseText = t('license.Subscription');
    }
  } else {
    licenseText = t('license.OpenSource');
  }

  const logoSrc = isDarkMode
    ? 'manifest/backend.ai-text-bgdark.svg'
    : 'manifest/backend.ai-text.svg';

  return (
    <BAIModal
      {...modalProps}
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
        <BAIText style={{ fontSize: 13 }}>
          Backend.AI Web UI <span>{version}</span>
        </BAIText>
        <BAIText style={{ fontSize: 13 }}>{edition} Edition</BAIText>
        {licenseText === t('license.Subscription') && validUntil ? (
          <BAIText style={{ fontSize: 13 }}>
            Subscription is active until {validUntil}
          </BAIText>
        ) : licenseText === t('license.Perpetual') ? (
          <BAIText style={{ fontSize: 13 }}>Perpetual License</BAIText>
        ) : null}
        <div style={{ marginTop: 15 }}>
          <BAIText style={{ fontSize: 13 }}>
            Backend.AI Cluster {managerVersion}
          </BAIText>
        </div>
        <BAIText style={{ fontSize: 13 }}>
          {isElectron ? 'App' : 'WebServer'} Build {buildVersion}
        </BAIText>
      </BAIFlex>
      <BAIFlex
        direction="column"
        gap="xs"
        style={{ paddingLeft: 20, marginTop: token.marginSM }}
      >
        <BAIText style={{ fontSize: 13 }}>
          Powered by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/lablup/backend.ai/blob/main/LICENSE"
            style={{ color: token.colorLink }}
          >
            open-source software
          </a>
        </BAIText>
        <BAIText style={{ fontSize: 12 }}>
          Copyright &copy; 2015-2025 Lablup Inc.
        </BAIText>
        <BAIFlex gap="sm">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/lablup/backend.ai-webui/releases/tag/v${version}`}
            style={{ color: token.colorLink, fontSize: 12 }}
          >
            Release Note
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/lablup/backend.ai-webui/blob/main/LICENSE"
            style={{ color: token.colorLink, fontSize: 12 }}
          >
            License
          </a>
        </BAIFlex>
      </BAIFlex>
    </BAIModal>
  );
};

export default SplashModal;
