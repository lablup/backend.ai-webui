import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAITableSettingColumn {
    key: string;
    label: string;
    /** Required columns are always visible and their checkbox is locked. */
    required?: boolean;
}
export interface BAITableSettingResult {
    selectedColumnKeys: Array<string>;
    /** Every column key, in the order the user left them. */
    columnOrder: Array<string>;
}
export interface BAITableSettingModalProps {
    open: boolean;
    columns: Array<BAITableSettingColumn>;
    /** Currently visible keys, in current display order. */
    visibleColumnKeys: Array<string>;
    disableReorder?: boolean;
    onRequestClose: (result?: BAITableSettingResult) => void;
}
declare const BAITableSettingModal: React.FC<BAITableSettingModalProps>;
export default BAITableSettingModal;
