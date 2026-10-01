/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicySelectQuery } from '../__generated__/UserResourcePolicySelectQuery.graphql';
import { localeCompare } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { AstryxFormSelector } from './astryxFormControls';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Every policy in one page: the V2 connection has no server-side cap and the
// list it replaced was unpaginated.
const POLICY_PAGE_LIMIT = 1000;

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
  const baiClient = useSuspendedBackendaiClient();
  // `adminUserResourcePoliciesV2` is superadmin-only; a domain admin still
  // reads the legacy list.
  const isSuperAdmin = !!baiClient.is_superadmin;
  const { adminUserResourcePoliciesV2, user_resource_policies } =
    useLazyLoadQuery<UserResourcePolicySelectQuery>(
      graphql`
        query UserResourcePolicySelectQuery(
          $limit: Int!
          $isSuperAdmin: Boolean!
        ) {
          adminUserResourcePoliciesV2(
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) @include(if: $isSuperAdmin) {
            edges {
              node {
                id
                name
              }
            }
          }
          user_resource_policies @skip(if: $isSuperAdmin) {
            id
            name
          }
        }
      `,
      { limit: POLICY_PAGE_LIMIT, isSuperAdmin },
      {
        fetchPolicy: 'store-and-network',
      },
    );
  const policyNames = isSuperAdmin
    ? _.map(adminUserResourcePoliciesV2?.edges, (edge) => edge.node.name)
    : _.map(user_resource_policies, (policy) => policy?.name ?? '');

  return (
    <AstryxFormSelector
      // `showSearch` -> `hasSearch`: the search stays client-side, as before.
      hasSearch
      hasClear={allowClear}
      label={t('resourcePolicy.ResourcePolicy')}
      placeholder={t('credential.SelectPolicy')}
      onChange={(next) => onChange?.(next ?? undefined)}
      options={policyNames
        .map((name) => ({ value: name, label: name }))
        .sort((a, b) => localeCompare(a.label, b.label))}
      {...selectProps}
    />
  );
};

export default UserResourcePolicySelect;
