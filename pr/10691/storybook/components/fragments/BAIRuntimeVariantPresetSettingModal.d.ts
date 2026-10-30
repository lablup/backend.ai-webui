import { BAIRuntimeVariantPresetSettingModalFragment$key } from '../../__generated__/BAIRuntimeVariantPresetSettingModalFragment.graphql';
import { BAIModalProps } from '../BAIModal';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIRuntimeVariantPresetSettingModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
    presetFrgmt?: BAIRuntimeVariantPresetSettingModalFragment$key | null;
    onRequestClose: (success?: boolean) => void;
    /** Category values already used by other presets, offered as autocomplete suggestions. */
    categoryOptions?: ReadonlyArray<string>;
}
declare const BAIRuntimeVariantPresetSettingModal: React.FC<BAIRuntimeVariantPresetSettingModalProps>;
export default BAIRuntimeVariantPresetSettingModal;
