import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { UserSelectorQuery } from "./__generated__/UserSelectorQuery.graphql";

import { Select, SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import _ from "lodash";

interface Props extends SelectProps {
  onChange?: (value: string) => void;
  limit?: number;
  currentPage?: number;
  pageSize?: number;
}

const UserSelector: React.FC<Props> = ({ 
  onChange,
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const { user_list } = useLazyLoadQuery<UserSelectorQuery>(
    graphql`
      query UserSelectorQuery (
        $limit: Int!
        $offset: Int!
      ) {
        user_list(limit: $limit, offset: $offset, is_active: true) {
            items {
              id
              username
              is_active
            }
        }
      }
    `,
    {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    {
      fetchPolicy: "store-and-network",
    }
  );
  return (
    <Select
      labelInValue
      filterOption={false}
      onChange={(value) => {
        onChange?.(value);
      }}
      showSearch
      placeholder={t('storageHost.quotaSettings.SelectUser')}
      {...selectProps}
    >
      {_.map(user_list?.items, (user) => {
        return (
          <Select.Option key={user?.id}>{user?.username}</Select.Option>
        );
      })}
    </Select>
  );
};

export default UserSelector;
