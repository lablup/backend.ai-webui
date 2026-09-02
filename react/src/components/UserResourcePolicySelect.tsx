/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicySelectQuery } from '../__generated__/UserResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import { AstryxFormSelector } from './astryxFormControls';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * PILOT-DECISION: the props no longer `extend SelectProps` (antd). MAPPING
 * §3.1 puts a small, single-shot, statically-fetched option list on `Selector`
 * — here through the shared `AstryxFormSelector` adapter, because all three
 * call sites render this inside a `BAIFormItem` (UpdateUsersModal,
 * UserSettingModal, BulkCreateUserFromCSVModal). The interface below is the
 * grepped union of what those three actually pass — `allowClear`, `value`,
 * `onChange`, `placeholder`, `style` — plus what `Form.Item` injects. The
 * antd `style={{width:'100%'}}` becomes the adapter's `width`, which is
 * already its default.
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
  /**
   * Kept so `BulkCreateUserFromCSVModal` (a sibling partition's file) stays at
   * zero diff. Astryx `Selector` accepts `style` through `BaseProps`, and the
   * one live value — `{width: '100%'}` — is already the adapter's default.
   */
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
    <AstryxFormSelector
      // `showSearch` -> `hasSearch`: user_resource_policy has no server-side
      // filter, so the search stays client-side exactly as before.
      hasSearch
      hasClear={allowClear}
      label={t('resourcePolicy.ResourcePolicy')}
      placeholder={t('credential.SelectPolicy')}
      onChange={(next) => onChange?.(next ?? undefined)}
      options={_.map(user_resource_policies, (policy) => {
        return {
          value: policy?.name ?? '',
          label: policy?.name ?? '',
        };
      }).sort((a, b) => localeCompare(a?.label, b?.label))}
      {...selectProps}
    />
  );
};

export default UserResourcePolicySelect;
