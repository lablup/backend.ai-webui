/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useAppDownloadMap,
  useCliDownloadMap,
  useSuspendedBackendaiClient,
} from '../hooks';
import BAITabs from './BAITabs';
import SourceCodeView from './SourceCodeView';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  filterOutEmpty,
} from 'backend.ai-ui';
import { map, toUpper } from 'lodash-es';
import { Download } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DesktopAppDownloadTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { selectedOS, setSelectedOS, OS, architectures, getDownloadLink } =
    useAppDownloadMap();

  return (
    // antd `Descriptions column={1} bordered` -> Astryx `MetadataList
    // columns="single"` (MAPPING §4). `bordered` has NO destination and is
    // dropped: MetadataList lays out label/value rows without a grid frame.
    <MetadataList columns="single">
      <MetadataListItem label={t('summary.OS')}>
        {/* antd `Select` with `Select.Option` children -> `Selector` with an
            `options` array; `label` is required and hidden because the
            metadata row already prints it. */}
        <Selector
          label={t('summary.OS')}
          isLabelHidden
          value={selectedOS}
          // Astryx `Selector` commits a plain `string`; the hook's setter is
          // typed on the OS literal union, so the narrowing happens here.
          onChange={(value) => setSelectedOS(value as typeof selectedOS)}
          options={map(OS, (os) => ({ value: os, label: os }))}
        />
      </MetadataListItem>
      <MetadataListItem label={t('webui.menu.Architecture')}>
        <BAIFlex gap={'xs'} justify="between">
          {map(architectures, (arch: 'arm64' | 'x64') => (
            // antd v6 `Button variant="outlined" color="primary"` ->
            // Astryx `variant="secondary"` (the bordered, non-filled
            // treatment); `style={{flex:1}}` -> `width="100%"` inside the
            // flex row, and the children become the required `label`.
            <Tooltip content={t('webui.menu.ClickToDownload')} key={arch}>
              <Button
                key={arch}
                onClick={() =>
                  window.open(
                    getDownloadLink(arch),
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                width="100%"
                variant="secondary"
                icon={<Download size="1em" />}
                label={toUpper(arch)}
              />
            </Tooltip>
          ))}
        </BAIFlex>
      </MetadataListItem>
    </MetadataList>
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
            <Text weight="semibold">{t('summary.CLIDownloadExecutable')}</Text>
            <MetadataList columns="single">
              <MetadataListItem label={t('summary.OS')}>
                <Selector
                  label={t('summary.OS')}
                  isLabelHidden
                  value={selectedOS}
                  onChange={(value) =>
                    setSelectedOS(value as typeof selectedOS)
                  }
                  options={map(OS, (os) => ({ value: os, label: os }))}
                />
              </MetadataListItem>
              <MetadataListItem label={t('webui.menu.Architecture')}>
                <BAIFlex gap={'xs'} justify="between">
                  {map(architectures, (arch: 'x86_64' | 'aarch64') => (
                    <Tooltip
                      content={t('webui.menu.ClickToDownload')}
                      key={arch}
                    >
                      <Button
                        key={arch}
                        onClick={() =>
                          window.open(
                            getDownloadLink(arch),
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                        width="100%"
                        variant="secondary"
                        icon={<Download size="1em" />}
                        label={arch}
                      />
                    </Tooltip>
                  ))}
                </BAIFlex>
              </MetadataListItem>
            </MetadataList>
            {selectedOS === 'MacOS' ? (
              <Banner
                status="warning"
                title={t('summary.CLIMacOSUnsignedTitle')}
                description={
                  <BAIFlex direction="column" align="stretch" gap="xs">
                    <Text color="secondary">
                      {t('summary.CLIMacOSUnsignedDescription')}
                    </Text>
                    <SourceCodeView language="shell">
                      {macOSUnblockSnippet}
                    </SourceCodeView>
                  </BAIFlex>
                }
              />
            ) : (
              <BAIFlex direction="column" align="stretch" gap="xs">
                <Text color="secondary">
                  {t('summary.CLIRunExecutableDescription')}
                </Text>
                <SourceCodeView language="shell">{runSnippet}</SourceCodeView>
              </BAIFlex>
            )}
          </BAIFlex>
          <Divider />
        </>
      ) : null}
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Text weight="semibold">{t('summary.CLIInstallViaPip')}</Text>
        <Text color="secondary">{t('summary.CLIGetStartedDescription')}</Text>
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
      {/* antd `Tabs items` (with `children` panels) -> `BAITabs`, the
          frontier wrapper that keeps the antd-shaped `items` contract and
          renders the active panel itself (Astryx `TabList` is navigation
          only). */}
      {/* `type="line"`: this modal used a PLAIN antd `Tabs` on `main`, i.e. the
          underlined strip — not the card tabs `BAITabs` now defaults to. */}
      <BAITabs items={tabItems} type="line" />
    </BAIModal>
  );
};

export default DownloadModal;
