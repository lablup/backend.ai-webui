import Flex from './Flex';
import SettingPageItem from './SettingPageItem';
import { SettingItemProps } from './SettingPageItem';
import { SearchOutlined } from '@ant-design/icons';
import { List, Typography, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

//interface for settings
interface SettingPageProps {
  settingOptions: [string, SettingItemProps[]][];
}

const SettingPage: React.FC<SettingPageProps> = ({
  settingOptions,
}: SettingPageProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { t } = useTranslation();

  return (
    <>
      <Flex direction="column" style={{ paddingTop: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          //Todo: change the placeholder text
          placeholder={t('table.SearchTableColumn')}
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
        />
      </Flex>
      <Flex direction="column" align="start">
        <List
          itemLayout="vertical"
          dataSource={settingOptions}
          renderItem={(item) => (
            <Flex direction="column" align="stretch" gap={'xs'}>
              {searchValue === '' && (
                <Typography.Title level={4} style={{ fontWeight: 'bold' }}>
                  {item[0]}
                </Typography.Title>
              )}
              {item[1].map(
                (setting) =>
                  setting.title
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) && (
                    <SettingPageItem {...setting} />
                  ),
              )}
            </Flex>
          )}
        />
      </Flex>
    </>
  );
};

export default SettingPage;
