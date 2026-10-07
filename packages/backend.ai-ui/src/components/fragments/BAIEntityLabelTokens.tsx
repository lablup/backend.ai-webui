import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import BAIFlex from '../BAIFlex';
import { Token } from '@lablup/ui-common/Token';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIEntityLabel {
  key: string;
  value: string;
}

export interface BAIEntityLabelTokensProps {
  entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
  /** When provided, tokens render as buttons that report the clicked label. */
  onLabelClick?: (label: BAIEntityLabel) => void;
  /** Keeps a token click from also firing the surrounding row's click. */
  stopRowClick?: boolean;
  /** Rendered when the entity has no labels. */
  fallback?: React.ReactNode;
}

export const formatEntityLabel = (label: BAIEntityLabel) =>
  `${label.key}=${label.value}`;

/** The entity-filter fragment that selects entities carrying this exact label. */
export const toEntityLabelFilter = (label: BAIEntityLabel) => ({
  labels: {
    some: { key: { equals: label.key }, value: { equals: label.value } },
  },
});

const BAIEntityLabelTokens: React.FC<BAIEntityLabelTokensProps> = ({
  entityLabelsFrgmt,
  onLabelClick,
  stopRowClick = false,
  fallback = null,
}) => {
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
  const labels = (entityLabels?.edges ?? []).map((edge) => edge.node);

  if (labels.length === 0) return <>{fallback}</>;

  return (
    <BAIFlex wrap="wrap" gap="xxs">
      {labels.map((label) => (
        <Token
          key={label.key}
          label={formatEntityLabel(label)}
          onClick={
            onLabelClick
              ? (e) => {
                  if (stopRowClick) e.stopPropagation();
                  onLabelClick({ key: label.key, value: label.value });
                }
              : undefined
          }
        />
      ))}
    </BAIFlex>
  );
};

export default BAIEntityLabelTokens;
