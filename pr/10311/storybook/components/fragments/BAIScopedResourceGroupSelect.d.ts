import { ResourceGroupFilter, ResourceGroupScope } from '../../__generated__/BAIScopedResourceGroupSelectQuery.graphql';
import { BAISelectProps } from '../BAISelect';
export type BAIResourceGroupFilter = Pick<ResourceGroupFilter, 'isActive' | 'isPublic'>;
/**
 * Names of the resource groups `scope` reaches, ordered by name (ADR 0012).
 * Shares one request with `BAIScopedResourceGroupSelect` given the same `scope` and `filter`.
 */
export declare const useScopedResourceGroupNames: (scope: ResourceGroupScope, filter?: BAIResourceGroupFilter | null) => string[];
export interface BAIScopedResourceGroupSelectProps extends Omit<BAISelectProps, 'options'> {
    /** The resource groups this scope reaches are listed, usually the current domain. */
    scope: ResourceGroupScope;
    /** Narrows the list; omit to list every resource group in reach. */
    filter?: BAIResourceGroupFilter | null;
}
declare const BAIScopedResourceGroupSelect: ({ scope, filter, ...selectProps }: BAIScopedResourceGroupSelectProps) => import("react").JSX.Element;
export default BAIScopedResourceGroupSelect;
