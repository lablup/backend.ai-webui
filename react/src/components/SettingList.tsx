import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Tabs } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingPageProps {
  settingOptions: { title: string; options: SettingItemProps[] }[];
}

const SettingList: React.FC<SettingPageProps> = ({
  settingOptions,
}: SettingPageProps) => {
  const optionRenderItems = [
    {
      title: 'General',
      options: _.flatMap(settingOptions, (item) => item.options),
    },
    ...settingOptions,
  ];
  const [searchValue, setSearchValue] = useState('');
  const { t } = useTranslation();

  return (
    <Flex direction="column" gap={'md'} align="start">
      <Input
        prefix={<SearchOutlined />}
        //Todo: change the placeholder text
        placeholder={t('table.SearchTableColumn')}
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
      />
      {/* Todo: make rendered children scrollable except the tab bar and search field */}
      <Tabs
        tabPosition="left"
        tabBarStyle={{
          width: 200,
        }}
        style={{ width: '100%' }}
        items={optionRenderItems.map((item) => {
          return {
            key: item.title,
            label: item.title,
            children: (
              <Flex direction="column" gap={'md'} align="start">
                {item.options.map(
                  (option) =>
                    (option.title
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()) ||
                      (typeof option?.description === 'string' &&
                        option?.description?.includes(
                          searchValue.toLowerCase(),
                        ))) && <SettingItem {...option} />,
                )}
              </Flex>
            ),
          };
        })}
      />
    </Flex>
  );
};

export default SettingList;
