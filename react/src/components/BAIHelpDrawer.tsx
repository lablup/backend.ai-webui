import { ExportOutlined } from '@ant-design/icons';
import { Button, Drawer, DrawerProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BAIHelpDrawerProps extends DrawerProps {
  // Base URL of the manual
  manualURL: string;
  // URL matching table. Key is the URL of the page, value is the URL of the manual page.
  URLMatchingTable?: { [key: string]: string };
  // Key of the URL matching table. If not specified, the manualURL is used.
  matchingKey?: string;
}

const BAIHelpDrawer: React.FC<BAIHelpDrawerProps> = ({
  manualURL,
  URLMatchingTable = {},
  matchingKey = '',
  ...props
}) => {
  const { t } = useTranslation();

  const URL =
    manualURL + (matchingKey ? URLMatchingTable[matchingKey] || '' : '');

  const ExternalContentDisplay = () => {
    return (
      <iframe
        src={URL}
        title="External content"
        style={{
          width: '100%',
          height: '100%',
          border: '0px',
        }}
        allow="fullscreen"
      />
    );
  };

  return (
    <Drawer
      title={t('webui.menu.Help')}
      extra={<Button icon={<ExportOutlined />} type="link" href={URL} />}
      size="large"
      styles={{
        // mask: { backgroundColor: 'transparent' },
        body: {
          padding: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
        header: {
          padding: 15,
        },
      }}
      {...props}
    >
      <ExternalContentDisplay />
    </Drawer>
  );
};

export default BAIHelpDrawer;
