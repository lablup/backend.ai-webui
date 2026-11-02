import { BAIProjectSettingModalFragment$key } from '../../__generated__/BAIProjectSettingModalFragment.graphql';
import { ResourceGroupScope } from '../../__generated__/BAIScopedResourceGroupSelectQuery.graphql';
import { BAIModalProps } from '../BAIModal';
export interface BAIProjectSettingModalProps extends Omit<BAIModalProps, 'title' | 'loading'> {
    projectFragment: BAIProjectSettingModalFragment$key | null;
    /** Scope of the Allowed Resource Groups picker, usually the current domain (ADR 0012). */
    resourceGroupScope: ResourceGroupScope;
}
export type BAIProjectSettingModalFragmentKey = BAIProjectSettingModalFragment$key;
declare const BAIProjectSettingModal: ({ projectFragment, resourceGroupScope, ...modalProps }: BAIProjectSettingModalProps) => import("react").JSX.Element;
export default BAIProjectSettingModal;
