import SettingItem, { SettingItemProps } from './SettingItem';
import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Checkbox,
  Divider,
  Empty,
  Input,
  Tabs,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import { BAIModal, BAIFlex, BAIButton } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useState, ReactNode } from 'react';
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

export type SettingGroup = {
  'data-testid': string;
  title: string;
  titleExtra?: ReactNode;
  description?: ReactNode;
  settingItems: SettingItemProps[];
  alert?: ReactNode;
};

interface SettingPageProps {
  settingGroups: Array<SettingGroup>;
  tabDirection?: 'top' | 'left';
  showChangedOptionFilter?: boolean;
  showResetButton?: boolean;
  showSearchBar?: boolean;
  primaryButton?: ReactNode;
  extraButton?: ReactNode;
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

const GroupSettingItems: React.FC<
  {
    group: SettingGroup;
    hideEmpty?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ group, hideEmpty = true, ...props }) => {
  const { token } = theme.useToken();

  if (hideEmpty && group.settingItems.length === 0) return false;
  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        marginBottom: token.marginMD,
      }}
      {...props}
    >
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          zIndex: 1,
          marginBottom: token.marginMD,
          background: token.colorBgContainer,
        }}
      >
        <BAIFlex align="start" justify="between">
          <BAIFlex gap="sm" align="start">
            <Typography.Title
              level={5}
              style={{
                marginTop: 0,
              }}
            >
              {group.title}
            </Typography.Title>
            {group.titleExtra && <div>{group.titleExtra}</div>}
          </BAIFlex>
        </BAIFlex>
        <Divider style={{ marginTop: 0, marginBottom: 0 }} />
        {group.description && (
          <Typography.Text
            type="secondary"
            style={{ marginTop: token.marginSM }}
          >
            {group.description}
          </Typography.Text>
        )}
      </BAIFlex>
      <BAIFlex direction="column" align="stretch" gap={'lg'}>
        {group.alert}
        {group.settingItems.map((item, idx) => (
          <SettingItem key={item.title + idx} {...item} />
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

const SettingList: React.FC<SettingPageProps> = ({
  settingGroups,
  tabDirection = 'left',
  showChangedOptionFilter,
  showResetButton,
  showSearchBar,
  primaryButton,
  extraButton,
}) => {
  'use memo';

  const { t } = useTranslation();
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
      <BAIFlex direction="column" gap={'md'} align="stretch">
        <BAIFlex justify="start" gap={'xs'}>
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
          {extraButton}
          {!!showResetButton && (
            <BAIButton
              icon={<RedoOutlined />}
              onClick={() => setIsOpenResetChangesModal()}
            >
              {t('button.Reset')}
            </BAIButton>
          )}
          {primaryButton}
        </BAIFlex>
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
                <BAIFlex direction="column" align="stretch" gap={'xl'}>
                  {_.sumBy(
                    filteredSettingGroups,
                    (group) => group.settingItems.length,
                  ) > 0 ? (
                    _.map(filteredSettingGroups, (group) => (
                      <GroupSettingItems
                        data-testid={group?.['data-testid']}
                        key={group.title}
                        group={group}
                        hideEmpty
                        onReset={() => {
                          setIsOpenResetChangesModal();
                        }}
                      />
                    ))
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('settings.NoChangesToDisplay')}
                    />
                  )}
                </BAIFlex>
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
                <BAIFlex direction="column" align="stretch" gap={'xl'}>
                  {group.settingItems.length > 0 ? (
                    <GroupSettingItems
                      group={group}
                      hideEmpty
                      onReset={() => {
                        setIsOpenResetChangesModal();
                      }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('settings.NoChangesToDisplay')}
                    />
                  )}
                </BAIFlex>
              ),
            })),
          ]}
        />
      </BAIFlex>
      <BAIModal
        open={isOpenResetChangesModal}
        title={t('dialog.ask.DoYouWantToResetChanges')}
        okText={t('button.Reset')}
        okButtonProps={{ danger: true }}
        onOk={() => {
          resetSettingItems(settingGroups);
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

const resetSettingItems = (settingGroups: SettingGroup[]) => {
  _.flatMap(settingGroups, (item) => item.settingItems).forEach((option) => {
    !option.disabled &&
      option?.setValue &&
      option.setValue(option.defaultValue);
  });
};
