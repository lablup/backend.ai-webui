import { BAIUserSelectScopedPaginatedQuery } from '../../__generated__/BAIUserSelectScopedPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIUserSelectFilter = NonNullable<BAIUserSelectScopedPaginatedQuery['variables']['filter']>;
export interface BAIUserSelectUser {
    id: string;
    email: string | null | undefined;
    fullName: string | null | undefined;
}
export interface BAIUserSelectRef {
    refetch: () => void;
}
export interface BAIUserSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
    value?: string | Array<string> | null;
    /**
     * The second argument carries the labelInValue pair(s), so a caller can
     * show the email while the raw UUID goes into a filter or mutation input.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    filter?: BAIUserSelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIUserSelectRef>;
    /** Lists this project's members. Takes precedence over `domainId`. */
    projectId?: string;
    /** Lists this domain's users (domain UUID). Defaults to the current domain. */
    domainId?: string;
}
declare const BAIUserSelect: React.FC<BAIUserSelectProps>;
export default BAIUserSelect;
