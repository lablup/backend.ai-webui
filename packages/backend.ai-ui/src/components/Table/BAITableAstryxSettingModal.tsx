/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 25 — Astryx-native column-settings modal for
 `BAITable`.

 The antd version (`BAITableSettingModal`) renders a whole antd `Table` inside
 an antd `Modal`, with `Form`, `Checkbox`, `Input.Search` and a dnd-kit
 sortable body. Astryx has no Form/Table-in-modal idiom of that shape, so this
 rebuild keeps the *behaviour* (search, per-column checkbox, required columns
 locked, drag-to-reorder, cancel/apply) and drops the table chrome: it is a
 plain list of rows.

 PILOT-DECISION: the antd modal committed on close via a `Form` instance. Here
 the working set is ordinary component state seeded from props on open, and
 `onRequestClose` is called with `undefined` on cancel / the new
 `{selectedColumnKeys, columnOrder}` on apply. That is the same contract the
 caller already handled, so `BAITable`'s projection back into
 `columnOverrides` is unchanged.

 Drag-to-reorder still uses dnd-kit (already a BUI dependency); Astryx ships no
 sortable-list primitive.
*/
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIDialog from '../BAIDialog';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as _ from 'lodash-es';
import { GripVertical } from 'lucide-react';
import React, { useState } from 'react';

export interface BAITableAstryxSettingColumn {
  key: string;
  label: string;
  /** Required columns are always visible and their checkbox is locked. */
  required?: boolean;
}

export interface BAITableAstryxSettingResult {
  selectedColumnKeys: Array<string>;
  /** Every column key, in the order the user left them. */
  columnOrder: Array<string>;
}

export interface BAITableAstryxSettingModalProps {
  open: boolean;
  columns: Array<BAITableAstryxSettingColumn>;
  /** Currently visible keys, in current display order. */
  visibleColumnKeys: Array<string>;
  disableReorder?: boolean;
  onRequestClose: (result?: BAITableAstryxSettingResult) => void;
}

const SortableRow: React.FC<{
  id: string;
  isDragDisabled?: boolean;
  children: React.ReactNode;
}> = ({ id, isDragDisabled, children }) => {
  'use memo';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled });
  const { token } = theme.useToken();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
        paddingBlock: token.paddingXXS,
      }}
    >
      {isDragDisabled ? (
        <span style={{ width: 16 }} />
      ) : (
        <span
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            display: 'inline-flex',
            color: token.colorTextTertiary,
          }}
          aria-hidden
        >
          <GripVertical size={16} />
        </span>
      )}
      {children}
    </div>
  );
};

const BAITableAstryxSettingModal: React.FC<BAITableAstryxSettingModalProps> = ({
  open,
  columns,
  visibleColumnKeys,
  disableReorder,
  onRequestClose,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  // Working set, seeded once per mount. `BAIUnmountAfterClose` guarantees a
  // fresh mount per open, so no reset effect is needed.
  const [order, setOrder] = useState<Array<string>>(() => {
    const visible = _.filter(visibleColumnKeys, (key) =>
      _.some(columns, (column) => column.key === key),
    );
    const rest = _.map(
      _.reject(columns, (column) => _.includes(visible, column.key)),
      (column) => column.key,
    );
    return [...visible, ...rest];
  });
  const [selected, setSelected] = useState<Array<string>>(() => [
    ...visibleColumnKeys,
  ]);
  const [search, setSearch] = useState('');

  const columnByKey = _.keyBy(columns, 'key');
  const visibleRows = _.filter(order, (key) => {
    const column = columnByKey[key];
    if (!column) return false;
    if (!search) return true;
    return _.includes(_.toLower(column.label), _.toLower(search));
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = _.indexOf(order, String(active.id));
    const to = _.indexOf(order, String(over.id));
    if (from === -1 || to === -1) return;
    setOrder(arrayMove(order, from, to));
  };

  if (!open) return null;

  const list = (
    <VStack gap={0} align="stretch">
      {_.map(visibleRows, (key) => {
        const column = columnByKey[key];
        return (
          <SortableRow
            key={key}
            id={key}
            isDragDisabled={disableReorder || !!search}
          >
            <CheckboxInput
              label={column.label || key}
              size="sm"
              value={_.includes(selected, key) || !!column.required}
              isDisabled={!!column.required}
              onChange={(checked) =>
                setSelected((prev) =>
                  checked ? _.union(prev, [key]) : _.without(prev, key),
                )
              }
            />
          </SortableRow>
        );
      })}
      {_.isEmpty(visibleRows) ? (
        <Text type="supporting" color="secondary">
          {t('comp:BAITable.SearchTableColumn')}
        </Text>
      ) : null}
    </VStack>
  );

  return (
    <BAIDialog
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onRequestClose(undefined);
      }}
      width={420}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader
            title={String(t('comp:BAITable.SettingTable'))}
            subtitle={String(t('comp:BAITable.SelectColumnToDisplay'))}
            onOpenChange={(next) => {
              if (!next) onRequestClose(undefined);
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
                value={search}
                onChange={(value) => setSearch(value ?? '')}
                size="sm"
              />
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {disableReorder || search ? (
                  list
                ) : (
                  <DndContext
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={visibleRows}
                      strategy={verticalListSortingStrategy}
                    >
                      {list}
                    </SortableContext>
                  </DndContext>
                )}
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
                onClick={() => onRequestClose(undefined)}
              />
              <Button
                label={String(t('comp:BAITable.Apply'))}
                variant="primary"
                onClick={() =>
                  onRequestClose({
                    selectedColumnKeys: _.union(
                      selected,
                      _.map(
                        _.filter(columns, (column) => !!column.required),
                        (column) => column.key,
                      ),
                    ),
                    columnOrder: order,
                  })
                }
              />
            </HStack>
          </LayoutFooter>
        }
        style={{ minWidth: 0 }}
      />
      <span style={{ display: 'none' }} data-token={token.colorText} />
    </BAIDialog>
  );
};

export default BAITableAstryxSettingModal;
