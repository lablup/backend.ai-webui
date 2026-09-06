/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 30-D — Astryx-native CSV column picker for `BAITable`.

 The antd version rendered an antd `Table` (one column, a `Checkbox` per row)
 inside an antd `Modal` wrapped in a `Form` whose only field was the search
 box — three container components for what is a searchable checkbox list. This
 rebuild drops all of that chrome and mirrors `BAITableSettingModal`:
 `Dialog` + `Layout` + a plain scrolling `VStack` of `CheckboxInput` rows.

 The EXPORT-KEY GROUPING logic is preserved verbatim, because it is the only
 non-obvious behaviour here: several columns can project the same backend
 field(s) (`exportKey`), and toggling any one of them must toggle the whole
 group — otherwise the emitted key list would depend on which of two
 equivalent rows the user happened to click. Columns whose export keys are not
 all in `supportedFields` are shown disabled rather than hidden, so the user
 can see *why* a visible column is missing from the export.

 PILOT-DECISIONs:
 - `onRequestClose(success: boolean)` is unchanged, so both the export trigger
   and `BAIUnmountAfterClose` keep working as before.
 - The antd version fixed the list box at 330px (`scroll.y`); here it is a
   `max-height` so a short column list produces a short dialog instead of a
   half-empty one.
 - The Export button uses Astryx `Button.clickAction` (native async + loading)
   in place of `BAIButton`'s `action` prop; the close-on-success is ours, the
   same way the pilot modal did it.
*/
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIDialog from '../BAIDialog';
import type { BAIColumnsType } from './tableTypes';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import * as _ from 'lodash-es';
import React, { useMemo, useState } from 'react';

export interface BAITableColumnCSVExportModalProps<T = unknown> {
  open: boolean;
  /** `true` when an export actually ran, `false` on cancel / dismiss. */
  onRequestClose?: (success: boolean) => void;
  onExport: (selectedExportKeys: string[]) => Promise<void>;
  supportedFields: string[];
  columns: BAIColumnsType<T>;
}

/** Pulls the plain-text part out of a JSX column title (icons etc. dropped). */
const extractTitleString = (element: React.ReactElement): string => {
  const { children } = element.props as { children?: React.ReactNode };
  return React.Children.toArray(children)
    .filter((child) => typeof child === 'string')
    .join('');
};

const BAITableColumnCSVExportModal = <T,>({
  open,
  onRequestClose,
  onExport,
  supportedFields,
  columns,
}: BAITableColumnCSVExportModalProps<T>): React.JSX.Element | null => {
  'use memo';

  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  const columnOptions = useMemo(
    () =>
      _.map(columns, (column) => {
        let label: string;
        if (typeof column.title === 'string') {
          label = column.title;
        } else if (
          typeof column.title === 'object' &&
          'props' in column.title!
        ) {
          label = extractTitleString(column.title as React.ReactElement);
        } else {
          label = '';
        }

        // Get export keys (exportKey > dataIndex > empty)
        let exportKeys: string[] = [];
        if (column.exportKey) {
          exportKeys = Array.isArray(column.exportKey)
            ? column.exportKey
            : [column.exportKey];
        } else if ('children' in column) {
          // Column groups without explicit exportKey have no export keys
        } else if (column.dataIndex) {
          exportKeys = [
            Array.isArray(column.dataIndex)
              ? column.dataIndex.join('.')
              : _.toString(column.dataIndex),
          ];
        }

        // Check if all export keys are supported
        const selectable =
          exportKeys.length > 0 &&
          exportKeys.every((k) => supportedFields.includes(k));

        return {
          key: _.toString(column.key),
          label,
          exportKeys,
          selectable,
        };
      }),
    [columns, supportedFields],
  );

  /**
   * Columns sharing the same export key set are controlled together — see the
   * file header.
   */
  const groupMembersByKey = useMemo(() => {
    const byGroupId = new Map<string, string[]>();
    _.forEach(columnOptions, (option) => {
      if (option.exportKeys.length > 0 && option.selectable) {
        const groupId = [...option.exportKeys].sort().join(',');
        if (!byGroupId.has(groupId)) byGroupId.set(groupId, []);
        byGroupId.get(groupId)!.push(option.key);
      }
    });
    const byKey = new Map<string, string[]>();
    _.forEach(columnOptions, (option) => {
      if (option.exportKeys.length === 0) {
        byKey.set(option.key, [option.key]);
        return;
      }
      const groupId = [...option.exportKeys].sort().join(',');
      byKey.set(option.key, byGroupId.get(groupId) ?? [option.key]);
    });
    return byKey;
  }, [columnOptions]);

  // Working set, seeded once per mount. `BAIUnmountAfterClose` guarantees a
  // fresh mount per open, so no reset effect is needed.
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () =>
      new Set(
        _.map(
          _.filter(columnOptions, (option) => option.selectable),
          (option) => option.key,
        ),
      ),
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  const visibleOptions = searchKeyword
    ? _.filter(columnOptions, (option) =>
        _.includes(_.toLower(option.label), _.toLower(searchKeyword)),
      )
    : columnOptions;

  const handleVisibilityChange = (key: string, checked: boolean) => {
    const members = groupMembersByKey.get(key) ?? [key];
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      _.forEach(members, (memberKey) => {
        if (checked) next.add(memberKey);
        else next.delete(memberKey);
      });
      return next;
    });
  };

  if (!open) return null;

  return (
    <BAIDialog
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onRequestClose?.(false);
      }}
      width={500}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader
            title={String(t('comp:BAITable.ExportCSV'))}
            subtitle={String(t('comp:BAITable.SelectColumnToDisplay'))}
            onOpenChange={(next) => {
              if (!next) onRequestClose?.(false);
            }}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={2} align="stretch">
              <TextInput
                label={String(t('comp:BAITable.SearchTableColumn'))}
                isLabelHidden
                placeholder={String(t('comp:BAITable.SearchTableColumn'))}
                value={searchKeyword}
                onChange={(value) => setSearchKeyword(value ?? '')}
                size="sm"
              />
              <div style={{ maxHeight: 330, overflowY: 'auto' }}>
                <VStack gap={0} align="stretch">
                  {_.map(visibleOptions, (option) => (
                    <div
                      key={option.key}
                      style={{ paddingBlock: token.paddingXXS }}
                    >
                      <CheckboxInput
                        label={option.label || option.key}
                        size="sm"
                        value={selectedKeys.has(option.key)}
                        isDisabled={!option.selectable}
                        onChange={(checked) =>
                          handleVisibilityChange(option.key, checked)
                        }
                      />
                    </div>
                  ))}
                  {_.isEmpty(visibleOptions) ? (
                    <Text type="supporting" color="secondary">
                      {t('comp:BAITable.SearchTableColumn')}
                    </Text>
                  ) : null}
                </VStack>
              </div>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack justify="end" gap={2} align="center">
              <Button
                label={String(t('comp:BAITable.Cancel'))}
                variant="secondary"
                onClick={() => onRequestClose?.(false)}
              />
              <Button
                label={String(t('comp:BAITable.Export'))}
                variant="primary"
                clickAction={async () => {
                  const selectedExportKeys = _.uniq(
                    _.flatMap(
                      _.filter(columnOptions, (option) =>
                        selectedKeys.has(option.key),
                      ),
                      (option) => option.exportKeys,
                    ),
                  );
                  await onExport?.(selectedExportKeys);
                  onRequestClose?.(true);
                }}
              />
            </HStack>
          </LayoutFooter>
        }
        style={{ minWidth: 0 }}
      />
    </BAIDialog>
  );
};

export default BAITableColumnCSVExportModal;
