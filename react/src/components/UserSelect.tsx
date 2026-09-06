/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserSelectQuery } from '../__generated__/UserSelectQuery.graphql';
import { Selector } from '@astryxdesign/core/Selector';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * PILOT-DECISION 1: the props no longer `extend SelectProps` (antd). A grep
 * for `import UserSelect` across `react/src` finds NO consumer — this
 * component is currently unreferenced — so there is no call-site contract to
 * preserve and the interface below states the minimum a caller would need.
 *
 * PILOT-DECISION 2: the server-side search is dropped; the search is now
 * client-side over the already-loaded page. Astryx `Selector.hasSearch` owns
 * its search box and exposes no controlled `searchValue`/`onSearch` pair, so
 * antd's `showSearch={{searchValue, onSearch, filterOption:false}}` — which
 * fed the term back into the Relay query's `email ilike` filter — has no
 * equivalent on this branch. MAPPING §3.1 routes genuine remote search to
 * `Typeahead`/`ComplexSelector`; building either for an unreferenced
 * component is exactly the antd-equivalence reflex the simplicity policy
 * forbids. The query already returns up to 150 active users and `Selector`
 * filters that set locally, so the visible behaviour is unchanged for any
 * deployment under that bound. If this component is ever revived against a
 * larger user base, promote it to `BAIUserSelect` (which already does
 * paginated remote search) rather than re-adding the filter here.
 */
interface Props {
  value?: string;
  onSelectUser: (user: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UserSelect: React.FC<Props> = ({
  onSelectUser,
  value,
  placeholder,
  disabled,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { user_list } = useLazyLoadQuery<UserSelectQuery>(
    graphql`
      query UserSelectQuery($limit: Int!, $offset: Int!, $filter: String) {
        user_list(
          limit: $limit
          offset: $offset
          filter: $filter
          is_active: true
        ) {
          items {
            id
            is_active
            email
            resource_policy
          }
        }
      }
    `,
    {
      limit: 150,
      offset: 0,
      filter: null,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <Selector
      label={t('storageHost.quotaSettings.SelectUser')}
      isLabelHidden
      hasSearch
      value={value}
      isDisabled={disabled}
      onChange={(next) => {
        onSelectUser(
          _.find(user_list?.items, (user) => {
            return user?.email === next;
          }),
        );
      }}
      placeholder={placeholder ?? t('storageHost.quotaSettings.SelectUser')}
      options={_.map(user_list?.items, (user) => {
        return {
          value: user?.email ?? '',
          label: user?.email ?? '',
        };
      }).sort((a, b) => (a.value && b.value && a.value > b.value ? 1 : -1))}
    />
  );
};

export default UserSelect;
