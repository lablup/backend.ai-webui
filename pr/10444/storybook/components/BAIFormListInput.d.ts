import { FormItemProps, FormListProps, ListField, StoreValue } from '../form-engine';
import { ListInputColumn, ListInputProps } from '@lablup/ui-common/lab';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
    formItemProps?: (field: ListField) => Omit<FormItemProps, 'name' | 'noStyle' | 'help' | 'children'>;
    /** The control. `Form.Item` injects `value` / `onChange`. */
    renderInput: (context: BAIFormListInputCellContext) => React.ReactElement;
}
export interface BAIFormListInputProps extends Omit<FormListProps, 'children'>, Pick<ListInputProps<ListField>, 'label' | 'isLabelHidden' | 'itemName' | 'description' | 'isDisabled' | 'isOptional' | 'isRequired' | 'maxItems'> {
    columns: BAIFormListInputColumn[];
    /** Initial value of a newly added row. */
    createValue?: () => StoreValue;
}
/**
 * A `Form.List` rendered through Astryx `ListInput`: column labels once above
 * the first row, every cell bound to its own `Form.Item` rules.
 */
declare const BAIFormListInput: React.FC<BAIFormListInputProps>;
export default BAIFormListInput;
