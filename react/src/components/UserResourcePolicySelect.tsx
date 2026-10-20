/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicySelectQuery } from '../__generated__/UserResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import { BAISelector } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * PILOT-DECISION: the props no longer `extend SelectProps` (antd); they are
 * the union of what the three call sites pass (UpdateUsersModal,
 * UserSettingModal, BulkCreateUserFromCSVModal) plus what `Form.Item` injects.
 */
interface Props {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string | undefined) => void;
  /** antd spelling of Astryx's `hasClear`. */
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const UserResourcePolicySelect: React.FC<Props> = ({
  onChange,
  allowClear,
  ...selectProps
}) => {
  'use memo';
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
            max_vfolder_count
            max_session_count_per_model_session
            max_quota_scope_size
            # ---------------- END ---------------------
            max_customized_image_count
          }
        }
      `,
      {},
      {
        fetchPolicy: 'store-and-network',
      },
    );

  const commonProps = {
    // user_resource_policy has no server-side filter, so the search stays
    // client-side.
    hasSearch: true,
    'aria-label': t('resourcePolicy.ResourcePolicy'),
    placeholder: t('credential.SelectPolicy'),
    options: _.map(user_resource_policies, (policy) => {
      return {
        value: policy?.name ?? '',
        label: policy?.name ?? '',
      };
    }).sort((a, b) => localeCompare(a?.label, b?.label)),
    ...selectProps,
  };

  // `hasClear` switches Selector's `onChange` to a nullable value.
  return allowClear ? (
    <BAISelector
      {...commonProps}
      hasClear
      onChange={(next: string | null) => onChange?.(next ?? undefined)}
    />
  ) : (
    <BAISelector
      {...commonProps}
      onChange={(next: string) => onChange?.(next)}
    />
  );
};

export default UserResourcePolicySelect;
