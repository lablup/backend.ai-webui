import { BAIRuntimeVariantSelectPaginatedQuery } from '../../__generated__/BAIRuntimeVariantSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type RuntimeVariantNode = NonNullable<NonNullable<BAIRuntimeVariantSelectPaginatedQuery['response']['runtimeVariants']>['edges'][number]>['node'];
export interface BAIRuntimeVariantSelectRef {
    refetch: () => void;
}
export interface BAIRuntimeVariantSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key, as the antd `BAIRuntimeVariantSelect` exposes. */
    value?: string | null;
    onChange?: (value: string | undefined) => void;
    /**
     * Notifies the parent of resolved variant metadata as the paginated list
     * and selected-value point lookup fan in, keyed by runtime variant UUID (the
     * dash-stripped local id of the node's global id). The parent typically
     * merges these into a local map so it can resolve the *currently selected*
     * variant id back to its `name` and its `readsVfolderConfigFiles` flag
     * elsewhere in the form (e.g., to branch on whether the variant reads the
     * vfolder config files) without re-querying.
     */
    onResolvedVariantsChange?: (variantMap: Record<string, {
        name: string;
        readsVfolderConfigFiles: boolean;
    }>) => void;
    /**
     * @deprecated Use `onResolvedVariantsChange` instead — this only surfaces
     * `name`, not `readsVfolderConfigFiles`. Kept (and still notified
     * alongside the richer callback) so existing consumers of this shared
     * backend.ai-ui component don't break on upgrade.
     */
    onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
    ref?: React.Ref<BAIRuntimeVariantSelectRef>;
}
declare const BAIRuntimeVariantSelect: React.FC<BAIRuntimeVariantSelectProps>;
export default BAIRuntimeVariantSelect;
