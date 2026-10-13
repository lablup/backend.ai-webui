import { ResourceGroupFilter, ResourceGroupScope } from '../../__generated__/BAIResourceGroupSelectQuery.graphql';
import { BAISelectProps } from '../BAISelect';
export type BAIResourceGroupFilter = Pick<ResourceGroupFilter, 'isActive' | 'isPublic'>;
/**
 * Names of the resource groups `scope` reaches, ordered by name (ADR 0011).
 * Shares one request with `BAIResourceGroupSelect` given the same `scope` and `filter`.
 */
export declare const useResourceGroupNames: (scope: ResourceGroupScope, filter?: BAIResourceGroupFilter | null) => string[];
export interface BAIResourceGroupSelectProps extends Omit<BAISelectProps, 'options'> {
    /** The resource groups this scope reaches are listed, usually the current domain. */
    scope: ResourceGroupScope;
    /** Narrows the list; omit to list every resource group in reach. */
    filter?: BAIResourceGroupFilter | null;
}
declare const BAIResourceGroupSelect: ({ scope, filter, ...selectProps }: BAIResourceGroupSelectProps) => import("react").JSX.Element;
export default BAIResourceGroupSelect;
