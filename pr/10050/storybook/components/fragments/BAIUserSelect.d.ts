import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIUserSelectFilter = NonNullable<BAIUserSelectPaginatedQuery['variables']['filter']>;
/**
 * Which users the picker lists. `admin` needs a super-admin, `domain` a
 * domain admin of that domain, `project` a member of that project.
 */
export type BAIUserSelectScope = {
    type: 'admin';
} | {
    type: 'domain';
    domainName: string;
} | {
    type: 'project';
    projectId: string;
};
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
    /**
     * Defaults to every user the caller may administer: all users for a
     * super-admin, the caller's own domain otherwise.
     */
    scope?: BAIUserSelectScope;
    filter?: BAIUserSelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIUserSelectRef>;
}
declare const BAIUserSelect: React.FC<BAIUserSelectProps>;
export default BAIUserSelect;
