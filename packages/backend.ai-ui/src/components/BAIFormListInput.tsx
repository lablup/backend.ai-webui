/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  Form,
  FormItemInputContext,
  type FormItemProps,
  type FormListProps,
  type ListField,
  type StoreValue,
} from '../form-engine';
import type { InputStatus } from '@lablup/ui-common/Field';
import {
  ListInput,
  type ListInputColumn,
  type ListInputProps,
} from '@lablup/ui-common/lab';
import * as _ from 'lodash-es';
import React, { createContext, useContext } from 'react';

const ListInputCellContext = createContext(false);

/**
 * The status a control inside a `BAIFormListInput` cell should render: the
 * cell's `Form.Item` result as a tooltip, so a message never changes the row
 * height. `undefined` outside a cell. The variant is constant per position,
 * so the control's element structure never flips between renders.
 */
export const useBAIFormListInputCellStatus = ():
  { status?: InputStatus; statusVariant: 'tooltip' } | undefined => {
  'use memo';
  const isInCell = useContext(ListInputCellContext);
  const { status, errors, warnings } = useContext(FormItemInputContext);
  if (!isInCell) return undefined;
  if (status !== 'error' && status !== 'warning') {
    return { statusVariant: 'tooltip' };
  }
  const message = _.find(
    status === 'error' ? errors : warnings,
    (entry): entry is string => typeof entry === 'string',
  );
  return { status: { type: status, message }, statusVariant: 'tooltip' };
};

export interface BAIFormListInputCellContext {
  /** The `Form.List` field of this row. */
  field: ListField;
  /** Every row of the list, for cross-row checks such as duplicate names. */
  fields: ListField[];
  /** Accessible name for the cell's control: the header, plus the row position after the first row. */
  label: string;
}

export interface BAIFormListInputColumn {
  /** The row's field the cell edits; the cell's form name is `[row, key]`. */
  key: string;
  /** Visible column label, shown once above the first row. */
  header: string;
  width?: ListInputColumn<ListField>['width'];
  /** Rules, dependencies and other `Form.Item` props for this cell. */
  formItemProps?: (
    field: ListField,
  ) => Omit<FormItemProps, 'name' | 'noStyle' | 'help' | 'children'>;
  /** The control. `Form.Item` injects `value` / `onChange`. */
  renderInput: (context: BAIFormListInputCellContext) => React.ReactElement;
}

export interface BAIFormListInputProps
  extends
    Omit<FormListProps, 'children'>,
    Pick<
      ListInputProps<ListField>,
      | 'label'
      | 'isLabelHidden'
      | 'itemName'
      | 'description'
      | 'isDisabled'
      | 'isOptional'
      | 'isRequired'
      | 'maxItems'
    > {
  columns: BAIFormListInputColumn[];
  /** Initial value of a newly added row. */
  createValue?: () => StoreValue;
}

/**
 * A `Form.List` rendered through Astryx `ListInput`: column labels once above
 * the first row, every cell bound to its own `Form.Item` rules.
 */
const BAIFormListInput: React.FC<BAIFormListInputProps> = ({
  columns,
  createValue,
  label,
  isLabelHidden,
  itemName,
  description,
  isDisabled,
  isOptional,
  isRequired,
  maxItems,
  ...formListProps
}) => {
  'use memo';
  return (
    <Form.List {...formListProps}>
      {(fields, { add, remove }, { errors }) => (
        <>
          <ListInput<ListField>
            label={label}
            isLabelHidden={isLabelHidden}
            itemName={itemName}
            description={description}
            isDisabled={isDisabled}
            isOptional={isOptional}
            isRequired={isRequired}
            maxItems={maxItems}
            value={fields}
            getItemKey={(field) => field.key}
            // ListInput only reads this back through `onChange`; the real
            // row (and its key) is the one `Form.List` creates in `add()`.
            createItem={() => ({
              key: -1,
              name: fields.length,
              isListField: true,
            })}
            onChange={(_next, change) => {
              if (change.type === 'add') add(createValue?.());
              else if (change.type === 'remove') remove(change.item.name);
            }}
            columns={_.map(columns, (column) => ({
              key: column.key,
              header: column.header,
              width: column.width,
              renderInput: ({ item: { key: _key, ...field }, label }) => (
                <ListInputCellContext.Provider value>
                  <Form.Item
                    {...field}
                    {...column.formItemProps?.({ key: _key, ...field })}
                    name={[field.name, column.key]}
                    noStyle
                    // The message renders as the control's tooltip instead
                    // of under the cell or the list.
                    help={false}
                  >
                    {column.renderInput({
                      field: { key: _key, ...field },
                      fields,
                      label,
                    })}
                  </Form.Item>
                </ListInputCellContext.Provider>
              ),
            }))}
          />
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
};

export default BAIFormListInput;
