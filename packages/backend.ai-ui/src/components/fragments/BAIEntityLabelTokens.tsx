import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import BAIFlex from '../BAIFlex';
import type { FilterProperty } from '../BAIGraphQLPropertyFilter';
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

/** The entity-filter fragment that selects entities carrying this label (iEquals: the string operator BAIGraphQLPropertyFilter accepts). */
export const toEntityLabelFilter = (label: BAIEntityLabel) => ({
  labels: {
    some: { key: { iEquals: label.key }, value: { iEquals: label.value } },
  },
});

/** The filter-bar properties that show and edit a `toEntityLabelFilter` condition as key and value chips. */
export const entityLabelFilterProperties = (propertyLabels: {
  key: string;
  value: string;
}): Array<FilterProperty> => [
  { key: 'labels.some.key', propertyLabel: propertyLabels.key, type: 'string' },
  {
    key: 'labels.some.value',
    propertyLabel: propertyLabels.value,
    type: 'string',
  },
];

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
