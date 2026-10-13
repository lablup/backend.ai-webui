import { ResourceGroupFilter } from '../../__generated__/BAIResourceGroupSelectQuery.graphql';
import { BAISelectProps } from '../BAISelect';
export type BAIResourceGroupFilter = Pick<ResourceGroupFilter, 'isActive' | 'isPublic'>;
/**
 * Every resource group name at admin scope, ordered by name. Runs the same
 * query as `BAIResourceGroupSelect`, so a parent that needs the list before
 * render (to pick a default, say) shares one request with the select when
 * both receive the same `filter`.
 */
export declare const useResourceGroupNames: (filter?: BAIResourceGroupFilter | null) => string[];
export interface BAIResourceGroupSelectProps extends Omit<BAISelectProps, 'options'> {
    /** Narrows the admin-scope list; omit to list every resource group. */
    filter?: BAIResourceGroupFilter | null;
}
declare const BAIResourceGroupSelect: ({ filter, ...selectProps }: BAIResourceGroupSelectProps) => import("react").JSX.Element;
export default BAIResourceGroupSelect;
