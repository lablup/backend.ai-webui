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
import './BAIFormListInput.css';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  ListInput,
  type ListInputColumn,
  type ListInputProps,
} from '@lablup/ui-common/lab';
import * as _ from 'lodash-es';
import React, { useContext } from 'react';

type CellControlProps = {
  element: React.ReactElement;
} & Record<string, unknown>;

/**
 * The cell's control, given the props its `noStyle` `Form.Item` injects. The
 * ui-common control paints the item's status border itself; the message goes
 * in a tooltip, so a failed rule never changes the row height. The tooltip is
 * always rendered (disabled without a message) so the control never remounts.
 */
const CellControl: React.FC<CellControlProps> = ({ element, ...injected }) => {
  'use memo';
  const { status, errors, warnings } = useContext(FormItemInputContext);
  const message =
    status === 'error' || status === 'warning'
      ? _.find(
          status === 'error' ? errors : warnings,
          (entry): entry is string => typeof entry === 'string' && entry !== '',
        )
      : undefined;
  // A control's own handler (a cross-row revalidation, say) runs after the
  // form's, as `Form.Item` does for a direct child.
  const props = _.mapValues(injected, (value, key) => {
    const own = (element.props as Record<string, unknown>)[key];
    return typeof value === 'function' && typeof own === 'function'
      ? (...args: unknown[]) => {
          value(...args);
          own(...args);
        }
      : value;
  });
  return (
    <Tooltip content={message ?? ''} isEnabled={!!message}>
      {React.cloneElement(element, props)}
    </Tooltip>
  );
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
  const form = Form.useFormInstance();
  return (
    <Form.List {...formListProps}>
      {(fields, { add, remove }, { errors }) => (
        <>
          <ListInput<ListField>
            // Its rows are an inline-size container, which takes no width
            // from its content: without this a centering parent collapses it.
            className="bai-form-list-input"
            style={{ width: '100%' }}
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
              // A list rule that only runs on submit (`validateTrigger={false}`)
              // still clears as soon as the rows fix it.
              if (errors.length > 0) {
                void form.validateFields([formListProps.name]).catch(() => {});
              }
            }}
            columns={_.map(columns, (column) => ({
              key: column.key,
              header: column.header,
              width: column.width,
              renderInput: ({ item: { key: _key, ...field }, label }) => (
                <Form.Item
                  {...field}
                  {...column.formItemProps?.({ key: _key, ...field })}
                  name={[field.name, column.key]}
                  noStyle
                  // The message renders as the control's tooltip instead
                  // of under the cell or the list.
                  help={false}
                >
                  <CellControl
                    element={column.renderInput({
                      field: { key: _key, ...field },
                      fields,
                      label,
                    })}
                  />
                </Form.Item>
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
