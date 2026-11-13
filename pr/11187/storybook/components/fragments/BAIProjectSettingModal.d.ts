import { BAIProjectSettingModalFragment$key } from '../../__generated__/BAIProjectSettingModalFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export interface BAIProjectSettingModalProps extends Omit<BAIModalProps, 'title' | 'loading'> {
    projectFragment: BAIProjectSettingModalFragment$key | null;
}
export type BAIProjectSettingModalFragmentKey = BAIProjectSettingModalFragment$key;
declare const BAIProjectSettingModal: ({ projectFragment, ...modalProps }: BAIProjectSettingModalProps) => import("react").JSX.Element;
export default BAIProjectSettingModal;
