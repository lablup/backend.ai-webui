/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AssignRoleModalQuery } from '../__generated__/AssignRoleModalQuery.graphql';
import { Select } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface AssignRoleModalProps extends BAIModalProps {
  onAssign: (userId: string) => void;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  onAssign,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const data = useLazyLoadQuery<AssignRoleModalQuery>(
    graphql`
      query AssignRoleModalQuery($filter: UserV2Filter, $first: Int) {
        adminUsersV2(filter: $filter, first: $first) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    {
      filter: deferredSearch ? { email: { contains: deferredSearch } } : null,
      first: 50,
    },
    {
      fetchPolicy: baiModalProps.open ? 'store-and-network' : 'store-only',
    },
  );

  const users = data.adminUsersV2?.edges?.map((edge) => edge?.node) ?? [];

  return (
    <BAIModal
      title={t('rbac.AssignUser')}
      okText={t('rbac.Assign')}
      onOk={() => {
        if (selectedUserId) {
          onAssign(selectedUserId);
        }
      }}
      okButtonProps={{ disabled: !selectedUserId }}
      destroyOnClose
      afterClose={() => {
        setSelectedUserId(null);
        setSearch('');
      }}
      {...baiModalProps}
    >
      <Select
        style={{ width: '100%' }}
        placeholder={t('rbac.SelectUser')}
        value={selectedUserId}
        onChange={(value) => setSelectedUserId(value)}
        loading={deferredSearch !== search}
        showSearch={{
          searchValue: search,
          onSearch: (v) => setSearch(v),
          filterOption: false,
        }}
        options={users.map((user) => ({
          value: user?.id,
          label: user?.basicInfo?.email || user?.id,
          description: user?.basicInfo?.fullName,
        }))}
        optionRender={(option) => (
          <div>
            <div>{option.label}</div>
            {option.data?.description && (
              <div style={{ fontSize: 12, color: '#999' }}>
                {option.data.description}
              </div>
            )}
          </div>
        )}
      />
    </BAIModal>
  );
};

export default AssignRoleModal;
