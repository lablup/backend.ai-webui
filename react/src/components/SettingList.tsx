import BAIModal from './BAIModal';
import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, Button, Checkbox, Input, Tabs, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  TabStyles: css`
    .ant-tabs-tab-active {
      font-weight: var(--token-fontWeightSuperStrong, 700);
    }
    .ant-typography-secondary {
      font-weight: normal !important;
    }
  `,
}));

export type SettingGroup = Array<{
  title: string;
  settingItems: SettingItemProps[];
}>;

interface SettingPageProps {
  settingGroup: SettingGroup;
  tabDirection?: 'top' | 'left';
  showChangedOptionFilter?: boolean;
  showResetButton?: boolean;
  showSearchBar?: boolean;
}

const SettingList: React.FC<SettingPageProps> = ({
  settingGroup,
  tabDirection = 'left',
  showChangedOptionFilter,
  showResetButton,
  showSearchBar,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);
  const [isOpenResetChangesModal, { toggle: setIsOpenResetChangesModal }] =
    useToggle(false);

  const appendedAllSettingGroup = useMemo(() => {
    return [
      {
        title: t('general.All'),
        settingItems: _.flatMap(settingGroup, (item) => item.settingItems),
      },
      ...settingGroup,
    ];
    // eslint-disable-next-line
  }, [settingGroup]);

  const searchedItemFilter = (item: SettingItemProps) => {
    return (
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      (typeof item.description === 'string' &&
        item.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  };

  const changedItemValidator = (item: SettingItemProps) => {
    if (item.value === null || item.value === undefined) {
      return false;
    }
    return item.value !== item.defaultValue;
  };
  return (
    <>
      <Flex
        direction="column"
        gap={'md'}
        align="stretch"
        style={{
          padding: token.paddingContentHorizontal,
          maxWidth: token.screenLG,
        }}
      >
        <Flex justify="start" gap={'xs'}>
          {!!showSearchBar && (
            <Input
              prefix={<SearchOutlined />}
              placeholder={t('settings.SearchPlaceholder')}
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
            />
          )}
          {!!showChangedOptionFilter && (
            <Checkbox
              onChange={(e) => setChangedOptionFilter(e.target.checked)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('settings.ShowOnlyChanged')}
            </Checkbox>
          )}
          {!!showResetButton && (
            <Button
              icon={<RedoOutlined />}
              onClick={() => setIsOpenResetChangesModal()}
            >
              {t('button.Reset')}
            </Button>
          )}
        </Flex>
        <Tabs
          className={styles.TabStyles}
          tabPosition={tabDirection ? 'left' : 'top'}
          tabBarStyle={{ minWidth: 200 }}
          items={_.map(appendedAllSettingGroup, (settingGroup) => {
            const filteredItems = settingGroup.settingItems.filter((item) => {
              return (
                (!changedOptionFilter || changedItemValidator(item)) &&
                searchedItemFilter(item)
              );
            });
            return {
              key: settingGroup.title,
              label: (
                <>
                  <Typography.Text>{settingGroup.title}</Typography.Text>
                  <Typography.Text type="secondary">{` (${filteredItems.length})`}</Typography.Text>
                </>
              ),
              children: (
                <Flex direction="column" gap={'lg'} align="start">
                  {filteredItems.map((item) => (
                    <SettingItem {...item} />
                  ))}
                </Flex>
              ),
            };
          })}
        />
      </Flex>
      <BAIModal
        open={isOpenResetChangesModal}
        title={t('dialog.ask.DoYouWantToResetChanges')}
        okText={t('button.Reset')}
        okButtonProps={{ danger: true }}
        onOk={() => {
          _.flatMap(settingGroup, (item) => item.settingItems).forEach(
            (option) => {
              option?.setValue && option.setValue(option.defaultValue);
            },
          );
          setIsOpenResetChangesModal();
        }}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenResetChangesModal()}
      >
        <Alert
          showIcon
          message={t('dialog.warning.CannotBeUndone')}
          type="warning"
        />
      </BAIModal>
    </>
  );
};

export default SettingList;
