/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminClientIpMaskingPolicyListPurgeMutation } from '../__generated__/AdminClientIpMaskingPolicyListPurgeMutation.graphql';
import {
  AdminClientIpMaskingPolicyListQuery,
  AdminClientIpMaskingPolicyListQuery$data,
} from '../__generated__/AdminClientIpMaskingPolicyListQuery.graphql';
import { ClientIpMaskingPolicySettingModalFragment$key } from '../__generated__/ClientIpMaskingPolicySettingModalFragment.graphql';
import { App } from '../app-shim';
import ClientIpMaskingPolicySettingModal, {
  CLIENT_IP_MASKING_TARGETS,
  DEFAULT_IPV4_PREFIX,
  DEFAULT_IPV6_PREFIX,
} from './ClientIpMaskingPolicySettingModal';
import {
  BAIAlert,
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAIText,
  filterOutNullAndUndefined,
  useUpdatableState,
  type BAIColumnType,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ClientIpMaskingPolicyNode = NonNullable<
  NonNullable<
    AdminClientIpMaskingPolicyListQuery$data['adminClientIpMaskingPolicies']
  >['edges'][number]['node']
>;

const AdminClientIpMaskingPolicyList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<ClientIpMaskingPolicySettingModalFragment$key | null>(null);

  const { adminClientIpMaskingPolicies } =
    useLazyLoadQuery<AdminClientIpMaskingPolicyListQuery>(
      graphql`
        query AdminClientIpMaskingPolicyListQuery(
          $orderBy: [ClientIPMaskingPolicyOrderBy!]
          $limit: Int
        ) {
          adminClientIpMaskingPolicies(orderBy: $orderBy, limit: $limit) {
            count
            edges {
              node {
                id
                entityId
                targetType
                mode
                ipv4Prefix
                ipv6Prefix
                updatedAt
                ...ClientIpMaskingPolicySettingModalFragment
              }
            }
          }
        }
      `,
      {
        orderBy: [{ field: 'TARGET_TYPE', direction: 'ASC' }],
        // One policy per target at most, so a single page holds them all.
        limit: CLIENT_IP_MASKING_TARGETS.length,
      },
      {
        fetchPolicy:
          fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  const [commitPurge] =
    useMutation<AdminClientIpMaskingPolicyListPurgeMutation>(graphql`
      mutation AdminClientIpMaskingPolicyListPurgeMutation($id: UUID!) {
        purgeClientIpMaskingPolicy(id: $id) {
          purgedId
          entityId
        }
      }
    `);

  const refetch = () => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  };

  const policies = filterOutNullAndUndefined(
    _.map(adminClientIpMaskingPolicies?.edges, (edge) => edge?.node),
  );
  const availableTargets = _.difference(
    CLIENT_IP_MASKING_TARGETS,
    _.map(policies, 'targetType'),
  );

  const targetLabel = (target: string) =>
    t(`clientIpMasking.targets.${target}`, { defaultValue: target });

  const purgePolicy = (policy: ClientIpMaskingPolicyNode) =>
    new Promise<void>((resolve, reject) => {
      commitPurge({
        variables: { id: policy.entityId },
        onCompleted: (_res, errors) => {
          if (errors && errors.length > 0) {
            _.forEach(errors, (err) => message.error(err.message));
            reject();
            return;
          }
          message.success(t('clientIpMasking.SuccessfullyDeleted'));
          refetch();
          resolve();
        },
        onError: (error) => {
          message.error(error.message);
          reject(error);
        },
      });
    });

  const renderPrefix = (
    policy: ClientIpMaskingPolicyNode,
    prefix: number | null | undefined,
    defaultPrefix: number,
  ) => {
    if (policy.mode !== 'TRUNCATE') {
      return <BAIText type="secondary">-</BAIText>;
    }
    return _.isNumber(prefix) ? (
      `/${prefix}`
    ) : (
      <BAIText type="secondary">
        {t('clientIpMasking.DefaultPrefix', { prefix: defaultPrefix })}
      </BAIText>
    );
  };

  const columns: Array<BAIColumnType<ClientIpMaskingPolicyNode>> = [
    {
      title: t('clientIpMasking.Target'),
      dataIndex: 'targetType',
      key: 'targetType',
      fixed: 'left',
      required: true,
      render: (__, row) => (
        <BAINameActionCell
          title={targetLabel(row.targetType)}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setEditingPolicy(row);
                setIsOpenSettingModal(true);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              popConfirm: {
                title: t('clientIpMasking.DeletePolicy'),
                description: t(
                  row.targetType === 'DEFAULT'
                    ? 'clientIpMasking.DeleteDefaultPolicyDescription'
                    : 'clientIpMasking.DeletePolicyDescription',
                  { target: targetLabel(row.targetType) },
                ),
                okText: t('button.Delete'),
                cancelText: t('button.Cancel'),
                okButtonProps: { danger: true },
                onConfirm: () => purgePolicy(row),
              },
            },
          ]}
        />
      ),
    },
    {
      title: t('clientIpMasking.Mode'),
      dataIndex: 'mode',
      key: 'mode',
      render: (__, row) =>
        t(`clientIpMasking.modes.${row.mode}`, { defaultValue: row.mode }),
    },
    {
      title: t('clientIpMasking.IPv4Prefix'),
      dataIndex: 'ipv4Prefix',
      key: 'ipv4Prefix',
      render: (__, row) =>
        renderPrefix(row, row.ipv4Prefix, DEFAULT_IPV4_PREFIX),
    },
    {
      title: t('clientIpMasking.IPv6Prefix'),
      dataIndex: 'ipv6Prefix',
      key: 'ipv6Prefix',
      render: (__, row) =>
        renderPrefix(row, row.ipv6Prefix, DEFAULT_IPV6_PREFIX),
    },
    {
      title: t('general.UpdatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (__, row) => dayjs(row.updatedAt).format('lll'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIAlert type="info" description={t('clientIpMasking.Description')} />
      <BAIFlex justify="end" gap="xs">
        <BAIFetchKeyButton
          loading={isRefetchPending}
          value={fetchKey}
          onChange={refetch}
        />
        <BAIButton
          type="primary"
          icon={<PlusIcon />}
          disabled={_.isEmpty(availableTargets)}
          title={
            _.isEmpty(availableTargets)
              ? t('clientIpMasking.AllTargetsHavePolicy')
              : undefined
          }
          onClick={() => {
            setEditingPolicy(null);
            setIsOpenSettingModal(true);
          }}
        >
          {t('clientIpMasking.CreatePolicy')}
        </BAIButton>
      </BAIFlex>
      <BAITable<ClientIpMaskingPolicyNode>
        scroll={{ x: 'max-content' }}
        size="small"
        rowKey="entityId"
        loading={isRefetchPending}
        dataSource={policies}
        columns={columns}
        pagination={false}
      />
      <ClientIpMaskingPolicySettingModal
        open={isOpenSettingModal}
        policyFrgmt={editingPolicy}
        availableTargets={availableTargets}
        onRequestClose={(success) => {
          setIsOpenSettingModal(false);
          if (success && editingPolicy === null) {
            refetch();
          }
        }}
      />
    </BAIFlex>
  );
};

export default AdminClientIpMaskingPolicyList;
