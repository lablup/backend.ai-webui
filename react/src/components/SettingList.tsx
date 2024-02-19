import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Input, Tabs, Typography, theme } from 'antd';
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
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);

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
        align="stretch"
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
          {t('usersettings.Preferences')}
        </Typography.Title>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Input
              prefix={<SearchOutlined />}
              //Todo: change the placeholder text
              placeholder={t('table.SearchTableColumn')}
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
              style={{ width: 400 }}
            />
            <Checkbox
              onChange={(e) => setChangedOptionFilter(e.target.checked)}
            >
              {/* Todo: Change message */}
              {t('Only Changed Settings')}
            </Checkbox>
          </Flex>
          <Button
            icon={<RedoOutlined />}
            // loading={isPendingRefreshTransition}
            // onClick={() => {
            //   startRefreshTransition(() => checkUpdate());
            // }}
          >
            {/* Todo: Change message */}
            {t('button.Refresh')}
          </Button>
        </Flex>
      </Flex>
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
                {item.options.map((option) =>
                  (option.title
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                    (typeof option?.description === 'string' &&
                      option?.description?.includes(
                        searchValue.toLowerCase(),
                      ))) &&
                  changedOptionFilter ? (
                    option.value !== option.defaultValue ? (
                      <SettingItem {...option} />
                    ) : null
                  ) : (
                    <SettingItem {...option} />
                  ),
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
