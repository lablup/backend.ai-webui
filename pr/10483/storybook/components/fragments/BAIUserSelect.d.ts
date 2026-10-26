import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type AstryxUserNode = NonNullable<NonNullable<BAIUserSelectPaginatedQuery['response']['user_nodes']>['edges'][number]>['node'];
export interface BAIUserSelectRef {
    refetch: () => void;
}
export interface BAIUserSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIUserSelect` exposes. */
    value?: string | Array<string> | null;
    /**
     * P3C-1: the second `option` argument survives here (and only here). antd's
     * `onChange(value, option)` was dropped wholesale by ticket 27, but
     * `BAIGraphQLPropertyFilter.renderInput` needs the human-readable label to
     * put on the filter chip while the raw UUID goes into the GraphQL filter —
     * and the label is not derivable at the call site. Shape is the
     * `labelInValue` pair the wrapper already holds, so nothing is rebuilt.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    filter?: string;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIUserSelectRef>;
}
declare const BAIUserSelect: React.FC<BAIUserSelectProps>;
export default BAIUserSelect;
