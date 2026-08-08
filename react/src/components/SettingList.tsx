/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAITabs from './BAITabs';
import SettingItem, { SettingItemProps } from './SettingItem';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useToggle } from 'ahooks';
import { BAIModal, BAIFlex, BAIButton } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Redo2, Search } from 'lucide-react';
import React, { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
  // PILOT-DECISION: dropped `tabDirection`. antd's `tabPlacement="start"`
  // (the default, `tabDirection='left'`) genuinely rendered a vertical
  // left-rail tab list (verified against the pre-conversion render — see
  // `.scratch/astryx-migration/shots/22/before-settingList-*.png`) —
  // Astryx `TabList` (wrapped by `BAITabs`) has no vertical/side-placement
  // orientation at all (core 0.3.0, checked via `astryx component TabList`),
  // so this is a genuine layout capability gap, not a no-op cleanup.
  // Collapsed to Astryx's only supported layout: horizontal tabs at top.
  showChangedOptionFilter?: boolean;
  showResetButton?: boolean;
  showSearchBar?: boolean;
  primaryButton?: ReactNode;
  extraButton?: ReactNode;
  onReset?: () => void;
}

const GroupSettingItems: React.FC<
  {
    group: SettingGroup;
    hideEmpty?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ group, hideEmpty = true, ...props }) => {
  if (hideEmpty && group.settingItems.length === 0) return false;
  return (
    <BAIFlex direction="column" align="stretch" gap="md" {...props}>
      <BAIFlex direction="column" align="stretch" gap="xs">
        <BAIFlex align="start" justify="between">
          <BAIFlex gap="sm" align="start">
            <Heading level={5}>{group.title}</Heading>
            {group.titleExtra && <div>{group.titleExtra}</div>}
          </BAIFlex>
        </BAIFlex>
        <Divider />
        {group.description && (
          <Text color="secondary">{group.description}</Text>
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
  showChangedOptionFilter,
  showResetButton,
  showSearchBar,
  primaryButton,
  extraButton,
  onReset,
}) => {
  'use memo';

  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);
  const [isOpenResetChangesModal, { toggle: setIsOpenResetChangesModal }] =
    useToggle(false);
  const [activeTabKey, setActiveTabKey] = useState('all');

  const searchedItemFilter = (item: SettingItemProps) => {
    return [item.title, item.description]
      .map((val) => (typeof val === 'string' ? val.toLowerCase() : ''))
      .some((val) => val.includes(searchValue.toLowerCase()));
  };

  const changedItemValidator = (item: SettingItemProps) => {
    if (
      item.value === null ||
      item.value === undefined ||
      item?.selectProps?.disabled ||
      item?.checkboxProps?.disabled
    ) {
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

  const totalItemCount = _.sumBy(
    filteredSettingGroups,
    (group) => group.settingItems.length,
  );

  return (
    <>
      <BAIFlex direction="column" gap={'md'} align="stretch">
        <BAIFlex justify="start" gap={'xs'}>
          {!!showSearchBar && (
            <TextInput
              label={t('settings.SearchPlaceholder')}
              isLabelHidden
              startIcon={Search}
              placeholder={t('settings.SearchPlaceholder')}
              onChange={(nextValue) => setSearchValue(nextValue)}
              value={searchValue}
            />
          )}
          {!!showChangedOptionFilter && (
            <CheckboxInput
              label={t('settings.ShowOnlyChanged')}
              value={changedOptionFilter}
              onChange={(checked) => setChangedOptionFilter(checked)}
            />
          )}
          {extraButton}
          {!!showResetButton && (
            <BAIButton
              danger
              icon={<Redo2 size="1em" />}
              onClick={() => setIsOpenResetChangesModal()}
            >
              {t('button.Reset')}
            </BAIButton>
          )}
          {primaryButton}
        </BAIFlex>
        <BAITabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={[
            {
              key: 'all',
              label: t('general.All'),
              endContent: <Badge label={totalItemCount} variant="neutral" />,
              children:
                totalItemCount > 0 ? (
                  <BAIFlex direction="column" align="stretch" gap={'xl'}>
                    {_.map(filteredSettingGroups, (group) => (
                      <GroupSettingItems
                        data-testid={group?.['data-testid']}
                        key={group.title}
                        group={group}
                        hideEmpty
                      />
                    ))}
                  </BAIFlex>
                ) : (
                  <EmptyState
                    title={t('settings.NoChangesToDisplay')}
                    isCompact
                  />
                ),
            },
            ..._.map(filteredSettingGroups, (group, idx) => ({
              key: `index${idx}`,
              label: group.title,
              endContent: (
                <Badge label={group.settingItems.length} variant="neutral" />
              ),
              children:
                group.settingItems.length > 0 ? (
                  <BAIFlex direction="column" align="stretch" gap={'xl'}>
                    <GroupSettingItems group={group} hideEmpty />
                  </BAIFlex>
                ) : (
                  <EmptyState
                    title={t('settings.NoChangesToDisplay')}
                    isCompact
                  />
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
          onReset ? onReset() : resetSettingItems(settingGroups);
          setIsOpenResetChangesModal();
        }}
        cancelText={t('button.Cancel')}
        onCancel={() => setIsOpenResetChangesModal()}
      >
        <Banner status="warning" title={t('dialog.warning.CannotBeUndone')} />
      </BAIModal>
    </>
  );
};

export default SettingList;

const resetSettingItems = (settingGroups: SettingGroup[]) => {
  _.flatMap(settingGroups, (item) => item.settingItems).forEach((option) => {
    if (option.onReset) {
      option.onReset();
    } else {
      !option?.selectProps?.disabled &&
        !option?.checkboxProps?.disabled &&
        option?.onChange?.(option.defaultValue);
    }
  });
};
