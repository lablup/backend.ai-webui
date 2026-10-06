import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import { BAITokenListProps } from '../BAITokenList';
export interface BAIEntityLabelTokensProps extends Omit<BAITokenListProps, 'items'> {
    entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
}
export declare const formatEntityLabel: (label: {
    key: string;
    value: string;
}) => string;
declare const BAIEntityLabelTokens: ({ entityLabelsFrgmt, ...tokenListProps }: BAIEntityLabelTokensProps) => import("react").JSX.Element;
export default BAIEntityLabelTokens;
