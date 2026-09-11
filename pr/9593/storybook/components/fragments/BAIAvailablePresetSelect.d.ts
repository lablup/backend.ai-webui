import { BAIAvailablePresetSelectPaginatedQuery } from '../../__generated__/BAIAvailablePresetSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxDeploymentRevisionPresetNode = NonNullable<NonNullable<NonNullable<BAIAvailablePresetSelectPaginatedQuery['response']['deploymentRevisionPresets']>['edges'][number]>['node']>;
export interface BAIAvailablePresetSelectRef {
    refetch: () => void;
}
export interface BAIAvailablePresetSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAvailablePresetSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    runtimeVariantId?: string;
    /**
     * When set, scope the options to the presets a specific model card is
     * resource-compatible with, via the top-level `modelCardAvailablePresets`
     * query (Added in 26.4.2) — the same server-filtered subset a model card
     * deploys against. When omitted, the options are the project-wide
     * `deploymentRevisionPresets` list. Pass a raw model-card UUID (local id).
     */
    modelCardId?: string;
    ref?: React.Ref<BAIAvailablePresetSelectRef>;
}
declare const BAIAvailablePresetSelect: React.FC<BAIAvailablePresetSelectProps>;
export default BAIAvailablePresetSelect;
