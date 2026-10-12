/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { BAIDomainSelectV2Query } from '../../__generated__/BAIDomainSelectV2Query.graphql';
import { toLocalId } from '../../helper';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISelect, { type BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIDomainSelectV2Props extends Omit<
  BAISelectProps,
  'options'
> {
  activeOnly?: boolean;
}

// `adminDomainsV2` returns 10 rows when no bound is given; domains are a
// tenant-level catalog, so one bounded page lists them all.
const DOMAIN_FETCH_LIMIT = 100;

/**
 * Sibling of `BAIDomainSelect` on `adminDomainsV2`: shows the domain name but
 * its value is the domain uuid (BA-7234, managers >= 26.9.0). Superadmin only.
 */
const BAIDomainSelectV2: React.FC<BAIDomainSelectV2Props> = ({
  activeOnly = true,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [value, setValue] = useControllableValue(selectProps);

  const { adminDomainsV2 } = useLazyLoadQuery<BAIDomainSelectV2Query>(
    graphql`
      query BAIDomainSelectV2Query($isActive: Boolean, $limit: Int!) {
        adminDomainsV2(filter: { isActive: $isActive }, limit: $limit) {
          edges {
            node {
              id
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    { isActive: activeOnly ? true : null, limit: DOMAIN_FETCH_LIMIT },
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <BAISelect
      placeholder={t('comp:BAIDomainSelect.SelectDomain')}
      {...selectProps}
      value={value}
      onChange={(_value, option) => {
        setValue(_value, option);
      }}
      options={_.compact(
        _.map(adminDomainsV2?.edges, (edge) =>
          edge?.node
            ? {
                label: edge.node.basicInfo?.name,
                value: toLocalId(edge.node.id),
              }
            : null,
        ),
      )}
    />
  );
};

export default BAIDomainSelectV2;
