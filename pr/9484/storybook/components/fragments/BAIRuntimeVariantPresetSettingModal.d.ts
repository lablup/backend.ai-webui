import { BAIRuntimeVariantPresetSettingModalFragment$key } from '../../__generated__/BAIRuntimeVariantPresetSettingModalFragment.graphql';
import { BAIModalProps } from '../BAIModal';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIRuntimeVariantPresetSettingModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
    presetFrgmt?: BAIRuntimeVariantPresetSettingModalFragment$key | null;
    onRequestClose: (success?: boolean) => void;
    /** Category values already used by other presets, offered as autocomplete suggestions. */
    categoryOptions?: ReadonlyArray<string>;
}
declare const BAIRuntimeVariantPresetSettingModal: React.FC<BAIRuntimeVariantPresetSettingModalProps>;
export default BAIRuntimeVariantPresetSettingModal;
