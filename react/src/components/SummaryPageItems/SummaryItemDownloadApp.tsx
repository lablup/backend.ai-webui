import { useSuspendedBackendaiClient } from '../../hooks';
import Flex from '../Flex';
import { Button, Select, Typography, theme } from 'antd';
import { useState } from 'react';

const detectDefaultOS = () => {
  if (navigator.userAgent.indexOf('Mac') !== -1) return 'MacOS';
  if (navigator.userAgent.indexOf('Win') !== -1) return 'Windows';
  if (navigator.userAgent.indexOf('Linux') !== -1) return 'Linux';
  return 'MacOS';
};

const SummaryItemDownloadApp: React.FC = () => {
  const { token } = theme.useToken();
  const [OS, setOS] = useState(detectDefaultOS());

  const baiClient = useSuspendedBackendaiClient();
  const url = baiClient._config.appDownloadUrl;

  const appDownloadMap: Record<string, any> = {
    Linux: {
      os: 'linux',
      architecture: ['arm64', 'x64'],
      extension: 'zip',
    },
    MacOS: {
      os: 'macos',
      architecture: ['arm64', 'x64'],
      extension: 'dmg',
    },
    Windows: {
      os: 'win',
      architecture: ['arm64', 'x64'],
      extension: 'zip',
    },
  };
  const downloadApp = (architecture: string) => {
    //@ts-ignore
    const pkgVersion = globalThis.packageVersion;
    const os = appDownloadMap[OS].os;
    const extension = appDownloadMap[OS].extension;
    const downloadLink = `${url}/v${pkgVersion}/backend.ai-desktop-${pkgVersion}-${os}-${architecture}.${extension}`;
    window.open(downloadLink, '_blank');
  };

  return (
    <Flex
      direction="column"
      justify="between"
      align="start"
      style={{ gap: token.paddingMD }}
    >
      <Select
        defaultValue={OS}
        options={[
          { value: 'MacOS', label: 'MacOS' },
          { value: 'Windows', label: 'Windows' },
          { value: 'Linux', label: 'Linux' },
        ]}
        style={{
          width: '100%',
          height: '50px',
        }}
        onChange={(value) => setOS(value)}
        dropdownRender={(menu) => (
          <Typography.Text className="drag-cancel-component">
            {menu}
          </Typography.Text>
        )}
      />
      <Flex style={{ width: '100%', gap: token.paddingXS }}>
        {appDownloadMap[OS].architecture.map((arch: any) => (
          <Button
            key={arch}
            size="large"
            style={{ flex: 1, color: token.colorPrimary }}
            onClick={(e: any) => {
              downloadApp(e.target.innerText.toLowerCase());
            }}
          >
            {arch}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};

export default SummaryItemDownloadApp;
