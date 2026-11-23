import { BAIDeploymentSelectPaginatedQuery } from '../../__generated__/BAIDeploymentSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxDeploymentNode = NonNullable<NonNullable<BAIDeploymentSelectPaginatedQuery['response']['adminDeployments']>['edges'][number]>['node'];
export interface BAIDeploymentSelectRef {
    refetch: () => void;
}
export interface BAIDeploymentSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIDeploymentSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    ref?: React.Ref<BAIDeploymentSelectRef>;
}
declare const BAIDeploymentSelect: React.FC<BAIDeploymentSelectProps>;
export default BAIDeploymentSelect;
