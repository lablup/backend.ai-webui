import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Tabs } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingPageProps {
  settingOptions: [string, SettingItemProps[]][];
}

const SettingList: React.FC<SettingPageProps> = ({
  settingOptions,
}: SettingPageProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { t } = useTranslation();
  //Todo: change mapping logic for rendering tab items
  const items = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Flex direction="column" align="start" gap={'md'}>
          {_.flatMap(settingOptions, ([title, settings]) => {
            return settings.map(
              (setting) =>
                //Todo: refactor filtering logic
                (setting.title
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                  (typeof setting?.description === 'string' &&
                    setting?.description?.includes(
                      searchValue.toLowerCase(),
                    ))) && <SettingItem {...setting} />,
            );
          })}
        </Flex>
      ),
    },
  ].concat(
    settingOptions.map((item, index) => {
      return {
        key: item[0],
        label: item[0],
        children: (
          <Flex direction="column" align="start" gap={'md'}>
            {item[1].map(
              (setting) =>
                setting.title
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) && (
                  <SettingItem {...setting} />
                ),
            )}
          </Flex>
        ),
      };
    }),
  );

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
        items={items}
      />
      {/* <SSHkeypairManagementModal
        open={isOpenSSHKeypairInfoModal}
        onCancel={toggleSSHKeypairInfoModal}
      /> */}
    </Flex>
  );
};

export default SettingList;
