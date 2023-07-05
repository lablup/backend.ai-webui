import React, { startTransition, useState } from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { UserSelectorQuery } from "./__generated__/UserSelectorQuery.graphql";

import { Select, SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import _ from "lodash";

interface Props extends SelectProps {
  onSelectUser?: (user: any) => void;
}

const UserSelector: React.FC<Props> = ({ onSelectUser, ...selectProps }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");
  const { user_list } = useLazyLoadQuery<UserSelectorQuery>(
    graphql`
      query UserSelectorQuery($limit: Int!, $offset: Int!, $filter: String) {
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
      limit: 50,
      offset: 0,
      filter: search?.length === 0 ? null : 'email ilike "%' + search + '%"',
    },
    {
      fetchPolicy: "store-and-network",
    }
  );
  return (
    <Select
      filterOption={false}
      onSearch={(value) => {
        startTransition(() => {
          setSearch(value);
        });
      }}
      onChange={(value, option) => {
        onSelectUser?.(option);
      }}
      showSearch
      placeholder={t("storageHost.quotaSettings.SelectUser")}
      {...selectProps}
    >
      {_.map(user_list?.items, (user) => {
        return (
          <Select.Option
            key={user?.id}
            userId={user?.id}
            userResourcePolicy={user?.resource_policy}
          >
            {user?.email}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default UserSelector;
