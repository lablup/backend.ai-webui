import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Badge, Button, Checkbox, Input, Tabs, Typography, theme } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingPageProps {
  settingOptions: { title: string; options: SettingItemProps[] }[];
  placeholder?: string;
}

const SettingList: React.FC<SettingPageProps> = ({
  settingOptions,
  placeholder,
}: SettingPageProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);
  const [isRefreshFinished, setisRefreshFinished] = useState(false);

  const optionRenderItems = [
    {
      title: t('general.All'),
      options: _.flatMap(settingOptions, (item) => item.options),
    },
    ...settingOptions,
  ];
  const matchedOptionPicker = (option: SettingItemProps) => {
    return (
      option.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      (typeof option.description === 'string' &&
        option.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  };
  const changedOptionPicker = (option: SettingItemProps) => {
    return option.value !== option.defaultValue;
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
              style={{ width: 400 }}
            />
            <Checkbox
              onChange={(e) => setChangedOptionFilter(e.target.checked)}
            >
              {t('settings.ShowOnlyChanged')}
            </Checkbox>
          </Flex>
          <Button
            icon={<RedoOutlined />}
            loading={isRefreshFinished}
            onClick={() => {
              setisRefreshFinished(true);
              _.flatMap(settingOptions, (item) => item.options).forEach(
                (option) => {
                  option?.setValue && option.setValue(option.defaultValue);
                },
              );
              setisRefreshFinished(false);
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
        items={optionRenderItems.map((item) => {
          const filteredOptions = item.options.filter(
            (option) =>
              matchedOptionPicker(option) &&
              (!changedOptionFilter || changedOptionPicker(option)),
          );
          return {
            key: item.title,
            label:
              item.title +
              (searchValue || changedOptionFilter
                ? ` (${filteredOptions.length})`
                : ''),
            children: (
              <Flex direction="column" gap={'md'} align="start">
                {filteredOptions.map((option) => (
                  <SettingItem {...option} />
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
