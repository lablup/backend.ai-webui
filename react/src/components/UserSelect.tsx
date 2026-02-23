/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserSelectQuery } from '../__generated__/UserSelectQuery.graphql';
import { Select, type SelectProps } from 'antd';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  onSelectUser: (user: any) => void;
}

const UserSelect: React.FC<Props> = ({ onSelectUser, ...selectProps }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>('');
  const deferredSearch = useDeferredValue(search);
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
      filter:
        deferredSearch?.length === 0
          ? null
          : 'email ilike "%' + deferredSearch + '%"',
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <Select
      loading={deferredSearch !== search}
      onChange={(value) => {
        onSelectUser(
          _.find(user_list?.items, (user) => {
            return user?.email === value;
          }),
        );
      }}
      showSearch={{
        searchValue: search,
        onSearch: (v) => {
          setSearch(v);
        },
        filterOption: false,
      }}
      placeholder={t('storageHost.quotaSettings.SelectUser')}
      options={_.map(user_list?.items, (user) => {
        return {
          value: user?.email,
          label: user?.email,
        };
      }).sort((a, b) => (a.value && b.value && a.value > b.value ? 1 : -1))}
      {...selectProps}
    />
  );
};

export default UserSelect;
