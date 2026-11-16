import { BAIScopedResourceGroupSelectPaginatedQuery, ResourceGroupScope } from '../../__generated__/BAIScopedResourceGroupSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type BAIScopedResourceGroupSelectFilter = NonNullable<BAIScopedResourceGroupSelectPaginatedQuery['variables']['filter']>;
export interface BAIScopedResourceGroupSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Resource group name(s). */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    /** The resource groups this scope reaches are listed (ADR 0012). */
    scope: ResourceGroupScope;
    filter?: BAIScopedResourceGroupSelectFilter;
    open?: boolean;
    defaultOpen?: boolean;
}
declare const BAIScopedResourceGroupSelect: React.FC<BAIScopedResourceGroupSelectProps>;
export default BAIScopedResourceGroupSelect;
