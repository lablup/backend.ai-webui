/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIBreakpoint } from '../theme-shim';
import SettingItem, { SettingItemProps } from './SettingItem';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Divider } from '@astryxdesign/core/Divider';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { Layout, LayoutContent, LayoutPanel } from '@astryxdesign/core/Layout';
import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { useToggle } from 'ahooks';
import { BAIModal, BAIFlex, BAIButton } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ArrowLeft, ChevronRight, Redo2, Search } from 'lucide-react';
import React, { useState, ReactNode, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

// Frame budget for the settings shell (astryx docs layout — pick the shell and
// budget its regions in px before writing content). The legacy left tab rail
// was `tabBarStyle={{ minWidth: 200 }}` and grew to fit its labels;
// `LayoutPanel.width` is a fixed budget, so it is set one step wider so the
// longest group label in the app ("Experimental features", "Images /
// Environment") still fits beside its count badge instead of truncating.
const NAV_PANEL_WIDTH = 240;

// From the `settings-sidebar` template: the nav column carries its own padding
// so its first item sits on the same baseline as the content pane's first row.
const navPanelPadding: CSSProperties = {
  paddingBlock: 'var(--spacing-4)',
  paddingInline: 'var(--spacing-1)',
};

const ALL_NAV_KEY = 'all';

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
  // CONVERSION-IDIOM (supersedes ticket 22's horizontal-collapse
  // PILOT-DECISION): antd's vertical tabs (`tabPlacement="start"`, formerly
  // this component's `tabDirection='left'` default) are NOT a horizontal
  // `TabList`. Astryx's canonical equivalent is the `settings-sidebar`
  // template composition — `Layout` + `LayoutPanel` nav column (`List` /
  // `ListItem` with `isSelected`) + `LayoutContent` pane — which is what this
  // component now renders. `TabList` genuinely has no side orientation, but
  // the missing capability was never "tabs on the left"; it was "settings
  // shell", and Layout provides it. See
  // `.scratch/astryx-migration/CONVERSION-IDIOMS.md`.
  // `tabDirection` stays dropped: the vertical shell is now the only layout,
  // and no call site ever asked for the horizontal one.
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
    // Narrow drill-down already names the section beside the back button
    // (settings-sidebar template), so the in-pane heading would be a duplicate.
    hideTitle?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ group, hideEmpty = true, hideTitle = false, ...props }) => {
  if (hideEmpty && group.settingItems.length === 0) return false;
  return (
    <BAIFlex direction="column" align="stretch" gap="md" {...props}>
      <BAIFlex direction="column" align="stretch" gap="xs">
        {!hideTitle && (
          <>
            <BAIFlex align="start" justify="between">
              <BAIFlex gap="sm" align="start">
                <Heading level={5}>{group.title}</Heading>
                {group.titleExtra && <div>{group.titleExtra}</div>}
              </BAIFlex>
            </BAIFlex>
            <Divider />
          </>
        )}
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
  // RESPONSIVE-POLICY §2: JS behaviour branches use `useBAIBreakpoint()`, not
  // Astryx `useMediaQuery` (which reports `false` on first render and flashes).
  // `md` is antd's 768px step — the same breakpoint the template drills down at.
  const { md } = useBAIBreakpoint();
  const isNarrow = !md;
  const [searchValue, setSearchValue] = useState('');
  const [changedOptionFilter, setChangedOptionFilter] = useState(false);
  const [isOpenResetChangesModal, { toggle: setIsOpenResetChangesModal }] =
    useToggle(false);
  const [activeTabKey, setActiveTabKey] = useState(ALL_NAV_KEY);
  // Narrow viewports are a master→detail drill-down (template behaviour): the
  // nav list replaces the pane, and a back button returns to it.
  const [narrowView, setNarrowView] = useState<'nav' | 'detail'>('nav');

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

  const navItems = [
    {
      key: ALL_NAV_KEY,
      label: t('general.All'),
      count: totalItemCount,
    },
    ..._.map(filteredSettingGroups, (group, idx) => ({
      key: `index${idx}`,
      label: group.title,
      count: group.settingItems.length,
    })),
  ];
  const activeNavItem =
    _.find(navItems, (item) => item.key === activeTabKey) ?? navItems[0];
  const activeGroup =
    activeTabKey === ALL_NAV_KEY
      ? undefined
      : filteredSettingGroups[Number(activeTabKey.replace('index', ''))];

  const selectNavItem = (key: string) => {
    setActiveTabKey(key);
    setNarrowView('detail');
  };

  const navList = (
    <BAIFlex direction="column" align="stretch" style={navPanelPadding}>
      <List density="spacious">
        {_.map(navItems, (item) => (
          <ListItem
            key={item.key}
            label={item.label}
            endContent={
              isNarrow ? (
                <Icon icon={ChevronRight} size="sm" color="secondary" />
              ) : (
                <Badge label={item.count} variant="neutral" />
              )
            }
            isSelected={!isNarrow && activeTabKey === item.key}
            onClick={() => selectNavItem(item.key)}
          />
        ))}
      </List>
    </BAIFlex>
  );

  const settingsPane =
    activeTabKey === ALL_NAV_KEY ? (
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
        <EmptyState title={t('settings.NoChangesToDisplay')} isCompact />
      )
    ) : activeGroup && activeGroup.settingItems.length > 0 ? (
      <BAIFlex direction="column" align="stretch" gap={'xl'}>
        <GroupSettingItems group={activeGroup} hideEmpty hideTitle={isNarrow} />
      </BAIFlex>
    ) : (
      <EmptyState title={t('settings.NoChangesToDisplay')} isCompact />
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
              // POLISH-3 item 5 — the search box fills the rest of the row,
              // as legacy did. antd `Input` carries `width: 100%`, so as a
              // flex item it claimed the row and shrank to leave room for the
              // filter checkbox and the buttons beside it; Astryx `TextInput`
              // sizes to its own content box instead (measured 252px against
              // a 1262px row). `width` is TextInput's own prop for this and
              // sizes the whole field (label + control + status) together.
              width="100%"
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
        {isNarrow && narrowView === 'nav' ? (
          navList
        ) : (
          <Layout
            height="auto"
            padding={0}
            start={
              isNarrow ? undefined : (
                <LayoutPanel
                  hasDivider
                  padding={0}
                  width={NAV_PANEL_WIDTH}
                  isScrollable={false}
                  role="navigation"
                  label={t('webui.menu.Settings')}
                >
                  {navList}
                </LayoutPanel>
              )
            }
            content={
              <LayoutContent padding={4} isScrollable={false}>
                <BAIFlex direction="column" align="stretch" gap={'md'}>
                  {isNarrow && (
                    <Toolbar
                      label={activeNavItem.label}
                      gap={2}
                      startContent={
                        <>
                          <Button
                            label={t('webui.menu.GoBack')}
                            variant="ghost"
                            size="sm"
                            isIconOnly
                            icon={<Icon icon={ArrowLeft} size="sm" />}
                            onClick={() => setNarrowView('nav')}
                          />
                          <Heading level={5}>{activeNavItem.label}</Heading>
                        </>
                      }
                    />
                  )}
                  {settingsPane}
                </BAIFlex>
              </LayoutContent>
            }
          />
        )}
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
