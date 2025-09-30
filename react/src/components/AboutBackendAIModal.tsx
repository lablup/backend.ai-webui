import { useCustomThemeConfig } from '../helper/customThemeConfig';
import { useSuspendedBackendaiClient } from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import { Typography } from 'antd';
import { BAILink, BAIModal, BAIModalProps } from 'backend.ai-ui';

interface AboutBackendAIModalProps extends BAIModalProps {
  onRequestClose: () => void;
}
const AboutBackendAIModal = ({
  onRequestClose,
  ...props
}: AboutBackendAIModalProps) => {
  const themeConfig = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();
  const baiClient = useSuspendedBackendaiClient();
  // @ts-ignore
  const packageVersion = globalThis.packageVersion;
  // @ts-ignore
  const packageValidUntil = globalThis.packageValidUntil;
  // @ts-ignore
  const packageEdition = globalThis.packageEdition;
  // @ts-ignore
  const buildVersion = globalThis.buildVersion;
  // @ts-ignore
  const isElectron = globalThis.isElectron;

  return (
    <BAIModal
      className="about-backendai-modal"
      title={
        <img
          className="about-logo-img"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            isDarkMode && themeConfig?.logo?.srcDark
              ? themeConfig?.logo?.src || '/manifest/backend.ai-white-text.svg'
              : themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-white-text.svg'
          }
          style={{
            width: themeConfig?.logo?.aboutModalSize?.width || 159,
            height: themeConfig?.logo?.aboutModalSize?.height || 24,
            cursor: 'pointer',
          }}
        />
      }
      onCancel={onRequestClose}
      destroyOnClose
      footer={null}
      width={350}
      {...props}
    >
      <Typography.Paragraph>
        Backend.AI Web UI {packageVersion}
        <br />
        {packageEdition} Edition
        <br />
        {(() => {
          if (packageEdition !== 'Open Source') {
            if (
              packageValidUntil === '2099-12-31' ||
              packageValidUntil === '""' ||
              packageValidUntil === ''
            ) {
              return 'Perpetual License';
            } else {
              return `Subscription is active until ${packageValidUntil}`;
            }
          } else {
            return '';
          }
        })()}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Backend.AI Cluster {baiClient.managerVersion}
        <br />
        {isElectron ? 'App' : 'WebServer'} Build {buildVersion}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Powered by{' '}
        <BAILink
          target="_blank"
          to={'https://github.com/lablup/backend.ai/blob/main/LICENSE'}
        >
          open-source software
        </BAILink>
        <br />
        Copyright &copy; 2015-2025 Lablup Inc.
        <br />
        <BAILink
          target="_blank"
          to={`https://github.com/lablup/backend.ai-webui/releases/tag/v${
            packageVersion
          }`}
        >
          Release Note
        </BAILink>
        &nbsp;
        <BAILink
          target="_blank"
          to={'https://github.com/lablup/backend.ai-webui/blob/main/LICENSE'}
        >
          License
        </BAILink>
      </Typography.Paragraph>
    </BAIModal>
  );
};

export default AboutBackendAIModal;
