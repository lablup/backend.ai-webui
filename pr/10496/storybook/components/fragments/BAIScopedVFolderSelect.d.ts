import { BAIScopedVFolderSelectQuery$data } from '../../__generated__/BAIScopedVFolderSelectQuery.graphql';
import { VFolderFilter, VFolderScope } from '../../hooks/useMountableVFolders';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type ScopedVFolderNode = NonNullable<BAIScopedVFolderSelectQuery$data['scopedVFoldersV2']>['edges'][number]['node'];
/** What the select knows about a folder, from an option row or the value lookup. */
export interface ScopedVFolderSummary {
    entityId: string;
    name: string;
    host: string;
    /** The caller's mount level: `NONE`, `READ_ONLY`, `READ_WRITE` or `RW_DELETE`. */
    permission: string;
}
export interface ScopedVFolderResolution {
    /** Selected folders the scope and `filter` reach and `getFolderDisabled` allows. */
    resolved: Array<ScopedVFolderSummary>;
    /** Selected ids the scope and `filter` do not reach, or `getFolderDisabled` rejects. */
    unresolved: Array<string>;
}
export interface BAIScopedVFolderSelectRef {
    /** Re-reads the options and re-checks the selected ids. */
    refetch: () => void;
}
export interface BAIScopedVFolderSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total' | 'isLoadingNext' | 'endReached'> {
    /** Folder UUIDs (`VFolder.entityId`). Array iff `multiple`. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    /** The scopes whose folders are read, combined with OR. */
    scope: VFolderScope;
    /** ANDed onto the options and onto the selected-value lookup. */
    filter?: VFolderFilter;
    /** ANDed onto the options only; a selected folder it excludes stays selected. */
    optionFilter?: VFolderFilter;
    /**
     * A truthy result lists the option disabled (with `reason` under its label)
     * and reports a matching selection unresolved.
     */
    getFolderDisabled?: (folder: ScopedVFolderSummary) => boolean | {
        reason: string;
    };
    /** Labels for selected ids the scope and `filter` do not reach. */
    fallbackLabels?: Record<string, string>;
    /** Fires once the selected ids are looked up, and again whenever the outcome changes. */
    onResolve?: (resolution: ScopedVFolderResolution) => void;
    ref?: React.Ref<BAIScopedVFolderSelectRef>;
}
/**
 * Picks vfolders from `scopedVFoldersV2`, paged and searched on the server.
 * The value is folder UUIDs. The selected ids are looked up by `entityId`
 * within `scope` and `filter`, which labels them and tells `onResolve` whether
 * the scope still reaches them. The options are read only while the popup is
 * open; the lookup suspends on first load.
 *
 * Props and usage: `BAIScopedVFolderSelect.doc.ts`.
 */
declare const BAIScopedVFolderSelect: React.FC<BAIScopedVFolderSelectProps>;
export default BAIScopedVFolderSelect;
