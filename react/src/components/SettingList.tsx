import BAIModal from './BAIModal';
import Flex from './Flex';
import SettingItem from './SettingItem';
import { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Input,
  Tabs,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  TabStyles: css`
    .ant-tabs-tab-active {
      font-weight: var(--token-fontWeightSuperStrong, 700);
    }
    .ant-typography-secondary {
      font-weight: normal !important;
    }
  `,
}));

export type SettingGroup = {
  title: string;
  description?: ReactNode;
  settingItems: SettingItemProps[];
};

interface SettingPageProps {
  settingGroups: Array<SettingGroup>;
  tabDirection?: 'top' | 'left';
  showChangedOptionFilter?: boolean;
  showResetButton?: boolean;
  showSearchBar?: boolean;
}

const TabTitle: React.FC<{
  title: string;
  count: number;
}> = ({ title, count }) => {
  return (
    <>
      <Typography.Text>{title}</Typography.Text>
      <Typography.Text type="secondary">{` (${count})`}</Typography.Text>
    </>
  );
};

const GroupSettingItems: React.FC<{
  group: SettingGroup;
  hideEmpty?: boolean;
}> = ({ group, hideEmpty }) => {
  const { token } = theme.useToken();
  if (hideEmpty && group.settingItems.length === 0) return false;
  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        marginBottom: token.marginMD,
      }}
    >
      <Flex
        direction="column"
        align="stretch"
        style={{
          zIndex: 1,
          marginBottom: token.marginMD,
          background: token.colorBgContainer,
        }}
      >
        <Typography.Title
          level={5}
          style={{
            marginTop: 0,
          }}
        >
          {group.title}
        </Typography.Title>
        <Divider style={{ marginTop: 0, marginBottom: 0 }} />
        {group.description && (
          <Typography.Text
            type="secondary"
            style={{ marginTop: token.marginSM }}
          >
            {group.description}
          </Typography.Text>
        )}
      </Flex>
      <Flex direction="column" align="start" gap={'lg'}>
        {group.settingItems.map((item, idx) => (
          <SettingItem key={item.title + idx} {...item} />
        ))}
      </Flex>
    </Flex>
  );
};

const SettingList: React.FC<SettingPageProps> = ({
  settingGroups,
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
  const [activeTabKey, setActiveTabKey] = useState('all');

  const searchedItemFilter = (item: SettingItemProps) => {
    return (
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      (typeof item.description === 'string' &&
        item.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  };

  const changedItemValidator = (item: SettingItemProps) => {
    if (item.value === null || item.value === undefined || !!item.disabled) {
      return false;
    }
    return item.value !== item.defaultValue;
  };

  const filteredSettingGroups = _.map(settingGroups, (group) => {
    return {
      ...group,
      settingItems: _.filter(
        group.settingItems,
        (item) =>
          (!changedOptionFilter || changedItemValidator(item)) &&
          searchedItemFilter(item),
      ),
    };
  });

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
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          className={styles.TabStyles}
          tabPosition={tabDirection ? 'left' : 'top'}
          tabBarStyle={{ minWidth: 200 }}
          items={[
            {
              key: 'all',
              label: (
                <TabTitle
                  title={t('general.All')}
                  count={_.sumBy(
                    filteredSettingGroups,
                    (group) => group.settingItems.length,
                  )}
                />
              ),
              children: (
                <Flex direction="column" align="stretch" gap={'xl'}>
                  {_.map(filteredSettingGroups, (group) => (
                    <GroupSettingItems
                      key={group.title}
                      group={group}
                      hideEmpty
                    />
                  ))}
                </Flex>
              ),
            },
            ..._.map(filteredSettingGroups, (group, idx) => ({
              key: `index${idx}`,
              label: (
                <TabTitle
                  title={group.title}
                  count={group.settingItems.length}
                />
              ),
              children: (
                <GroupSettingItems
                  group={filteredSettingGroups[idx]}
                  hideEmpty
                />
              ),
            })),
          ]}
        />
      </Flex>
      <BAIModal
        open={isOpenResetChangesModal}
        title={t('dialog.ask.DoYouWantToResetChanges')}
        okText={t('button.Reset')}
        okButtonProps={{ danger: true }}
        onOk={() => {
          _.flatMap(settingGroups, (item) => item.settingItems).forEach(
            (option) => {
              !option.disabled &&
                option?.setValue &&
                option.setValue(option.defaultValue);
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
