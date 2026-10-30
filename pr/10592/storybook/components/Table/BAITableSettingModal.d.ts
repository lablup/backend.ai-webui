import { DataGridSettingsModalProps, DataGridSettingsResult } from '@lablup/ui-common/components/DataGrid';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAITableSettingColumn {
    key: string;
    label: string;
    /** Required columns are always visible and their checkbox is locked. */
    required?: boolean;
}
export type BAITableSettingResult = DataGridSettingsResult;
export interface BAITableSettingModalProps extends Omit<DataGridSettingsModalProps, 'isOpen' | 'onOpenChange' | 'columns' | 'visibleColumnKeys' | 'isReorderable' | 'onApply'> {
    open: boolean;
    columns: Array<BAITableSettingColumn>;
    /** Currently visible keys, in current display order. */
    visibleColumnKeys: Array<string>;
    disableReorder?: boolean;
    /** `undefined` on cancel, the new settings on Apply. */
    onRequestClose: (result?: BAITableSettingResult) => void;
}
declare const BAITableSettingModal: React.FC<BAITableSettingModalProps>;
export default BAITableSettingModal;
