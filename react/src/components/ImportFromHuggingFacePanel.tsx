import Flex from '../components/Flex';
import BAICard from './BAICard';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd/lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ImportFromHuggingFacePanel: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>();

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
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('modelStore.ImportFromHuggingFace')}
          allowClear
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          autoComplete="off"
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            // TODO search and Import from Hugging Face
          }}
          loading={false}
        />
      </Flex>
    </BAICard>
  );
};

export default ImportFromHuggingFacePanel;
