import Flex from '../components/Flex';
import BAICard from './BAICard';
import { App, Button, Input, theme } from 'antd';
import type { GetProps } from 'antd';
import React, { useState } from 'react';

// import { useTranslation } from 'react-i18next';

const ImportFromHuggingFacePanel: React.FC = () => {
  // const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [search, setSearch] = useState<string>('');
  type SearchProps = GetProps<typeof Input.Search>;

  const { Search } = Input;
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    // TODO: download model from hugging face by URL
    setSearch(value);
  };

  const handleDownloadClick = () => {
    if (search.trim()) {
      // TODO: Implement the logic to handle the search state (e.g., send it to a server)
      message.info({
        key: 'import-from-hugging-face',
        content: `Downloading model for: ${search}`,
      });
    } else {
      message.warning({
        key: 'import-from-hugging-face',
        content: 'Please enter a valid search term.',
      });
    }
  };

  return (
    <BAICard
      style={{
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url(/resources/images/model-player/hugging-face-background.jpg)',
      }}
    >
      <Flex
        direction="row"
        align="center"
        justify="center"
        style={{ padding: '20px' }}
        gap={'sm'}
      >
        <Search
          placeholder="Import From Hugging Face"
          allowClear
          enterButton={
            <Button
              type="primary"
              onClick={handleDownloadClick}
              // FIXME: Temporary use hardcoded color for the button background
              style={{ color: token.colorBgBase, backgroundColor: '#FF7A00' }}
            >
              Download
            </Button>
          }
          size="large"
          onSearch={onSearch}
        />
      </Flex>
    </BAICard>
  );
};

export default ImportFromHuggingFacePanel;
