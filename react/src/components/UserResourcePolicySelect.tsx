/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicySelectQuery } from '../__generated__/UserResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import { Select, type SelectProps } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  defaultValue?: string;
}

const UserResourcePolicySelect: React.FC<Props> = ({ ...selectProps }) => {
  const { t } = useTranslation();
  const { user_resource_policies } =
    useLazyLoadQuery<UserResourcePolicySelectQuery>(
      graphql`
        query UserResourcePolicySelectQuery {
          user_resource_policies {
            id
            name
            created_at
            # follows version of https://github.com/lablup/backend.ai/pull/1993
            # --------------- START --------------------
            max_vfolder_count @since(version: "23.09.6")
            max_session_count_per_model_session @since(version: "23.09.10")
            max_quota_scope_size @since(version: "23.09.2")
            # ---------------- END ---------------------
            max_customized_image_count @since(version: "24.03.0")
            ...UserResourcePolicySettingModalFragment
          }
        }
      `,
      {},
      {
        fetchPolicy: 'store-and-network',
      },
    );

  return (
    <Select
      showSearch // user_resource_policy does not have filtering options
      placeholder={t('credential.SelectPolicy')}
      options={_.map(user_resource_policies, (policy) => {
        return {
          value: policy?.name,
          label: policy?.name,
        };
      }).sort((a, b) => localeCompare(a?.label, b?.label))}
      {...selectProps}
    />
  );
};

export default UserResourcePolicySelect;
