/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useAppDownloadMap,
  useCliDownloadMap,
  useSuspendedBackendaiClient,
} from '../hooks';
import SourceCodeView from './SourceCodeView';
import { DownloadOutlined } from '@ant-design/icons';
import {
  Alert,
  Select,
  Button,
  Descriptions,
  Divider,
  Tooltip,
  Tabs,
  Typography,
} from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  filterOutEmpty,
} from 'backend.ai-ui';
import { map, toUpper } from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DesktopAppDownloadTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { selectedOS, setSelectedOS, OS, architectures, getDownloadLink } =
    useAppDownloadMap();

  return (
    <Descriptions column={1} bordered>
      <Descriptions.Item label={t('summary.OS')}>
        <Select
          value={selectedOS}
          onChange={(value) => setSelectedOS(value)}
          style={{ width: '100%' }}
        >
          {map(OS, (os) => (
            <Select.Option key={os} value={os}>
              {os}
            </Select.Option>
          ))}
        </Select>
      </Descriptions.Item>
      <Descriptions.Item label={t('webui.menu.Architecture')}>
        <BAIFlex gap={'xs'} justify="between">
          {map(architectures, (arch: 'arm64' | 'x64') => (
            <Tooltip title={t('webui.menu.ClickToDownload')} key={arch}>
              <Button
                key={arch}
                onClick={() =>
                  window.open(
                    getDownloadLink(arch),
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                style={{ flex: 1 }}
                variant="outlined"
                color="primary"
                icon={<DownloadOutlined />}
              >
                {toUpper(arch)}
              </Button>
            </Tooltip>
          ))}
        </BAIFlex>
      </Descriptions.Item>
    </Descriptions>
  );
};

const CLIDownloadTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const {
    cliDownloadUrl,
    selectedOS,
    setSelectedOS,
    OS,
    architectures,
    getDownloadLink,
  } = useCliDownloadMap();

  // The endpoint is pre-filled from the current session; the keypair is left as
  // a placeholder so secrets are never rendered — the user pastes their own.
  const endpoint = baiClient?._config?.endpoint ?? '';
  // Single-quote-escape so an endpoint containing shell metacharacters
  // (`$`, backticks, …) can't trigger expansion when the snippet is pasted.
  const shellSingleQuote = (value: string) =>
    `'${value.replace(/'/g, `'\\''`)}'`;

  // The client requires Python 3.13 (~=3.13.7). Pin it inside a venv and
  // upgrade pip first, otherwise a stale pip on newer Python (e.g. 3.14) walks
  // back to a 4-year-old client whose transitive build (PyYAML) then fails.
  // Pin the install to the connected manager version so client and server match
  // (this also stops the silent fallback to the ancient release).
  const managerVersion = baiClient?.managerVersion;
  const pipInstall = managerVersion
    ? `pip install "backend.ai-client==${managerVersion}"`
    : 'pip install backend.ai-client';
  const pipSnippet = [
    '# Backend.AI CLI requires Python 3.13 (3.14+ is not supported yet)',
    'python3.13 -m venv .venv',
    'source .venv/bin/activate',
    'pip install -U pip',
    pipInstall,
    '',
    `export BACKEND_ENDPOINT=${shellSingleQuote(endpoint)}`,
    "export BACKEND_ACCESS_KEY='<your-access-key>'",
    "export BACKEND_SECRET_KEY='<your-secret-key>'",
    '',
    '# Examples',
    `backend.ai run python -c "print('Hello Backend.AI!')"`,
    'backend.ai ps',
    'backend.ai --help',
  ].join('\n');

  // Generic "how to run" guidance for the downloaded binary (Linux etc.).
  const runSnippet = [
    'chmod +x ./backendai-client-<os>-<arch>',
    './backendai-client-<os>-<arch> --help',
    '',
    '# optional: install onto your PATH as `backend.ai`',
    'sudo install -m 755 ./backendai-client-<os>-<arch> /usr/local/bin/backend.ai',
  ].join('\n');

  // The macOS build is not notarized yet, so Gatekeeper quarantines it.
  const macOSUnblockSnippet = [
    'chmod +x ./backendai-client-macos-aarch64',
    'xattr -d com.apple.quarantine ./backendai-client-macos-aarch64',
    './backendai-client-macos-aarch64 --help',
  ].join('\n');

  return (
    <BAIFlex direction="column" align="stretch" gap="lg">
      {cliDownloadUrl ? (
        <>
          <BAIFlex direction="column" align="stretch" gap="sm">
            <Typography.Text strong>
              {t('summary.CLIDownloadExecutable')}
            </Typography.Text>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t('summary.OS')}>
                <Select
                  value={selectedOS}
                  onChange={(value) => setSelectedOS(value)}
                  style={{ width: '100%' }}
                >
                  {map(OS, (os) => (
                    <Select.Option key={os} value={os}>
                      {os}
                    </Select.Option>
                  ))}
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label={t('webui.menu.Architecture')}>
                <BAIFlex gap={'xs'} justify="between">
                  {map(architectures, (arch: 'x86_64' | 'aarch64') => (
                    <Tooltip title={t('webui.menu.ClickToDownload')} key={arch}>
                      <Button
                        key={arch}
                        onClick={() =>
                          window.open(
                            getDownloadLink(arch),
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                        style={{ flex: 1 }}
                        variant="outlined"
                        color="primary"
                        icon={<DownloadOutlined />}
                      >
                        {arch}
                      </Button>
                    </Tooltip>
                  ))}
                </BAIFlex>
              </Descriptions.Item>
            </Descriptions>
            {selectedOS === 'MacOS' ? (
              <Alert
                type="warning"
                showIcon
                title={t('summary.CLIMacOSUnsignedTitle')}
                description={
                  <BAIFlex direction="column" align="stretch" gap="xs">
                    <Typography.Text type="secondary">
                      {t('summary.CLIMacOSUnsignedDescription')}
                    </Typography.Text>
                    <SourceCodeView language="shell">
                      {macOSUnblockSnippet}
                    </SourceCodeView>
                  </BAIFlex>
                }
              />
            ) : (
              <BAIFlex direction="column" align="stretch" gap="xs">
                <Typography.Text type="secondary">
                  {t('summary.CLIRunExecutableDescription')}
                </Typography.Text>
                <SourceCodeView language="shell">{runSnippet}</SourceCodeView>
              </BAIFlex>
            )}
          </BAIFlex>
          <Divider style={{ margin: 0 }} />
        </>
      ) : null}
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Typography.Text strong>
          {t('summary.CLIInstallViaPip')}
        </Typography.Text>
        <Typography.Text type="secondary">
          {t('summary.CLIGetStartedDescription')}
        </Typography.Text>
        <SourceCodeView language="shell">{pipSnippet}</SourceCodeView>
      </BAIFlex>
    </BAIFlex>
  );
};

interface DownloadModalProps extends BAIModalProps {
  onRequestClose?: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const showDesktopApp = baiClient?._config?.allowAppDownloadPanel;
  const showCLI = baiClient?._config?.allowCLIDownloadPanel;

  const tabItems = filterOutEmpty([
    showDesktopApp && {
      key: 'desktop',
      label: t('summary.DesktopApp'),
      children: <DesktopAppDownloadTab />,
    },
    showCLI && {
      key: 'cli',
      label: t('summary.CLI'),
      children: <CLIDownloadTab />,
    },
  ]);

  return (
    <BAIModal
      title={t('summary.Downloads')}
      onCancel={onRequestClose}
      footer={null}
      styles={{ body: { paddingTop: 0 } }}
      {...baiModalProps}
    >
      <Tabs items={tabItems} />
    </BAIModal>
  );
};

export default DownloadModal;
