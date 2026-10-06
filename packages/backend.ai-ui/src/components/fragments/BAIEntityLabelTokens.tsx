import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import BAITokenList, { type BAITokenListProps } from '../BAITokenList';
import { graphql, useFragment } from 'react-relay';

export interface BAIEntityLabelTokensProps extends Omit<
  BAITokenListProps,
  'items'
> {
  entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
}

export const formatEntityLabel = (label: { key: string; value: string }) =>
  `${label.key}=${label.value}`;

const BAIEntityLabelTokens = ({
  entityLabelsFrgmt,
  ...tokenListProps
}: BAIEntityLabelTokensProps) => {
  'use memo';
  const entityLabels = useFragment(
    graphql`
      fragment BAIEntityLabelTokensFragment on EntityLabelConnection {
        edges {
          node {
            key
            value
          }
        }
      }
    `,
    entityLabelsFrgmt,
  );

  return (
    <BAITokenList
      maxInline={2}
      {...tokenListProps}
      items={(entityLabels?.edges ?? []).map((edge) =>
        formatEntityLabel(edge.node),
      )}
    />
  );
};

export default BAIEntityLabelTokens;
