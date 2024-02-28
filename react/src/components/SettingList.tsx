import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, Tabs, Typography, theme } from 'antd';
import { useResponsive } from 'antd-style';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingPageProps {
  settingGroup: { title: string; settingItems: SettingItemProps[] }[];
  placeholder?: string;
}

const SettingList: React.FC<SettingPageProps> = ({
  settingGroup,
  placeholder,
}: SettingPageProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);

  const { mobile } = useResponsive();

  const appendedSettingGroup = [
    {
      title: t('general.All'),
      settingItems: _.flatMap(settingGroup, (item) => item.settingItems),
    },
    ...settingGroup,
  ];
  const matchedItemValidator = (item: SettingItemProps) => {
    return (
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      (typeof item.description === 'string' &&
        item.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  };
  const changedItemValidator = (item: SettingItemProps) => {
    return item.value !== item.defaultValue;
  };

  const itemMaxWidth = 600;
  const isLeftTab = !mobile;
  const leftTabWidth = 200;

  return (
    <Flex
      direction="column"
      gap={'md'}
      align="stretch"
      style={{
        flex: 1,
        padding: token.paddingContentHorizontal,
        paddingLeft: isLeftTab ? 0 : token.paddingContentHorizontal,
        paddingRight: isLeftTab ? 0 : token.paddingContentHorizontal,
      }}
    >
      <Flex
        direction="row"
        justify="start"
        wrap="wrap"
        gap={'xs'}
        style={{
          paddingLeft: isLeftTab ? token.paddingContentHorizontal : undefined,
          paddingRight: isLeftTab ? token.paddingContentHorizontal : undefined,
        }}
      >
        <Typography.Title
          level={4}
          style={{
            margin: 0,
            padding: 0,
            width: isLeftTab ? leftTabWidth : undefined,
          }}
        >
          {t('settings.Config')}
        </Typography.Title>
        <Input
          prefix={<SearchOutlined />}
          placeholder={placeholder || t('setting.SearchPlaceholder')}
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          style={{ flex: 1, maxWidth: itemMaxWidth, minWidth: 50 }}
        />
        <Checkbox onChange={(e) => setChangedOptionFilter(e.target.checked)}>
          {t('settings.ShowOnlyChanged')}
        </Checkbox>

        {/* <Button
            icon={<RedoOutlined />}
            onClick={() => {
              _.flatMap(settingGroup, (item) => item.settingItems).forEach(
                (option) => {
                  option?.setValue && option.setValue(option.defaultValue);
                },
              );
            }}
          >
            {t('button.Reset')}
          </Button> */}
      </Flex>
      <Tabs
        tabPosition={isLeftTab ? 'left' : 'top'}
        tabBarStyle={{
          width: isLeftTab ? leftTabWidth : undefined,
        }}
        items={appendedSettingGroup.map((settingGroup) => {
          const filteredItems = settingGroup.settingItems.filter((item) => {
            return (
              (!changedOptionFilter || changedItemValidator(item)) &&
              matchedItemValidator(item)
            );
          });
          return {
            key: settingGroup.title,
            label:
              settingGroup.title +
              (searchValue || changedOptionFilter
                ? ` (${filteredItems.length})`
                : ''),
            children: (
              <Flex direction="column" gap={'lg'} align="start">
                {filteredItems.map((item) => (
                  <SettingItem {...item} style={{ maxWidth: itemMaxWidth }} />
                ))}
              </Flex>
            ),
          };
        })}
      />
    </Flex>
  );
};

export default SettingList;
