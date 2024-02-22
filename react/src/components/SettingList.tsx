import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Tabs, Typography, theme } from 'antd';
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

  return (
    <Flex
      direction="column"
      gap={'md'}
      align="start"
      style={{ maxWidth: 1100 }}
    >
      <Flex
        direction="row"
        justify="between"
        wrap="wrap"
        gap={'xs'}
        style={{
          width: '100%',
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, padding: 0 }}>
          {t('settings.Config')}
        </Typography.Title>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            {/* 
            Todo: apply debounce or throttle later if needed
            */}
            <Input
              prefix={<SearchOutlined />}
              placeholder={placeholder || t('setting.SearchPlaceholder')}
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
              style={{ width: 300 }}
            />
            <Checkbox
              onChange={(e) => setChangedOptionFilter(e.target.checked)}
            >
              {t('settings.ShowOnlyChanged')}
            </Checkbox>
          </Flex>
          <Button
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
          </Button>
        </Flex>
      </Flex>
      <Tabs
        tabPosition="left"
        tabBarStyle={{
          width: 200,
        }}
        style={{ width: '100%' }}
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
              <Flex direction="column" gap={'md'} align="start">
                {filteredItems.map((item) => (
                  <SettingItem {...item} />
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
